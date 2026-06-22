# Track D — Internals: code & performance (v6 synthesis)

Seven RFCs harden the render core. They are **all additive at the source level** (several carry tiny bug-fix output deltas), but they are **not independent**: D-01 is the structural foundation everything else stands on, and the render/stream entry points are a contested spine that must be serialized, not merged in parallel. The headline wins: deep trees stop crashing, static chrome renders once, the third (lossy, XSS-leaking) serializer is unified into the real one, streaming becomes real backpressure, and the CSP-nonce mutation footgun is gone.

This narrative walks the changes in dependency order, then groups the surface by additive-vs-breaking and names the headline wins.

---

## Dependency order

### Foundation — RFC-D-01 (Renderer de-recursion + `Frozen()`)
Everything in this track routes through one dispatch point, so this lands first. `renderImpl`/`streamImpl` and all four fold drivers (`foldView`/`paraView`/`unfoldView`/`hyloView`) descend one native call frame per DOM depth and crash at ~3.5k nesting. D-01 replaces them with an explicit **work-stack** (a shared `serialize(view, sink)` over a `Sink` interface, emitting via `+=` — measured 2.5× faster than array-join). Signatures and bytes are identical; the only observable change is that previously-crashing deep trees now succeed.

On top of the de-recursed dispatch it adds **`Frozen(view)`** — a `FrozenView` (`_t: 3`, joining `Tag:1`/`RawString:2`) that renders a request-invariant subtree once and memcpys the cached string thereafter. Targets: static `<head>`, nav, footer, icon SVGs at module scope. The documented footgun is freezing per-request data (user/csrf/nonce/locale). Because a frozen node is opaque, the nonce and fold layers must throw or descend when they hit a `FrozenView` containing `<script>`/`<style>` — wiring that D-04/D-05 consume.

D-01 also introduces the typed `RawCtx = 'escape' | 'raw' | 'script' | 'style'` union that replaces the tri-meaning `boolean | string` flag — a seam D-03, D-04, and D-07 all reuse.

### Emitter unification — RFC-D-03 (one serializer; thin `renderAlgebra`)
Lands **on top of D-01**, never before. Today there are *three* HTML serializers that must agree but can't: `render()` (canonical), `renderToStream()` (a drifted verbatim copy — already has a stray `v as string` cast and a non-variadic signature mismatch), and the exported `renderAlgebra` (a third, lossy fold serializer that drops 16 of 20+ HTMX attrs, emits `<img></img>`, and skips `</script>` sanitization — a real XSS gap on public API). D-03 collapses them into one `emit(sink, view, ctx)` parameterized by `Sink`/`RenderCtx`; `render`/`renderToStream`/`renderAlgebra` become thin wrappers that **cannot drift**. `renderToStream` is widened to variadic to match `render` (fixes the multi-swap streaming compile error). This is the structural fix that makes "patch one path" correct, so all attribute/serialization work across the v6 milestone folds its per-attribute logic into D-03's single emitter (the cross-track three-path parity test).

### Demand-driven streaming — RFC-D-02 (true backpressure)
**Hard `depends_on` D-01** — a generator that suspends mid-tree on backpressure cannot be built on a recursive walk that keeps position on the JS call stack. Today `renderToStream` walks the whole tree in one tick, discards every `push()` backpressure signal, and can double-render on paused re-entry — TTFB and memory are identical to `render()`. D-02 turns the work-stack into a synchronous-pull generator: `renderToIterable(view, opts?)` yields coalesced ~`chunkSize` fragments and holds traversal position between `.next()` calls (so it can never double-render); `renderToStream` becomes a thin Node `Readable` driver that suspends on `push() === false`. `RenderStreamOptions = { chunkSize?, highWaterMark? }`. No async on the render path. Also wires `bench/` into CI as a perf-smoke.

### CSP nonce — RFC-D-04 (render-time, non-mutating)
The owner of the render **options object**. Today `renderWithNonce` is a pre-pass that permanently mutates the live `Tag` tree (`setNonce` writes `attributes.nonce` and never restores it) — so a shared/reused layout leaks the first request's nonce into every later plain `render()`, there's no streaming nonce variant, and it double-traverses. D-04 re-models nonce as a per-request render-time value threaded through the emitter and emitted inline at the existing `<script>`/`<style>` boundary. New surface: `RenderOptions = { nonce?: string }`, `render(view, opts)` overload, `renderToStream(view, opts)`, and `renderToStreamWithNonce()`. Author-set `.setNonce()` wins over ambient. `render(...views)` with no opts is byte- and allocation-identical to today. This is why apps can stop setting `contentSecurityPolicy: false`.

> Spine note: D-04 owns `RenderOptions`; Track-B's B-09 *extends the same type* with `contexts` rather than shipping a parallel options bag, and the variadic `render(...views)` vs `render(view, opts)` forms reconcile to one decorator shape. Exactly one options-bearing render overload ships.

### Fold/unfold hardening — RFC-D-05 (single safe reconstruction)
The fold layer is a second construction path that doesn't inherit the core's safety invariants. Seven findings share one root cause: hand-written reconstruction helpers that bypass `validateAttributeKey` and `escapeJs`. D-05 introduces one internal hardened primitive **`rebuildTag(element, attrs, children)`** — the only place the fold/unfold/transform layer may build a `Tag`. It restores `_sk` schema keys (so transforms stop silently dropping `href`/`src`/`type`), validates every custom attribute key (closes the `onclick`/`__proto__` coalgebra XSS hole), and copies base fields. It also exports `validateAttributeKey`, promotes **`escapeJs`** to a shared util applied in every behavior renderer (the `toggleClass` JS-injection hole), and tightens `hx-status:` keys to a literal-union **`HxStatusKey`** with a serialize-time guard (attr-name injection). D-05 is the single owner of `escapeJs`/`validateAttributeKey`; Track-A's A-08 and Track-B's B-02 defer to it.

