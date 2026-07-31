# Fluent Styling API

Chainable, type-safe Tailwind CSS methods with IDE autocomplete for all values.

```typescript
Div()
  .p("4").bg("red-500").text("white").rounded("lg").shadow("md")
```

## Variants: `.on()` and `.at()`

**`.on(state, fn)`** — pseudo-classes and states:

```typescript
Button("Save")
  .bg("blue-500").text("white").transition("colors")
  .on("hover", t => t.bg("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ring("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
```

States: `hover` `focus` `focus-within` `focus-visible` `active` `disabled` `checked` `required` `invalid` `valid` `first` `last` `odd` `even` `placeholder` `before` `after` `dark` `group-hover` `group-focus` `peer-hover` `peer-checked` and more — plus typed `aria-*`/`aria-[…]`, `data-[…]`, named `group-…/name`/`peer-…/name`, structural `nth-3`/`nth-[3n+1]`, and child/descendant `*`/`**`.

Variants nest:

```typescript
Div().on("dark", t => t.bg("gray-900").on("hover", t => t.bg("gray-800")))
// -> dark:bg-gray-900 dark:hover:bg-gray-800
```

**`.at(breakpoint, fn)`** — responsive breakpoints:

```typescript
Div()
  .w("full").gridCols("1")
  .at("md", t => t.w("1/2").gridCols("2"))
  .at("lg", t => t.gridCols("3"))
```

Breakpoints: `sm` `md` `lg` `xl` `2xl`, plus container-query breakpoints `@3xs`…`@7xl` (`@max-lg`, `@[480px]`, named scope `@lg/sidebar`) for children of a `.containerQuery()` element.

## Conditional: `.when()`

```typescript
Button("Save")
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.bg("blue-500").text("white"))
```

## Composition: `.apply()`

```typescript
const card = (t: Tag) => t.p("6").bg("white").rounded("lg").shadow("md");
const hoverLift = (t: Tag) => t.transition().duration("200")
  .on("hover", t => t.shadow("lg").translate("y", "-1"));

Div("Content").apply(card, hoverLift)
```

## Boolean Attributes: `.toggle()`

```typescript
Input().toggle("required")                        // always on
Input().toggle("required", isRequired)            // conditional
Option(city).toggle("selected", city === current) // expression
```

## Style Methods Reference

Method name = Tailwind class prefix. Merged prefixes (`text`, `font`, `border`, `ring`, `shadow`, `flex`, `list`, …) take every value family their Tailwind prefix does — the argument discriminates, exactly like Tailwind itself: `.text("lg")` → `text-lg`, `.text("red-500")` → `text-red-500`, `.text("center")` → `text-center`.

### Where names diverge from raw Tailwind

The prefix rule has a few deliberate exceptions — worth knowing when deriving a method from a class you already know:

- **Compound prefixes: the longest camelCase prefix wins.** `text-shadow-lg` → `.textShadow("lg")`, never `.text("shadow-lg")`; likewise `.dropShadow("lg")`, `.insetShadow("sm")`, `.insetRing("2")`, `.gridCols("3")`, `.scrollM("t", "24")`.
- **Negative utilities go through `.neg()`.** `-mt-2` → `.neg("mt-2")`, `-inset-px` → `.neg("inset-px")`. Methods with numeric arguments relocate the sign themselves: `.rotate(-45)` → `-rotate-45`, `.colEnd(-1)` → `-col-end-1`, `.bgLinear(-65)` → `-bg-linear-65`.
- **Translate takes its axis as an argument** — `.translate("y", "-1")` → `-translate-y-1` — while rotate/scale use per-axis methods (`.rotateX("45")`, `.scaleX("110")`).
- **A few names can't equal their prefix:** `.containerQuery()` (`@container` isn't a valid identifier), `.gradient(from, to, dir?)` (a multi-class convenience over `.bgLinear()`/`.from()`/`.to()`), and `.snap("x", "mandatory")` (emits the `snap-x snap-mandatory` pair; `"none"` would collide between the axis and align families, so children use `.snapAlign()`/`.snapStop()`).

### Spacing

