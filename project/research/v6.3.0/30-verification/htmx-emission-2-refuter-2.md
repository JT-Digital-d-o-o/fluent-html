# Verdict: htmx-emission-2 — CONFIRMED (refutation failed)

**Finding:** `Partial()` corrupts every non-id target by force-prefixing `#` (src/patterns.ts:41)
**Mode:** refute-by-reproduction
**Result:** `refuted = false` — the defect reproduces exactly as described, against the shipped `dist/` build.

## Reproduction

Probe script run with Node against the compiled library (`dist/src/patterns.js`, `dist/src/htmx.js`, `dist/src/render/render.js`):

```js
import { Partial } from '.../dist/src/patterns.js';
import { clss, closest, find, id } from '.../dist/src/htmx.js';
import { render } from '.../dist/src/render/render.js';

render(Partial(clss('items'), 'X'));
render(Partial(closest('tr'), 'X'));
render(Partial(find('.content'), 'X'));
render(Partial(id('main'), 'X'));
render(Partial('main', 'X'));
```

Actual output:

```
clss:    <hx-partial hx-target="#.items"        hx-swap="outerMorph">X</hx-partial>
closest: <hx-partial hx-target="#closest tr"    hx-swap="outerMorph">X</hx-partial>
find:    <hx-partial hx-target="#find .content" hx-swap="outerMorph">X</hx-partial>
id():    <hx-partial hx-target="#main"          hx-swap="outerMorph">X</hx-partial>
bare:    <hx-partial hx-target="#main"          hx-swap="outerMorph">X</hx-partial>
```

- `#.items` is an invalid CSS selector (matches nothing → swap no-ops).
- `#closest tr` / `#find .content` are neither valid CSS nor valid htmx extended selectors — the extended-selector semantics are destroyed.
- Only `Id` objects, `id()`-built strings, and bare id names survive.

## Type-level confirmation

The signature admits every corrupted input — this is not misuse:

- `dist/src/patterns.d.ts:22` — `export declare function Partial(target: HxTarget | Id, content: View, swap?: HxSwap): Tag;`
- `dist/src/htmx.d.ts:27` — `export type HxTarget = StandardCSSSelector | ExtendedCSSSelector;`
- `src/htmx.ts:388-412` ships `clss()`, `closest()`, `find()` (and `next()`/`previous()`) as documented `HxTarget` builders, all of which `Partial()` mangles.

## Source confirmation

`src/patterns.ts:41-42` (matches compiled `dist/src/patterns.js:32`):

```ts
const selector = isId(target) ? target.selector :
  target.startsWith('#') ? target : `#${target}`;
```

Any string not already starting with `#` is unconditionally prefixed, regardless of whether it is a class selector or an htmx extended selector.

## Conclusion

The evidence anchor, the type surface, and the runtime behavior all line up with the finding. Every non-id `HxTarget` passed to `Partial()` emits a corrupted `hx-target`, silently producing a no-op swap. The proposed fix (pass strings through verbatim, optionally keeping the bare-name convenience behind a `/^[A-Za-z][\w-]*$/` guard) is consistent with the observed behavior.

**refuted: false · confidence: high**
