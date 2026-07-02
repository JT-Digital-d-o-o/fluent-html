# Track C — Tailwind v4 misc-modern utilities for fluent-html v6.2.0

Lens scope: misc-modern utilities — text-wrap (balance/pretty), hyphens, field-sizing, accent-color, caret-color, color-scheme/scheme-*, forced-color-adjust, scroll-* (snap/margin/padding/behavior), overscroll, touch-action, will-change, @theme/@utility.

## Method of verification

The fluent styling vocabulary has a single source of truth in `src/class-vocab/vocab.ts` (header: "the ~120-row source of truth … the extractor + ESLint maps are generated from this array"), mirrored 1:1 by render emitters in `src/core/tailwind-methods.ts` and arg unions in `src/core/tailwind-types.ts`. Every proposal below was grepped against all three. Lockstep requirement: each new row is a `stat()`/`pre()`/`space()`/`size()` entry in `vocab.ts` plus a method+emitter in `tailwind-methods.ts` plus (if it has args) a union in `tailwind-types.ts`; the `class-vocab.test.ts` lib-parity test then keeps the extractor + ESLint plugin honest automatically.

**Already covered in my lens (do not re-propose):**
- `willChange(TailwindWillChange)` — `tailwind-methods.ts:337,747`, `tailwind-types.ts:302`.
- `overscroll(value)` / `overscroll("x"|"y", value)` — `tailwind-methods.ts:340-341,751-753`, `tailwind-types.ts:303`.
- `whitespace(TailwindWhitespace)` — `tailwind-methods.ts:264,638`, `tailwind-types.ts:198`. (Covers `whitespace-nowrap`, NOT `text-wrap`.)
- `breakAll()` → `break-all` — `tailwind-methods.ts:328,733`.
- `select`, `pointerEvents`, `cursor`, `resize`, `outlineHidden` — already present.

Everything below is genuinely absent.

---

## 1. `textWrap(value)` — text-wrap: balance / pretty / nowrap / wrap

**Problem/evidence.** No way to emit `text-balance` or `text-pretty`. Grep for `text-wrap|balance|pretty|textWrap` across `vocab.ts`, `tailwind-methods.ts`, `tailwind-types.ts` returns nothing (the only `wrap` hits are `flexWrap`/`breakAll`). `whitespace()` (`tailwind-types.ts:198`) emits the `white-space` property — a different CSS property; it cannot produce `text-wrap: balance`. This is the single highest-value gap in the lens: `text-balance` on headings and `text-pretty` on body copy are everyday typography wins for an SSR/Tailwind app, and both are now Baseline (text-wrap:balance Baseline 2024; pretty broadly shipping). Verified class names from tailwindcss.com/docs/text-wrap: `text-wrap`, `text-nowrap`, `text-balance`, `text-pretty` (all set CSS `text-wrap`).

**Proposed API.**
```ts
type TailwindTextWrap = "wrap" | "nowrap" | "balance" | "pretty";
textWrap(value: TailwindTextWrap): this;   // → `text-${value}`
```
Emitter: `p.textWrap = function (v: string) { return this.addClass(`text-${v}`); };`
Vocab row: `pre("textWrap", "text")`.

**Before/After.**
```ts
// Before — no fluent method; escape hatch only
H1("Long balanced heading").setClass("text-balance")
// After
H1("Long balanced heading").textWrap("balance")
P(article.lede).textWrap("pretty")
```

**Already in lib?** No (Tailwind text-wrap intro v3.4 / refined v4; balance Baseline 2024, pretty 2023+).
**Value:** high. **Effort:** small.

---

## 2. `hyphens(value)` — hyphens: none / manual / auto

**Problem/evidence.** No `hyphens` method anywhere (grep `hyphen` empty). For justified/narrow-column body text in an SSR content site, `hyphens-auto` (with `lang` set, which the lib already exposes via `setLang`, CHANGELOG 6.1.x) is the correct pairing. Verified classes: `hyphens-none`, `hyphens-manual`, `hyphens-auto` (CSS `hyphens`). Baseline: widely available.

**Proposed API.**
```ts
type TailwindHyphens = "none" | "manual" | "auto";
hyphens(value: TailwindHyphens): this;   // → `hyphens-${value}`
```
Vocab row: `pre("hyphens", "hyphens")`.

**Before/After.**
```ts
P(longProse).setLang("de").setClass("hyphens-auto")   // before
P(longProse).setLang("de").hyphens("auto")            // after
```

**Already in lib?** No.
**Value:** medium. **Effort:** small.

---

## 3. `fieldSizing(value)` — field-sizing: content / fixed

**Problem/evidence.** No `fieldSizing`/`field-sizing` anywhere (grep empty). This is the v4 idiom for auto-growing `<textarea>`/`<input>` without JS — directly relevant to the lib's typed `Form<T>` builder (`f.textarea(...)`) and HTMX SSR forms. Verified classes: `field-sizing-content`, `field-sizing-fixed` (CSS `field-sizing`). **Baseline status: NOT Baseline** — Chromium-only (Chrome 123+), no Firefox/Safari as of 2025; it degrades gracefully (control just doesn't auto-grow), so safe to ship but document the caveat.

