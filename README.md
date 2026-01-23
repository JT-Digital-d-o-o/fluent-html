# Lambda.html

A **type-safe**, **zero-dependency** HTML builder for TypeScript with built-in **XSS protection**, **first-class HTMX support**, and a **fluent styling API** for server-side rendering.

[![npm version](https://img.shields.io/npm/v/lambda.html.svg)](https://www.npmjs.com/package/lambda.html)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](https://www.npmjs.com/package/lambda.html)

```typescript
const page = Div([
  H1("Welcome").setClass("text-3xl font-bold"),
  Button("Load More")
    .setHtmx(hx("/api/items", {
      trigger: "click",           // ← IDE suggests: "click" | "load" | "revealed" | ...
      swap: "beforeend",          // ← IDE suggests: "innerHTML" | "outerHTML" | ...
      target: closest("ul"),      // ← Type-safe selector helper
    }))
]).setClass("container mx-auto p-8");
```

---

## Why Lambda.html?

### 🎯 **IDE-Powered Development**

Lambda.html's type system provides **intelligent autocomplete** for everything—HTML attributes, HTMX configurations, CSS classes, and more. Your IDE becomes your documentation.

```typescript
// Your IDE suggests all valid trigger options as you type:
Button("Save").setHtmx(hx("/api/save", {
  trigger: "cl"  // IDE shows: click | change | load | revealed | intersect | ...
  //        ↑ Autocomplete appears here!
}))

// Complex triggers with modifiers? Also fully typed:
Input().setHtmx(hx("/api/search", {
  trigger: "keyup changed delay:300ms"  // ← Valid typed trigger
  //              ↑ IDE validates modifier syntax
}))
```

### 🔒 **Compile-Time Safety**

Catch errors before they reach production:

```typescript
// ✅ Compiles - valid swap strategy
Div().setHtmx(hx("/api", { swap: "innerHTML" }))

// ❌ Type Error - "inner" is not a valid swap strategy
Div().setHtmx(hx("/api", { swap: "inner" }))
//                              ~~~~~~~ 
// Type '"inner"' is not assignable to type 'HxSwap'

// ✅ Compiles - valid input type
Input().setType("email").setPattern("[a-z]+@[a-z]+\\.[a-z]+")

// ❌ Type Error - setPattern doesn't exist on Div
Div().setPattern("[a-z]+")  
//    ~~~~~~~~~~ Property 'setPattern' does not exist on type 'Tag'
```

### 🛡️ **Built-in XSS Protection**

All content is automatically escaped—no configuration needed:

```typescript
const userInput = '<script>alert("xss")</script>';
render(Div(userInput));
// Output: <div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>
```

### ⚡ **Zero Dependencies, Tiny Footprint**

Pure TypeScript. No runtime overhead. Perfect for server-side rendering.

---

## Installation

```bash
npm install lambda.html
```

## Quick Start

```typescript
import { Div, H1, P, Button, render, hx } from 'lambda.html';

const page = Div([
  H1("Welcome to Lambda.html")
    .setClass("text-3xl font-bold"),
  P("Build type-safe HTML with confidence.")
    .setClass("text-gray-600 mt-2"),
  Button("Get Started")
    .setClass("bg-blue-500 text-white px-4 py-2 rounded mt-4")
    .setHtmx(hx("/api/start", { method: "post" }))
]).setClass("container mx-auto p-8");

console.log(render(page));
```

**Output:**
```html
<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold">Welcome to Lambda.html</h1>
  <p class="text-gray-600 mt-2">Build type-safe HTML with confidence.</p>
  <button class="bg-blue-500 text-white px-4 py-2 rounded mt-4" 
          hx-post="/api/start">Get Started</button>
</div>
```

---

## Table of Contents

- [IDE Autocomplete in Action](#ide-autocomplete-in-action)
- [Type-Safe HTMX](#type-safe-htmx)
- [Fluent Styling API](#fluent-styling-api)
- [XSS Protection](#xss-protection)
- [HTML Elements](#html-elements)
- [Control Flow](#control-flow)
- [Composable Components](#composable-components)
- [Common Patterns](#common-patterns)
- [API Reference](#api-reference)

---

## IDE Autocomplete in Action

Lambda.html transforms your IDE into a powerful documentation tool. Here's what you get:

### HTMX Triggers

```typescript
// As you type, your IDE suggests all valid triggers:
.setHtmx(hx("/api", { 
  trigger: "|"  // Cursor here shows:
}))
// Suggestions:
//   click      - Standard click event
//   change     - Input change event  
//   submit     - Form submission
//   load       - Page load
//   revealed   - Element scrolled into view
//   intersect  - Intersection observer
//   keyup      - Key release
//   mouseenter - Mouse enters element
//   every 1s   - Polling every second
//   sse:event  - Server-sent event
//   ...and 20+ more!
```

### HTMX Swap Strategies

```typescript
.setHtmx(hx("/api", { 
  swap: "|"  // Cursor here shows:
}))
// Suggestions:
//   innerHTML   - Replace inner content (default)
//   outerHTML   - Replace entire element
//   beforebegin - Insert before element
//   afterbegin  - Insert at start of children
//   beforeend   - Insert at end of children
//   afterend    - Insert after element
//   delete      - Remove element
//   none        - No swap
//
// With modifiers:
//   innerHTML scroll:top
//   outerHTML transition:true
//   beforeend show:window:top
```

### HTMX Sync Strategies

```typescript
.setHtmx(hx("/api", { 
  sync: "|"  // Cursor here shows:
}))
// Suggestions:
//   drop        - Drop new request if one in flight
//   abort       - Abort current request
//   replace     - Same as abort
//   queue       - Queue requests
//   queue first - Queue, process first only
//   queue last  - Queue, process last only
//   queue all   - Queue all requests
```

### Input Types & Attributes

```typescript
Input()
  .setType("|")  // IDE suggests: text | email | password | number | tel | url | ...
  .setAutocomplete("|")  // IDE suggests: on | off | email | username | current-password | ...
```

### Element-Specific Methods

```typescript
// Only Th and Td have colspan/rowspan:
Th("Header").setColspan(2).setScope("col")
//           ~~~~~~~~~~~ ✓ Available on ThTag
//                       ~~~~~~~~~ ✓ Available on ThTag

Div("Content").setColspan(2)
//             ~~~~~~~~~~ ✗ Error: Property 'setColspan' does not exist

// Only Form has action/method:
Form().setAction("/submit").setMethod("post")
//     ~~~~~~~~~ ✓ Available    ~~~~~~~~~ ✓ Available

// Only Input has min/max/step:
Input().setType("number").setMin(0).setMax(100).setStep(5)
//                        ~~~~~~ ✓  ~~~~~~ ✓   ~~~~~~~ ✓
```

---

## Type-Safe HTMX

Lambda.html provides **complete HTMX 2.0 support** with full type safety.

### Basic Requests

```typescript
import { hx } from 'lambda.html';

// GET request (default)
Button("Load").setHtmx(hx("/api/items"))

// POST request
Button("Submit").setHtmx(hx("/api/submit", { method: "post" }))

// PUT request
Button("Update").setHtmx(hx("/api/update/123", { method: "put" }))

// PATCH request (new in HTMX 2.0)
Button("Patch").setHtmx(hx("/api/resource", { method: "patch" }))

// DELETE request
Button("Delete").setHtmx(hx("/api/delete/123", { method: "delete" }))
```

### Type-Safe Target Selectors

```typescript
import { id, clss, closest, find, next, previous } from 'lambda.html';

// ID selector → "#content"
Button("Load").setHtmx(hx("/api", { target: id("content") }))

// Class selector → ".items"
Button("Update").setHtmx(hx("/api", { target: clss("items") }))

// Closest ancestor → "closest tr"
Button("Delete Row").setHtmx(hx("/api/delete", { 
  method: "delete",
  target: closest("tr") 
}))

// Find descendant → "find .content"
Div().setHtmx(hx("/api", { target: find(".content") }))

// Next sibling → "next div"
Button("Next").setHtmx(hx("/api", { target: next("div") }))

// Previous sibling → "previous li"  
Button("Prev").setHtmx(hx("/api", { target: previous("li") }))
```

### Triggers with Modifiers

```typescript
// Debounced search input
Input()
  .setType("search")
  .setName("q")
  .setHtmx(hx("/api/search", {
    trigger: "keyup changed delay:300ms",  // ← Fully typed!
    target: "#search-results"
  }))

// Throttled scroll
Div().setHtmx(hx("/api/more", {
  trigger: "scroll throttle:500ms",
  swap: "beforeend"
}))

// Load on reveal (lazy loading)
Div().setHtmx(hx("/api/content", { trigger: "revealed" }))

// Polling every 30 seconds
Div().setHtmx(hx("/api/notifications", { trigger: "every 30s" }))

// Multiple triggers
Button("Action").setHtmx(hx("/api/action", {
  trigger: "click, keyup[key=='Enter']"
}))
```

### Swap Strategies with Modifiers

```typescript
// Basic swaps
Div().setHtmx(hx("/api", { swap: "innerHTML" }))    // Replace inner content
Div().setHtmx(hx("/api", { swap: "outerHTML" }))    // Replace entire element
Div().setHtmx(hx("/api", { swap: "beforeend" }))    // Append to children

// With scroll modifier
Div().setHtmx(hx("/api", { swap: "innerHTML scroll:top" }))

// With show modifier (scroll into view)
Div().setHtmx(hx("/api", { swap: "innerHTML show:window:top" }))

// With transition
Div().setHtmx(hx("/api", { swap: "outerHTML transition:true" }))

// With timing
Div().setHtmx(hx("/api", { swap: "innerHTML swap:500ms settle:100ms" }))
```

### HTMX 2.0 Features

```typescript
// Prompt dialog before request
Button("Rename").setHtmx(hx("/api/rename", {
  method: "post",
  prompt: "Enter new name:"
}))

// Disable elements during request
Button("Submit").setHtmx(hx("/api/submit", {
  method: "post",
  disabledElt: "this"  // or "#submit-btn" or "closest form"
}))

// Out-of-band swaps
Div().setHtmx(hx("/api/data", { swapOob: true }))
Div().setHtmx(hx("/api/data", { swapOob: "true:#sidebar" }))

// Control attribute inheritance
Div().setHtmx(hx("/api", { disinherit: "*" }))           // Disable all
Div().setHtmx(hx("/api", { inherit: "hx-target hx-swap" })) // Force specific

// Prevent history snapshot
Div().setHtmx(hx("/api/modal", { history: false }))

// Preserve element during swap (e.g., video player)
Video().setId("player").setHtmx(hx("/api/page", { preserve: true }))

// Request configuration
Div().setHtmx(hx("/api/slow", { request: "timeout:5000" }))

// Boost links/forms to use AJAX
A("Page").setHref("/page").setHtmx(hx("/page", { boost: true }))

// Sync strategies
Button("Save").setHtmx(hx("/api/save", { 
  method: "post",
  sync: "abort"        // Abort previous request
}))
Input().setHtmx(hx("/api/search", { 
  sync: "queue last"   // Queue, process last
}))
```

### Complete Form Example

```typescript
Form([
  Fieldset([
    Legend("User Registration"),
    
    Label("Email").setFor("email"),
    Input()
      .setType("email")
      .setId("email")
      .setName("email")
      .setPlaceholder("you@example.com")
      .setAutocomplete("email")
      .setToggles(["required"]),
    
    Label("Password").setFor("password"),
    Input()
      .setType("password")
      .setId("password")
      .setName("password")
      .setMinlength(8)
      .setAutocomplete("new-password")
      .setToggles(["required"]),
    
    Button("Register")
      .setType("submit")
      .setClass("bg-blue-500 text-white px-4 py-2 rounded")
  ]).setClass("space-y-4")
])
  .setHtmx(hx("/api/register", {
    method: "post",
    swap: "outerHTML",
    indicator: "#loading",
    disabledElt: "find button"
  }))
```

---

## Fluent Styling API

Lambda.html provides a **fluent, chainable API** for Tailwind CSS classes, making your styling code more expressive and maintainable.

### Quick Start

```typescript
import { Div, Button } from 'lambda.html';

// Instead of:
Div("Content").setClass("p-4 bg-red-500 mx-8 text-white rounded-lg shadow-md")

// Write this:
Div("Content")
  .padding("4")
  .background("red-500")
  .margin("x", "8")
  .textColor("white")
  .rounded("lg")
  .shadow("md")
```

Both approaches produce identical HTML, but the fluent API offers better readability and IDE support.

### Spacing Methods

**Padding:**
```typescript
.padding("4")                    // p-4 (all sides)
.padding("x", "4")               // px-4 (horizontal)
.padding("y", "4")               // py-4 (vertical)
.padding("top", "4")             // pt-4
.padding("bottom", "4")          // pb-4
.padding("left", "4")            // pl-4
.padding("right", "4")           // pr-4
```

**Margin:**
```typescript
.margin("4")                     // m-4 (all sides)
.margin("x", "auto")             // mx-auto (center horizontally)
.margin("y", "4")                // my-4 (vertical)
.margin("top", "8")              // mt-8
```

### Color & Typography

**Colors:**
```typescript
.background("red-500")           // bg-red-500
.textColor("gray-700")           // text-gray-700
.borderColor("gray-300")         // border-gray-300
```

**Typography:**
```typescript
.textSize("xl")                  // text-xl
.textAlign("center")             // text-center
.fontWeight("bold")              // font-bold
```

### Layout Methods

**Sizing:**
```typescript
.w("full")                       // w-full
.w("1/2")                        // w-1/2
.h("screen")                     // h-screen
.maxW("md")                      // max-w-md
```

**Flexbox:**
```typescript
.flex()                          // flex
.flexDirection("col")            // flex-col
.justifyContent("center")        // justify-center
.alignItems("center")            // items-center
.gap("4")                        // gap-4
```

**Grid:**
```typescript
.grid()                          // grid
.gridCols("3")                   // grid-cols-3
.gridRows("2")                   // grid-rows-2
```

### Visual Effects

**Borders & Radius:**
```typescript
.border()                        // border
.border("2")                     // border-2
.rounded()                       // rounded
.rounded("full")                 // rounded-full
.shadow()                        // shadow
.shadow("lg")                    // shadow-lg
```

**Position & Display:**
```typescript
.position("relative")            // relative
.position("absolute")            // absolute
.zIndex("10")                    // z-10
.opacity("50")                   // opacity-50
.cursor("pointer")               // cursor-pointer
.overflow("hidden")              // overflow-hidden
```

### Real-World Example

```typescript
const card = Div([
  H2("Card Title")
    .textSize("2xl")
    .fontWeight("bold")
    .margin("bottom", "4"),

  P("Card content goes here...")
    .textColor("gray-600")
    .margin("bottom", "6"),

  Div([
    Button("Cancel")
      .padding("x", "4")
      .padding("y", "2")
      .border()
      .borderColor("gray-300")
      .rounded(),

    Button("Submit")
      .padding("x", "4")
      .padding("y", "2")
      .background("blue-500")
      .textColor("white")
      .rounded()
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
  .w("full")
  .maxW("md");
```

### Mixing with Traditional Styles

You can freely mix fluent methods with traditional class names:

```typescript
Div()
  .padding("4")                  // Fluent API
  .background("red-500")         // Fluent API
  .addClass("hover:bg-red-600")  // Traditional Tailwind
  .setClass("custom-class");     // Replace all classes
```

### Type Safety

All methods return the correct type for full IDE autocomplete:

```typescript
Button("Click")
  .padding("4")                  // Available on all Tags
  .setType("submit")             // Button-specific method
  .background("blue-500")        // Available on all Tags
  .setDisabled(false);           // Button-specific method
```

The fluent API generates standard Tailwind CSS classes. Make sure Tailwind is included in your project. For a complete API reference, see the [styling documentation](https://github.com/your-repo/lambda.html/blob/main/STYLING.md).

---

## XSS Protection

Lambda.html **automatically escapes** all text content and attributes. No configuration needed.

### Automatic Text Escaping

```typescript
// User input is automatically escaped
const userInput = '<script>alert("xss")</script>';
const element = Div(userInput);

console.log(render(element));
// Output: <div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>
```

### Automatic Attribute Escaping

```typescript
// Malicious class names are escaped
const malicious = '"><script>alert(1)</script>';
const element = Div().setClass(malicious);

console.log(render(element));
// Output: <div class="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"></div>
```

### Raw Content for Scripts & Styles

Script and Style elements are intentionally **not escaped** (they contain code, not user content):

```typescript
// Script content preserved for valid JavaScript
Script(`
  if (count < 10 && count > 0) {
    console.log('valid');
  }
`)
// Output: <script>if (count < 10 && count > 0) { console.log('valid'); }</script>

// Style content preserved for valid CSS
Style(`
  .card > .title { content: "a & b"; }
`)
// Output: <style>.card > .title { content: "a & b"; }</style>
```

### Safe Dynamic Content

```typescript
// Building HTML from user data is always safe
function UserCard(user: { name: string; bio: string }): View {
  return Div([
    H2(user.name),      // ← Escaped automatically
    P(user.bio),        // ← Escaped automatically
  ]).setClass("user-card");
}

// Even malicious data is safely rendered
const user = {
  name: '<script>steal(cookies)</script>',
  bio: '"><img src=x onerror=alert(1)>'
};

render(UserCard(user));
// All content properly escaped - XSS prevented!
```

---

## HTML Elements

Lambda.html provides **60+ HTML elements** with typed attribute methods.

### Element Chaining

All elements support fluent method chaining:

```typescript
const card = Div("Content")
  .setId("my-card")
  .setClass("card shadow-lg")
  .addClass("hover:shadow-xl")
  .setStyle("max-width: 400px")
  .addAttribute("data-testid", "card-component")
  .setHtmx(hx("/api/card", { trigger: "click" }));
```

### Nested Elements

```typescript
// Single child
Div(P("Paragraph inside div"))

// Multiple children as array
Div([
  H1("Title"),
  P("First paragraph"),
  P("Second paragraph")
])

// Mixed content
Div([
  "Text node",
  Strong("Bold text"),
  " more text"
])
```

### Form Elements

```typescript
// Text input with validation
Input()
  .setType("email")
  .setName("email")
  .setPlaceholder("Enter your email")
  .setPattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")
  .setAutocomplete("email")
  .setToggles(["required"])

// Number input with constraints
Input()
  .setType("number")
  .setName("quantity")
  .setMin(1)
  .setMax(100)
  .setStep(5)

// Textarea
Textarea()
  .setName("message")
  .setPlaceholder("Enter your message")
  .setRows(5)
  .setMaxlength(500)

// Select with optgroups
Select([
  Option("Select a country...").setValue(""),
  Optgroup([
    Option("United States").setValue("us"),
    Option("Canada").setValue("ca"),
  ]).setLabel("North America"),
  Optgroup([
    Option("United Kingdom").setValue("uk"),
    Option("Germany").setValue("de"),
  ]).setLabel("Europe"),
]).setName("country").setToggles(["required"])
```

### Table Elements

```typescript
Table([
  Caption("Monthly Sales Report"),
  Thead(
    Tr([
      Th("Product").setScope("col"),
      Th("Q1").setScope("col"),
      Th("Q2").setScope("col"),
      Th("Total").setScope("col").setColspan(2),
    ])
  ),
  Tbody([
    Tr([
      Th("Widget A").setScope("row"),
      Td("$1,000"),
      Td("$1,500"),
      Td("$2,500").setColspan(2),
    ]),
  ]),
  Tfoot(
    Tr([
      Th("Total").setScope("row"),
      Td("$3,000").setColspan(3),
    ])
  ),
]).setClass("w-full border-collapse")
```

### Media Elements

```typescript
// Responsive image with lazy loading
Img()
  .setSrc("hero.jpg")
  .setAlt("Hero image")
  .setSrcset("hero-400.jpg 400w, hero-800.jpg 800w")
  .setSizes("(max-width: 600px) 400px, 800px")
  .setLoading("lazy")
  .setDecoding("async")

// Video with multiple sources
Video([
  Source().setSrc("video.webm").setType("video/webm"),
  Source().setSrc("video.mp4").setType("video/mp4"),
  Track()
    .setSrc("captions.vtt")
    .setKind("subtitles")
    .setSrclang("en")
    .setLabel("English")
    .setDefault(),
  "Your browser does not support video."
])
  .setControls()
  .setPoster("poster.jpg")
  .setPreload("metadata")

// Picture element for art direction
Picture([
  Source()
    .setSrcset("hero-mobile.jpg")
    .setMedia("(max-width: 600px)"),
  Source()
    .setSrcset("hero-desktop.jpg")
    .setMedia("(min-width: 601px)"),
  Img().setSrc("hero-fallback.jpg").setAlt("Hero"),
])
```

### Interactive Elements

```typescript
// Details/Summary (accordion)
Details([
  Summary("Click to expand"),
  P("Hidden content revealed when opened."),
]).setOpen()

// Dialog (modal)
Dialog([
  H2("Confirm Action"),
  P("Are you sure you want to proceed?"),
  Button("Cancel").addAttribute("onclick", "this.closest('dialog').close()"),
  Button("Confirm").setClass("bg-blue-500 text-white"),
]).setId("confirm-modal")

// Progress and Meter
Progress().setValue(70).setMax(100)
Meter().setValue(0.7).setMin(0).setMax(1).setLow(0.3).setHigh(0.8).setOptimum(0.5)
```

---

## Control Flow

Lambda.html provides functional control flow for conditional and iterative rendering.

### IfThen / IfThenElse

```typescript
import { IfThen, IfThenElse } from 'lambda.html';

// Conditional rendering
function UserBadge(user: { isAdmin: boolean; isPremium: boolean }): View {
  return Div([
    IfThen(user.isAdmin, () => 
      Span("Admin").setClass("badge badge-red")
    ),
    IfThen(user.isPremium, () => 
      Span("Premium").setClass("badge badge-gold")
    ),
  ]);
}

// If-else rendering
function LoginStatus(user: User | null): View {
  return IfThenElse(
    user !== null,
    () => Span(`Welcome, ${user!.name}`),
    () => A("Login").setHref("/login")
  );
}
```

### SwitchCase

```typescript
import { SwitchCase } from 'lambda.html';

type Status = 'pending' | 'approved' | 'rejected';

function StatusBadge(status: Status): View {
  return SwitchCase([
    { condition: status === 'pending',  component: () => Span("⏳ Pending").setClass("text-yellow-600") },
    { condition: status === 'approved', component: () => Span("✅ Approved").setClass("text-green-600") },
    { condition: status === 'rejected', component: () => Span("❌ Rejected").setClass("text-red-600") },
  ], () => Span("Unknown").setClass("text-gray-600"));
}
```

### ForEach Variants

```typescript
import { ForEach, ForEach1, ForEach2, ForEach3, Repeat } from 'lambda.html';

const items = ["Apple", "Banana", "Cherry"];

// Basic iteration
Ul(ForEach(items, item => Li(item)))

// With index
Ol(ForEach1(items, (item, index) => 
  Li(`${index + 1}. ${item}`)
))

// Range iteration (0 to n-1)
Div(ForEach2(5, i => 
  Span(`Item ${i}`).setClass("inline-block p-2")
))

// Range iteration (start to end-1)
Div(ForEach3(1, 6, i => 
  Button(`Page ${i}`).setClass("px-3 py-1")
))

// Repeat n times
Div(Repeat(5, () => Span("⭐")))
```

---

## Composable Components

Build reusable, type-safe components as pure functions.

### Button Component

```typescript
interface ButtonProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  htmx?: HTMX;
}

function StyledButton(props: ButtonProps): View {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  const button = Button(props.text)
    .setClass(`rounded font-medium transition-colors
      ${variants[props.variant ?? 'primary']}
      ${sizes[props.size ?? 'md']}
      ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `.replace(/\s+/g, ' ').trim());
  
  if (props.disabled) button.setDisabled();
  if (props.htmx) button.setHtmx(props.htmx);
  
  return button;
}

// Usage
StyledButton({ text: "Save", variant: "primary", htmx: hx("/api/save", { method: "post" }) })
StyledButton({ text: "Cancel", variant: "secondary" })
StyledButton({ text: "Delete", variant: "danger", disabled: true })
```

### Card Component

```typescript
interface CardProps {
  title: string;
  content: View;
  footer?: View;
  image?: string;
}

function Card(props: CardProps): View {
  return Div([
    IfThen(!!props.image, () =>
      Img()
        .setSrc(props.image!)
        .setAlt(props.title)
        .setClass("w-full h-48 object-cover")
        .setLoading("lazy")
    ),
    Div([
      H3(props.title).setClass("text-xl font-semibold mb-2"),
      Div(props.content).setClass("text-gray-600"),
    ]).setClass("p-4"),
    IfThen(!!props.footer, () =>
      Div(props.footer!).setClass("px-4 py-3 bg-gray-50 border-t")
    ),
  ]).setClass("bg-white rounded-lg shadow-md overflow-hidden");
}
```

### Data Table Component

```typescript
interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => View;
}

function DataTable<T extends Record<string, any>>(
  columns: Column<T>[],
  data: T[],
  options?: { striped?: boolean; hoverable?: boolean }
): View {
  return Table([
    Thead(
      Tr(ForEach(columns, col =>
        Th(col.header).setScope("col").setClass("px-4 py-3 text-left font-semibold")
      )).setClass("bg-gray-100")
    ),
    Tbody(
      ForEach1(data, (row, index) =>
        Tr(ForEach(columns, col => {
          const value = row[col.key];
          const content = col.render ? col.render(value, row) : String(value);
          return Td(content).setClass("px-4 py-3");
        }))
          .addClass(options?.hoverable ? 'hover:bg-gray-50' : '')
          .addClass(options?.striped && index % 2 ? 'bg-gray-50' : '')
      )
    ),
  ]).setClass("w-full border-collapse");
}

// Usage
interface User { id: number; name: string; email: string; role: string; }

DataTable<User>(
  [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { 
      key: "role", 
      header: "Role",
      render: (value) => Span(String(value))
        .setClass(value === "Admin" ? "text-red-600 font-bold" : "text-gray-600")
    },
  ],
  users,
  { striped: true, hoverable: true }
)
```

### Infinite Scroll Component

```typescript
function InfiniteScrollList(items: Item[], page: number): View {
  return Div([
    Ul(
      ForEach(items, item => 
        Li([
          H3(item.title).setClass("font-medium"),
          P(item.description).setClass("text-gray-600 text-sm"),
        ]).setClass("p-4 border-b")
      )
    ).setId("item-list"),
    
    // Load more trigger - fires when scrolled into view
    Div("Loading...")
      .setId("load-more")
      .setClass("p-4 text-center text-gray-500")
      .setHtmx(hx(`/api/items?page=${page + 1}`, {
        trigger: "revealed",
        swap: "outerHTML",
      }))
  ]);
}
```

---

## Common Patterns

Lambda.html includes built-in helpers for common UI patterns and layouts.

### Utility Methods

**Array-based Class Management:**
```typescript
// Automatically filters out falsy values
Button("Save").setClasses([
  "btn",
  props.disabled && "btn-disabled",
  props.variant === "primary" ? "btn-primary" : "btn-secondary"
])
// Output: class="btn btn-primary"
```

**Object-based Styles:**
```typescript
// Supports camelCase → kebab-case conversion
Div("Box").setStyles({
  width: "100px",
  height: "50px",
  backgroundColor: "blue",  // → background-color
  fontSize: "16px"          // → font-size
})
```

**Batch Data Attributes:**
```typescript
Button("Click").setDataAttrs({
  testid: "submit-btn",     // → data-testid
  userId: "123",            // → data-user-id
  actionType: "save"        // → data-action-type
})
```

**Accessibility Attributes:**
```typescript
Button("Menu").setAria({
  label: "Open menu",
  expanded: false,          // Converts boolean to string
  controls: "menu-panel",
  hasPopup: true            // → aria-has-popup
})
```

### Layout Helpers

**Vertical Stack (Flexbox Column):**
```typescript
import { VStack } from 'lambda.html';

VStack([
  H1("Title"),
  P("Content"),
  Button("Action")
], {
  spacing: "1rem",
  align: "center",
  justify: "flex-start",
  className: "my-stack"
})
// Creates flex column with gap
```

**Horizontal Stack (Flexbox Row):**
```typescript
import { HStack } from 'lambda.html';

HStack([
  Button("Cancel"),
  Button("Save")
], {
  spacing: "0.5rem",
  justify: "flex-end"
})
// Creates flex row with gap
```

**Grid Layout:**
```typescript
import { Grid } from 'lambda.html';

// With column count
Grid([Card1, Card2, Card3, Card4], {
  columns: 2,
  gap: "1rem"
})
// → grid-template-columns: repeat(2, 1fr)

// With custom template
Grid([Item1, Item2, Item3], {
  columns: "1fr 2fr 1fr",
  rows: "auto 1fr auto",
  gap: "1rem"
})
```

### HTMX Patterns

**Debounced Search:**
```typescript
import { SearchInput } from 'lambda.html';

SearchInput({
  endpoint: "/api/search",
  target: "#results",
  delay: 300,                    // milliseconds
  placeholder: "Search products...",
  name: "q"
})
// Automatically debounces keystrokes
```

**Infinite Scroll:**
```typescript
import { InfiniteScroll } from 'lambda.html';

// In your list view
Ul(
  ForEach(items, item => Li(item.name))
).setId("items"),

// Add at the bottom
InfiniteScroll({
  endpoint: `/api/items?page=${nextPage}`,
  loadingText: "Loading more items...",
  threshold: "100px"  // Trigger 100px before visible
})
// Loads when scrolled into view
```

### Form Patterns

**Form Field with Label and Error:**
```typescript
import { FormField } from 'lambda.html';

FormField({
  label: "Email Address",
  name: "email",
  type: "email",
  placeholder: "you@example.com",
  required: true,
  error: "Please enter a valid email"
})
// Includes label, input, and error message
```

### List Patterns

**Keyed Lists:**
```typescript
import { KeyedList } from 'lambda.html';

KeyedList(
  users,
  (user) => user.id,  // Key function
  (user, index) => Div([
    H3(user.name),
    P(user.email)
  ])
)
// Adds data-key attribute for stability
```

### Combining Patterns

```typescript
// Form with layout helpers and fluent styling
VStack([
  H1("Contact Us")
    .textSize("3xl")
    .fontWeight("bold"),

  FormField({
    label: "Name",
    name: "name",
    type: "text",
    required: true
  }),

  FormField({
    label: "Email",
    name: "email",
    type: "email",
    required: true
  }),

  HStack([
    Button("Cancel")
      .padding("x", "4")
      .padding("y", "2")
      .border()
      .rounded(),
    Button("Submit")
      .padding("x", "4")
      .padding("y", "2")
      .background("blue-500")
      .textColor("white")
      .rounded()
  ], { justify: "flex-end" })
], { spacing: "1.5rem" })
```

---

## API Reference

### Element Functions

| Category        | Elements                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Structure**   | `Div`, `Main`, `Header`, `Footer`, `Section`, `Article`, `Nav`, `Aside`, `Figure`, `Figcaption`, `Address`, `Hgroup`, `Search`                                |
| **Headings**    | `H1`, `H2`, `H3`, `H4`, `H5`, `H6`                                                                                                                            |
| **Text**        | `P`, `Span`, `Strong`, `Em`, `B`, `I`, `U`, `S`, `Mark`, `Small`, `Sub`, `Sup`, `Blockquote`, `Pre`, `Code`, `Abbr`, `Cite`, `Q`, `Dfn`, `Kbd`, `Samp`, `Var` |
| **Breaks**      | `Br`, `Hr`, `Wbr`                                                                                                                                             |
| **Lists**       | `Ul`, `Ol`, `Li`, `Dl`, `Dt`, `Dd`, `Menu`                                                                                                                    |
| **Tables**      | `Table`, `Thead`, `Tbody`, `Tfoot`, `Tr`, `Th`, `Td`, `Caption`, `Colgroup`, `Col`                                                                            |
| **Forms**       | `Form`, `Input`, `Textarea`, `Button`, `Label`, `Select`, `Option`, `Optgroup`, `Datalist`, `Fieldset`, `Legend`, `Output`                                    |
| **Interactive** | `Details`, `Summary`, `Dialog`                                                                                                                                |
| **Media**       | `Img`, `Picture`, `Source`, `Video`, `Audio`, `Track`, `Canvas`                                                                                               |
| **SVG**         | `Svg`, `Path`, `Circle`, `Rect`, `Line`, `Polygon`, `Polyline`, `Ellipse`, `G`, `Defs`, `Use`, `Text`, `Tspan`                                                |
| **Embedded**    | `Iframe`, `ObjectEl`, `Embed`, `MapEl`, `Area`                                                                                                                |
| **Links**       | `A`                                                                                                                                                           |
| **Document**    | `HTML`, `Head`, `Body`, `Title`, `Meta`, `Link`, `Style`, `Script`, `Base`, `Noscript`, `Template`                                                            |
| **Data**        | `Time`, `Data`, `Progress`, `Meter`, `Slot`                                                                                                                   |
| **Utility**     | `El` (custom), `Empty`, `Overlay`                                                                                                                             |

### Common Methods (All Tags)

| Method                       | Description                                           |
| ---------------------------- | ----------------------------------------------------- |
| `.setId(id)`                 | Set element ID                                        |
| `.setClass(classes)`         | Set CSS classes                                       |
| `.addClass(class)`           | Append CSS class                                      |
| `.setClasses([...])`         | Set classes from array (filters falsy values)         |
| `.setStyle(css)`             | Set inline styles as string                           |
| `.setStyles({})`             | Set inline styles as object (camelCase support)       |
| `.addAttribute(key, value)`  | Add custom attribute                                  |
| `.setDataAttrs({})`          | Set multiple data-* attributes                        |
| `.setAria({})`               | Set multiple aria-* attributes                        |
| `.setHtmx(hx(...))`          | Add HTMX behavior                                     |
| `.setToggles([...])`         | Add boolean attributes (`required`, `disabled`, etc.) |

### Fluent Styling Methods (All Tags)

| Method                           | Description                                         |
| -------------------------------- | --------------------------------------------------- |
| `.padding(value)` / `.padding(side, value)` | Add padding classes (`p-4`, `px-4`, `pt-4`) |
| `.margin(value)` / `.margin(side, value)` | Add margin classes (`m-4`, `mx-auto`, `mt-8`) |
| `.background(color)`             | Add background color (`bg-red-500`)                 |
| `.textColor(color)`              | Add text color (`text-gray-700`)                    |
| `.borderColor(color)`            | Add border color (`border-gray-300`)                |
| `.textSize(size)`                | Add text size (`text-xl`, `text-sm`)                |
| `.textAlign(align)`              | Add text alignment (`text-center`)                  |
| `.fontWeight(weight)`            | Add font weight (`font-bold`)                       |
| `.w(width)`                      | Add width (`w-full`, `w-1/2`)                       |
| `.h(height)`                     | Add height (`h-screen`, `h-64`)                     |
| `.maxW(width)` / `.minW(width)` / `.maxH(height)` / `.minH(height)` | Size constraints |
| `.flex()` / `.flex(value)`       | Flexbox (`flex`, `flex-1`)                          |
| `.flexDirection(dir)`            | Flex direction (`flex-col`, `flex-row`)             |
| `.justifyContent(value)`         | Justify content (`justify-center`)                  |
| `.alignItems(value)`             | Align items (`items-center`)                        |
| `.gap(value)` / `.gap(axis, value)` | Gap (`gap-4`, `gap-x-2`)                        |
| `.grid()`                        | Grid display (`grid`)                               |
| `.gridCols(cols)` / `.gridRows(rows)` | Grid template (`grid-cols-3`)              |
| `.border()` / `.border(width)`   | Border (`border`, `border-2`)                       |
| `.rounded()` / `.rounded(size)`  | Border radius (`rounded`, `rounded-lg`)             |
| `.shadow()` / `.shadow(size)`    | Box shadow (`shadow`, `shadow-lg`)                  |
| `.position(pos)`                 | Position (`relative`, `absolute`, `fixed`)          |
| `.zIndex(value)`                 | Z-index (`z-10`, `z-50`)                            |
| `.opacity(value)`                | Opacity (`opacity-50`)                              |
| `.cursor(value)`                 | Cursor (`cursor-pointer`)                           |
| `.overflow(value)` / `.overflow(axis, value)` | Overflow (`overflow-hidden`, `overflow-x-auto`) |

### Control Flow

| Function                                | Description                 |
| --------------------------------------- | --------------------------- |
| `IfThen(condition, thenFn)`             | Render if condition is true |
| `IfThenElse(condition, thenFn, elseFn)` | Conditional rendering       |
| `SwitchCase(cases, defaultFn)`          | Multi-branch conditional    |
| `ForEach(items, renderFn)`              | Iterate over items          |
| `ForEach1(items, renderFn)`             | Iterate with index          |
| `ForEach2(n, renderFn)`                 | Range 0 to n-1              |
| `ForEach3(start, end, renderFn)`        | Range start to end-1        |
| `Repeat(n, renderFn)`                   | Repeat n times              |

### HTMX Helper

```typescript
hx(endpoint: string, options?: {
  // HTTP Method
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  
  // Targeting
  target?: string;              // CSS selector or extended selector
  swap?: HxSwap;                // Swap strategy
  swapOob?: boolean | string;   // Out-of-band swap
  select?: string;              // Select from response
  selectOob?: string;           // Select OOB content
  
  // Triggering  
  trigger?: HxTrigger;          // Event trigger
  
  // URL
  pushUrl?: boolean | string;   // Push to history
  replaceUrl?: boolean | string; // Replace in history
  
  // Data
  vals?: object | string;       // Additional values
  headers?: object;             // Custom headers
  include?: string;             // Include elements
  params?: string;              // Filter params
  encoding?: 'multipart/form-data';
  
  // Validation
  validate?: boolean;
  confirm?: string;             // Confirmation dialog
  prompt?: string;              // Prompt dialog
  
  // Loading
  indicator?: string;           // Loading indicator
  disabledElt?: string;         // Disable during request
  
  // Sync
  sync?: HxSync;                // Request synchronization
  
  // Other
  ext?: string;                 // Extensions
  disinherit?: string;          // Disable inheritance
  inherit?: string;             // Force inheritance
  history?: boolean;            // History snapshot
  historyElt?: boolean;
  preserve?: boolean;           // Preserve element
  request?: string;             // Request config
  boost?: boolean;              // Boost links/forms
  disable?: boolean;            // Disable htmx
})
```

### Selector Helpers

```typescript
import { id, clss, closest, find, next, previous } from 'lambda.html';

id("content")        // → "#content"
clss("items")        // → ".items"
closest("tr")        // → "closest tr"
find(".content")     // → "find .content"
next("div")          // → "next div"
next()               // → "next"
previous("li")       // → "previous li"
previous()           // → "previous"
```

### Pattern Helpers

```typescript
import {
  VStack, HStack, Grid,
  SearchInput, InfiniteScroll,
  FormField,
  KeyedList
} from 'lambda.html';
```

| Function | Description |
| -------- | ----------- |
| `VStack(children, options)` | Vertical flex layout (column) |
| `HStack(children, options)` | Horizontal flex layout (row) |
| `Grid(children, options)` | CSS Grid layout |
| `SearchInput(options)` | Debounced search input with HTMX |
| `InfiniteScroll(options)` | Infinite scroll trigger element |
| `FormField(options)` | Form field with label and error |
| `KeyedList(items, getKey, render)` | List with keyed items |

---

## License

ISC © Toni K. Turk

---

## Links

- [npm Package](https://www.npmjs.com/package/lambda.html)
- [GitLab Repository](https://gitlab.com/seckmaster/lambda.html)
- [Report Issues](https://gitlab.com/seckmaster/lambda.html/issues)
- [HTMX Documentation](https://htmx.org/docs/)