```typescript
.p("4")                    // p-4 (all sides; same for .m())
.px("6")  .py("3")         // px-6, py-3
.pt("4")  .pb("4")  .pl("2")  .pr("2")
.mx("auto")                // mx-auto
.mt("8")  .mb("2")  .ml("4")  .mr("4")
.p("x", "4")               // px-4 (parametric side form; directions: x, y, top/t, bottom/b, left/l, right/r)
.gap("4")                  // gap-4
.gap("x", "2")             // gap-x-2
.spaceX("4")               // space-x-4
.spaceY("2")               // space-y-2
```

### Sizing

```typescript
.w("full")  .w("1/2")  .w("64")     // w-full, w-1/2, w-64
.h("screen")  .h("64")              // h-screen, h-64
.maxW("md")  .maxH("screen")        // max-w-md, max-h-screen
.minW("0")   .minH("screen")        // min-w-0, min-h-screen
.aspect("video")                     // aspect-video
```

### Arbitrary Value Unit Overloads

Sizing, spacing, and position methods accept a `(unit, amount)` overload for arbitrary values:

```typescript
.w("px", 180)              // w-[180px]
.h("rem", 2.5)             // h-[2.5rem]
.minH("vh", 50)            // min-h-[50vh]
.p("px", 12)               // p-[12px]
.mt("em", 1.5)             // mt-[1.5em]
.gap("px", 10)             // gap-[10px]
.top("rem", 2)             // top-[2rem]
```

Units: `px` `rem` `em` `%` `vh` `vw` `dvh` `svh` `lvh`. Available on: `w`, `h`, `minW`, `maxW`, `minH`, `maxH`, `p`, `m` + the directional shorthands (`px`…`pr`, `mx`…`mr`), `gap`, `top`, `right`, `bottom`, `left`, `inset`, `insetX`, `insetY`, `insetS`, `insetE`, `text`, `leading`, `tracking`, `underlineOffset`, `stroke`, `decoration`, `scrollM`, `scrollP`.

### Colors

```typescript
.bg("red-500")             // bg-red-500
.text("gray-700")          // text-gray-700
.border("gray-300")        // border-gray-300
.ring("blue-300")          // ring-blue-300
.fill("current")           // fill-current (SVG paint; .stroke("current"), .stroke("2"))
.accent("blue-600")        // accent-blue-600 (.caret("pink-500") for the text caret)
.decoration("blue-500")    // decoration-blue-500 (same method for style/thickness: .decoration("wavy"), .decoration("2"))
.scheme("light-dark")      // scheme-light-dark (color-scheme)
```

### Typography

```typescript
.text("xl")                // text-xl
.text("center")            // text-center
.font("semibold")          // font-semibold
.font("mono")              // font-mono (weights and families share the prefix)
.italic()                  // italic
.underline()  .noUnderline()  .lineThrough()  .truncate()
.uppercase()  .lowercase()  .capitalize()
.leading("tight")          // leading-tight (line-height)
.tracking("wide")          // tracking-wide (letter-spacing)
.antialiased()             // antialiased
.tabularNums()             // tabular-nums
.underlineOffset("4")      // underline-offset-4
.lineClamp("3")            // line-clamp-3
.breakAll()                // break-all
.list("disc")              // list-disc (.list("inside") for position)
.text("balance")           // text-balance (.text("pretty") for body copy)
.hyphens("auto")           // hyphens-auto (needs an ancestor lang)
.textShadow("lg")          // text-shadow-lg (v4.1; .textShadow("lg/30"), colors too: .textShadow("black/30"))
```

### Flexbox

```typescript
.flex()                    // flex
.flex("1")                 // flex-1
.flex("col")               // flex-col
.flex("wrap")              // flex-wrap
.justify("between")        // justify-between
.items("center")           // items-center
.self("center")            // self-center
.shrink("0")  .grow()      // shrink-0, grow
```

### Grid

```typescript
.grid()                    // grid
.gridCols("3")             // grid-cols-3
.gridRows("2")             // grid-rows-2
.colSpan("2")              // col-span-2
.rowSpan("2")              // row-span-2
.colStart("2")  .colEnd(-1)  // col-start-2, -col-end-1 (negative line = end-relative)
.rowStart("1")  .rowEnd("3")
```

### Borders & Effects

