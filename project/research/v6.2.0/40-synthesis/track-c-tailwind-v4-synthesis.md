# Track C — Tailwind v4 — Synthesis (v6.2.0)

Consolidated from 10 discovery lenses (c01–c10). Re-verified against CHANGELOG 6.0.0 → 6.1.1
and against `src/core/tailwind-methods.ts` / `src/class-vocab/vocab.ts` (greps confirm absence).
All proposals are new fluent Tailwind methods (or one-line type-union widenings) that today force a
raw `.setClass(...)` / `.addClass(...)` escape hatch. Naming follows the lib's `pre`/`opt`/`stat`/`size`
vocab helpers; lockstep with the extractor + eslint plugin is required for every new vocab row.

---

## Deduplication (merged across lenses)

| Merged proposal | Came from | Kept signature from |
|---|---|---|
| `accentColor` / `caretColor` | c01, c10 | c01 (`TailwindColor` reuse) |
| `fieldSizing("content"\|"fixed")` | c06, c10 | c06 |
| `colorScheme` / `scheme` | c01, c10 | c10 (6-member union incl. `normal`) |
| Gradient color-interpolation modifier | c01, c03 | c03 (per-method `interpolation?` arg) |

Note: c01's gradient-interpolation idea (a class-mutating `gradientInterpolation()`) is **dropped** in favor of
c03's cleaner design — an optional `interpolation?` arg on the existing `gradientTo/Linear/Conic/Radial`
emitters, so the slash modifier is part of the base token at emit time (no post-hoc class mutation).

---

## Prioritized table

Value/effort sort: high-value + small-effort first.

