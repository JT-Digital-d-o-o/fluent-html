# Render Performance — fresh-eyes audit (lens: render-perf)

**Scope read:** `src/render/serialize.ts`, `src/render/escape.ts`, `src/render/render.ts`, `src/core/tag.ts`, `src/core/htmx-methods.ts`, `bench/render.ts`. All claims below were validated by micro-benchmarks against `dist/` plus A/B runs of the full bench suite (patched `dist` vs pristine, alternating runs); the full test suite (415 tests, incl. the fuzz `render ≡ renderToIterable` parity test) passes against the patched builds.

**Lens summary.** The serializer architecture is sound — single emit loop, no recursion, build-time class accumulation, no O(n²) string building (V8 rope `+=` is fine). The dominant, fixable cost is `escapeHtml`: it hand-scans every character in JS even though the overwhelming majority of SSR strings (every class attribute, id, URL, most text) contain nothing to escape — a one-line regex pre-test makes the *variant-heavy* bench 3.8× faster and every other bench 20–45% faster. The second cost is `buildHtmx`'s 19-entry config-table loop (3× slower than direct checks; +55% on the HTMX bench when unrolled). Several plausible-sounding optimizations were tested and found to be **non-wins** (frame-object allocation, `Object.keys` vs `for-in`, hidden-class field initialization) — recorded below so future effort isn't wasted on them.

**Baseline** (`npm run build && node dist/bench/render.js`, Apple Silicon, Node from local env; 3 runs, ranges shown):

| bench | baseline ops/sec |
|---|---|
| Flat page (1000 divs) | 5.6–6.9K |
| Deep tree (100 levels) | 105–125K |
| Heavy escaping (200 ¶) | 8.6–11.3K |
| HTMX attrs (100 buttons) | 12.0–18.3K |
| Realistic page (~200 tags) | 20.9–24.8K |
| Variant-heavy (100 buttons) | 9.7–10.5K |
| Large ForEach (5000) | 0.86–1.23K |
| Build+render realistic | 15.2K |

---

## render-perf-1: `escapeHtml` scans every char in JS — a regex pre-test fast path is 4–5× faster on clean strings and lifts every bench 20–300%

**Kind:** perf · **Severity:** high
**Evidence:** `src/render/escape.ts:11-28`, `src/render/escape.ts:37-39`

```ts
export function escapeHtml(unsafe: string): string {
  let result = '';
  let lastIdx = 0;
  for (let i = 0; i < unsafe.length; i++) {
    const ch = unsafe.charCodeAt(i);
    ...
  }
  if (lastIdx === 0) return unsafe; // No escaping needed — fast path
  return result + unsafe.substring(lastIdx);
}
```

The "fast path" at line 26 only skips the *rebuild*, not the *scan*: the JS `charCodeAt` loop still walks every character. And **every attribute value goes through this** — `escapeAttr` is an alias (`escape.ts:37-39`), so every fluent-generated class string (`"px-4 py-2 bg-blue-500 text-white rounded transition-colors hover:bg-blue-600 …"`), every id, every URL is char-scanned per tag per render, despite being machine-generated strings that can never contain `&<>"'`.

Adding a native regex pre-test lets V8's vectorized regex engine reject clean strings:

```ts
const NEEDS_ESCAPE = /[&<>"']/;
export function escapeHtml(unsafe: string): string {
  if (!NEEDS_ESCAPE.test(unsafe)) return unsafe;
  /* existing loop unchanged */
}
```

**Micro-benchmark** (`micro-escape.mjs`, 3M iters × 3 rounds, realistic corpus of class strings/ids/URLs/text):

| corpus | current | regex pre-test |
|---|---|---|
| clean (8 typical SSR strings) | 81–94 ns/op | **19–21 ns/op** (4.3×) |
| dirty (3 escape-heavy strings) | 155–160 ns/op | 161–179 ns/op (≤ 11% slower) |

**End-to-end** (patched `dist/src/render/escape.js` only, 3 alternating A/B runs):

| bench | baseline | patched | delta |
|---|---|---|---|
| Variant-heavy | 9.7–10.5K | **35.3–40.6K** | **~3.8×** |
| Realistic page | 20.9–24.5K | 27.0–31.0K | +25–45% |
| Flat page | 5.6–6.9K | 7.0–8.4K | +20–37% |
| HTMX attrs | 12.0–18.3K | 20.2–22.0K | +19–69% |
| Large ForEach | 0.86–1.20K | 1.05–1.35K | +10% |
| Heavy escaping | 8.6–11.3K | 9.5–11.1K | within noise |

