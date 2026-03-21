# Fluent Tailwind Methods

Chainable, type-safe Tailwind CSS methods with IDE autocomplete. Method order doesn't matter — all append classes.

## Variants: `.on()` and `.at()`

Use `.on()` for pseudo-classes and `.at()` for breakpoints — **not `addClass`**:

```typescript
Button("Save")
  .padding("x", "4").background("blue-500").textColor("white").rounded()
  .transition("colors")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md", t => t.padding("x", "8").textSize("lg"))
```

Variants nest for compound selectors:

```typescript
Div().on("dark", t => t.background("gray-900").on("hover", t => t.background("gray-800")))
// -> dark:bg-gray-900 dark:hover:bg-gray-800
```

States: `hover` `focus` `focus-within` `focus-visible` `active` `disabled` `checked` `required` `invalid` `valid` `first` `last` `odd` `even` `placeholder` `before` `after` `dark` `group-hover` `peer-hover` and more.

Breakpoints: `sm` `md` `lg` `xl` `2xl`

## Conditional & Composition

```typescript
// .when() — conditionally apply modifications
Button("Save")
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.background("blue-500").textColor("white"))

// .apply() — compose reusable modifier functions
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const hoverLift = (t: Tag) => t.transition().duration("200")
  .on("hover", t => t.shadow("lg").translate("y", "-1"));

Div("Content").apply(card, hoverLift)
```

## Method Reference

### Spacing

```typescript
.padding("4")              // p-4         (directions: x, y, top/t, bottom/b, left/l, right/r)
.padding("x", "4")         // px-4
.margin("x", "auto")       // mx-auto
.gap("4")                  // gap-4       (directions: x, y)
.spaceX("4")               // space-x-4
```

### Sizing

```typescript
.w("full")  .w("1/2")  .w("64")    .h("screen")  .h("64")
.maxW("md")  .maxH("screen")       .minW("0")  .minH("screen")
.aspect("video")
```

### Colors

```typescript
.background("red-500")     // bg-red-500  | .background("[#1da1f2]")  // arbitrary
.textColor("gray-700")     // text-gray-700
.borderColor("gray-300")   // border-gray-300
.ringColor("blue-300")     // ring-blue-300
```

### Typography

```typescript
.textSize("xl")            // text-xl     | .textAlign("center")      // text-center
.fontWeight("semibold")    // font-semibold
.bold()  .italic()  .underline()  .noUnderline()  .lineThrough()  .truncate()
.uppercase()  .lowercase()  .capitalize()
.leading("tight")          // leading-tight (line-height)
.tracking("wide")          // tracking-wide (letter-spacing)
```

### Flexbox

```typescript
.flex()  .flex("1")                    .flexDirection("col")
.justifyContent("between")            .alignItems("center")  .alignSelf("end")
.gap("4")  .gap("x", "2")            .flexWrap("wrap")
.shrink("0")  .grow()
```

### Grid

```typescript
.grid()  .gridCols("3")  .gridRows("2")  .colSpan("2")
```

### Borders & Effects

```typescript
.border()  .border("2")  .border("b")  .border("bottom", "2")
.rounded("lg")             .shadow("md")
.ring("2")                 .opacity("50")
.divideX()  .divideY("2")
```

### Position & Layout

```typescript
.position("relative")      .display("inline-flex")     .hidden()
.inset("0")  .top("0")  .right("0")  .bottom("0")  .left("0")
.zIndex("10")              .cursor("pointer")
.overflow("hidden")        .overflow("x", "auto")
.objectFit("cover")
```

### Transforms & Animation

```typescript
.scale("105")              .rotate("45")               .translate("x", "2")
.transition("colors")      .duration("200")            .animate("spin")
```

### Interactivity

```typescript
.select("none")            .pointerEvents("none")      .whitespace("nowrap")
.outline("none")           .srOnly()
```

## Notes

- All values are **strictly typed** — wrong values don't compile
- For arbitrary Tailwind values (e.g., `p-[37px]`), use `addClass()` as the escape hatch
- Named types exported: `TailwindPosition`, `TailwindTextAlign`, `TailwindFlexDirection`, `TailwindJustifyContent`, `TailwindAlignItems`