| # | Proposal | Proposed API | Value | Effort | Why |
|---|---|---|---|---|---|
| 1 | **`fill` / `stroke` (+`strokeWidth`)** SVG color | `fill(c: TailwindColor\|"none")` → `fill-red-500`; `stroke(c: TailwindColor\|"none")`; `strokeWidth(0\|1\|2\|"[…]")` | high | small | Inline SVG icons are everywhere; `fill-current` is the canonical icon color-inherit. Today forces `setClass("fill-current stroke-red-500")`. |
| 2 | **`accentColor` / `caretColor`** | `accentColor(c: TailwindColor)` → `accent-blue-600`; `caretColor(c: TailwindColor)` → `caret-pink-500` | high | small | Themes native checkbox/radio/range + input caret. Reuses closed `TailwindColor` (free plumbing). Direct fit with `Form<T>`. |
| 3 | **`size(...)`** — w+h shorthand | `size(v: TailwindSize)`; `size(unit, amount)` → `size-16` / `size-[10px]` | high | small | Square avatars/icons/spinners halve the call. `size()` vocab helper is private — no public `.size()` exists, no collision. Reuses `kind:"sizing"` emitter so `(unit, amount)` comes free. |
| 4 | **`textWrap`** | `textWrap("wrap"\|"nowrap"\|"balance"\|"pretty")` → `text-balance` | high | small | `balance` on headings, `pretty` on body copy. `whitespace()` cannot emit these. Baseline. |
| 5 | **`delay`** — transition-delay | `delay(v: TailwindDelay)` → `delay-150` | high | small | Companion to existing `duration()`; staggered/entrance choreography. Mirror `TailwindDuration` exactly. Entirely missing. |
| 6 | **`transitionBehavior`** | `transitionBehavior("discrete"\|"normal")` → `transition-discrete` | high | small | The mechanism that makes `display`/popover/dialog animate — completes the already-shipped `starting:` variant + native dialog (6.1.x). |
| 7 | **`dropShadow` (+`dropShadowColor`)** | `dropShadow(v?: "xs".."2xl"\|"none"\|"[…]")`; `dropShadowColor(TailwindColor)` | high | small | Only missing CSS filter; follows alpha outline (logos/icons). v4.1 colored. Mirror `shadow`/`shadowColor`. |
| 8 | **`textShadow` (+`textShadowColor`)** | `textShadow(v?: "2xs".."lg"\|"none"\|"[…]")`; `textShadowColor(TailwindColor)` | high | small | Brand-new v4.1 typography utility; hero/headline copy. Typography analogue of `shadow`. |
| 9 | **`perspective` + `perspectiveOrigin`** | `perspective("dramatic"\|"near"\|"normal"\|"midrange"\|"distant"\|"none"\|"[…]")`; `perspectiveOrigin(9-way\|"[…]")` | high | small | Without it all 3D transforms render flat. Plain `pre()` vocab rows. Gates items 19–21. |
| 10 | **`rotateX` / `rotateY` / `rotateZ`** | `rotateX/Y/Z(v: TailwindRotate)` → `rotate-x-45` / `-rotate-x-45` | high | small | Bare `rotate()` is 2D-only. Mirror existing `skewX/skewY`, reuse `signNeg` + `TailwindRotate`. |
| 11 | **`translate` z-axis** (widen union) | `translate("x"\|"y"\|"z", v)` → `translate-z-12` | high | small | Core 3D depth primitive. Impl already interpolates direction; only the union + extractor sample change. |
| 12 | **`data-*` variants on `.on()`** | `TailwindState \| \`data-${string}\` \| \`group-data-${string}\` \| \`peer-data-${string}\`` | high | small | Core HTMX/headless styling hook. Runtime already emits prefix verbatim; only the type union is missing. |
| 13 | **`aria-*` variants on `.on()`** | closed `AriaBoolVariant` + `\`aria-[${string}]\`` + `group-aria-`/`peer-aria-` | high | small | `Form<T>` already EMITS `aria-invalid` so the variant can target it, yet `.on("aria-invalid", …)` is a type error today. Closes the a11y loop. |
| 14 | **named `group-*` / `peer-*` variants on `.on()`** | `TailwindState \| \`group-${string}\` \| \`peer-${string}\`` | high | small | `.group(name)`/`.peer(name)` already emit `group/name` but no `group-hover/item` type form. Half-built: producer ships, consumer doesn't type-check. Subsumes group-data-/group-aria-. |
| 15 | **`fieldSizing("content"\|"fixed")`** | → `field-sizing-content` | high | small | JS-free auto-growing textarea — marquee v4 form feature for an SSR/HTMX no-JS app. Serves `f.textarea()`. (Caveat: not yet Baseline — Chromium-only; degrades gracefully.) |
| 16 | **Gradient stop positions** on `from`/`via`/`to` | `from(c, position?: \`${number}%\`\|"[…]")` (same via/to) → `from-indigo-500 from-10%` | high | small | v4's positioned color stops have no typed path. Canonical v4 gradient example uses them. |
| 17 | **Container-query closed union for `.at()`** | tighten `TailwindContainerBreakpoint` to `@3xs…@7xl` + `@min-[…]`/`@max-[…]` + named-scope, keep arbitrary open | high | small | Today fully open → `.at("@mdd", …)` type-checks with no autocomplete/typo protection. Type-only, no runtime change. |
| 18 | **Grid-line placement** | `colStart/colEnd/rowStart/rowEnd(v: TailwindGridLine)`; `rowSpan(v)` → `row-span-3` / `-col-start-1` | high | medium | Most common grid need after `gridCols`/`colSpan` (which exist). No `rowSpan` or any start/end placement today. Negative-line emitter needed. |
| 19 | **`decorationColor` (+`decorationStyle`/`decorationThickness`)** | `decorationColor(TailwindColor)` → `decoration-red-500`; `decorationStyle(...)`; `decorationThickness(...)` | medium | small | Completes the existing `underline`/`lineThrough`/`underlineOffset` family for branded link underlines. |
| 20 | **`transformStyle` + `backfaceVisibility`** | `transformStyle("3d"\|"flat")` → `transform-3d`; `backfaceVisibility("visible"\|"hidden")` → `backface-hidden` | medium | small | Nested 3D scenes (cubes, flip cards). Closed 2-value unions via `pre()`. Pairs with items 9–11. |
| 21 | **`scaleX` / `scaleY` / `scaleZ` / `scale3d`** | `scaleX/Y/Z(v: TailwindScale)`; `scale3d()` → `scale-3d` | medium | small | `scale()` is uniform-only. `scaleX/Y` useful in 2D (flip without rotate). Reuse `TailwindScale` + `signNeg`. |
| 22 | **`columns`** — multi-column layout | `columns(v: TailwindColumns)` → `columns-3` / `columns-xs` / `columns-auto` | medium | small | No `columns` anywhere. One `pre()` row + closed union. Pairs with item 23. |
| 23 | **`breakInside`/`breakBefore`/`breakAfter` + `boxDecoration`** | `breakInside("avoid"\|…)`; `breakBefore/After(...)`; `boxDecoration("clone"\|"slice")` | medium | small | Column/page fragmentation (e.g. `break-inside-avoid` keeps a card whole). Natural companion to `columns`. Only `breakAll` (word-break) exists. |
| 24 | **`isolate` / `isolation`** | `isolate()` → `isolate`; `isolation("auto")` | medium | small | New stacking context — canonical z-index-leak fix + documented `mix-blend` guard. |
| 25 | **`insetX` / `insetY` (+ logical `insetS`/`insetE`)** | overloads (`TailwindInset` \| dir+value \| unit+amount) → `inset-x-0` | medium | small | `inset-x-0` is daily for full-width sticky bars/overlays; `inset-s/e` are RTL-correct (v4.3 deprecated `start-*`/`end-*`). Reuse `kind:"sizing"` emitter. |
| 26 | **`insetShadow`/`insetRing` (+ color variants)** | `insetShadow(v?)`; `insetShadowColor(c)`; `insetRing(v?)`; `insetRingColor(c)` | medium | small | v4 split inner shadows into dedicated `inset-shadow-*` + `inset-ring-*` that layer independently of outer shadow/ring. Lib only has legacy `shadow("inner")`. |
| 27 | **`mixBlend` / `bgBlend`** | `mixBlend(mode)` → `mix-blend-multiply`; `bgBlend(mode)` | medium | small | Compositing parity gap (duotone/overlay imagery, badges over photos). v4 adds `plus-darker`/`plus-lighter`. |
| 28 | **Gradient angle methods** | `gradientLinear(angle: number)` → `bg-linear-45` / `-bg-linear-65`; `gradientConic(angle?)` → `bg-conic-180` | medium | small | `gradientTo` is keyword-direction-only; conic is bare-only. Reuse existing `signNeg`. |
| 29 | **Gradient interpolation modifier** | `interpolation?` arg on `gradientTo/Linear/Conic/Radial` → `bg-linear-to-r/oklch`, `bg-conic/decreasing` | medium | medium | Headline v4 gradient feature (controls mid-tone vibrancy). `oklab` default. Base-token modifier slot — touches 4 emitters. |
| 30 | **`colorScheme` / `scheme`** | `scheme("normal"\|"light"\|"dark"\|"light-dark"\|"only-light"\|"only-dark")` → `scheme-light-dark` | medium | small | Native widgets/scrollbars/date inputs honor light/dark; pairs with the project's `dark:` usage. |
| 31 | **`scrollMargin`/`scrollPadding`/`scrollBehavior`** | `scrollMargin` overloads → `scroll-mt-*`; `scrollPadding`; `scrollBehavior("auto"\|"smooth")` | medium | medium | `scroll-mt-*` offsets sticky headers for in-page anchors; pairs with HTMX `show:window:top`. Reuse `space()` family for directional+unit overloads free. |
| 32 | **Scroll-snap family** | `snap(type\|strictness)`; `snapAlign(...)`; `snapStop("normal"\|"always")` | medium | medium | Carousels/galleries. Container + child methods. Currently stringly `setClass("snap-x snap-mandatory")`. |
| 33 | **`hyphens`** | `hyphens("none"\|"manual"\|"auto")` → `hyphens-auto` | medium | small | Pairs with shipped `setLang` for auto-hyphenation of narrow-column body text in SSR content sites. |
| 34 | **`ease("initial")`** (widen `TailwindEase`) | add `"initial"` arm → `ease-initial` | medium | small | Reset easing inside a variant. One-arm union widening, no method change. |
| 35 | **`containerType`/size containment** | `containerQuery({ name?, type?: "inline-size"\|"size" })` → `@container-size` | medium | small | `containerQuery()` only emits inline-size; `@container-size` needed for `cqb`/`cqh` + height queries. Keep existing string overload. |
| 36 | **`cq*` length units** in sizing overloads | widen `LengthUnit` with `cqw\|cqi\|cqb\|cqh\|cqmin\|cqmax` → `.w("cqw",50)` → `w-[50cqw]` | medium | small | Natural sizing primitive inside a container. Method bodies unit-agnostic; only the union widens. |
| 37 | **Widen `aspect` to arbitrary ratios** | `TailwindAspect \| \`[${string}]\``; optional `aspect(w, h)` → `aspect-[16/9]` | medium | small | `aspect()` exists but union is `auto\|square\|video` only — a 16/9 hero must fall to `setClass`. (Discovery flagged `alreadyInLib:true` for the method; the union-widen is the gap.) |
| 38 | **`*` / `**` child & descendant variants on `.on()`** | `TailwindState \| \`*:${string}\` \| \`**:${string}\`` | medium | small | Style children without per-child classes — idiomatic with `ForEach`-rendered rows. |
| 39 | **Structural `nth-*` family + missing pseudo keywords** | add `nth-/nth-last-/nth-of-type-/nth-last-of-type-${string}` + literals (`only`, `target`, `read-only`, `autofill`, `user-valid`, `rtl`, `ltr`, …) | medium | small | Only `nth-[…]` exists today; the rest are verbatim-safe but type-error. |
| 40 | **`mask*` family** (image presets + edge fades + composite) | `maskImage`, `maskLinear/Radial/Conic`, `maskFrom/To(edge, stop)`, `maskComposite`, `maskSize`, `maskType` | high | large | Signature v4.1 feature; previously arbitrary-only. Broad surface — **phase**: image presets + edge fades + composite first; defer repeat/clip/origin/position. |
| 41 | **`touchAction` + `forcedColorAdjust`** | `touchAction(...)` → `touch-manipulation`; `forcedColorAdjust("auto"\|"none")` | low | small | `touch-manipulation` kills 300ms tap delay; `forced-color-adjust-none` complements shipped forced-colors a11y for brand swatches. Cheap batch. |
| 42 | **Logical sizing: `inlineSize`/`blockSize` (+min/max)** | `inlineSize(TailwindWidth)`/`blockSize(TailwindHeight)` + min/max counterparts | low | medium | Writing-mode/RTL correctness — niche until an app goes RTL. Weigh against the "one way to do each thing" convergence rule. |

