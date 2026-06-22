# fluent-html v6 — Recon 04: Performance & Internal Code Quality

**Scope:** rendering hot path + internal code quality of `fluent-html` (SSR HTML-string builder).
**Method:** static read of `src/`, ran `npm run build && npm run bench` and `npm run bench:mem` (Node, darwin), plus targeted micro-benchmarks to validate hypotheses.
**Bottom line:** the core renderer is already well-optimized for the common path (string `+=` accumulation, charCode escape with a no-escape fast path, prototype-based fluent methods, no per-call cloning). The biggest real risks are (1) **unbounded recursion → stack overflow at ~3.5k nesting depth**, (2) **construction-time allocations dominating render-time** (the tree is rebuilt every request), and (3) a **fold/algebra layer that is largely parallel dead-ish code** with `Object.keys`-driven attribute extraction. Several "obvious" optimizations (regex-prefilter escaping, array-join instead of `+=`) were measured and are **net-negative** — documented below so v6 does not chase them.

---

## 1. Render pipeline walkthrough

A `View` is `Tag | string | RawString | View[]` (`src/core/types.ts:6`). Rendering is a single recursive descent.

### 1.1 Construction (happens per request, before render)
- Element factories call `new Tag(el, ...children)` (`src/core/utils.ts:8`, `src/core/tag.ts:59`).
- `Tag` constructor normalizes children: `0 → ""`, `1 → child`, `>1 → array` (`src/core/tag.ts:61`). This avoids a wrapper array for the (very common) single-child case — good.
- Fluent styling methods live on `Tag.prototype` via declaration merging (`src/core/tailwind-methods.ts:322+`, `htmx-methods.ts:28+`, `behavior-methods.ts:91`). Every Tailwind method funnels to `addClass` (`src/core/tag.ts:102`), which does string `+=` accumulation onto `this.class`. **Methods mutate in place and return `this`** — no cloning, no intermediate Tag objects per fluent call (`tag.ts:108-113`). This is the single most important perf property of the library.
- `addClass` has a variant branch: if `this._variantPrefix` is set (inside `.on()/.at()`), single classes get `prefix:cls`, multi-class strings get `split(" ").map().join(" ")` (`tag.ts:103-107`). The split/map/join only fires for multi-class arguments, which fluent methods never pass (they pass one class each) — so the hot path is the cheap `indexOf(' ') === -1` branch.
- `_sk` (schema keys) is a `readonly string[]` set **once on each subclass prototype** (`src/elements/forms.ts:125`, `tables.ts:48`, etc.) — not per instance. Specialized attrs (`type`, `name`, `href`…) are plain instance fields.

### 1.2 `render(...views)` entry (`src/render/render.ts:33`)
- Single view → `renderImpl(views[0], false)`; multiple → wraps the rest-array. The `false` second arg is the "raw context" flag (`false` = escape; `'script'`/`'style'` = sanitize; `true` = passthrough for `Raw`).

### 1.3 `renderImpl(view, isRawContext)` (`render.ts:184-256`) — the core loop
Dispatch order:
1. **string** (`:185`) → `escapeHtml` (or `sanitizeRawContent`, or passthrough).
2. **RawString** (`:191`, guard `isRawString` = `_t === 2`, `guards.ts:8`) → emit `.html` raw (sanitized inside script/style).
3. **Tag** (`:196`, guard `isTag` = `_t === 1`) → build `attrs` string by `+=`:
   - `id`, `class`, `style` (`:201-206`) — each escaped via `escapeAttr`.
   - `_sk` loop (`:208-216`): for each schema key, read instance field, coerce + escape.
   - `attributes` extra map (`:218-228`): skipped entirely when it's the frozen shared `EMPTY_ATTRS` (`tag.ts:8`) via identity check `!== EMPTY_ATTRS` (`:219`) — so tags with no custom attrs pay nothing here.
   - `htmx` (`:230`) → `buildHtmx` (data-driven over `HTMX_ATTRS` table, `:128-156`).
   - `toggles` (`:232-235`) → `join(' ')`.
   - Void elements (`:237`) → `<el attrs>`, no children.
   - Otherwise → `'<'+el+attrs+'>' + renderImpl(child, childCtx) + '</'+el+'>'` (`:240`). `childCtx` switches to `'script'`/`'style'` for those elements.