The variant-heavy 3.8× is the tell: its long (~250-char), perfectly clean class attribute was eating ~75% of that page's render time in the char loop. Output is byte-identical (parity-checked; all 415 tests incl. fuzz pass on the patched build). Dirty-content cost is bounded (the pre-test aborts at the first special char) and invisible end-to-end.

**Fix:** the two-line change above. Optionally skip the pre-test when `unsafe.length < ~8` if the short-string regex call overhead ever shows up — the corpus above says it doesn't.

---

## render-perf-2: `buildHtmx` walks a 19-entry config table with dynamic key reads per htmx tag — unrolled direct checks are 3× faster (+55% on the HTMX bench)

**Kind:** perf · **Severity:** medium
**Evidence:** `src/render/serialize.ts:142-162` (table), `src/render/serialize.ts:182-187` (loop)

```ts
for (const attr of HTMX_ATTRS) {
  const value = htmx[attr.key as keyof HTMX];
  if (value !== undefined) {
    result += attr.serialize(value);
  }
}
```

For every tag carrying htmx (in an HTMX-first app: most interactive elements), this does 19 megamorphic dynamic-key property reads (`htmx[attr.key]` can't be inline-cached — the key changes every iteration) plus a closure invocation per present attr. A typical config has 2–4 keys set, so ~16 reads find `undefined`.

**Micro-benchmark** (`micro-htmx.mjs`, typical nav/button configs, 2M iters × 3 rounds): config-table loop **353–357 ns/op** vs unrolled `if (htmx.target !== undefined) …` chain **118–119 ns/op** — exactly 3×, with byte-identical output.

**End-to-end** (patched `dist` `buildHtmx` only): HTMX attrs bench 18.0K → **27.8K ops/sec (+55%)**. Combined with render-perf-1: **32.0–37.4K** (~2× baseline). Realistic page (12 htmx buttons of ~200 tags): 24.5K → 25.9K.

**Fix:** replace the table with a monomorphic unrolled sequence of `if (htmx.X !== undefined)` checks (the special cases at `serialize.ts:190-214` already work this way). The table costs nothing in maintainability to inline — it's one call site, and each entry is one line either way. Keep `HTMX_ATTRS` if the extractor/tooling consumes it, but don't drive the hot loop off it.

---

## render-perf-3: shared static layout chrome is re-walked and re-escaped on every request — a pre-rendered-subtree pattern (or `Static()` helper) is +21% on the realistic page *after* fixes 1–2

**Kind:** idea · **Severity:** medium
**Evidence:** `src/render/serialize.ts:409-471` (`emit` re-walks the entire tree unconditionally), `src/core/raw-string.ts` (`Raw` — the enabling primitive already exists)

An SSR app rebuilds the page per request, but the layout chrome (header/nav/footer) is identical every time — and today it is re-serialized, re-`buildAttrs`'d and re-escaped per request. The library already has the primitive to skip this: a `RawString` is emitted with a single `sink.append(v.html)` (`serialize.ts:430-432`).

**Measured** (`micro-static.mjs`, realistic page with header+footer hoisted to `Raw(render(chrome))`, on a dist that already had fixes 1–2 applied — so this win is *on top*): full re-serialize **44.4–45.1K ops/sec** vs hoisted **53.5–54.0K ops/sec** = **+21%**, byte-identical output. On unpatched v6.2.0 the win would be proportionally larger (more escaping avoided).

**Proposal (either or both):**
1. Document the pattern in `performance.md` / README: `const chrome = Raw(render(Header(...)))` at module scope for request-invariant subtrees.
2. A tiny `Static(thunk: () => View): View` helper that renders once on first emit and caches the string — same semantics, but self-describing and safe from the "accidentally shared mutable Tag" footgun that hand-hoisting a `Tag` (rather than a `Raw`) invites. Caveat to document: a `Static`/`Raw` subtree is invisible to render-time nonce stamping (`serialize.ts:438-440`), so it must not contain `<script>`/`<style>` that need nonces.

---

## render-perf-4: the bench harness has 25–57% run-to-run spread — too noisy to validate the very wins it exists to protect

**Kind:** issue · **Severity:** medium
**Evidence:** `bench/render.ts:14-25`, `bench/render.ts:228-234`

```ts
function measure(_name: string, fn: () => void, iterations: number): ... {
  // Warm-up
  for (let i = 0; i < Math.min(iterations, 100); i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;
```

One warm-up (100 iters is not enough for TurboFan on larger bodies), one contiguous sample per scenario, scenarios never interleaved, no median/min. Observed across three back-to-back baseline runs on an idle machine: Large ForEach **860 → 1,230 ops/sec (57% spread)**, HTMX attrs **11.95K → 18.26K (53%)**, Flat **5.58K → 6.88K (23%)**. The file's own comment (`bench/render.ts:229-233`) concedes ±6–40% noise and sets gate floors 8× under — meaning a real 2× regression passes the gate.

This matters now: findings 1–2 above produce 20–55% deltas, i.e. the same order as harness noise; each had to be confirmed by 3 alternating A/B runs plus micro-benchmarks. **Fix:** per scenario take N=7+ short samples and report the median (or min); interleave scenarios across repetition rounds so thermal/GC drift hits all variants equally; extend warm-up to a time budget (e.g. 200ms) instead of 100 iterations. ~20 lines in `measure()`, no new deps; would let the gate floors tighten from 8× to ~1.5×.

---

## render-perf-5: per-node frame objects and per-tag close-tag concatenation in `emit` — measured, only worth ~5–13% on 5000-node lists; low priority

**Kind:** perf · **Severity:** low
**Evidence:** `src/render/serialize.ts:322` (`type Frame = string | { v: View; c: RenderCtx }`), `src/render/serialize.ts:452-453`

```ts
stack.push('</' + el + '>');
stack.push({ v: v.child, c: childCtx });
```

Every non-void tag allocates one `{v, c}` frame object plus one fresh `'</' + el + '>'` string per render (element names come from a fixed ~120-name set — the closer could be a `Map`-cached constant), and every array child costs another frame.

**Measured** (`micro-emit.mjs`: parallel `stackV`/`stackC` arrays with int ctx codes + close-tag cache, byte-identical output): Large ForEach 5000 nodes **1,336 → 1,507 ops/sec (+5–13%, one noisy outlier higher)**; Flat 1000 and Deep 100 **within noise (±2%)**. The traversal is simply not the bottleneck — escaping and `buildAttrs` are. Worth folding in only if someone is already rewriting `emit` (note it must be applied to both `emit` and `emitChunks`, which deliberately duplicate the skeleton per `serialize.ts:403-408`); not worth a dedicated change. Recorded so the "obvious" allocation win isn't re-attempted expecting big numbers.

---

## render-perf-6: verified non-issues — two plausible V8 optimizations that measure flat or negative

**Kind:** pattern · **Severity:** low (negative results, recorded to prevent wasted effort)
**Evidence:** `src/render/serialize.ts:277-279`, `src/core/tag.ts:68-73`

1. **`Object.keys(extraAttrs)` per tag per render** (`serialize.ts:277`: `const extraKeys = Object.keys(extraAttrs);`) looks like an avoidable array allocation, but the bag is a null-prototype object (`Object.create(null)`, `tag.ts:191`) which V8 keeps in dictionary mode — `for…in` over it measured **slower** (304 vs 324 ns/op on a 2-attr `Img`, matched local copies differing only in the loop; `micro-attrs2.mjs`). Keep `Object.keys`.
2. **Lazily-added optional fields** (`tag.ts:68-73`: `id?: string; class?: string; style?: string; … htmx?; toggles?`) create order-dependent hidden classes (`setId().setClass()` vs `setClass()` vs `setStyle().setId()` are three shapes), which in theory makes `buildAttrs`' field reads megamorphic. Constructor-initializing all fields to `undefined` measured **flat**: 81–86 vs 81–82 ns/tag through `buildAttrs` on a deliberately shape-mixed 1000-tag corpus (`micro-attrs.mjs` part B). V8's megamorphic stub handles this fine; don't pay the per-construction cost of initializing six fields (construction is itself per-request in SSR).

---

*Method note: all experiments ran against compiled `dist/` copies of v6.2.0 (branch `v6.2.0`, commit 0ffed5e), patched in place and restored via `npm run build` afterward. Micro-benchmark scripts (`micro-escape.mjs`, `micro-htmx.mjs`, `micro-emit.mjs`, `micro-attrs.mjs`, `micro-attrs2.mjs`, `micro-static.mjs`) live in the session scratchpad. Every A/B variant was parity-checked for byte-identical output before timing, and the full 415-test suite (including the render/stream fuzz parity test) passes against the combined patched build.*