---

## Grouped: Quick wins (high value, small effort)

Ship these first — each is a 1–2 vocab rows + closed-union method, or a pure type widening, reusing an
existing emitter:

- **Color**: `fill`/`stroke`(+`strokeWidth`) · `accentColor`/`caretColor` · `decorationColor`(+style/thickness)
- **Sizing**: `size(...)` w+h shorthand · `insetX`/`insetY`(+`insetS`/`insetE`)
- **Typography**: `textWrap` · `hyphens` · `textShadow`(+color)
- **Effects/filters**: `dropShadow`(+color) · `insetShadow`/`insetRing`(+colors) · `mixBlend`/`bgBlend`
- **Transitions**: `delay` · `transitionBehavior` · `ease("initial")`
- **Transforms 3D**: `perspective`/`perspectiveOrigin` · `rotateX/Y/Z` · `translate` z-axis · `transformStyle`/`backfaceVisibility` · `scaleX/Y/Z`/`scale3d`
- **Layout**: `columns` · `breakInside`/`breakBefore`/`breakAfter`+`boxDecoration` · `isolate`
- **Variants on `.on()`** (mostly pure type adds, emitter unchanged): `data-*` · `aria-*` · named `group-*`/`peer-*` · `*`/`**` · `nth-*` family
- **Container queries**: closed union for `.at()` (type-only) · `containerType` size · `cq*` units
- **Gradients**: stop positions on `from`/`via`/`to` · angle methods
- **Misc**: `colorScheme`/`scheme` · `fieldSizing` (with Baseline caveat) · widen `aspect` to `[…]`