```typescript
.border()  .border("2")   // border, border-2
.border("t")               // border-t (directional)
.rounded("lg")             // rounded-lg
.shadow("md")              // shadow-md
.shadow("red-500")         // shadow-red-500
.ring("2")                 // ring-2 (widths 0|1|2|3|4|8; colors on the same method)
.opacity("50")             // opacity-50
.divideX()  .divideY("2")  // divide-x, divide-y-2
.dropShadow("lg")          // drop-shadow-lg (v4.1 colors on the same method: .dropShadow("red-500/50"))
.insetShadow("sm")         // inset-shadow-sm (.insetRing("2") inner ring; both take colors too)
.mixBlend("multiply")      // mix-blend-multiply (.bgBlend() for background layers)
.isolate()                 // isolate (new stacking context — z-index/blend leak guard)
```

### Position & Layout

```typescript
.relative()                // relative  (.absolute() .fixed() .sticky() .static())
.block()                   // block     (.inline() .inlineFlex() .inlineGrid() .contents())
.hidden()                  // hidden
.z("10")                   // z-10
.inset("0")                // inset-0
.top("4")  .right("0")  .bottom("0")  .left("0")
.insetX("0")  .insetY("4")  // inset-x-0, inset-y-4 (.insetS()/.insetE() are logical/RTL)
.overflow("hidden")        // overflow-hidden
.overflow("x", "auto")     // overflow-x-auto
.object("cover")           // object-cover
.columns("3")              // columns-3 (.breakInside("avoid") keeps a card whole)
.snap("x", "mandatory")    // snap-x snap-mandatory (.snapAlign("center") on children)
.scrollM("t", "24")        // scroll-mt-24 (.scrollP(), .scroll("smooth"))
.fieldSizing("content")    // field-sizing-content (JS-free auto-grow textarea)
```

### Transforms & Animation

```typescript
.scale("105")              // scale-105
.rotate("45")              // rotate-45
.translate("x", "4")       // translate-x-4
.skewX("6")                // skew-x-6
.skewY("3")                // skew-y-3
.rotateX("45")  .rotateY(-30)  .rotateZ("90")  // rotate-x-45, -rotate-y-30, rotate-z-90 (3D)
.scaleX("110")  .scaleZ("75")  .scale3d()      // scale-x-110, scale-z-75, scale-3d
.translate("z", "12")      // translate-z-12 (3D depth)
.perspective("normal")     // perspective-normal (gate on the PARENT; + .perspectiveOrigin())
.transform("3d")           // transform-3d (+ .backface("hidden"))
.transition("colors")      // transition-colors
.duration("200")           // duration-200
.delay("150")              // delay-150
.ease("in-out")            // ease-in-out
.transition("discrete")    // transition-discrete (animate display/popover/dialog)
.animate("spin")           // animate-spin
```

### Gradients (v4 `bg-linear-*`)

```typescript
.gradient("blue-500", "pink-500", "to-r")  // bg-linear-to-r from-blue-500 to-pink-500
.bgLinear("to-r")          // bg-linear-to-r  (interpolation: .bgLinear("to-r", "oklch"))
.bgLinear(45)              // bg-linear-45 (angle; -65 → -bg-linear-65)
.bgRadial("top-left")      // bg-radial-[at_top_left]   ·   .bgConic(180)  // bg-conic-180
.from("blue-500", "10%")   // from-blue-500 from-10%  (optional stop position)
.via("purple-500")  .to("pink-500", "90%")
```

### Filters

```typescript
.blur()  .blur("lg")       // blur, blur-lg
.brightness("75")          // brightness-75
.contrast("125")           // contrast-125
.grayscale()               // grayscale
.hueRotate("90")           // hue-rotate-90
.invert()                  // invert
.saturate("150")           // saturate-150
.sepia()                   // sepia
```

All filters have `backdrop` variants: `.backdropBlur()`, `.backdropBrightness()`, `.backdropContrast()`, etc.

### Masks (v4.1)

```typescript
.mask("none")              // mask-none  (or "[url(/fade.png)]")
.maskFrom("b", "50%")  .maskTo("b", "90%")  // mask-b-from-50% mask-b-to-90% (edge fade)
.mask("intersect")         // mask-intersect (stacked masks)
.maskType("luminance")     // mask-type-luminance (SVG <mask>)
```

### Group & Peer

```typescript
.group()                   // group
.group("form")             // group/form (named group)
.peer()                    // peer
.peer("input")             // peer/input (named peer)
```

Use with `.on()` for group/peer state variants:

```typescript
Div(
  Input().peer(),
  Span("Error").on("peer-invalid", t => t.block()),
).group()
```

### Interactivity

```typescript
.cursor("pointer")         // cursor-pointer
.select("none")            // select-none
.pointerEvents("none")     // pointer-events-none
.whitespace("nowrap")      // whitespace-nowrap
.outline("none")           // outline-none
.srOnly()                  // sr-only
.willChange("transform")   // will-change-transform
.overscroll("contain")     // overscroll-contain
.resize("y")               // resize-y
```

## Real-World Example

```typescript
const Card = ({ title, body }: { title: string; body: string }) =>
  Div(
    H2(title).text("xl").font("bold").mb("2"),
    P(body).text("gray-600"),
    Div(
      Button("Cancel").px("4").py("2").border().rounded()
        .on("hover", t => t.bg("gray-50")),
      Button("Submit").px("4").py("2")
        .bg("blue-500").text("white").rounded()
        .on("hover", t => t.bg("blue-600"))
    ).flex().gap("4").justify("end").mt("6")
  )
    .bg("white").p("6").rounded("xl").shadow("lg")
    .border().border("gray-200")
    .at("md", t => t.p("8"))
    .on("dark", t => t.bg("gray-800").border("gray-700"))
```

## Theming: `defineTheme()`

Define design tokens **once** → typed autocomplete on the fluent methods + the v4 `@theme` CSS + the extractor safelist.

```ts
import { defineTheme, type ThemeKeys } from "fluent-html";

const tokens = {
  colors:  { brand: "#ff5500", forest: "#2d5016" },
  spacing: { gutter: "1.5rem" },
} as const;

export const theme = defineTheme(tokens);

// One line per family — written once, derives from `tokens` (add tokens freely).
declare module "fluent-html" {
  interface FluentCustomColors  extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
}
```

```ts
Div().bg("brand").p("gutter")   // ✓ your tokens, autocompleted
Div().bg("brnad")               // ✗ compile error (closed unions)
Div().bg("blue-500")            // ✓ built-ins still work
const card = (t: Tag) => t.p("6").rounded("lg").shadow("md");  // ✓ preset = composition
Div().apply(card)                             // ✓ presets are user-land, NOT defineTheme
```

- Tokens only: `colors` / `spacing` / `fontSize` / `radius` / `shadow`. Component presets are `.apply()` helpers, not `defineTheme`.
- Wire the CSS + safelist once: run `generateFluentSafelist(globFiles(["./src/**/*.ts"]), { theme })` in a prebuild step, write it to `fluent-safelist.css`, and `@import` that file next to `@import "tailwindcss"`. (A real file — Tailwind only resolves `@import`s from disk.)
- The themeable unions are **closed** (no `(string & {})`): a custom-token typo is a compile error, not an unstyled element.

## Escape hatches — the decision rule

Raw class strings (`setClass`/`addClass` with Tailwind) are lint-blocked: they bypass the type system, conflict detection, and the safelist extractor. When the typed vocabulary genuinely doesn't cover a need, there is exactly one sanctioned hatch per situation:

| Situation | Hatch | Emits |
|---|---|---|
| Arbitrary value of a covered utility | bracket arm / unit overload: `.text("[13px]")`, `.w("px", 180)`, `.p("[37px]")` | `text-[13px]`, `w-[180px]` |
| CSS property with no Tailwind utility | `.cssProp("mask-repeat", "no-repeat")` | `[mask-repeat:no-repeat]` |
| Legit non-Tailwind class (JS/CSS hook, third-party) | `.cssClass("js-map-container")` | verbatim |
| Runtime-computed style value | `.setStyle("--progress: " + pct + "%")` | inline style (extractor-opaque, dynamic-safe) |

`.cssProp` stays build-tracked: literal calls are safelisted, a non-literal value fails the safelist build (`onUnresolved: "error"`). `addClass` is `@internal` — the emitter primitive the fluent methods call, not a styling API.

## Notes

- All values are **strictly typed** — wrong values don't compile
- Fluent methods append and never overwrite each other — order doesn't affect specificity
- Named types exported for consumer use: `TailwindPosition`, `TailwindTextAlign`, `TailwindFlexDirection`, `TailwindJustifyContent`, `TailwindAlignItems`, `CssPropertyName`