### Construction cleanup — RFC-D-06 (allocation + monomorphic Tag)
17 findings shaving per-request construction allocation (the SSR pattern rebuilds the whole tree every request). Mostly internal: `_variantPrefix` moves to a prototype default (monomorphic hidden class), `withVariant` gets `try/finally` (fixes silent `hover:` prefix leak on a thrown `.on()` callback), `ForEach` generic fallback becomes single-pass `Array.from(iter, fn)`, shared `extractAttrs` with an `EMPTY_ATTRS` fast path, O(n) `linksAlgebra`. Public surface: `Context.push()`/`pop()` (zero-alloc escape hatch over `scope()`, taught with mandatory `try/finally`), `foldViewScalar()` (allocation-free read-only folds), and `escapeAttr()` narrowed to a quoted-attribute fast path (output-equivalent, security-lens gated).

> Spine note: D-06's `escapeAttr` narrowing must not collide with D-03/D-05's escape routing — the fast path ships under a new internal name (`escapeQuotedAttr`) so public `escapeAttr === escapeHtml` stays additive.

### Type-quality hardening — RFC-D-07 (typed seams + bench-in-CI)
Removes the leaky internal seams. `defineSchemaKeys`/`setDiscriminant` localize the **54 `as any` prototype-write casts** into one typed file. `TagAttrs.get<T>()` gives custom algebras a typed reader (no more `attrs.href as string`). **`setStyles()` stays `replace`** (`set*` = override) — F-D-073 (apps chaining `setStyle().setStyles()` and losing the first style) is fixed by *documenting* the `set*`/`add*` convention, not by changing behavior. `Overlay` is rewritten to the variadic-children form the guideline mandates (the lib's own source violated it). Bench is wired into CI with checked-in ceilings + a build-and-render scenario (today's bench excludes construction cost).

> Spine note: D-07's variadic `Overlay` is the *same* change as Track-A's A-09 — deduped to one rewrite owned by A-09 (which also flips inline-style → Tailwind classes). D-07's `RawCtx` is the same union D-01 introduces.

---

## Additive vs breaking

**Purely additive (new symbols, zero output change):**
- D-01 `Frozen()` / `FrozenView` / `isFrozen()`; de-recursion is byte-identical.
- D-02 `renderToIterable`, `RenderStreamOptions`, `renderToStream` options arg.
- D-04 `RenderOptions`, `render(view, opts)`, `renderToStream(view, opts)`, `renderToStreamWithNonce()`.
- D-05 `validateAttributeKey` / `escapeJs` exports (`rebuildTag` internal).
- D-06 `Context.push`/`pop`, `foldViewScalar()`.
- D-07 `TagAttrs.get<T>()` / `getAttr()`; `defineSchemaKeys`/`setDiscriminant`/`RawCtx` internal. `setStyle`/`setStyles` unchanged (replace).

**Bug-fix output deltas (breaking-changes.md *note*, no codemod):**
- D-03 `renderAlgebra` output buggy→correct (dropped HTMX attrs appear, `<img></img>`→`<img>`, script/style sanitized). Library-internal snapshots re-baseline.
- D-04 `renderWithNonce` no longer mutates the tree.
- D-05 `HxStatusKey` tightening rejects only already-invalid keys; `rebuildTag` restores previously-dropped `_sk` attrs.
- D-06 `escapeAttr` narrowing — byte-identical inside double-quoted attributes.
  _(D-07 has no output delta — `setStyles` is unchanged; F-D-073 is a docs-only fix.)_

**Reclassified to genuinely breaking (per merge amendments):**
- D-01's `frozen` algebra arm is added to the public `ViewAlgebra`/`ParaAlgebra` interfaces (structural implementers must handle it) → bundled into breaking-changes.md.

---

## Headline wins

1. **No more stack-overflow crashes.** Deep trees (recursive comment threads, nested menus, `unfoldView` output) render at 50k+ depth instead of dying at ~3.5k — across `render`, `renderToStream`, and all four fold drivers (D-01).
2. **Render-once static chrome.** `Frozen()` turns the `<head>` + icon SVGs + nav that every app re-serializes per request into a single cached memcpy (D-01).
3. **One serializer, not three.** D-03 kills the drift that already shipped 16 missing HTMX attrs, invalid void elements, and a `</script>` XSS gap in the exported `renderAlgebra` — and makes future attr additions a one-place edit.
4. **Streaming that actually streams.** Real demand-driven backpressure, bounded memory, early `<head>` flush, no double-render (D-02).
5. **CSP without footguns.** Render-time `{ nonce }` that never mutates a shared layout, with streaming parity — apps can stop disabling CSP (D-04).
6. **The fold layer is no longer an XSS bypass.** One hardened `rebuildTag` + shared `escapeJs`/`validateAttributeKey` + typed `HxStatusKey` close three injection holes and stop silent `href`/`src` loss (D-05).
7. **Type-debt paydown.** 54 `as any` casts → 0, the tri-typed render flag → `RawCtx`, `attrs.x as string` → `TagAttrs.get()`, and the `set*`/`add*` convention is finally documented (D-06/D-07).

**Mandatory sequencing:** D-01 (de-recursion + `Frozen`) → D-03 (emitter dedup) → D-02 (backpressure, hard dep on D-01) and D-04 (nonce, consumes the unified emitter + `Frozen` opacity rule); D-05/D-06/D-07 land their per-attribute and reconstruction logic into the single D-03 emitter or ship the three-path parity test.