## Grouped: Bigger bets (medium/large effort, or design-touchy)

- **`mask*` family** (large) — phase the high-use subset first (image presets, edge fades, composite); defer the long tail. Highest single-feature value in the track but the only large item.
- **Gradient interpolation modifier** (medium) — touches all 4 gradient emitters to add the base-token `/space` slot. Pairs naturally with stop-positions + angles to land a complete v4 gradient story in one release.
- **Grid-line placement** (medium) — needs a custom negative-line emitter for `-col-start-N`.
- **`scrollMargin`/`scrollPadding`** + **scroll-snap** (medium each) — wire into the `space()` family; snap needs container+child split. Good "scroll experience" bundle with `scrollBehavior`.
- **Logical sizing `inlineSize`/`blockSize`** (low/medium) — defer; convergence-rule risk until an app actually goes RTL.

---

## Cut / already-shipped

- **Gradient interpolation as a class-mutating `gradientInterpolation()` (c01)** — cut in favor of c03's
  `interpolation?` arg design (item 29). Merged.
- **`accentColor`/`caretColor` (c10), `fieldSizing` (c10), `colorScheme`/`scheme` (c01)** — duplicates of
  c01/c06; merged into items 2, 15, 30 respectively (single entry each).
- **Relational state hooks `has-`/`group-has-`/`peer-has-`/`in-` on `.on()`** — **already shipped in 6.1.1**
  (CHANGELOG: "TW4 relational state hooks"). Not re-proposed. The `data-`/`aria-`/named-`group`/`*`/`nth`
  variant arms (items 12–14, 38–39) are the *remaining* gaps in `TailwindState`.
- **`viewTransitionName` / `anchorName` / `positionAnchor` / `positionArea`** — **already shipped (6.1.x)**,
  now emitting inline style. Not in this track.
- **`starting:` variant** — already present (`tailwind-types.ts`); item 6 (`transitionBehavior`) is its
  runtime companion, not a re-proposal.
- **`aspect()` method** — already exists; only the **union widen to arbitrary ratios** is the gap (item 37).

## Lockstep reminder

Every new vocab row must regenerate the `fluent-html-tailwind-extractor` (class→method round-trip) and the
`fluent-html-eslint-plugin` (flags raw `addClass`). Proposals deliberately reuse `pre`/`opt`/`stat`/`size`/
`space`/`custom` helpers so only the `mask*` `custom` emitters and the grid negative-line emitter need new
extractor code paths. Pure type-union widenings (variants on `.on()`, `cq*` units, `aspect` arbitrary,
`ease("initial")`) need no emitter change but DO need compile-only `test/types/*.test-d.ts` coverage to lock
the typo-is-a-compile-error contract.
