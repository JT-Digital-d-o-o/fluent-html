# Verification: control-flow-6 (refuter 2)

**Finding:** ForEach array fast path feeds `undefined` for sparse-array holes despite non-nullable `T` typing (src/control/iteration.ts:73).

**Verdict: CONFIRMED — not refuted.**

## Reproduction (against dist/)

Probe (`probe-sparse.mjs`, run with node against `dist/src/index.js`):

```js
import { ForEach, Span, Div, render } from '.../dist/src/index.js';

const sparse = new Array(3);
sparse[0] = 'a';
sparse[2] = 'c';

const calls = [];
const view = Div(ForEach(sparse, (item, i) => { calls.push([i, item]); return Span(`${i}:${item}`); }));
```

Output:

```
callback calls: [[0,"a"],[1,null],[2,"c"]]        // [1, null] = JSON serialization of [1, undefined]
html: <div><span>0:a</span>
<span>1:undefined</span>
<span>2:c</span></div>
Array.prototype.map on same sparse array: ["0:a",null,"2:c"]   // map SKIPS the hole (callback never invoked)
```

## Checks

1. **Code path exists as described.** `src/control/iteration.ts:69-75` — the `Array.isArray` fast path iterates `for (let i = 0; i < arr.length; i++) { result[i] = fn(arr[i], i); }` with no `i in arr` check. Same code is present in `dist/src/control/iteration.js` (line 26 onward).
2. **Callback is invoked for the hole with `undefined`** — the calls log shows the callback ran at index 1 and received `undefined`, even though the overload types it `(item: T, index: number)` with `T = string` for a `string[]`. Type-level contract violated at runtime.
3. **Renders `<span>1:undefined</span>`** — exactly the string claimed in the finding.
4. **Diverges from `Array.prototype.map`** — `map` on the same sparse array never invokes the callback for the hole (it produces a hole in the result); `ForEach` does invoke it. The `Array.from(iterable, fn)` slow path (line 79) would also yield `undefined` for holes, but a caller comparing against `.map` semantics still gets a surprise from the documented "maps each item" contract.
5. **No test pins the behavior** — `grep -ri "sparse" test/` and a search for sparse-array constructions in `test/` return nothing relevant.

## Notes on severity framing

- Sparse arrays are rare in app code, but `new Array(n)` without fill is an easy way to produce one, and the failure mode is a literal `undefined` rendered into user-visible HTML with no type error.
- The finding's proposal (pick a contract — skip holes via `i in arr`, or document hole-visits-with-undefined — and add a test) is accurate and actionable. Note: skipping holes would leave holes in the `result` array (as `map` does), which the renderer would then need to tolerate; alternatively compact the result. Either way the decision should be pinned by a test.

**Conclusion: finding stands. refuted = false.**
