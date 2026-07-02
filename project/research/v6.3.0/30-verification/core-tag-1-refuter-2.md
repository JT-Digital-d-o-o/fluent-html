# Verdict: core-tag-1 — CONFIRMED (refutation failed)

**Finding:** addChild mutates caller-owned / shared child arrays (aliasing corruption)
**Anchor:** `src/core/tag.ts:309` (`current.push(...views)`), with aliasing introduced at `src/core/tag.ts:84` (`this.child = children[0]!` when a single array child is passed)
**Mode:** refute-by-reproduction against `dist/src/index.js` (v6.2.0)
**Result:** Reproduced exactly as described. **refuted = false.**

## Reproduction 1 — shared array corrupts sibling tag

```js
import { Ul, Li, render } from '<repo>/dist/src/index.js';
const shared = [Li('a'), Li('b')];
const ul1 = Ul(shared);
const ul2 = Ul(shared);
ul1.addChild(Li('c'));
```

Output:

```
ul1: <ul><li>a</li><li>b</li><li>c</li></ul>
ul2: <ul><li>a</li><li>b</li><li>c</li></ul>   <- ul2 also got <li>c</li>
shared.length: 3                                <- caller's array mutated
aliased: true                                   <- ul1.child === shared === ul2.child
```

`Ul(shared)` stores the caller's array by reference (constructor, tag.ts:84: single child → `children[0]!`). `addChild` then hits the `Array.isArray(current)` branch (tag.ts:308–309) and pushes into that caller-owned array, so the mutation leaks to every other view holding the same array.

## Reproduction 2 — SSR memory growth on module-level array

```js
const NAV_ITEMS = [Li('Home'), Li('About')];
function renderPage(extra) {
  return render(Ul(NAV_ITEMS).addChild(Li(extra)));
}
renderPage('req1'); renderPage('req2'); renderPage('req3');
// NAV_ITEMS.length === 5   (grows by 1 per request; stale items render on later requests)
```

Confirms the SSR failure mode claimed in the finding: a module-level child array grows unboundedly and accumulates prior requests' content.

## Contrast case (why ownership matters)

`Div(a, b).addChild(c)` is safe — the variadic rest parameter creates a fresh Tag-owned array, so pushing into it affects no one else. Verified: a second `Div(a, b)` renders without `c`. This supports the proposed fix's ownership distinction: only arrays Tag itself allocated (constructor rest array, the `[current, ...views]` branch at tag.ts:311) may be pushed into; a caller-provided array must be copied.

One additional note for the fixer: the empty-child branch (tag.ts:307, `this.child = views.length === 1 ? views[0]! : views`) has the same aliasing hazard when the single appended view is itself a caller-owned array (`tag.addChild(callerArray)`), so a copy-always fix in the array branch alone does not cover every alias source.

## Conclusion

Could not refute. Defect positively confirmed by execution against the built package; behavior matches the finding's evidence verbatim.
