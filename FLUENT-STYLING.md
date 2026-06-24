# Fluent Styling API

Chainable, type-safe Tailwind CSS methods with IDE autocomplete for all values.

```typescript
Div()
  .padding("4").background("red-500").textColor("white").rounded("lg").shadow("md")
```

## Variants: `.on()` and `.at()`

**`.on(state, fn)`** — pseudo-classes and states:

```typescript
Button("Save")
  .background("blue-500").textColor("white").transition("colors")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
```

States: `hover` `focus` `focus-within` `focus-visible` `active` `disabled` `checked` `required` `invalid` `valid` `first` `last` `odd` `even` `placeholder` `before` `after` `dark` `group-hover` `group-focus` `peer-hover` `peer-checked` and more.

Variants nest:

```typescript
Div().on("dark", t => t.background("gray-900").on("hover", t => t.background("gray-800")))
// -> dark:bg-gray-900 dark:hover:bg-gray-800
```

**`.at(breakpoint, fn)`** — responsive breakpoints:

```typescript
Div()
  .w("full").gridCols("1")
  .at("md", t => t.w("1/2").gridCols("2"))
  .at("lg", t => t.gridCols("3"))
```

Breakpoints: `sm` `md` `lg` `xl` `2xl`

## Conditional: `.when()`

```typescript
Button("Save")
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.background("blue-500").textColor("white"))
```

## Composition: `.apply()`

```typescript
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
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

### Spacing

```typescript
.padding("4")              // p-4
.padding("x", "4")         // px-4  (directions: x, y, top/t, bottom/b, left/l, right/r)
.margin("x", "auto")       // mx-auto
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
.padding("px", 12)         // p-[12px]
.margin("em", 1.5)         // m-[1.5em]
.gap("px", 10)             // gap-[10px]
.top("rem", 2)             // top-[2rem]
```

Units: `px` `rem` `em` `%` `vh` `vw` `dvh` `svh` `lvh`. Available on: `w`, `h`, `minW`, `maxW`, `minH`, `maxH`, `padding`, `margin`, `gap`, `top`, `right`, `bottom`, `left`, `inset`.

### Colors

```typescript
.background("red-500")     // bg-red-500
.textColor("gray-700")     // text-gray-700
.borderColor("gray-300")   // border-gray-300
.ringColor("blue-300")     // ring-blue-300
```

### Typography

```typescript
.textSize("xl")            // text-xl
.textAlign("center")       // text-center
.fontWeight("semibold")    // font-semibold
.fontFamily("mono")        // font-mono
.bold()  .italic()         // font-bold, italic
.underline()  .noUnderline()  .lineThrough()  .truncate()
.uppercase()  .lowercase()  .capitalize()
.leading("tight")          // leading-tight (line-height)
.tracking("wide")          // tracking-wide (letter-spacing)
.antialiased()             // antialiased
.tabularNums()             // tabular-nums
.underlineOffset("4")      // underline-offset-4
.lineClamp("3")            // line-clamp-3
.breakAll()                // break-all
.listStyleType("disc")     // list-disc
.listStylePosition("inside") // list-inside
```

### Flexbox

```typescript
.flex()                    // flex
.flex("1")                 // flex-1
.flexDirection("col")      // flex-col
.justifyContent("between") // justify-between
.alignItems("center")      // items-center
.alignSelf("center")       // self-center
.flexWrap("wrap")          // flex-wrap
.shrink("0")  .grow()      // shrink-0, grow
```

### Grid

```typescript
.grid()                    // grid
.gridCols("3")             // grid-cols-3
.gridRows("2")             // grid-rows-2
.colSpan("2")              // col-span-2
```

### Borders & Effects

```typescript
.border()  .border("2")   // border, border-2
.border("t")               // border-t (directional)
.rounded("lg")             // rounded-lg
.shadow("md")              // shadow-md
.shadowColor("red-500")    // shadow-red-500
.ring("2")                 // ring-2
.opacity("50")             // opacity-50
.divideX()  .divideY("2")  // divide-x, divide-y-2
```

### Position & Layout

```typescript
.relative()                // relative  (.absolute() .fixed() .sticky() .static())
.block()                   // block     (.inline() .inlineFlex() .inlineGrid() .contents())
.hidden()                  // hidden
.zIndex("10")              // z-10
.inset("0")                // inset-0
.top("4")  .right("0")  .bottom("0")  .left("0")
.overflow("hidden")        // overflow-hidden
.overflow("x", "auto")     // overflow-x-auto
.objectFit("cover")        // object-cover
```

### Transforms & Animation

```typescript
.scale("105")              // scale-105
.rotate("45")              // rotate-45
.translate("x", "4")       // translate-x-4
.skewX("6")                // skew-x-6
.skewY("3")                // skew-y-3
.transition("colors")      // transition-colors
.duration("200")           // duration-200
.ease("in-out")            // ease-in-out
.animate("spin")           // animate-spin
```

### Gradients

```typescript
.gradientTo("r")           // bg-gradient-to-r
.from("blue-500")          // from-blue-500
.via("purple-500")         // via-purple-500
.to("pink-500")            // to-pink-500
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
    H2(title).textSize("xl").bold().margin("bottom", "2"),
    P(body).textColor("gray-600"),
    Div(
      Button("Cancel").padding("x", "4").padding("y", "2").border().rounded()
        .on("hover", t => t.background("gray-50")),
      Button("Submit").padding("x", "4").padding("y", "2")
        .background("blue-500").textColor("white").rounded()
        .on("hover", t => t.background("blue-600"))
    ).flex().gap("4").justifyContent("end").margin("top", "6")
  )
    .background("white").padding("6").rounded("xl").shadow("lg")
    .border().borderColor("gray-200")
    .at("md", t => t.padding("8"))
    .on("dark", t => t.background("gray-800").borderColor("gray-700"))
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
Div().background("brand").padding("gutter")   // ✓ your tokens, autocompleted
Div().background("brnad")                     // ✗ compile error (closed unions)
Div().background("blue-500")                  // ✓ built-ins still work
const card = (t: Tag) => t.padding("6").rounded("lg").shadow("md");  // ✓ preset = composition
Div().apply(card)                             // ✓ presets are user-land, NOT defineTheme
```

- Tokens only: `colors` / `spacing` / `fontSize` / `radius` / `shadow`. Component presets are `.apply()` helpers, not `defineTheme`.
- Wire the CSS + safelist once: run `generateFluentSafelist(globFiles(["./src/**/*.ts"]), { theme })` in a prebuild step, write it to `fluent-safelist.css`, and `@import` that file next to `@import "tailwindcss"`. (A real file — Tailwind only resolves `@import`s from disk.)
- The themeable unions are **closed** (no `(string & {})`): a custom-token typo is a compile error, not an unstyled element.

## Notes

- All methods append via `addClass()` — order doesn't affect specificity
- `setClass()` replaces all classes; fluent methods add to them
- All values are **strictly typed** — wrong values don't compile
- For arbitrary Tailwind values (e.g., `p-[37px]`), use `addClass()` as the escape hatch
- Named types exported for consumer use: `TailwindPosition`, `TailwindTextAlign`, `TailwindFlexDirection`, `TailwindJustifyContent`, `TailwindAlignItems`