4. **Array** (`:243-253`): `len 0 → ''`, `len 1 → recurse`, else first child then `'\n' + recurse` for the rest. **Children are joined with `\n`** (`:250`).
5. fallthrough → `''`.

Output is a single `string` built by repeated `+=` and recursive concatenation. V8 ropes/cons-strings make this fast (measured below).

### 1.4 `renderToStream(view)` (`src/render/stream.ts:111`)
- Wraps a `node:stream` `Readable`; `read()` calls `streamImpl` then `push(null)` (`:113-117`). **The entire tree is walked synchronously inside one `read()` call** — every chunk is `push`ed in one tick, then EOF. So this is *not* backpressure-aware streaming and *not* incremental: it materializes all chunks eagerly into the stream's internal buffer. `streamImpl` (`:120-194`) is a near-verbatim copy of `renderImpl` that `stream.push(...)`es each fragment instead of concatenating. No async children, no `await`, no flush points tied to I/O readiness.

### 1.5 Fold layer (`src/fold/`) — parallel, mostly off the hot path
- `foldView(alg, view)` (`fold.ts:55`): catamorphism. For each Tag it calls `extractAttrs` (`fold.ts:9-28`) which **spreads `{...tag.attributes}` and iterates `Object.keys(tag)`** to copy element-specific fields into a fresh `TagAttrs` object — heavy allocation per node.
- `paraView` (`para.ts:47`) duplicates `foldView` + `extractAttrs` verbatim.
- `unfoldView` (anamorphism, `unfold.ts:20`), `hyloView` (fused, `hylo.ts:18`).
- `renderAlgebra` (`algebras/render.ts:63`) is a **second, slower HTML renderer** built on the fold; it uses `parts: string[]` + `join`, handles only 3 HTMX attrs (`:34-40` — `// Add other HTMX attributes as needed...`), and its own comment says "use render() for production" (`:58`). The real `render()` does **not** use the fold layer at all — confirmed: `render.ts` imports nothing from `fold/`.

### 1.6 Control flow (`src/control/`)
- `ForEach` (`iteration.ts:40`): pre-sizes `new Array(len)` for number/array overloads, falls back to `Array.from(iterable).map` for generic iterables (`:76`) — returns a `View[]` that the renderer joins with `\n`. Cheap.
- `IfThen/IfThenElse` (`conditionals.ts`): plain branch, returns `Empty()` = `""` (`utils.ts:4`) on the false path — a string, zero allocation.
- `Match` (`conditionals.ts:148`): object lookup `cases[value]`; discriminated-union overload does one extra property read. Cheap.
- `createContext` (`context.ts:69`): a closure over `stack: T[]`; `scope()` pushes and returns a `Disposable` **object allocated per scope** (`:78-84`). `current` is `stack[stack.length-1]`. The per-scope Disposable allocation is why the "1000 scopes" bench is comparatively slow (see §2).

---

## 2. Benchmark results

Ran `npm run bench` / `bench:mem` (ITERATIONS=1000). Numbers are stable across two runs (±5%):

| Benchmark | ops/sec | ms/op |
|---|---:|---:|
| Flat page (1000 divs, id+padding+bg) | **6.4K** | 0.156 |
| Deep tree (100 levels) | 124K | 0.008 |
| Heavy escaping (200 paragraphs, nasty input) | 11.3K | 0.089 |
| HTMX attributes (100 buttons) | 18.1K | 0.055 |
| Realistic page (~200 tags) | 23.6K | 0.043 |
| Variant-heavy (100 buttons, 10+ variants) | 10.2K | 0.098 |
| Large ForEach (5000 items) | **1.1K** | 0.886 |
| foldView count (realistic page) | 25K | 0.040 |
| Context scope/read (1000 scopes) | 4.2K | 0.237 |

Memory (`--expose-gc`, heap delta over 100 iters):

| Op | heap KB / 100 iters | ≈ per render |
|---|---:|---:|
| Flat page **construction** (1000 divs) | 1452 | ~14.5 KB |
| Realistic page **construction** | 6520 | ~65 KB |
| Flat page **render** (1000 divs) | 10382 | ~104 KB |
| Realistic page **render** | 5453 | ~55 KB |

