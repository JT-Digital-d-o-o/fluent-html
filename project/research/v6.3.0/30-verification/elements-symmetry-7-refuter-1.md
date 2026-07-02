# elements-symmetry-7 — Refuter 1 verdict

**Finding:** Image-map trio incomplete: MapTag/AreaTag fully typed but ImgTag has no usemap setter.

**Verdict: CONFIRMED (refutation failed)**

## Refutation attempts

1. **"A usemap setter exists somewhere."** — Refuted the refutation: `grep -rin "usemap"` across `src/` returns **zero hits**. `ImgTag` (src/elements/media.ts:13-83) declares exactly `src, alt, width, height, loading, decoding, srcset, sizes, crossorigin, fetchpriority, referrerpolicy` — no `usemap` field, setter, or schema key (media.ts:83).

2. **"A generic typed mechanism covers it."** — No. The only mechanisms on `Tag` are `addAttribute(key: string, value: string)` (src/core/tag.ts:188, untyped) and `toggle(name: BooleanAttribute)` (tag.ts:220), which covers only boolean `ismap`. `usemap` takes a value (`#name`) so `toggle` cannot express it. The workaround is exactly what the finding states: `addAttribute("usemap", "#name")` with the caller-remembered `#` prefix.

3. **"Image maps are intentionally unsupported / deprecated."** — No. `usemap` is valid, non-deprecated HTML, and the library clearly *intends* to support image maps: `MapTag.setName` exists (src/elements/links.ts:65-74), `AreaTag` has all eight attributes typed (links.ts:80-131), and `ismap` is deliberately included in `BooleanAttribute` (src/elements/html-types.ts:225). Three of the feature's four legs are typed; the connecting leg is missing — this is asymmetry, not policy.

4. **"ObjectTag has it, so only Img was scoped out."** — No. `ObjectTag` (src/elements/embedded.ts:85-118) also lacks `usemap` (`data, type, width, height, name` only), consistent with the finding's secondary observation.

## Evidence anchors verified

| Claim | Location | Status |
|---|---|---|
| MapTag.setName typed | src/elements/links.ts:65-74 | accurate |
| AreaTag eight typed attrs | src/elements/links.ts:80-131 | accurate (shape, coords, href, alt, target, rel, download, referrerpolicy) |
| `ismap` in BooleanAttribute | src/elements/html-types.ts:225 | accurate |
| ImgTag lacks usemap | src/elements/media.ts:13-83 | accurate (grep across src: 0 hits) |
| ObjectTag also lacks usemap | src/elements/embedded.ts:85-118 | accurate |

## Notes on severity

This is an API-completeness/DX gap, not a runtime bug — rendering still works via `addAttribute`. But as a symmetry finding it is factually correct in every particular, and the proposed `setUsemap(name)` with `#`-prefix normalization matches the library's existing setter conventions (cf. `popovertarget` using `extractId`, tag.ts:462, which already normalizes id references for callers).
