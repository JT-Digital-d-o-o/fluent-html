# SwiftUI-Style Tailwind Methods - AI Instructions

## Overview
Lambda.html provides SwiftUI-inspired methods for applying Tailwind CSS classes in a type-safe, chainable way. These methods make styling feel native and intuitive.

## Why Use These Methods?

Instead of writing long class strings:
```typescript
// Old way (still works!)
Div().setClass("p-4 bg-red-500 mx-8 text-white rounded-lg shadow-md")
```

Use chainable, autocompleted methods:
```typescript
// New way - SwiftUI-like
Div()
  .padding("4")
  .background("red-500")
  .margin("x", "8")
  .textColor("white")
  .rounded("lg")
  .shadow("md")
```

Both produce identical HTML, but the second is more discoverable and type-safe.

## Complete Method Reference

### Spacing - Padding

```typescript
// All sides
.padding("4")                    // p-4

// Directional (two parameters)
.padding("x", "4")               // px-4 (horizontal)
.padding("y", "4")               // py-4 (vertical)
.padding("top", "8")             // pt-8
.padding("bottom", "4")          // pb-4
.padding("left", "2")            // pl-2
.padding("right", "2")           // pr-2

// Short forms also work
.padding("t", "8")               // pt-8
.padding("b", "4")               // pb-4
.padding("l", "2")               // pl-2
.padding("r", "2")               // pr-2
```

### Spacing - Margin

```typescript
// All sides
.margin("4")                     // m-4

// Directional (two parameters)
.margin("x", "4")                // mx-4 (horizontal)
.margin("y", "4")                // my-4 (vertical)
.margin("top", "8")              // mt-8
.margin("bottom", "4")           // mb-4
.margin("left", "2")             // ml-2
.margin("right", "2")            // mr-2

// Special values
.margin("x", "auto")             // mx-auto (centering)
.margin("top", "-4")             // mt--4 (negative margin)

// Short forms
.margin("t", "8")                // mt-8
.margin("b", "4")                // mb-4
```

### Colors

```typescript
// Background colors
.background("red-500")           // bg-red-500
.background("blue-100")          // bg-blue-100
.background("white")             // bg-white
.background("[#1da1f2]")         // bg-[#1da1f2] (arbitrary)

// Text colors
.textColor("gray-700")           // text-gray-700
.textColor("white")              // text-white

// Border colors
.borderColor("gray-300")         // border-gray-300
.borderColor("blue-500")         // border-blue-500
```

### Typography

```typescript
// Text size
.textSize("xl")                  // text-xl
.textSize("2xl")                 // text-2xl
.textSize("sm")                  // text-sm
.textSize("base")                // text-base

// Text alignment
.textAlign("center")             // text-center
.textAlign("right")              // text-right
.textAlign("left")               // text-left
.textAlign("justify")            // text-justify

// Font weight
.fontWeight("bold")              // font-bold
.fontWeight("semibold")          // font-semibold
.fontWeight("medium")            // font-medium
.fontWeight("light")             // font-light
```

### Sizing

```typescript
// Width
.w("full")                       // w-full
.w("1/2")                        // w-1/2
.w("64")                         // w-64
.w("screen")                     // w-screen

// Height
.h("screen")                     // h-screen
.h("64")                         // h-64
.h("full")                       // h-full

// Max width
.maxW("md")                      // max-w-md
.maxW("prose")                   // max-w-prose
.maxW("screen-xl")               // max-w-screen-xl

// Min width
.minW("0")                       // min-w-0
.minW("full")                    // min-w-full

// Max height
.maxH("screen")                  // max-h-screen
.maxH("96")                      // max-h-96

// Min height
.minH("screen")                  // min-h-screen
.minH("0")                       // min-h-0
```

### Flexbox

```typescript
// Display
.flex()                          // flex
.flex("1")                       // flex-1

// Direction
.flexDirection("row")            // flex-row (default)
.flexDirection("col")            // flex-col
.flexDirection("row-reverse")    // flex-row-reverse
.flexDirection("col-reverse")    // flex-col-reverse

// Justify content
.justifyContent("center")        // justify-center
.justifyContent("between")       // justify-between
.justifyContent("around")        // justify-around
.justifyContent("evenly")        // justify-evenly
.justifyContent("start")         // justify-start
.justifyContent("end")           // justify-end

// Align items
.alignItems("center")            // items-center
.alignItems("start")             // items-start
.alignItems("end")               // items-end
.alignItems("baseline")          // items-baseline
.alignItems("stretch")           // items-stretch

// Gap
.gap("4")                        // gap-4
.gap("x", "2")                   // gap-x-2
.gap("y", "4")                   // gap-y-4
```

### Grid

```typescript
// Display
.grid()                          // grid

// Columns
.gridCols("3")                   // grid-cols-3
.gridCols("2")                   // grid-cols-2
.gridCols("1")                   // grid-cols-1

// Rows
.gridRows("2")                   // grid-rows-2
.gridRows("3")                   // grid-rows-3
```