**Reading the numbers:**
- The two slowest workloads (flat 1000, ForEach 5000) are dominated by **per-node cost × node count**, not by string size. ~6.4K ops/s for 1000 nodes ≈ **156 ns/node** including escape, attr build, and recursion.
- Construction allocates a lot: 1000 divs = ~14.5 KB just to build the tree, *before* rendering. Because the SSR pattern rebuilds the tree every request, **construction allocation is paid on every request** and is a first-class perf concern, not just render.
- Render allocates ~104 KB for the flat-1000 case — mostly intermediate cons-strings; GC pressure, not retained memory.
- `foldView count` (25K) ≈ realistic `render` (23.6K) even though count does nothing but add integers — confirming `extractAttrs`'s `{...attributes}` + `Object.keys(tag)` per node is a real tax on the fold layer.

**Micro-benchmarks I ran to test "obvious" optimizations (all measured, Node/V8):**

| Hypothesis | Result | Verdict |
|---|---|---|
| `+=` concat vs `array.push + join` for 1000 fragments | concat **30K ops/s** vs join **12K** | **`+=` wins 2.5×** — keep it; do NOT switch to array-join. |
| escape clean string: current charCode-scan vs regex `.test()` prefilter + scan | current **13.3M** vs prefilter **10.7M** | current wins; the `lastIdx===0` fast path already beats a regex prefilter. |
| escape dirty string: same | current **4.4M** vs prefilter **2.7M** | current wins. **Escaping is not a bottleneck and not a quick win.** |
| `addClass` ×6 no-variant vs ×4 with-variant prefix | 14.4M vs 7.1M | variant path 2× slower but tiny absolute cost; not worth changing. |

**Recursion stack limit (measured, binary search):** linear nesting `Div(Div(...Span))` overflows the call stack **between depth 3468 and 3500** (`render(deep(3500))` → `Maximum call stack size exceeded`). 1000 is fine, 5000 throws. Deeply nested real-world layouts (recursive comment threads, nested menus, generated trees) can hit this.

---

## 3. Performance opportunities (ranked)

| # | Opportunity | Mechanism | Expected impact | Risk | Where |
|---|---|---|---|---|---|
| 1 | **Eliminate stack-overflow on deep trees** | Convert `renderImpl` recursion to an explicit work-stack (or trampoline the child/array descent). Children/arrays are the only recursion points. | Correctness fix; removes a hard ~3.5k-depth ceiling. Throughput neutral if the loop is kept tight. | Med — must preserve exact `\n`-join + script/style ctx semantics; needs fuzz/snapshot coverage. | `render.ts:240,248-251`; mirror in `stream.ts:182,187-191` |
| 2 | **Real incremental streaming** | Make `renderToStream` push on `read()` demand (generator/iterator driving the work-stack), honoring `push()` backpressure return value instead of emitting the whole tree in one tick. | Large pages start flushing to the socket immediately; bounded memory for huge responses. Today stream.ts buffers everything eagerly. | Med-High — real streaming semantics, async-readiness; new tests. | `stream.ts:111-194` |
| 3 | **Static subtree hoisting / precompiled fragments** | Add a `Frozen`/`Static` wrapper that renders a subtree once and caches the string (interned). Headers, footers, icons, nav are identical every request. | Big for realistic pages with large static chrome; turns repeated 200-tag renders into a memcpy. | Med — cache invalidation is the user's responsibility (document "static only"); needs API design. | new; integrates at `render.ts:196` (short-circuit on cached string) |
| 4 | **Cut construction allocation** | (a) Lazy-init `toggles`/`attributes` already done; (b) avoid `_variantPrefix = null` field on every Tag (init lazily / via prototype default) so the common no-variant tag is shape-stable and smaller (`tag.ts:309`). (c) Consider object-pool-free but monomorphic field order so all Tags share one hidden class. | Construction is paid every request (≈14.5 KB/1000 nodes). Smaller/monomorphic Tags reduce GC + improve inline-cache hit rate. | Med | Low-Med — hidden-class shape changes need before/after bench. | `tag.ts:43-62,309` |
| 5 | **De-duplicate render/stream/HTMX serialization** | `stream.ts` is a 70-line verbatim copy of `render.ts` (HTMX table, `buildHtmx`, `sanitizeRawContent`, `VOID_ELEMENTS`). Extract a shared emitter parameterized by a sink (`(s)=>out+=s` vs `stream.push`). | No raw speed, but removes drift risk (e.g. stream could silently lag render features) and shrinks bundle. | Low | both files |
| 6 | **Make the fold layer pay-as-you-go** | `extractAttrs` (`fold.ts:9`, `para.ts:9`) spreads `{...attributes}` + iterates `Object.keys(tag)` per node even for algebras (count/text) that ignore attrs entirely. Pass the live Tag and let algebras read what they need, or memoize the key list. | ~2× on fold-based traversals (count bench is as slow as full render). | Low-Med — `TagAttrs` is public API; could add an opt-in fast path. | `fold.ts:9-28`, `para.ts:9-26` |
| 7 | **Avoid double-escape on never-unsafe attribute values** | `_sk` numeric/boolean fields (`colspan`, `open`, `checked`, `width`…) are coerced with `String(value)` then `escapeAttr` (`render.ts:213`). Numbers/booleans can never contain `&<>"'` — skip escape for non-string `_sk` values. | Small but free on attribute-heavy tables/SVG. | Low | `render.ts:208-216`, `stream.ts:146-154` |
| 8 | **Cheaper context scope** | `scope()` allocates a fresh `{ [Symbol.dispose]() }` object per call (`context.ts:78`). For hot loops, return a shared singleton disposable bound to the stack, or expose a non-`using` `push/pop` pair. | Helps context-in-loop patterns (scope bench is 4.2K for 1000 scopes = lots of disposable allocs). | Low | `context.ts:77-84,121-128` |