**Proposed API.**
```ts
type TailwindFieldSizing = "content" | "fixed";
fieldSizing(value: TailwindFieldSizing): this;   // → `field-sizing-${value}`
```
Vocab row: `pre("fieldSizing", "field-sizing")`.

**Before/After.**
```ts
Form<NoteReq>({ values }, f => [
  f.textarea("body").setClass("field-sizing-content")   // before
  f.textarea("body").fieldSizing("content")             // after — grows with content
])
```

**Already in lib?** No.
**Value:** medium. **Effort:** small.

---

## 4. `scheme(value)` — color-scheme: light / dark / light-dark / only-*

**Problem/evidence.** No `scheme`/`color-scheme` method (grep empty; the only `scheme` hits are in node_modules `@types/node`). This is the v4-canonical way to make native form controls (date pickers, `<input>` spinners, scrollbars) render correctly in dark mode and to opt a subtree into `light dark`. Pairs with the lib's dark-mode `.on("dark", …)` variant. Verified from tailwindcss.com/docs/color-scheme: `scheme-normal`, `scheme-light`, `scheme-dark`, `scheme-light-dark`, `scheme-only-light`, `scheme-only-dark` (CSS `color-scheme`). Baseline: widely available.

**Proposed API.**
```ts
type TailwindColorScheme =
  | "normal" | "light" | "dark"
  | "light-dark" | "only-light" | "only-dark";
scheme(value: TailwindColorScheme): this;   // → `scheme-${value}`
```
Vocab row: `pre("scheme", "scheme")`.

**Before/After.**
```ts
Html().setClass("scheme-light").on("dark", t => t.setClass("scheme-dark"))  // before, stringly
Html().scheme("light").on("dark", t => t.scheme("dark"))                    // after
```

**Already in lib?** No.
**Value:** medium. **Effort:** small.

---

## 5. `accentColor(color)` + `caretColor(color)` — native control + caret tinting

**Problem/evidence.** No `accent-*` or `caret-*` (grep `accent|caret` empty). These reuse the existing closed `TailwindColor` union already used by `shadowColor`/`textColor`/`background`, so the type plumbing is free. `accent-{color}` tints native checkboxes/radios/range/progress; `caret-{color}` tints the text-input caret. Both are everyday form-styling needs in an SSR + `Form<T>` app and both are Baseline (widely available).

**Proposed API.**
```ts
accentColor(color: TailwindColor): this;   // → `accent-${color}`
caretColor(color: TailwindColor): this;    // → `caret-${color}`
```
Vocab rows: `pre("accentColor", "accent")`, `pre("caretColor", "caret")` (mirroring the `shadowColor`→`shadow` pattern).

**Before/After.**
```ts
f.checkbox("notify").setClass("accent-blue-600")   // before
f.checkbox("notify").accentColor("blue-600")       // after
f.input("name","text").caretColor("blue-500")
```

**Already in lib?** No.
**Value:** medium. **Effort:** small.

---

## 6. Scroll-snap family: `snap()`, `snapAlign()`, `snapStop()`

**Problem/evidence.** No scroll-snap support at all (grep `snap` empty). Carousels/horizontal galleries/step-scrollers are common in SSR landing pages; today the only path is `setClass("snap-x snap-mandatory")` on the container and `snap-center` on each child — fully stringly-typed. Verified from tailwindcss.com/docs: container `snap-none|snap-x|snap-y|snap-both` + strictness `snap-mandatory|snap-proximity`; child `snap-start|snap-end|snap-center|snap-align-none`; `snap-normal|snap-always` (scroll-snap-stop). Baseline: widely available.

**Proposed API.**
```ts
type TailwindSnapType = "none" | "x" | "y" | "both";
type TailwindSnapStrictness = "mandatory" | "proximity";
type TailwindSnapAlign = "start" | "end" | "center" | "align-none";
type TailwindSnapStop = "normal" | "always";

snap(value: TailwindSnapType): this;                       // → `snap-${value}`
snap(strictness: TailwindSnapStrictness): this;            // → `snap-${strictness}` (overload)
snapAlign(value: TailwindSnapAlign): this;                 // → `snap-${value}`
snapStop(value: TailwindSnapStop): this;                   // → `snap-${value}`
```
(Container typically chains `.snap("x").snap("mandatory")`; children `.snapAlign("center")`.)
Vocab rows: `pre("snapAlign","snap")`, `pre("snapStop","snap")`, and a custom emitter for `snap` (or two `pre` rows behind one method via an overload — keep one `snap` method emitting `snap-${arg}` since both arms share the `snap-` prefix).

**Before/After.**
```ts
Div(...slides).setClass("snap-x snap-mandatory overflow-x-auto")   // before
Div(...slides).snap("x").snap("mandatory").overflow("x","auto")    // after
Img().setClass("snap-center")  →  Img().snapAlign("center")
```

**Already in lib?** No.
**Value:** medium. **Effort:** medium (3 methods + container/child docs; overload on `snap`).