### Borders & Effects

```typescript
// Border
.border()                        // border
.border("2")                     // border-2
.border("4")                     // border-4

// Border color (requires .border() first)
.borderColor("gray-300")         // border-gray-300

// Border radius
.rounded()                       // rounded
.rounded("full")                 // rounded-full
.rounded("lg")                   // rounded-lg
.rounded("md")                   // rounded-md
.rounded("xl")                   // rounded-xl

// Shadow
.shadow()                        // shadow
.shadow("lg")                    // shadow-lg
.shadow("md")                    // shadow-md
.shadow("sm")                    // shadow-sm
.shadow("xl")                    // shadow-xl
```

### Position & Layout

```typescript
// Position
.position("relative")            // relative
.position("absolute")            // absolute
.position("fixed")               // fixed
.position("sticky")              // sticky
.position("static")              // static

// Z-index
.zIndex("10")                    // z-10
.zIndex("50")                    // z-50
.zIndex("0")                     // z-0

// Opacity
.opacity("50")                   // opacity-50
.opacity("75")                   // opacity-75
.opacity("0")                    // opacity-0

// Cursor
.cursor("pointer")               // cursor-pointer
.cursor("not-allowed")           // cursor-not-allowed
.cursor("default")               // cursor-default

// Overflow
.overflow("hidden")              // overflow-hidden
.overflow("auto")                // overflow-auto
.overflow("x", "auto")           // overflow-x-auto
.overflow("y", "scroll")         // overflow-y-scroll
```

## Real-World Examples

### Button Variants

```typescript
// Primary button
Button("Save")
  .padding("x", "6")
  .padding("y", "3")
  .background("blue-500")
  .textColor("white")
  .rounded("lg")
  .fontWeight("semibold")
  .cursor("pointer")
  .shadow()
  .addClass("hover:bg-blue-600")

// Secondary button
Button("Cancel")
  .padding("x", "6")
  .padding("y", "3")
  .border()
  .borderColor("gray-300")
  .textColor("gray-700")
  .rounded("lg")
  .cursor("pointer")
  .addClass("hover:bg-gray-50")

// Danger button
Button("Delete")
  .padding("x", "4")
  .padding("y", "2")
  .background("red-500")
  .textColor("white")
  .rounded()
  .textSize("sm")
  .cursor("pointer")
```

### Card Component

```typescript
Div([
  // Card header
  Div("Card Title")
    .textSize("2xl")
    .fontWeight("bold")
    .margin("bottom", "4"),

  // Card content
  Div("This is the card content with some descriptive text.")
    .textColor("gray-600")
    .margin("bottom", "6"),

  // Card actions
  Div([
    Button("Cancel")
      .padding("x", "4")
      .padding("y", "2")
      .border()
      .borderColor("gray-300")
      .rounded()
      .cursor("pointer"),

    Button("Confirm")
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
  .maxW("md")
```

### Centered Container

```typescript
Div([
  H1("Welcome")
    .textSize("4xl")
    .fontWeight("bold")
    .textAlign("center")
    .margin("bottom", "8"),

  P("Your content here")
    .textColor("gray-600")
    .textAlign("center")
])
  .w("full")
  .maxW("md")
  .margin("x", "auto")
  .padding("8")
```

### Flex Layout (Header)

```typescript
Div([
  // Logo
  Div("MyApp")
    .textSize("xl")
    .fontWeight("bold"),

  // Navigation
  Nav([
    A("Home").setHref("/"),
    A("About").setHref("/about"),
    A("Contact").setHref("/contact")
  ])
    .flex()
    .gap("6"),

  // Actions
  Button("Login")
    .padding("x", "4")
    .padding("y", "2")
    .background("blue-500")
    .textColor("white")
    .rounded()
])
  .flex()
  .justifyContent("between")
  .alignItems("center")
  .padding("4")
  .background("white")
  .shadow()
```

### Grid Gallery

```typescript
Div(
  ForEach(images, (img) =>
    Div([
      Img()
        .setSrc(img.url)
        .setAlt(img.title)
        .w("full")
        .h("48")
        .addClass("object-cover"),

      Div(img.title)
        .padding("2")
        .textSize("sm")
        .fontWeight("medium")
    ])
      .background("white")
      .rounded("lg")
      .shadow()
      .overflow("hidden")
  )
)
  .grid()
  .gridCols("3")
  .gap("4")
  .padding("8")
```

### Sticky Header

```typescript
Header([
  Nav([/* navigation items */])
])
  .position("sticky")
  .zIndex("50")
  .background("white")
  .shadow()
  .padding("4")
```

### Form Layout