**Non-opportunities (measured, do not pursue):** array-join rendering (slower than `+=`, #1 in §2 micro-table), regex-prefilter escaping (slower than current charCode scan), rewriting `addClass` variant path (negligible).

---

## 4. Code-quality findings

| Finding | Detail | Suggested fix |
|---|---|---|
| **Verbatim duplication: render vs stream** | `VOID_ELEMENTS`, `HTMX_ATTRS` + all `str/boolOrStr/boolVal/jsonOrStr/json` builders, `buildHtmx`, `buildStatusConfig`, `sanitizeRawContent`, and the entire Tag-serialization body are copied between `render.ts:8-182` and `stream.ts:8-194`. The comment admits it (`stream.ts:14-15`). | Extract `serialize.ts` with a `Sink` abstraction (`append(s)` impl for string vs stream). Single source of truth. |
| **Second, lossy renderer in fold** | `renderAlgebra` (`algebras/render.ts`) is a parallel HTML renderer that only serializes 3 HTMX attrs (`:34-40`) and skips script/style sanitization (its own comment, `:58,68`). It is exported public API but is strictly worse than `render()`. | Either delete it, or implement it via the shared emitter so it can't diverge/be insecure. At minimum mark clearly non-production. |
| **`extractAttrs` duplicated + allocation-heavy** | Identical function in `fold.ts:9` and `para.ts:9`; both do `{...tag.attributes}` + `Object.keys(tag)` scan per node. | Hoist to one shared helper; offer a no-copy variant for read-only algebras. |
| **`as any` for prototype/discriminant writes** | `(Tag.prototype as any)._t = 1` (`tag.ts:314`), `(RawString.prototype as any)._t = 2` (`raw-string.ts:13`), `(Tag.prototype as any).behavior = ...` (`behavior-methods.ts:91`), and ~30 `(XTag.prototype as any)._sk = [...]` across `src/elements/*`. | Define a typed internal helper `defineSchemaKeys(ctor, keys)` / `setDiscriminant(ctor, n)` that encapsulates the one unavoidable cast, removing ~30 scattered `as any`. |
| **`renderImpl` raw-context flag is tri-typed** | `isRawContext: boolean | string` (`render.ts:184`) overloads `false`/`true`/`'script'|'style'` — three meanings on one param. Works but is a clever-but-fragile encoding; every call site must remember the convention. | Replace with a small enum/union type `RawCtx = 'escape' | 'raw' | 'script' | 'style'` for self-documenting dispatch. |
| **Untyped attribute index access at render** | `(tag as unknown as Record<string, unknown>)[sk[i]]` (`render.ts:211`, `stream.ts:149`). | Acceptable given `_sk`, but a typed `Tag` index signature or a `getSchemaValue` helper would localize the cast. |
| **`hyloView` fabricates an empty attributes object every tag** | `attrs = { attributes: {}, ...layer.attrs }` (`hylo.ts:30-33`) allocates `{}` even when `layer.attrs` already has `attributes`. | Spread first, default after: `{ attributes: {}, ...layer.attrs }` → only default when missing. Minor. |
| **Deprecated API still exported** | `OOB`/`withOOB` are `@deprecated` (`patterns.ts:23,53`) but still in `index.ts:293`. Dead-ish surface for a v6 cut. | Remove in v6 (breaking) or move behind a `legacy` subpath. |
| **`escapeAttr` is an alias** | `escapeAttr = escapeHtml` (`escape.ts:37-39`) — fine today, but the renderer always double-quotes, so `'`/`>`/`&` escaping in attrs is partly redundant work. | Document is good; could add an attr-specific escaper that only handles `&` and `"` for a small win if profiling shows attr-escaping hot (it didn't here). |
| **Test gaps** | No test exercises: (a) **deep nesting near the stack limit** (the §2 overflow would have been caught); (b) **stream backpressure / large-response chunking** (`stream.test.ts` checks output equality, not flush behavior); (c) **`renderAlgebra` HTMX/script-sanitization parity** with `render()`; (d) bench is not wired into `npm test` so regressions in ops/sec are invisible. | Add a deep-tree render test, a stream-vs-render equality fuzz over generated trees, a render/renderAlgebra parity test, and a perf-smoke (assert ms/op under a ceiling) in CI. |
| **`countAlgebra` uses `reduce`** | `counts.reduce((a,b)=>a+b,0)` (`algebras/count.ts:14`) allocates a closure per list node. Negligible, but a `for` loop is idiomatic with the rest of the codebase (which carefully avoids functional overhead in render). | Loop. Minor consistency. |

---

## 5. Quick wins vs deep changes

### Quick wins (low risk, localized, days)
- **#7** skip escaping non-string `_sk` values (`render.ts:213`, `stream.ts:151`).
- **#5 / dup findings** extract shared `serialize.ts` emitter so render & stream stop drifting (mechanical refactor, behavior-preserving; lock with the existing snapshot/fuzz tests).
- **#6** no-copy `extractAttrs` fast path for read-only algebras (`fold.ts`, `para.ts`).
- Typed `defineSchemaKeys` / `setDiscriminant` helper to delete ~30 `as any`.
- Add the missing tests (deep-tree, stream/render parity, perf-smoke). Wire `bench` into CI as a regression gate.
- Replace the `boolean | string` raw-context flag with a typed union (`render.ts`).
- `_variantPrefix` lazy default (`tag.ts:309`) — measure hidden-class impact.

### Deep changes (architectural, design + bench gating, weeks)
- **#1 de-recursion of the renderer** (work-stack/trampoline) — removes the ~3.5k-depth stack-overflow ceiling. This is a correctness fix and the highest-priority deep change.
- **#2 true incremental, backpressure-aware streaming** — the current `renderToStream` is eager; real streaming is a v6-worthy capability for large SSR pages.
- **#3 static subtree hoisting / precompiled fragments** — the highest *throughput* upside for realistic pages (large static chrome rendered once), but needs careful API + invalidation design.
- **#4 construction-allocation reduction** (monomorphic Tag shape, smaller per-node footprint) — pays off every request since the SSR pattern rebuilds the tree per request; gate strictly on before/after `bench:mem`.

**Guardrail for v6:** the micro-benchmarks in §2 show the current `+=` string building and charCode escaping are already near-optimal for V8 — do **not** "optimize" them to array-join or regex-prefilter; both regress. Spend the budget on allocation, recursion safety, streaming, and static caching instead.