---

## 7. Scroll positioning: `scrollMargin()`, `scrollPadding()`, `scrollBehavior()`

**Problem/evidence.** No `scroll-m-*`/`scroll-p-*`/`scroll-smooth` (grep `scroll-` empty). With the lib's HTMX `outerMorph show:window:top` navigation and in-page anchor links, `scroll-mt-*` on headings (offset for sticky headers) and `scroll-smooth` on `<html>` are standard. These should reuse the existing **spacing family** machinery (`space()` row constructor in `vocab.ts:29`, which already powers `padding`/`margin`/`gap` with directional + unit-overload support) so `scrollMargin("t","16")` and `scrollMargin("px", 64)` both work for free.

**Proposed API.**
```ts
// directional + unit overloads, identical shape to padding/margin:
scrollMargin(value: TailwindSpacing): this;
scrollMargin(direction: TailwindDirection, value: TailwindSpacing): this;
scrollMargin(unit: TailwindUnit, amount: number): this;       // → scroll-m-[64px]
scrollPadding(...same overloads...): this;                     // scroll-p-*
scrollBehavior(value: "auto" | "smooth"): this;               // → scroll-${value}
```
Vocab rows: `space("scrollMargin","scroll-m","-",true,true)`, `space("scrollPadding","scroll-p","-",true,true)`, plus a `pre`/stat pair (`scroll-auto`/`scroll-smooth`) for `scrollBehavior`.

**Before/After.**
```ts
H2(section.title).setClass("scroll-mt-24")                    // before, sticky-header offset
H2(section.title).scrollMargin("t","24")
Html().setClass("scroll-smooth")  →  Html().scrollBehavior("smooth")
```

**Already in lib?** No.
**Value:** medium. **Effort:** medium (wire into existing `space()` family — low risk, reuses unit overloads).

---

## 8. `touchAction(value)` — touch-action for gestures/PWA-ish surfaces

**Problem/evidence.** No `touch-action`/`touchAction` (grep empty). Needed for custom draggable/swipeable surfaces and to suppress double-tap zoom (`touch-manipulation`) on tap targets — relevant for mobile SSR UIs. Verified classes: `touch-auto|touch-none|touch-pan-x|touch-pan-left|touch-pan-right|touch-pan-y|touch-pan-up|touch-pan-down|touch-pinch-zoom|touch-manipulation` (CSS `touch-action`). Baseline: widely available.

**Proposed API.**
```ts
type TailwindTouchAction =
  | "auto" | "none" | "manipulation" | "pinch-zoom"
  | "pan-x" | "pan-left" | "pan-right"
  | "pan-y" | "pan-up"   | "pan-down";
touchAction(value: TailwindTouchAction): this;   // → `touch-${value}`
```
Vocab row: `pre("touchAction", "touch")`.

**Before/After.**
```ts
Button("Tap").setClass("touch-manipulation")   // before — kill 300ms/zoom
Button("Tap").touchAction("manipulation")       // after
```

**Already in lib?** No.
**Value:** low-medium. **Effort:** small.

---

## 9. `forcedColorAdjust(value)` — forced-color-adjust: auto / none (a11y)

**Problem/evidence.** No `forced-color-adjust` (grep empty). The lib already invested in forced-colors a11y (`outlineHidden()` exists explicitly "keeps a visible outline in forced-colors mode", `tailwind-methods.ts:277`) and ships a `forced-colors` variant presumably via `.on(...)`. `forced-color-adjust-none` is the companion utility for swatches/charts/brand color chips that must survive Windows High Contrast. Verified classes: `forced-color-adjust-auto`, `forced-color-adjust-none` (CSS `forced-color-adjust`). Baseline: widely available.

**Proposed API.**
```ts
type TailwindForcedColorAdjust = "auto" | "none";
forcedColorAdjust(value: TailwindForcedColorAdjust): this;   // → `forced-color-adjust-${value}`
```
Vocab row: `pre("forcedColorAdjust", "forced-color-adjust")`.

**Before/After.**
```ts
Span().background("brand-500").setClass("forced-color-adjust-none")  // before — keep swatch color
Span().background("brand-500").forcedColorAdjust("none")             // after
```

**Already in lib?** No (complements existing `outlineHidden`).
**Value:** low-medium. **Effort:** small.

---

## Top picks
- **#1 `textWrap("balance"|"pretty")`** — highest-value, Baseline, one-line typography win; the only lens gap that has no good current workaround beyond raw `setClass`.
- **#5 `accentColor` / `caretColor`** — free type reuse (`TailwindColor`), everyday form styling, directly serves the `Form<T>` builder.
- **#7 `scrollMargin` / `scrollPadding` / `scrollBehavior`** — slots into the existing `space()` spacing family with unit overloads; pairs with the lib's HTMX scroll-to-top navigation.
- **#4 `scheme(...)`** — native-control dark-mode correctness, pairs with `.on("dark", …)`.
- (Bundle #2 hyphens, #3 fieldSizing, #8 touchAction, #9 forcedColorAdjust as a cheap "small" batch — all single `pre()` rows.)
