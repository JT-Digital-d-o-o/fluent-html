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
.bold()  .italic()         // font-bold, italic
.underline()  .lineThrough()  .truncate()
.uppercase()  .lowercase()  .capitalize()
.leading("tight")          // leading-tight (line-height)
.tracking("wide")          // tracking-wide (letter-spacing)
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
.ring("2")                 // ring-2
.opacity("50")             // opacity-50
.divideX()  .divideY("2")  // divide-x, divide-y-2
```

### Position & Layout

```typescript
.position("relative")      // relative
.display("block")          // block
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
.transition("colors")      // transition-colors
.duration("200")           // duration-200
.animate("spin")           // animate-spin
```

### Interactivity

```typescript
.cursor("pointer")         // cursor-pointer
.select("none")            // select-none
.pointerEvents("none")     // pointer-events-none
.whitespace("nowrap")      // whitespace-nowrap
.outline("none")           // outline-none
.srOnly()                  // sr-only
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

## Notes

- All methods append via `addClass()` — order doesn't affect specificity
- `setClass()` replaces all classes; fluent methods add to them
- All values are type-safe with autocomplete, but arbitrary strings are accepted too
