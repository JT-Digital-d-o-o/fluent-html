# Verification: elements-symmetry-7 (refuter 2)

**Verdict: CONFIRMED — refutation failed.** Reproduced by tsc probe and runtime script against `dist/`.

## Finding
ImgTag has no `usemap` setter while the other three legs of the image-map feature (MapTag.setName, AreaTag's eight setters, `ismap` boolean) are fully typed.

## Reproduction

Probe: `scratchpad/probe-usemap/probe.ts`, typechecked with `tsc --noEmit --strict` against `dist/src/index.d.ts` (package `main`/`types` point at `dist/src/index.js`/`.d.ts`).

1. **Type level** — `Img().setSrc("/a.png").setUsemap("nav")` fails:
   ```
   error TS2339: Property 'setUsemap' does not exist on type 'ImgTag'.
   ```
2. **Runtime level** — `typeof Img().setUsemap` → `undefined`.
3. **`grep -rn usemap src/`** → zero hits anywhere in the library source. Neither `ImgTag` (src/elements/media.ts:13-83, schema keys at :83) nor `ObjectTag` (src/elements/embedded.ts:85-116, schema keys `['data','type','width','height','name']`) exposes it.

## Evidence anchors verified

- `src/elements/media.ts:13-83` — ImgTag fields/setters: src, alt, width, height, loading, decoding, srcset, sizes, crossorigin, fetchpriority, referrerpolicy. No usemap. ✓
- `src/elements/links.ts:65-78` — `MapTag.setName` typed. ✓ (renders `<map name="nav">…</map>`)
- `src/elements/links.ts:80-135` — AreaTag: shape, coords, href, alt, target, rel, download, referrerpolicy — all eight typed. ✓
- `src/elements/html-types.ts:225` — `'ismap'` present in `BooleanAttribute`; `Img().toggle("ismap")` works. ✓

## The workaround and its footgun (reproduced)

```js
render(Img().setSrc('/a.png').addAttribute('usemap', '#nav').toggle('ismap'))
// → <img src="/a.png" usemap="#nav" ismap>          (works, but untyped)

render(Img().setSrc('/a.png').addAttribute('usemap', 'nav'))
// → <img src="/a.png" usemap="nav">                 (silently broken — no '#')
```

The forgotten-`#` variant renders without error but browsers require a hash-name reference for `usemap`, so the map silently fails to attach — exactly the failure mode the finding describes.

## Assessment of proposal

`ImgTag.setUsemap(name?: string)` normalizing the `#` prefix matches the existing setter pattern (optional param, `this` return, add to `defineSchemaKeys`). Extending to `ObjectTag` is correct: it is the only other conforming `usemap` host in HTML, and it currently lacks the setter too (verified).

No overstatement found; severity (minor completeness gap with a silent-failure workaround) is fairly characterized.
