# Fluent HTML

**A fluent, type-safe HTML builder for TypeScript.**

[![npm version](https://img.shields.io/npm/v/fluent-html.svg)](https://www.npmjs.com/package/fluent-html)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-green.svg)](https://www.npmjs.com/package/fluent-html)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

```bash
npm install fluent-html
```

## Why fluent-html?

- **No JSX, no templates** — pure TypeScript functions with full type checking, refactoring, and IDE support
- **Autocomplete everything** — every HTML attribute, Tailwind value, HTMX option, and swap strategy suggested as you type
- **Type-safe by design** — routes, IDs, and HTMX targets are compile-time validated; typos become build errors, not runtime bugs
- **Zero dependencies, SSR-ready** — ~15KB minified, renders to strings on the server, no virtual DOM overhead

---

Build HTML with chainable methods, full IDE autocomplete, and zero dependencies:

```typescript
import { Div, H1, Button, render } from 'fluent-html';

const page = Div(
  H1("Welcome")
    .textSize("3xl")
    .fontWeight("bold"),

  Button("Get Started")
    .padding("x", "6")
    .padding("y", "3")
    .background("blue-500")
    .textColor("white")
    .rounded("lg")
    .shadow()
).padding("8").maxW("4xl").margin("x", "auto");

render(page);
```

```html
<div class="p-8 max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold">Welcome</h1>
  <button class="px-6 py-3 bg-blue-500 text-white rounded-lg shadow">Get Started</button>
</div>
```

---

## Features

- **Fluent API** - Chainable methods for styling, attributes, and structure
- **Full autocomplete** - Every method, attribute, and value suggested by your IDE
- **First-class HTMX 4** - Type-safe routes, triggers, swaps, targets, morph strategies, and more
- **Fold / Catamorphism** - Generic View traversals via `foldView` with pre-built and custom algebras ([docs](FOLD.md))
- **XSS protection** - All content escaped automatically
- **Zero dependencies** - Pure TypeScript, ~15KB minified
- **SSR-ready** - Built for server-side rendering

---

## Quick Examples

### Fluent Styling

```typescript
// Chainable Tailwind-friendly methods
Card(
  H2("Dashboard").textSize("xl").fontWeight("semibold"),
  P("Welcome back!").textColor("gray-600")
)
  .background("white")
  .padding("6")
  .rounded("xl")
  .shadow("lg")

// Or use traditional classes
Div("Content").setClass("p-4 bg-white rounded-lg shadow")
```

### HTMX 4 with Full Type Safety

```typescript
// Type-safe routes — shared prefix, typos are compile errors
const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  delete: { method: "delete", path: "/:id" },
} as const);

Button("Load").setHtmx(userRoutes.list({ target: ids.userList }))
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }))

// Shorthand methods — clean and concise
Button("Load More").hxGet("/api/items", { target: ids.itemList, swap: "append" })
Button("Save").hxPost("/api/save")
Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" })

// IDE autocomplete for all HTMX attributes
Button("Load More").setHtmx(hx("/api/items", {
  trigger: "click",       // ✅ IDE suggests: "click" | "load" | "revealed" | ...
  swap: "outerMorph",     // ✅ IDE suggests: "outerMorph" | "innerMorph" | "innerHTML" | ...
  target: ids.itemList    // ✅ Compile-time validated ID
}))
```

### Forms with Validation

```typescript
Form(
  Input()
    .setType("email")
    .setName("email")
    .setPlaceholder("you@example.com")
    .setAutocomplete("email")
    .toggle("required"),

  Button("Subscribe").setType("submit")
)
  .setHtmx(hx("/api/subscribe", { method: "post", swap: "outerMorph" }))
```

### Conditional Modifiers

Use `.when()` to conditionally modify a tag without breaking the chain:

```typescript
Button("Save")
  .setClass("btn")
  .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
  .when(isPrimary, t => t.addClass("btn-primary"))
```

When the condition is false, the tag passes through unchanged.

### Reusable Modifiers

Use `.apply()` to compose reusable modifier functions:

```typescript
const card = (t: Tag) => t.setClass("rounded shadow p-4 bg-white");
const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");

// Apply single or multiple modifiers
Div("Warning").apply(card, danger)

// Combine with .when() for conditional composition
Div("Alert")
  .apply(card)
  .when(isError, t => t.apply(danger))
```

### Control Flow

```typescript
// Conditionals
IfThen(user.isAdmin, () => AdminBadge())
IfThenElse(loggedIn, () => Dashboard(), () => LoginForm())

// Nullable value narrowing — the value is passed as a non-null argument
IfThen(user.avatar, (src) => Img().setSrc(src).setAlt("Avatar"))
IfThenElse(user, (u) => Span(`Welcome, ${u.name}`), () => A("Login").setHref("/login"))

// Match — exhaustive value matching with type safety
Match(status, {
  loading: () => Spinner(),
  error:   () => ErrorBanner(),
  success: () => Dashboard(),
})

// Match — discriminated union with automatic type narrowing
Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),   // s narrowed to error variant
  success: (s) => UserList(s.data),   // s narrowed to success variant
})

// Iteration
Ul(ForEach(items, (item, i) => Li(`${i + 1}. ${item.name}`)))
Div(ForEach(5, i => Star()))  // Repeat 5 times
```

### Partial Multi-Swap (HTMX 4)

```typescript
// Update multiple page sections in one response
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.toast, Toast("User created!")),
)
```

---

## Full Documentation

- [Fluent Styling API](#fluent-styling-api) - Chainable Tailwind-friendly methods
- [HTMX Integration](#type-safe-htmx) - Requests, triggers, swaps, all typed
- [Type-Safe Routes](#type-safe-routes) - Compile-time-safe HTMX endpoints
- [Partial Multi-Swap](#partial-multi-swap) - Update multiple page sections in one response
- [Global HTMX Config](#global-htmx-config) - Type-safe global htmx configuration
- [HTML Elements](#html-elements) - 60+ typed elements
- [Control Flow](#control-flow-1) - IfThen, Match, ForEach
- [Fold / Catamorphism](FOLD.md) - Generic View traversals, pre-built algebras, custom folds
- [Common Patterns](#common-patterns) - Layouts, partial swaps, response helpers
- [ESLint Plugin](#eslint-plugin) - 16 rules catching style overwrites, class conflicts, HTMX pitfalls & more
- [Tailwind CSS Extractor](#tailwind-css-extractor) - Generate CSS from fluent method calls
- [API Reference](#api-reference) - Complete method reference

---

## IDE Autocomplete in Action

Fluent HTML transforms your IDE into a powerful documentation tool. Here's what you get:

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
//   outerMorph  - Morph target element (preserves focus, scroll, animations)
//   innerMorph  - Morph target's children
//   innerHTML   - Replace inner content (default)
//   outerHTML   - Replace entire element
//   before      - Insert before element (alias: beforebegin)
//   after       - Insert after element (alias: afterend)
//   prepend     - Insert at start of children (alias: afterbegin)
//   append      - Insert at end of children (alias: beforeend)
//   delete      - Remove element
//   none        - No swap
//
// With modifiers:
//   outerMorph scroll:top
//   outerHTML transition:true
//   append show:window:top
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

Fluent HTML provides **complete HTMX 4 support** with full type safety.

### Basic Requests

```typescript
// Shorthand methods — method is baked in
Button("Load").hxGet("/api/items")
Button("Submit").hxPost("/api/submit")
Button("Update").hxPut("/api/update/123")
Button("Patch").hxPatch("/api/resource")
Button("Delete").hxDelete("/api/delete/123")

// Or use setHtmx with inline args
Button("Load").setHtmx("/api/items")
Button("Submit").setHtmx("/api/submit", { method: "post" })

// Or with a pre-built hx() object
import { hx } from 'fluent-html';
Button("Submit").setHtmx(hx("/api/submit", { method: "post" }))
```

### Type-Safe Target Selectors

```typescript
import { id, clss, closest, find, next, previous } from 'fluent-html';

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
// Morph swaps (preferred — preserves focus, scroll, animations)
Div().setHtmx(hx("/api", { swap: "outerMorph" }))   // Morph target element itself
Div().setHtmx(hx("/api", { swap: "innerMorph" }))   // Morph target's children

// Classic swaps
Div().setHtmx(hx("/api", { swap: "innerHTML" }))    // Replace inner content
Div().setHtmx(hx("/api", { swap: "outerHTML" }))    // Replace entire element
Div().setHtmx(hx("/api", { swap: "append" }))       // Append to children
Div().setHtmx(hx("/api", { swap: "prepend" }))      // Prepend to children

// With scroll modifier
Div().setHtmx(hx("/api", { swap: "outerMorph scroll:top" }))

// With show modifier (scroll into view)
Div().setHtmx(hx("/api", { swap: "outerMorph show:window:top" }))

// With transition
Div().setHtmx(hx("/api", { swap: "outerHTML transition:true" }))

// With timing
Div().setHtmx(hx("/api", { swap: "innerHTML swap:500ms settle:100ms" }))
```

### HTMX 4 Features

```typescript
// Disable elements during request (renamed from disabledElt)
Button("Submit").setHtmx(hx("/api/submit", {
  method: "post",
  disable: "this"  // or "#submit-btn" or "closest form"
}))

// Per-element config (replaces removed hx-request)
Button("Upload").hxPost("/upload", {
  config: { timeout: 120000, credentials: true }
})

// Morph swaps — preserve DOM state (focus, scroll, animations)
Button("Refresh").hxGet("/users", {
  target: ids.userList,
  swap: "outerMorph",    // morph the target element itself
})

// Status-code routing — different targets for different responses
Form().hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
    "5xx": { swap: "none" },
  }
})

// Preload — prefetch on hover, cached by click time
A("Dashboard").setHref("/dashboard").toggle("hx-boost").toggle("hx-preload")

// Explicit inheritance — htmx 4 does NOT inherit by default
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")

// Or opt back in to htmx 2 behavior globally:
HtmxConfig({ implicitInheritance: true })

// Preserve element during swap (e.g., video player)
Video().setId("player").setHtmx(hx("/api/page", { preserve: true }))

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
Form(
  Fieldset(
    Legend("User Registration"),

    Label("Email").setFor("email"),
    Input()
      .setType("email")
      .setId("email")
      .setName("email")
      .setPlaceholder("you@example.com")
      .setAutocomplete("email")
      .toggle("required"),

    Label("Password").setFor("password"),
    Input()
      .setType("password")
      .setId("password")
      .setName("password")
      .setMinlength(8)
      .setAutocomplete("new-password")
      .toggle("required"),

    Button("Register")
      .setType("submit")
      .setClass("bg-blue-500 text-white px-4 py-2 rounded")
  ).setClass("space-y-4")
)
  .setHtmx(hx("/api/register", {
    method: "post",
    swap: "outerMorph",
    indicator: "#loading",
    disable: "find button"
  }))
```

---

## Type-Safe Routes

`defineRoutes()` gives you compile-time-safe HTMX endpoints. Path parameters (`:id`) are extracted at the type level and required at call time. Typos and missing params are compile errors.

```typescript
import { defineRoutes } from 'fluent-html';

// Shared prefix avoids path repetition (like Fastify's register prefix)
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  delete: { method: "delete", path: "/:id" },
} as const);

// Views — method is locked, params are required
Button("Load").setHtmx(userRoutes.list())
Button("Load").setHtmx(userRoutes.list({ target: ids.userList }))
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))

userRoutes.lsit()            // ✗ typo — compile error
userRoutes.delete()          // ✗ missing params — compile error

// Controllers — single-sourced paths
server.get(userRoutes.list.path, handler)       // "/users"
server.delete(userRoutes.delete.path, handler)  // "/users/:id"

// Resolved URLs for redirects, links, etc.
reply.redirect(userRoutes.list.resolve())                  // "/users"
reply.redirect(userRoutes.delete.resolve({ id: user.id })) // "/users/42"
```

The prefix is optional — you can still pass route definitions directly without one. Routes expose `.method`, `.path` (with prefix applied), and `.resolve()` (for param substitution). Views and controllers always stay in sync.

---

## Partial Multi-Swap

HTMX 4 replaces OOB swaps with the `<hx-partial>` element. Fluent HTML's `Partial()` helper generates these for you:

```typescript
import { Partial, render } from 'fluent-html';

// Update multiple page sections in one response
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

Each `Partial` targets a specific element by ID and uses `outerMorph` by default (preserves focus, scroll, animations). You can override the swap strategy:

```typescript
Partial(ids.notifications, Div("New!"), "append")  // append instead of morph
```

> **Note:** `OOB()` and `withOOB()` still exist but are deprecated. Migrate to `Partial()`.

---

## Global HTMX Config

Configure HTMX 4 globally via a type-safe `<meta>` tag:

```typescript
import { HtmxConfig } from 'fluent-html';

Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
    implicitInheritance: true,  // opt back in to htmx 2 inheritance behavior
  }),
  Script().setSrc("/htmx.js"),
)
```

---

## Type-Safe HTMX Targets

One of the most common issues with HTMX is **broken selectors**. A typo in `hx-target="#userList"` when the element has `id="user-list"` causes silent failures at runtime.

Fluent HTML solves this with **compile-time validated HTMX targets**.

### The Problem

```typescript
// page.ts
Div().setId("user-list")

// controller.ts (different file)
Button("Load").setHtmx(hx("/api", { target: "#userList" }))
//                                         ~~~~~~~~~~
// Typo! "userList" vs "user-list" - silent failure at runtime
```

### The Solution: Type-Safe IDs

```typescript
import { defineIds } from 'fluent-html';

// Define IDs once - shared across your app
export const ids = defineIds([
  "user-list",
  "user-count",
  "notification-area",
  "modal-container",
] as const);

// TypeScript infers camelCase keys from kebab-case IDs:
// ids.userList           → Id for "user-list"
// ids.userCount          → Id for "user-count"
// ids.notificationArea   → Id for "notification-area"
// ids.modalContainer     → Id for "modal-container"
```

### Usage

**In page layouts:**
```typescript
// pages/users.view.ts
import { ids } from './ids';

export function UsersPage() {
  return Div(
    Div().setId(ids.userList),           // id="user-list"
    Span("0").setId(ids.userCount),      // id="user-count"

    Button("Refresh")
      .setHtmx(hx("/api/users", {
        target: ids.userList              // hx-target="#user-list"
      }))
  );
}
```

**In controllers (different file, same safety):**
```typescript
// controllers/users.ts
import { ids } from '../ids';
import { Partial, Span } from 'fluent-html';

export function handleUserCreated(users: User[]) {
  return render(
    Partial(ids.userList, renderUserTable(users)),
    Partial(ids.userCount, Span(`${users.length} users`)),  // Same typed reference!
  );
}
```

**Typos caught at compile time:**
```typescript
ids.userLits              // ❌ TypeScript Error: Property 'userLits' does not exist
ids.userCount.selector    // ✓ Returns "#user-count"
ids.userCount.id          // ✓ Returns "user-count"
```

### Recommended File Structure

```
src/
  views/
    layout.view.ts        # exports LayoutIds (header, sidebar, toast, etc.)
    users.view.ts         # exports UserIds
    products.view.ts      # exports ProductIds
  controllers/
    users.controller.ts   # imports UserIds, LayoutIds
    products.controller.ts
```

Each `*.view.ts` file exports both its view components and its IDs. Controllers import the IDs they need to target.

### API

```typescript
import { defineIds, createId, Id } from 'fluent-html';

// Create a registry of IDs (recommended)
const ids = defineIds(["user-list", "modal"] as const);

// Or create single IDs ad-hoc
const customId = createId("custom-element");

// Id object properties
ids.userList.id         // "user-list" - for setId()
ids.userList.selector   // "#user-list" - for CSS/HTMX selectors

// Works with all HTMX-related APIs
Div().setId(ids.userList)                    // ✓
hx("/api", { target: ids.userList })         // ✓
Partial(ids.userList, content)               // ✓
```

---

## Fluent Styling API

Fluent HTML provides a **fluent, chainable API** for Tailwind CSS classes, making your styling code more expressive and maintainable.

### Quick Start

```typescript
import { Div, Button } from 'fluent-html';

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

### Type-Safe Autocomplete

All fluent methods have **type-safe parameters** with IDE autocomplete for Tailwind values:

```typescript
Div()
  .w("full")              // IDE suggests: "full", "1/2", "screen", "64", etc.
  .background("red-500")  // IDE suggests: all color-shade combinations
  .rounded("lg")          // IDE suggests: "sm", "md", "lg", "xl", "full", etc.
  .tracking("wide")       // IDE suggests: "tighter", "tight", "normal", "wide", etc.
```

The type system enforces valid Tailwind values — wrong values don't compile. For arbitrary values, use `addClass()`.

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
.bold()                          // font-bold (shorthand)
.italic()                        // italic
```

**Text Transform & Decoration:**
```typescript
.uppercase()                     // uppercase
.lowercase()                     // lowercase
.capitalize()                    // capitalize
.underline()                     // underline
.lineThrough()                   // line-through
.truncate()                      // truncate (ellipsis)
```

**Line Height & Letter Spacing:**
```typescript
.leading("tight")                // leading-tight
.leading("relaxed")              // leading-relaxed
.tracking("wide")                // tracking-wide
.tracking("tight")               // tracking-tight
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
const card = Div(
  H2("Card Title")
    .textSize("2xl")
    .fontWeight("bold")
    .margin("bottom", "4"),

  P("Card content goes here...")
    .textColor("gray-600")
    .margin("bottom", "6"),

  Div(
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
  )
    .flex()
    .gap("4")
    .justifyContent("end")
)
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

The fluent API generates standard Tailwind CSS classes. Make sure Tailwind is included in your project. For a complete API reference, see the [styling documentation](https://github.com/your-repo/fluent-html/blob/main/STYLING.md).

---

## XSS Protection

Fluent HTML **automatically escapes** all text content and attributes. No configuration needed.

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
  return Div(
    H2(user.name),      // ← Escaped automatically
    P(user.bio),        // ← Escaped automatically
  ).setClass("user-card");
}

// Even malicious data is safely rendered
const user = {
  name: '<script>steal(cookies)</script>',
  bio: '"><img src=x onerror=alert(1)>'
};

render(UserCard(user));
// All content properly escaped - XSS prevented!
```

### Raw HTML (Bypass Escaping)

For cases where you need to render **trusted** HTML content (e.g., pre-sanitized markdown, trusted SVG, CMS content), use the `Raw` helper:

```typescript
import { Raw, Div, render } from 'fluent-html';

// Render pre-sanitized HTML from a markdown library
const htmlFromMarkdown = markdownToHtml(trustedContent);
Div(Raw(htmlFromMarkdown))

// Render trusted SVG
Div(Raw('<svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>'))

// Mix raw and safe content
Div(
  P(userInput),                    // ← Escaped (safe)
  Raw(trustedHtml),                // ← Not escaped (trusted)
  Span(moreUserInput)              // ← Escaped (safe)
)
```

**⚠️ Warning:** `Raw` bypasses XSS protection. **Never use it with user-provided input.** Only use it when:
- Content comes from a trusted source (your own CMS, database with pre-sanitized HTML)
- Content has been sanitized by a trusted library (e.g., DOMPurify)
- Content is hardcoded in your codebase

```typescript
// ❌ DANGEROUS - Never do this!
const userComment = req.body.comment;
Div(Raw(userComment))  // XSS vulnerability!

// ✅ SAFE - Sanitize first
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(userComment);
Div(Raw(sanitized))

// ✅ SAFE - Or just use normal rendering
Div(userComment)  // Automatically escaped
```

---

## HTML Elements

Fluent HTML provides **60+ HTML elements** with typed attribute methods.

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

// Multiple children (variadic)
Div(
  H1("Title"),
  P("First paragraph"),
  P("Second paragraph")
)

// Mixed content
Div(
  "Text node",
  Strong("Bold text"),
  " more text"
)

// Array form (also works — useful for dynamic lists)
Div(...items)
```

### Void Elements

Void elements (`Input`, `Img`, `Br`, `Hr`, `Meta`, `Link`, `Source`, `Track`, `Wbr`, `Embed`, `Base`, `Area`, `Col`) **reject children** — any children passed are silently ignored at render time:

```typescript
Input()          // ✓ void element, no children
Img()            // ✓ void element, no children
Hr()             // ✓ void element, no children
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
  .toggle("required")

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
Select(
  Option("Select a country...").setValue(""),
  Optgroup(
    Option("United States").setValue("us"),
    Option("Canada").setValue("ca"),
  ).setLabel("North America"),
  Optgroup(
    Option("United Kingdom").setValue("uk"),
    Option("Germany").setValue("de"),
  ).setLabel("Europe"),
).setName("country").toggle("required")
```

### Table Elements

```typescript
Table(
  Caption("Monthly Sales Report"),
  Thead(
    Tr(
      Th("Product").setScope("col"),
      Th("Q1").setScope("col"),
      Th("Q2").setScope("col"),
      Th("Total").setScope("col").setColspan(2),
    )
  ),
  Tbody(
    Tr(
      Th("Widget A").setScope("row"),
      Td("$1,000"),
      Td("$1,500"),
      Td("$2,500").setColspan(2),
    ),
  ),
  Tfoot(
    Tr(
      Th("Total").setScope("row"),
      Td("$3,000").setColspan(3),
    )
  ),
).setClass("w-full border-collapse")
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
Video(
  Source().setSrc("video.webm").setType("video/webm"),
  Source().setSrc("video.mp4").setType("video/mp4"),
  Track()
    .setSrc("captions.vtt")
    .setKind("subtitles")
    .setSrclang("en")
    .setLabel("English")
    .setDefault(),
  "Your browser does not support video."
)
  .setControls()
  .setPoster("poster.jpg")
  .setPreload("metadata")

// Picture element for art direction
Picture(
  Source()
    .setSrcset("hero-mobile.jpg")
    .setMedia("(max-width: 600px)"),
  Source()
    .setSrcset("hero-desktop.jpg")
    .setMedia("(min-width: 601px)"),
  Img().setSrc("hero-fallback.jpg").setAlt("Hero"),
)
```

### SVG Elements with Typed Setters

All SVG shape elements extend `SvgShapeTag` with shared methods: `setFill()`, `setStroke()`, `setStrokeWidth()`, `setStrokeLinecap()`, `setStrokeLinejoin()`, `setStrokeDasharray()`, `setSvgOpacity()`, `setTransform()`.

```typescript
// Circle with typed setters
Svg(
  Circle().setCx("50").setCy("50").setR("40")
    .setFill("none").setStroke("blue").setStrokeWidth("2"),

  Rect().setX("10").setY("10").setWidth("80").setHeight("80")
    .setRx("5").setFill("red-500").setSvgOpacity("0.5"),

  Path().setD("M10 80 C40 10, 65 10, 95 80").setFill("none").setStroke("black"),

  Line().setX1("0").setY1("0").setX2("100").setY2("100").setStroke("gray"),

  Ellipse().setCx("50").setCy("50").setRx("40").setRy("20").setFill("green"),

  Polygon().setPoints("50,5 20,99 95,39 5,39 80,99").setFill("purple"),

  Text("Hello SVG").setX("10").setY("50")
    .setTextAnchor("start").setFontSize("16").setFontFamily("sans-serif"),

  Use().setHref("#my-symbol").setX("0").setY("0"),
)
```

> **Note:** SVG uses `setSvgOpacity()` instead of `setOpacity()` to avoid conflict with Tailwind's `.opacity()` method.

### Interactive Elements

```typescript
// Details/Summary (accordion)
Details(
  Summary("Click to expand"),
  P("Hidden content revealed when opened."),
).setOpen()

// Dialog (modal)
Dialog(
  H2("Confirm Action"),
  P("Are you sure you want to proceed?"),
  Button("Cancel").addAttribute("onclick", "this.closest('dialog').close()"),
  Button("Confirm").setClass("bg-blue-500 text-white"),
).setId("confirm-modal")

// Progress and Meter
Progress().setValue(70).setMax(100)
Meter().setValue(0.7).setMin(0).setMax(1).setLow(0.3).setHigh(0.8).setOptimum(0.5)
```

---

## Control Flow

Fluent HTML provides functional control flow for conditional and iterative rendering.

### IfThen / IfThenElse

```typescript
import { IfThen, IfThenElse } from 'fluent-html';

// Conditional rendering (boolean)
function UserBadge(user: { isAdmin: boolean; isPremium: boolean }): View {
  return Div(
    IfThen(user.isAdmin, () =>
      Span("Admin").setClass("badge badge-red")
    ),
    IfThen(user.isPremium, () =>
      Span("Premium").setClass("badge badge-gold")
    ),
  );
}

// If-else rendering (boolean)
function LoginStatus(loggedIn: boolean): View {
  return IfThenElse(
    loggedIn,
    () => Span("Welcome back"),
    () => A("Login").setHref("/login")
  );
}
```

Both `IfThen` and `IfThenElse` also accept **nullable values** instead of booleans.
When the value is non-null, it is passed into the callback with its type narrowed:

```typescript
// Nullable value narrowing — no !! or ! needed
function LoginStatus(user: User | null): View {
  return IfThenElse(
    user,
    (u) => Span(`Welcome, ${u.name}`),  // u is User, not User | null
    () => A("Login").setHref("/login")
  );
}

// Works great for optional props
function Card(props: { title: string; image?: string }): View {
  return Div(
    IfThen(props.image, (src) =>
      Img().setSrc(src).setAlt(props.title).setClass("card-img")
    ),
    H3(props.title),
  );
}
```

### Match

`Match` maps a value to a view using an object of cases. TypeScript enforces exhaustiveness — if you miss a case, you get a compile error.

```typescript
import { Match } from 'fluent-html';

type Status = 'pending' | 'approved' | 'rejected';

function StatusBadge(status: Status): View {
  return Match(status, {
    pending:  () => Span("Pending").setClass("text-yellow-600"),
    approved: () => Span("Approved").setClass("text-green-600"),
    rejected: () => Span("Rejected").setClass("text-red-600"),
  });
}
```

For partial matches, provide a default as the third argument:

```typescript
Match(status, {
  approved: () => Span("Approved"),
}, () => Span("Other"))
```

#### Discriminated Union Matching

Pass a discriminant key as the second argument to match on object unions. Each callback receives the **narrowed** variant type:

```typescript
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: User[] };

function UserPage(state: State): View {
  return Match(state, "status", {
    loading: ()  => Spinner(),
    error:   (s) => Alert(s.message),   // s: { status: "error"; message: string }
    success: (s) => UserList(s.data),   // s: { status: "success"; data: User[] }
  });
}

// Partial with default
Match(state, "status", {
  error: (s) => Alert(s.message),
}, () => Spinner())
```

### ForEach

`ForEach` is a unified iteration helper with three overloads:

```typescript
import { ForEach, Repeat } from 'fluent-html';

const items = ["Apple", "Banana", "Cherry"];

// Iterate over items (callback receives item and index)
Ul(ForEach(items, (item, index) =>
  Li(`${index + 1}. ${item}`)
))

// Range iteration (0 to n-1)
Div(ForEach(5, i =>
  Span(`Item ${i}`).setClass("inline-block p-2")
))

// Range iteration (start to end-1)
Div(ForEach(1, 6, i =>
  Button(`Page ${i}`).setClass("px-3 py-1")
))

// Repeat n times
Div(Repeat(5, () => Span("⭐")))
```

> **Note:** The legacy `ForEach1`, `ForEach2`, `ForEach3` aliases have been removed. Use `ForEach` with the appropriate overload.

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
  return Div(
    IfThen(props.image, (src) =>
      Img()
        .setSrc(src)
        .setAlt(props.title)
        .setClass("w-full h-48 object-cover")
        .setLoading("lazy")
    ),
    Div(
      H3(props.title).setClass("text-xl font-semibold mb-2"),
      Div(props.content).setClass("text-gray-600"),
    ).setClass("p-4"),
    IfThen(props.footer, (footer) =>
      Div(footer).setClass("px-4 py-3 bg-gray-50 border-t")
    ),
  ).setClass("bg-white rounded-lg shadow-md overflow-hidden");
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
  return Table(
    Thead(
      Tr(ForEach(columns, col =>
        Th(col.header).setScope("col").setClass("px-4 py-3 text-left font-semibold")
      )).setClass("bg-gray-100")
    ),
    Tbody(
      ForEach(data, (row, index) =>
        Tr(ForEach(columns, col => {
          const value = row[col.key];
          const content = col.render ? col.render(value, row) : String(value);
          return Td(content).setClass("px-4 py-3");
        }))
          .addClass(options?.hoverable ? 'hover:bg-gray-50' : '')
          .addClass(options?.striped && index % 2 ? 'bg-gray-50' : '')
      )
    ),
  ).setClass("w-full border-collapse");
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
  return Div(
    Ul(
      ForEach(items, item =>
        Li(
          H3(item.title).setClass("font-medium"),
          P(item.description).setClass("text-gray-600 text-sm"),
        ).setClass("p-4 border-b")
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
  );
}
```

---

## Common Patterns

Fluent HTML includes built-in helpers for common UI patterns and layouts.

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

### HTMX Patterns

**Debounced Search:**
```typescript
import { SearchInput } from 'fluent-html';

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
import { InfiniteScroll } from 'fluent-html';

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

**Partial Multi-Swap (HTMX 4):**
```typescript
import { Partial, render } from 'fluent-html';

// Update multiple parts of the page in one response
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.lastUpdated, Span("Just now")),
  Partial(ids.notifications, Div("New item added!"), "append"),
)
```

**HTMX Response Headers:**
```typescript
import { hxResponse, Div, Empty } from 'fluent-html';

// Build responses with HTMX headers
app.post('/api/item', (req, res) => {
  const { html, headers } = hxResponse(
    Div("Item saved!")
  )
    .trigger("itemSaved")              // HX-Trigger
    .trigger("showToast", { message: "Success!" })
    .pushUrl("/items/123")             // HX-Push-Url
    .build();

  res.set(headers);
  res.send(html);
});

// Redirect after action
app.post('/api/logout', (req, res) => {
  const { html, headers } = hxResponse(Empty())
    .redirect("/login")
    .build();

  res.set(headers);
  res.send(html);
});

// Override target and swap from server
const response = hxResponse(content)
  .retarget("#other-element")          // HX-Retarget
  .reswap("outerMorph")               // HX-Reswap
  .build();
```

### Form Patterns

**Form Field with Label and Error:**
```typescript
import { FormField } from 'fluent-html';

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
import { KeyedList } from 'fluent-html';

KeyedList(
  users,
  (user) => user.id,  // Key function
  (user, index) => Div(
    H3(user.name),
    P(user.email)
  )
)
// Adds data-key attribute for stability
```

### Combining Patterns

```typescript
// Form with fluent styling
Div(
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

  Div(
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
      .rounded(),
  ).flex().justifyContent("end").gap("2"),
).flex().flexDirection("col").gap("6")
```

---

## Fold / Catamorphism

Fluent HTML includes a generic **fold** (`foldView`) that recursively collapses any `View` tree into a value of your choice. Supply a `ViewAlgebra<A>` — four functions that handle text, raw HTML, tags, and lists — and `foldView` does the rest.

```typescript
import { foldView, countAlgebra, textAlgebra, linksAlgebra } from 'fluent-html';

// Count elements
foldView(countAlgebra, Div(P("Hello"), P("World")));  // 3

// Extract plain text
foldView(textAlgebra, H1("Welcome"));  // "Welcome\n"

// Collect all links
foldView(linksAlgebra, Div(A("Home").setHref("/"), A("About").setHref("/about")));
// [{ href: "/" }, { href: "/about" }]
```

Pre-built algebras: `countAlgebra`, `textAlgebra`, `linksAlgebra`, `renderAlgebra`. Transform helpers: `createTransformAlgebra`, `addClassToMatching`.

Writing your own algebra is straightforward — see the **[full Fold documentation](FOLD.md)** for in-depth explanations and examples.

---

## ESLint Plugin

[eslint-plugin-fluent-html](https://github.com/JT-Digital-d-o-o/fluent-html-eslint-plugin) — **16 rules** that catch real bugs before they ship: style overwrites, class conflicts, HTMX pitfalls, and API misuse. 8 rules include auto-fix.

```bash
npm install eslint-plugin-fluent-html --save-dev
```

```javascript
// eslint.config.js (ESLint 9+)
import fluentHtml from 'eslint-plugin-fluent-html';

export default [{
  plugins: { "fluent-html": fluentHtml },
  rules: fluentHtml.configs.recommended.rules // all 16 rules
}];
```

### Style Overwrite Prevention

The plugin catches the most common fluent-html mistake — calling `.setClass()` after fluent methods, which silently **replaces** all previously set classes:

```typescript
// 🚨 error: setClass after fluent modifier — background("green-700") and padding("4") are lost
Div().background("green-700").padding("4").setClass("bg-red-500 flex")

// ✅ auto-fixed — fluent methods append safely
Div().background("green-700").padding("4").background("red-500").flex()
```

It also catches `.setClass()` inside `.when()` / `.apply()` callbacks and multiple `.setClass()` calls in the same chain — both of which silently discard styles.

### Class Conflict Detection

Detects mutually exclusive Tailwind classes across 25+ conflict groups:

```typescript
// ⚠️ warn: conflicting classes — "grid" overwrites "flex" (both are display utilities)
Div().setClass("flex grid gap-4")

// ⚠️ warn: conflicting classes — "p-8" overwrites "p-4" (same prefix)
Div().setClass("p-4 p-8 m-2")
```

### Tailwind → Fluent Auto-Fix

Recognizes 70+ Tailwind patterns and converts them to fluent method calls, including variant-aware suggestions for `.on()` and `.at()`:

```typescript
// ⚠️ warn: known modifiers in setClass
Div().setClass("bg-red-500 p-4 flex justify-center my-custom-class")

// ✅ auto-fixed — Tailwind classes become methods, unknown classes stay in setClass
Div().background("red-500").padding("4").flex().justifyContent("center").setClass("my-custom-class")
```

### API Best Practices

```typescript
// ⚠️ prefer-set-method: use dedicated setter instead of addAttribute
Button().addAttribute("type", "submit")  →  Button().setType("submit")

// ⚠️ prefer-variadic-children: don't wrap children in arrays
Div([H1("Title"), P("Body")])  →  Div(H1("Title"), P("Body"))

// ⚠️ no-raw-ids: use defineIds() for type-safe IDs
Div().setId("user-list")  →  Div().setId(ids.userList)

// 🚨 no-innerhtml-swap: innerHTML loses the target element's id
hx(endpoint, { swap: "innerHTML" })  →  hx(endpoint, { swap: "outerHTML" })

// ⚠️ anchor-requires-cursor-pointer: anchors with setHtmx need cursor
A("Link").setHtmx(...)  →  A("Link").setHtmx(...).cursor("pointer")
```

### All 16 Rules

| Rule | Severity | Fix | What it catches |
|------|----------|-----|-----------------|
| `no-setclass-after-fluent-modifier` | error | — | `.setClass()` after fluent methods overwrites styles |
| `no-multiple-setclass-in-chain` | error | — | Multiple `.setClass()` calls — earlier ones are lost |
| `no-setclass-in-when-apply-callback` | error | — | `.setClass()` in callbacks overwrites outer styles |
| `no-innerhtml-swap` | error | ✅ | `innerHTML` swap loses target element id |
| `no-known-modifiers-in-setclass` | warn | ✅ | Tailwind classes that should be fluent methods |
| `no-conflicting-classes-in-setclass` | warn | — | Mutually exclusive Tailwind classes |
| `no-duplicate-classes-in-setclass` | warn | — | Duplicate class names |
| `no-empty-setclass` | warn | — | Empty `.setClass("")` calls |
| `no-unnecessary-spaces-in-setclass` | warn | ✅ | Extra whitespace in class strings |
| `no-conditional-in-setclass` | warn | — | Dynamic expressions — use `.when()` instead |
| `prefer-set-method` | warn | ✅ | `.addAttribute()` for standard HTML attributes |
| `prefer-variadic-children` | warn | ✅ | Array-wrapped children instead of variadic args |
| `no-raw-ids` | warn | — | Hardcoded ID strings — use `defineIds()` |
| `no-ternary-in-view-builder` | warn | — | Ternary children — use `.when()` / `IfThen` |
| `no-superfluous-view-return-type` | warn | ✅ | Unnecessary `: View` return type annotations |
| `anchor-requires-cursor-pointer` | warn | ✅ | Missing `cursor("pointer")` on anchors |

See the [full documentation](https://github.com/JT-Digital-d-o-o/fluent-html-eslint-plugin) for details.

---

## Tailwind CSS Extractor

[fluent-html-tailwind-extractor](https://github.com/JT-Digital-d-o-o/fluent-html-tailwind-extractor) teaches Tailwind which CSS classes to generate from fluent-html's method calls.

**The problem:** Tailwind scans source files for class names, but fluent methods like `.background("red-500")` don't look like `bg-red-500` — so Tailwind won't generate the CSS.

```bash
npm install fluent-html-tailwind-extractor --save-dev
```

```javascript
// tailwind.config.js
const fluentHtmlExtractor = require('fluent-html-tailwind-extractor');

module.exports = {
  content: {
    files: ['./src/**/*.{ts,tsx}'],
    extract: {
      ts: fluentHtmlExtractor,
      tsx: fluentHtmlExtractor,
    },
  },
};
```

The extractor converts fluent method calls to their Tailwind equivalents:

```typescript
.background("red-500")      → bg-red-500
.padding("x", "4")          → px-4
.textSize("xl")              → text-xl
.rounded("lg")               → rounded-lg
.flex()                      → flex
.justifyContent("center")    → justify-center
.setClass("hover:bg-blue")   → hover:bg-blue
```

See the [full documentation](https://github.com/JT-Digital-d-o-o/fluent-html-tailwind-extractor) for advanced configuration.

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
| **SVG**         | `Svg`, `Path`, `Circle`, `Rect`, `Line`, `Polygon`, `Polyline`, `Ellipse`, `G`, `Defs`, `Use`, `Text`, `Tspan` — all with typed attribute setters              |
| **Embedded**    | `Iframe`, `ObjectEl`, `Embed`, `MapEl`, `Area`                                                                                                                |
| **Links**       | `A`                                                                                                                                                           |
| **Document**    | `HTML`, `Head`, `Body`, `Title`, `Meta`, `Link`, `Style`, `Script`, `Base`, `Noscript`, `Template`                                                            |
| **Data**        | `Time`, `Data`, `Progress`, `Meter`, `Slot`                                                                                                                   |
| **Utility**     | `El` (custom), `Empty`, `Overlay`, `Raw`                                                                                                                      |

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
| `.setHtmx(hx(...))`          | Add HTMX behavior (pre-built object)                  |
| `.setHtmx(endpoint, opts?)`  | Add HTMX behavior (inline args)                       |
| `.hxGet(endpoint, opts?)`    | Shorthand for GET request                              |
| `.hxPost(endpoint, opts?)`   | Shorthand for POST request                             |
| `.hxPut(endpoint, opts?)`    | Shorthand for PUT request                              |
| `.hxPatch(endpoint, opts?)`  | Shorthand for PATCH request                            |
| `.hxDelete(endpoint, opts?)` | Shorthand for DELETE request                           |
| `.toggle(name, condition?)`  | Add boolean attribute (`required`, `disabled`, etc.) |
| `.when(condition, fn)`       | Conditionally modify tag (chain-friendly)              |
| `.apply(...fns)`             | Apply reusable modifier functions                      |

### Fluent Styling Methods (All Tags)

All fluent methods have **type-safe autocomplete** for Tailwind values.

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
| `.bold()`                        | Shorthand for `font-bold`                           |
| `.italic()`                      | Add italic style (`italic`)                         |
| `.uppercase()` / `.lowercase()` / `.capitalize()` | Text transform                    |
| `.underline()` / `.lineThrough()` | Text decoration                                    |
| `.truncate()`                    | Truncate with ellipsis (`truncate`)                 |
| `.leading(value)`                | Line height (`leading-tight`, `leading-relaxed`)    |
| `.tracking(value)`               | Letter spacing (`tracking-wide`, `tracking-tight`)  |
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
| `IfThen(value, thenFn)`                 | Render with narrowed non-null value |
| `IfThenElse(condition, thenFn, elseFn)` | Conditional rendering       |
| `IfThenElse(value, thenFn, elseFn)`     | Conditional with narrowed non-null value |
| `Match(value, cases)`                   | Exhaustive value matching   |
| `Match(value, cases, defaultView)`      | Partial value matching with default |
| `Match(value, key, cases)`              | Discriminated union matching with narrowing |
| `Match(value, key, cases, defaultView)` | Partial discriminated union with default |
| `ForEach(items, renderFn)`              | Iterate over items (with index) |
| `ForEach(n, renderFn)`                  | Range 0 to n-1              |
| `ForEach(start, end, renderFn)`         | Range start to end-1        |
| `Repeat(n, renderFn)`                   | Repeat n times              |

### HTMX Shorthand Methods

All tags have shorthand methods for each HTTP method. The `options` parameter accepts all HTMX options except `method` (which is implied):

```typescript
.hxGet(endpoint, options?)     // GET request
.hxPost(endpoint, options?)    // POST request
.hxPut(endpoint, options?)     // PUT request
.hxPatch(endpoint, options?)   // PATCH request
.hxDelete(endpoint, options?)  // DELETE request

// setHtmx also accepts inline args (method defaults to GET)
.setHtmx(endpoint, options?)
.setHtmx(hx(...))             // pre-built HTMX object
```

### hx() Helper

```typescript
hx(endpoint: string, options?: HxOptions): HTMX

// HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target'>>
//           & { method?: HxHttpMethod; target?: HxTarget | Id }

hx(endpoint: string, options?: {
  // HTTP Method
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';

  // Targeting
  target?: string;              // CSS selector or extended selector
  swap?: HxSwap;                // Swap strategy (outerMorph, innerMorph, innerHTML, outerHTML, etc.)
  select?: string;              // Select from response

  // Triggering
  trigger?: HxTrigger;          // Event trigger

  // URL
  pushUrl?: boolean | string;   // Push to history
  replaceUrl?: boolean | string; // Replace in history

  // Data
  vals?: object | string;       // Additional values
  headers?: object;             // Custom headers
  include?: string;             // Include elements
  encoding?: 'multipart/form-data';

  // Validation
  validate?: boolean;
  confirm?: string;             // Confirmation dialog

  // Loading
  indicator?: string;           // Loading indicator
  disable?: string;             // Disable elements during request (was disabledElt)

  // Sync
  sync?: HxSync;                // Request synchronization

  // HTMX 4 features
  config?: HxConfig | string;   // Per-element config (replaces removed hx-request)
  status?: Record<string, HxStatusConfig>; // Status-code routing
  preload?: 'mousedown' | 'mouseover' | boolean; // Preload on hover
  optimistic?: boolean;         // Show expected content before response

  // Other
  preserve?: boolean;           // Preserve element
  boost?: boolean;              // Boost links/forms
  ignore?: boolean;             // Ignore htmx processing (was hx-disable)
})
```

### Selector Helpers

```typescript
import { id, clss, closest, find, next, previous } from 'fluent-html';

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
  SearchInput, InfiniteScroll,
  Partial, HtmxConfig,
  defineRoutes, hxResponse,
  FormField, KeyedList
} from 'fluent-html';
```

| Function | Description |
| -------- | ----------- |
| `Partial(target, content, swap?)` | Multi-swap partial element (HTMX 4) |
| `HtmxConfig(options)` | Global HTMX configuration via `<meta>` tag |
| `defineRoutes(prefix?, routes)` | Type-safe route definitions for HTMX + server |
| `hxResponse(content)` | Build HTMX response with headers |
| `SearchInput(options)` | Debounced search input with HTMX |
| `InfiniteScroll(options)` | Infinite scroll trigger element |
| `FormField(options)` | Form field with label and error |
| `KeyedList(items, getKey, render)` | List with keyed items |
| `OOB(target, content, swap?)` | *Deprecated* — use `Partial` instead |
| `withOOB(main, ...oob)` | *Deprecated* — use `render()` with `Partial` instead |

### Raw HTML

```typescript
import { Raw, RawString } from 'fluent-html';

Raw(html: string): RawString  // Create unescaped HTML content
```

| Function | Description |
| -------- | ----------- |
| `Raw(html)` | Wrap HTML string to bypass XSS escaping. **Use only with trusted content.** |

### Type-Safe IDs & Routes

```typescript
import { defineIds, createId, Id, isId, extractId, extractSelector, defineRoutes } from 'fluent-html';
```

| Function | Description |
| -------- | ----------- |
| `defineIds(names)` | Create a typed ID registry from array of strings |
| `createId(name)` | Create a single Id object |
| `isId(value)` | Type guard to check if value is an Id |
| `extractId(value)` | Extract ID string from string or Id |
| `extractSelector(value)` | Extract selector string from string or Id |
| `defineRoutes(prefix?, routes)` | Create type-safe route definitions with params |

**Route Callable Object:**

| Property | Type | Description |
| -------- | ---- | ----------- |
| `(params?, options?)` | `HTMX` | Call the route to get an HTMX object for `setHtmx()` |
| `.method` | `string` | HTTP method (`"get"`, `"post"`, etc.) |
| `.path` | `string` | Full path template with prefix (`"/users/:id"`) |
| `.resolve(params?)` | `string` | Resolved URL with params substituted (`"/users/42"`) |

**Id Object:**

| Property | Type | Description |
| -------- | ---- | ----------- |
| `.id` | `string` | The raw ID (`"user-list"`) |
| `.selector` | `string` | CSS selector (`"#user-list"`) |
| `.toString()` | `string` | Returns the selector |

---

## Contributing

Contributions are welcome! Here's how to get started:

```bash
git clone https://github.com/JT-Digital-d-o-o/fluent-html.git
cd fluent-html
npm install
npm run build
npm test
```

- **Report bugs** — open an [issue](https://github.com/JT-Digital-d-o-o/fluent-html/issues) with a minimal reproduction
- **Suggest features** — open an issue describing the use case
- **Submit PRs** — fork, create a branch, and open a pull request against `main`

Please ensure `tsc --noEmit` passes and all tests are green before submitting.

---

## License

ISC © Toni K. Turk

---

## Links

- [npm Package](https://www.npmjs.com/package/fluent-html)
- [GitHub Repository](https://github.com/JT-Digital-d-o-o/fluent-html)
- [ESLint Plugin](https://github.com/JT-Digital-d-o-o/fluent-html-eslint-plugin)
- [Tailwind CSS Extractor](https://github.com/JT-Digital-d-o-o/fluent-html-tailwind-extractor)
- [Report Issues](https://github.com/JT-Digital-d-o-o/fluent-html/issues)
- [HTMX Documentation](https://htmx.org/docs/)
- [API Reference](https://jt-digital-d-o-o.github.io/fluent-html/)
- [Changelog](CHANGELOG.md)