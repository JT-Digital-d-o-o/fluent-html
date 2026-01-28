# Fluent Styling API

Lambda.html now supports fluent method chaining for Tailwind CSS classes, making your code more readable and native-feeling.

## Type-Safe Autocomplete

All fluent methods have **type-safe parameters** with IDE autocomplete for Tailwind values:

```typescript
Div()
  .w("full")              // IDE suggests: "full", "1/2", "screen", "64", etc.
  .h("screen")            // IDE suggests: "screen", "svh", "dvh", "full", etc.
  .background("red-500")  // IDE suggests: all color-shade combinations
  .padding("4")           // IDE suggests: "0", "1", "2", "4", "8", etc.
  .rounded("lg")          // IDE suggests: "sm", "md", "lg", "xl", "full", etc.
  .tracking("wide")       // IDE suggests: "tighter", "tight", "normal", "wide", etc.
```

The type system suggests valid Tailwind values while still allowing custom/arbitrary values when needed.

## Before & After

### Old Way (still works!)
```typescript
Div()
  .setClass("p-4 bg-red-500 mx-8 text-white rounded-lg shadow-md")
```

### New Way ✨
```typescript
Div()
  .padding("4")
  .background("red-500")
  .margin("x", "8")
  .textColor("white")
  .rounded("lg")
  .shadow("md")
```

Both produce identical HTML output!

## Complete API Reference

### Spacing

#### Padding
```typescript
.padding("4")                    // p-4 (all sides)
.padding("x", "4")               // px-4 (horizontal)
.padding("y", "4")               // py-4 (vertical)
.padding("top", "4")             // pt-4
.padding("bottom", "4")          // pb-4
.padding("left", "4")            // pl-4
.padding("right", "4")           // pr-4
// Also accepts: "t", "b", "l", "r"
```

#### Margin
```typescript
.margin("4")                     // m-4 (all sides)
.margin("x", "auto")             // mx-auto (horizontal)
.margin("y", "4")                // my-4 (vertical)
.margin("top", "8")              // mt-8
.margin("bottom", "4")           // mb-4
.margin("left", "2")             // ml-2
.margin("right", "2")            // mr-2
// Also accepts: "t", "b", "l", "r"
```

### Colors

```typescript
.background("red-500")           // bg-red-500
.textColor("gray-700")           // text-gray-700
.borderColor("gray-300")         // border-gray-300
```

### Typography

```typescript
.textSize("xl")                  // text-xl
.textSize("sm")                  // text-sm
.textAlign("center")             // text-center
.textAlign("right")              // text-right
.fontWeight("bold")              // font-bold
.fontWeight("semibold")          // font-semibold
.bold()                          // font-bold (shorthand)
.italic()                        // italic
```

### Text Transform & Decoration

```typescript
.uppercase()                     // uppercase
.lowercase()                     // lowercase
.capitalize()                    // capitalize
.underline()                     // underline
.lineThrough()                   // line-through
.truncate()                      // truncate (ellipsis)
```

### Line Height & Letter Spacing

```typescript
.leading("tight")                // leading-tight
.leading("normal")               // leading-normal
.leading("relaxed")              // leading-relaxed
.leading("loose")                // leading-loose

.tracking("tighter")             // tracking-tighter
.tracking("tight")               // tracking-tight
.tracking("normal")              // tracking-normal
.tracking("wide")                // tracking-wide
.tracking("wider")               // tracking-wider
.tracking("widest")              // tracking-widest
```

### Sizing

```typescript
.w("full")                       // w-full
.w("1/2")                        // w-1/2
.w("64")                         // w-64

.h("screen")                     // h-screen
.h("64")                         // h-64

.maxW("md")                      // max-w-md
.maxW("prose")                   // max-w-prose
.minW("0")                       // min-w-0

.maxH("screen")                  // max-h-screen
.minH("0")                       // min-h-0
```

### Flexbox