```typescript
Form([
  // Form field
  Div([
    Label("Email").setFor("email")
      .fontWeight("medium")
      .textSize("sm")
      .margin("bottom", "2"),

    Input()
      .setId("email")
      .setType("email")
      .setName("email")
      .setPlaceholder("you@example.com")
      .w("full")
      .padding("2")
      .border()
      .borderColor("gray-300")
      .rounded()
  ])
    .margin("bottom", "4"),

  // Submit button
  Button("Submit")
    .setType("submit")
    .w("full")
    .padding("3")
    .background("blue-500")
    .textColor("white")
    .rounded("lg")
    .fontWeight("semibold")
    .cursor("pointer")
])
  .maxW("md")
  .margin("x", "auto")
  .padding("6")
```

### Responsive Card Grid

```typescript
Div(
  ForEach(items, (item) =>
    Div([
      Div(item.title)
        .textSize("lg")
        .fontWeight("bold")
        .margin("bottom", "2"),

      Div(item.description)
        .textColor("gray-600")
        .textSize("sm")
    ])
      .background("white")
      .padding("6")
      .rounded("lg")
      .shadow()
      .border()
      .borderColor("gray-200")
  )
)
  .grid()
  .gridCols("3")
  .gap("6")
  .padding("8")
```

### Full-Screen Section

```typescript
Div([
  H1("Welcome to Our Site")
    .textSize("5xl")
    .fontWeight("bold")
    .textColor("white")
    .margin("bottom", "4"),

  P("Get started with amazing features")
    .textSize("xl")
    .textColor("gray-200")
])
  .w("full")
  .h("screen")
  .flex()
  .flexDirection("col")
  .justifyContent("center")
  .alignItems("center")
  .background("blue-600")
```

## Combining with Traditional Methods

SwiftUI-style methods work seamlessly with traditional methods:

```typescript
Div()
  .setId("my-element")              // Traditional
  .padding("4")                     // SwiftUI-style
  .background("red-500")            // SwiftUI-style
  .addClass("hover:bg-red-600")     // Traditional (for pseudo-classes)
  .setDataAttrs({ testid: "card" }) // Traditional
  .rounded("lg")                    // SwiftUI-style
```

## When to Use Each Approach

**Use SwiftUI-style methods for:**
- Base utility classes (padding, margin, colors, sizing)
- Layout classes (flex, grid)
- Simple borders, shadows, rounded corners

**Use traditional `addClass()` for:**
- Responsive variants: `"md:w-1/2 lg:w-1/3"`
- Pseudo-classes: `"hover:bg-blue-600 focus:ring-2"`
- State variants: `"active:bg-blue-700 disabled:opacity-50"`
- Complex combinations: `"group-hover:opacity-100"`
- Custom/arbitrary classes not in Tailwind

**Example combining both:**
```typescript
Button("Hover me")
  .padding("x", "6")                                    // SwiftUI-style
  .padding("y", "3")                                    // SwiftUI-style
  .background("blue-500")                               // SwiftUI-style
  .textColor("white")                                   // SwiftUI-style
  .rounded("lg")                                        // SwiftUI-style
  .addClass("hover:bg-blue-600 focus:ring-2 focus:ring-blue-300")  // Traditional for interactions
```

## Best Practices

1. **Chain for readability** - Put related properties together:
   ```typescript
   Div()
     .padding("6")
     .margin("4")
     .background("white")
     .rounded("lg")
     .shadow("md")
   ```

2. **Use directional shortcuts** for spacing:
   ```typescript
   // Good
   .padding("x", "4").padding("y", "2")

   // Instead of
   .padding("left", "4").padding("right", "4").padding("top", "2").padding("bottom", "2")
   ```

3. **Combine with `addClass()`** for interactive states:
   ```typescript
   Button("Click")
     .padding("4")
     .background("blue-500")
     .textColor("white")
     .rounded()
     .addClass("hover:bg-blue-600 transition-colors")
   ```

4. **Type safety helps** - Let IDE autocomplete guide you:
   ```typescript
   Div()
     .position("relative")  // IDE suggests: static, fixed, absolute, relative, sticky
     .textAlign("center")   // IDE suggests: left, center, right, justify
   ```

5. **Method order doesn't matter** - All methods append classes:
   ```typescript
   // These are equivalent
   Div().padding("4").margin("2")
   Div().margin("2").padding("4")
   ```

## Common Patterns Cheat Sheet

```typescript
// Centered container
.w("full").maxW("md").margin("x", "auto")

// Flex row centered
.flex().justifyContent("center").alignItems("center")

// Flex column centered
.flex().flexDirection("col").justifyContent("center").alignItems("center")

// Card style
.background("white").padding("6").rounded("lg").shadow("md")

// Button primary
.padding("x", "4").padding("y", "2").background("blue-500").textColor("white").rounded()

// Full height section
.w("full").h("screen")

// Responsive container
.w("full").maxW("screen-xl").margin("x", "auto").padding("x", "4")

// Grid layout
.grid().gridCols("3").gap("4")

// Sticky header
.position("sticky").zIndex("50").background("white").shadow()
```
