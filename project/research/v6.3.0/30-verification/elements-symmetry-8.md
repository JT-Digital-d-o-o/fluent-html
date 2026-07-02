# Verification: elements-symmetry-8 — Clear-by-undefined is arbitrary per class

**Finding:** Most element setters follow "optional param, undefined clears" (`AudioTag.setSrc(src?: string)`) but a minority require the argument (`VideoTag.setSrc(src: string)`), breaking conditional composition like `tag.setColspan(props.span)` when the prop is `T | undefined`.

## Gap check: CONFIRMED (and broader than claimed)

Every cited anchor verified in current src:

- `src/elements/media.ts:163` — `VideoTag.setSrc(src: string)` required, vs `AudioTag.setSrc(src?: string)` at media.ts:195. Same element category, opposite conventions.
- `VideoTag.setWidth/setHeight` (media.ts:153-160), `CanvasTag` (254-261), `SourceTag` (128-135) — required; `ImgTag.setWidth/setHeight` (media.ts:36-44) — optional.
- `tables.ts` — `ThTag.setColspan/setRowspan/setScope/setAbbr` (43-56, 71-74), `TdTag` (88-96), `ColTag/ColgroupTag.setSpan` (125, 140) all required. **Zero optional setters in tables.ts.**
- `SvgTag.setViewBox/setFill/setStroke` (media.ts:290-308) required.

**Broader than the finding states:** a repo-wide count shows ~112 required-param value setters across `src/elements/` vs ~165 optional-param setters. The bulk of the required ones are in `svg.ts` (~60 setters: setCx, setD, setX/Y, setFontSize, …), which the finding did not enumerate. Optional is clearly the dominant convention (forms.ts: 55 optional / ~1 required; document.ts: 31/0; links.ts: 16/0), so the required minority is an accident, not a design.

**No existing API covers the gap.** The only workarounds are `.when(props.span, (t, v) => t.setColspan(v))` / `whenElse` — which is exactly the asymmetric ceremony the finding names; identically-shaped optional setters need none. `addAttribute` bypasses typing. Render layer already skips undefined (`tag.ts:432` `if (value === undefined) continue;`), so "undefined clears/omits" semantics generalize cleanly.

## Call-site evidence (weak)

- No `.when(…set(Colspan|Span|Src|ViewBox|…))` workaround exists anywhere in fluent-html, fluent-html-demos, ttl, or rideshare — nobody has actually hit this yet.
- Real usage of the affected setters is all literal-valued: `Th().setColspan(2)` (test/tables.test.ts:40), `Video().setSrc("video.mp4").setWidth(640)` (test/elements.test.ts:278), `Svg().setViewBox(\`0 0 ${w} ${h}\`)` across ~8 demo views. None would change or benefit today.
- The pain is prospective (conditional props into table/SVG builders), not observed.

## Notes on the proposal

- Strictly widening — no call site breaks. Mechanical edit (~112 signatures; setters doing `String(width)` need an undefined guard).
- Minor cost: `Video().setSrc()` with no argument becomes legal everywhere — a tradeoff the majority convention already accepts.
- Enforcement via a type-level test (`test/types/type-surface.test-d.ts` already exists) is cheap; an eslint rule in fluent-html-eslint-plugin is optional extra.

## Score: 5/10

The inconsistency is real, pervasive (112 setters), and the fix is cheap, safe, and permanently closes a whole class of future friction with a single testable invariant — high consistency value for a library whose core promise is a uniform fluent API. But judged strictly on evidence, zero existing call sites in src/test/examples/downstream improve today; nobody has yet written the `.when()` workaround this would eliminate. Solid hygiene work, not a demonstrated pain-reliever.

**gapConfirmed: true**