```typescript
.flex()                          // flex
.flex("1")                       // flex-1
.flexDirection("col")            // flex-col
.flexDirection("row-reverse")    // flex-row-reverse

.justifyContent("center")        // justify-center
.justifyContent("between")       // justify-between
.justifyContent("around")        // justify-around

.alignItems("center")            // items-center
.alignItems("start")             // items-start
.alignItems("stretch")           // items-stretch

.gap("4")                        // gap-4
.gap("x", "2")                   // gap-x-2
.gap("y", "4")                   // gap-y-4
```

### Grid

```typescript
.grid()                          // grid
.gridCols("3")                   // grid-cols-3
.gridRows("2")                   // grid-rows-2
```

### Borders & Effects

```typescript
.border()                        // border
.border("2")                     // border-2
.borderColor("gray-300")         // border-gray-300

.rounded()                       // rounded
.rounded("full")                 // rounded-full
.rounded("lg")                   // rounded-lg

.shadow()                        // shadow
.shadow("lg")                    // shadow-lg
.shadow("md")                    // shadow-md
```

### Positioning

```typescript
.position("relative")            // relative
.position("absolute")            // absolute
.position("fixed")               // fixed

.zIndex("10")                    // z-10
.zIndex("50")                    // z-50
```

### Display & Visibility

```typescript
.opacity("50")                   // opacity-50
.cursor("pointer")               // cursor-pointer

.overflow("hidden")              // overflow-hidden
.overflow("x", "auto")           // overflow-x-auto
.overflow("y", "scroll")         // overflow-y-scroll
```

## Real-World Examples

### Card Component
```typescript
const card = Div([
  Div("Card Title")
    .textSize("2xl")
    .fontWeight("bold")
    .margin("bottom", "4"),

  Div("Card content goes here...")
    .textColor("gray-600")
    .margin("bottom", "6"),

  Div([
    Button("Cancel")
      .padding("x", "4")
      .padding("y", "2")
      .border()
      .borderColor("gray-300")
      .rounded()
      .cursor("pointer"),

    Button("Submit")
      .padding("x", "4")
      .padding("y", "2")
      .background("blue-500")
      .textColor("white")
      .rounded()
      .cursor("pointer")
      .shadow()
  ])
    .flex()
    .gap("4")
    .justifyContent("end")
])
  .background("white")
  .padding("6")
  .rounded("xl")
  .shadow("lg")
  .border()
  .borderColor("gray-200")
  .w("full")
  .maxW("md");
```

### Centered Container
```typescript
const container = Div("Content")
  .w("full")
  .maxW("md")
  .margin("x", "auto")
  .padding("4");
```

### Flex Layout
```typescript
const header = Div([
  Div("Logo"),
  Div("Navigation"),
  Div("User")
])
  .flex()
  .justifyContent("between")
  .alignItems("center")
  .padding("4")
  .background("white")
  .shadow();
```

### Grid Gallery
```typescript
const gallery = Div([
  Img().setSrc("1.jpg"),
  Img().setSrc("2.jpg"),
  Img().setSrc("3.jpg"),
  Img().setSrc("4.jpg")
])
  .grid()
  .gridCols("2")
  .gap("4")
  .padding("8");
```

## Mixing with Traditional Methods

You can freely mix the new fluent-style methods with existing methods:

```typescript
Div()
  .setId("my-element")
  .padding("4")                  // New style
  .background("red-500")         // New style
  .addClass("hover:bg-red-600")  // Traditional style
  .setDataAttrs({ testid: "123" })
  .rounded("lg");                // New style
```

## Type Safety

All methods return the correct type, so you get full IDE autocomplete and type checking:

```typescript
Button("Click")
  .padding("4")
  .setType("submit")  // Button-specific method still available!
  .background("blue-500")
  .setDisabled(false);
```

## Notes

- All these methods use `addClass()` internally, so they append to existing classes
- You can still use `setClass()` to completely replace the class string
- The methods generate Tailwind CSS classes - make sure Tailwind is included in your project
- Method order doesn't matter (unlike CSS specificity) since they all append classes
