# Fluent HTML AI Assistant Instructions

## Overview
Fluent HTML is a type-safe, zero-dependency HTML builder for TypeScript. When helping users write fluent-html code, follow these guidelines.

## Core Principles

### 1. Element Creation
Elements are created using factory functions that return Tag objects:

```typescript
import { Div, P, Span, Button, Input } from "fluent-html";

Div("Hello")           // Simple element with text
Div([P("1"), P("2")])  // Element with array of children
Div()                  // Empty element
```

### 2. Specialized Tags Have Specific Methods
**IMPORTANT:** Many elements have specialized tag classes with type-safe methods for their properties.

❌ **WRONG - Don't use addAttribute for standard properties:**
```typescript
Button().addAttribute("type", "submit")  // BAD!
Input().addAttribute("placeholder", "Enter name")  // BAD!
```

✅ **CORRECT - Use specialized methods:**
```typescript
Button().setType("submit")
Input().setPlaceholder("Enter name")
```

### Common Specialized Tags

**ButtonTag:**
```typescript
Button("Click me")
  .setType("submit")      // or "button" or "reset"
  .setDisabled(true)
  .setFormaction("/submit")
```

**InputTag:**
```typescript
Input()
  .setType("text")        // text, email, password, number, etc.
  .setPlaceholder("Enter text")
  .setName("fieldName")
  .setValue("default")
  .setDisabled(true)
  .setReadonly(true)
  .setChecked(true)       // for checkbox/radio
  .setMin(0)              // for number/date
  .setMax(100)
  .setPattern("[0-9]+")
```

**TextareaTag:**
```typescript
Textarea()
  .setPlaceholder("Enter text")
  .setName("message")
  .setRows(5)
  .setCols(40)
```

**SelectTag:**
```typescript
Select([
  Option("Item 1").setValue("1"),
  Option("Item 2").setValue("2").setSelected(true)
])
  .setName("choice")
  .setMultiple(true)
```

**AnchorTag (A):**
```typescript
A("Click here")
  .setHref("/page")
  .setTarget("_blank")
  .setRel("noopener noreferrer")
```

**ImgTag:**
```typescript
Img()
  .setSrc("/image.jpg")
  .setAlt("Description")
  .setWidth("800")
  .setHeight("600")
  .setLoading("lazy")
```

**FormTag:**
```typescript
Form([/* children */])
  .setAction("/submit")
  .setMethod("post")
  .setEnctype("multipart/form-data")
```

### 3. Universal Tag Methods
All tags have these common methods:

```typescript
Div()
  .setId("my-id")
  .setClass("class1 class2")
  .addClass("class3")              // Appends to existing classes
  .setClasses(["a", "b", false])   // Filters falsy values
  .setStyle("color: red")
  .setStyles({ color: "red", margin: "10px" })
  .addAttribute("data-test", "value")
  .setDataAttrs({ userId: "123", action: "save" })
  .setAria({ label: "Close", expanded: "false" })
  .toggle("required")               // Adds boolean attribute: required
  .toggle("hidden", isHidden)       // Conditional boolean attribute
```

### 4. Fluent Tailwind Styling (SwiftUI-like)

Fluent HTML provides **type-safe, chainable methods** for Tailwind CSS with IDE autocomplete:

```typescript
Div()
  .padding("4")                    // p-4
  .margin("x", "auto")             // mx-auto
  .background("blue-500")          // bg-blue-500
  .textColor("white")              // text-white
  .rounded("lg")                   // rounded-lg
  .shadow("md")                    // shadow-md
  .w("full")                       // w-full
  .h("screen")                     // h-screen
  .flex()                          // flex
  .justifyContent("center")        // justify-center
  .alignItems("center")            // items-center
  .gap("4")                        // gap-4
  .bold()                          // font-bold
  .uppercase()                     // uppercase
  .truncate()                      // truncate
```

**See `AI-SWIFTUI-STYLING.md` for the complete reference of all fluent styling methods.**

### 4. Children and Nesting

**Single child (string):**
```typescript
Div("text content")
P("paragraph text")
```

**Single child (element):**
```typescript
Div(P("nested paragraph"))
```

**Multiple children (array):**
```typescript
Div([
  H1("Title"),
  P("Paragraph 1"),
  P("Paragraph 2")
])
```

**Empty element:**
```typescript
Div()  // No children
```

**Deeply nested:**
```typescript
Div([
  Header([
    Nav([
      A("Home").setHref("/"),
      A("About").setHref("/about")
    ])
  ]),
  Main([
    H1("Welcome"),
    P("Content here")
  ])
])
```

## Control Flow

Fluent HTML provides functional control flow utilities:

### Conditionals

**IfThen** - Show element if condition is true:
```typescript
IfThen(user.isLoggedIn, () =>
  Div("Welcome back!")
)
```

**IfThenElse** - Show one of two elements:
```typescript
IfThenElse(
  user.isAdmin,
  () => Button("Admin Panel"),
  () => Span("Regular User")
)
```

**Nullable value narrowing** — pass a nullable value instead of a boolean.
When non-null, the value is injected into the callback with its type narrowed:
```typescript
// user is User | null — the callback receives User (non-null)
IfThen(user, (u) => Span(`Welcome, ${u.name}`))

IfThenElse(
  user,
  (u) => Span(`Welcome, ${u.name}`),
  () => A("Login").setHref("/login")
)

// Works for optional properties — no !! or ! needed
IfThen(props.image, (src) =>
  Img().setSrc(src).setAlt("Photo")
)
```

**SwitchCase** - Multiple conditions:
```typescript
SwitchCase([
  { condition: status === "loading", component: () => Div("Loading...") },
  { condition: status === "error", component: () => Div("Error!") },
  { condition: status === "success", component: () => Div("Success!") }
], () => Div("Unknown"))  // default case (optional)
```

### Loops

**ForEach** - Unified iteration (3 overloads):
```typescript
// Iterate over items (callback receives item and index)
ForEach(users, (user, index) =>
  Div(`${index + 1}. ${user.name}`)
)

// Range from 0 to n
ForEach(5, i =>
  Div(`Item ${i}`)
)
// Renders: Item 0, Item 1, Item 2, Item 3, Item 4

// Range from low to high
ForEach(1, 6, i =>
  Div(`Item ${i}`)
)
// Renders: Item 1, Item 2, Item 3, Item 4, Item 5
```

> **Note:** `ForEach1`, `ForEach2`, `ForEach3` are deprecated aliases. Use `ForEach` instead.

**Repeat** - Repeat element n times:
```typescript
Repeat(3, () => 
  Div("Repeated")
)
```

### Real-World Control Flow Examples

**User list with empty state:**
```typescript
IfThenElse(
  users.length > 0,
  () => Ul(
    ForEach(users, user =>
      Li([
        Strong(user.name),
        Span(` - ${user.email}`)
      ])
    )
  ),
  () => P("No users found")
)
```

**Optional fields with nullable narrowing:**
```typescript
function Card(props: { title: string; image?: string; footer?: View }): View {
  return Div([
    IfThen(props.image, (src) =>
      Img().setSrc(src).setAlt(props.title).setClass("card-img")
    ),
    H3(props.title),
    IfThen(props.footer, (footer) =>
      Div(footer).setClass("card-footer")
    ),
  ]);
}
```

**Status badge:**
```typescript
SwitchCase([
  { condition: status === "active", component: () =>
    Span("Active").setClass("badge-green") },
  { condition: status === "pending", component: () =>
    Span("Pending").setClass("badge-yellow") },
  { condition: status === "inactive", component: () =>
    Span("Inactive").setClass("badge-gray") }
])
```

**Numbered list:**
```typescript
Ol(
  ForEach(items, (item, index) =>
    Li(`${index + 1}. ${item.title}`)
  )
)
```

## Document Structure

### Complete HTML Document
```typescript
HTML([
  Head([
    Meta().setCharset("utf-8"),
    Meta()
      .setName("viewport")
      .setContent("width=device-width, initial-scale=1"),
    Title("My Page"),
    Link().setRel("stylesheet").setHref("/styles.css")
  ]),
  Body([
    Header([
      Nav([/* navigation */])
    ]),
    Main([/* main content */]),
    Footer([/* footer content */])
  ])
])
```

## HTMX Integration

Fluent HTML has first-class HTMX support with three calling styles:

```typescript
import { hx } from "fluent-html";

// Style 1: Shorthand methods (preferred for simple cases)
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: "#result" })
Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" })

// Style 2: setHtmx with inline args
Div().setHtmx("/api/update", { method: "post", target: "#result", swap: "innerHTML" })

// Style 3: setHtmx with pre-built hx() object
Form([
  Input().setName("query").setPlaceholder("Search..."),
  Button("Search").setType("submit")
])
  .setHtmx(hx("/search", {
    method: "post",
    target: "#results",
    swap: "innerHTML"
  }))
```

### Shorthand Methods

All tags have `.hxGet()`, `.hxPost()`, `.hxPut()`, `.hxPatch()`, `.hxDelete()`:

```typescript
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: "#result", swap: "innerHTML" })
Button("Update").hxPut("/api/item/1")
Button("Patch").hxPatch("/api/item/1")
Button("Delete").hxDelete("/api/item/1", { confirm: "Are you sure?" })
```

## Type-Safe HTMX Targets

**IMPORTANT:** Fluent HTML provides compile-time safety for HTMX targets. Use `defineIds()` to ensure your `hx-target` selectors always reference valid element IDs.

### The Problem
```typescript
// page.ts
Div().setId("user-list")

// controller.ts
hx("/api", { target: "#userList" })  // Typo! Silent failure at runtime
```

### The Solution
```typescript
import { defineIds } from "fluent-html";

// Define IDs once - use everywhere with type safety
export const ids = defineIds([
  "user-list",
  "user-count",
  "modal",
] as const);

// In page layout
Div().setId(ids.userList)           // id="user-list"

// In controller (same typed reference)
Button("Load").setHtmx(hx("/api", {
  target: ids.userList              // hx-target="#user-list"
}))

// OOB swaps also work
OOB(ids.userCount, Span("42"))      // id="user-count" hx-swap-oob="true"

// Typos caught at compile time:
ids.userLits                        // ❌ TypeScript Error!
```

### Recommended Pattern
Each `*.view.ts` file exports both its view and its IDs:

```typescript
// users.view.ts
export const UserIds = defineIds(["user-list", "user-count"] as const);

export function UsersPage() {
  return Div([
    Div().setId(UserIds.userList),
    Span("0").setId(UserIds.userCount),
    Button("Refresh").setHtmx(hx("/api/users", { target: UserIds.userList }))
  ]);
}
```

```typescript
// users.controller.ts
import { UserIds } from "./users.view";

function handleUpdate() {
  return OOB(UserIds.userCount, Span("42"));  // Same typed reference!
}
```

## Rendering

Convert your View to HTML string:

```typescript
import { render } from "fluent-html";

const view = Div("Hello, world!");
const html = render(view);
// Returns: <div>Hello, world!</div>

// Arrays render without wrappers (useful for HTMX partials):
render([Li("One"), Li("Two"), Li("Three")])
// Returns: <li>One</li>\n<li>Two</li>\n<li>Three</li>
```

## Out-of-Band (OOB) Swaps

Update multiple parts of the page in a single HTMX response:

```typescript
import { OOB, withOOB, render } from "fluent-html";

// OOB creates an element with hx-swap-oob attribute
render(withOOB(
  // Main content (replaces the target)
  Tr([Td("John"), Td("john@example.com")]).setId("row-1"),

  // OOB updates (swap into their respective targets)
  OOB("user-count", Span("42 users")),
  OOB("last-updated", Span("Just now")),
  OOB("notifications", Div("New item!"), "beforeend")  // Append
))
```

## HTMX Response Headers

Build HTMX responses with server-side headers:

```typescript
import { hxResponse, Div, Empty } from "fluent-html";

// Trigger events and update URL
const { html, headers } = hxResponse(Div("Saved!"))
  .trigger("itemSaved")
  .trigger("showToast", { message: "Success!" })
  .pushUrl("/items/123")
  .build();

// Use with your server framework (Express example):
res.set(headers);
res.send(html);

// Available methods:
hxResponse(content)
  .trigger(event, detail?)       // HX-Trigger
  .triggerAfterSwap(event)       // HX-Trigger-After-Swap
  .triggerAfterSettle(event)     // HX-Trigger-After-Settle
  .pushUrl(url)                  // HX-Push-Url
  .replaceUrl(url)               // HX-Replace-Url
  .redirect(url)                 // HX-Redirect
  .refresh()                     // HX-Refresh
  .retarget(selector)            // HX-Retarget
  .reswap(strategy)              // HX-Reswap
  .reselect(selector)            // HX-Reselect
  .location(config)              // HX-Location
  .build()                       // Returns { html, headers }
```

## XSS Protection

Fluent HTML **automatically escapes** all text content:

```typescript
const userInput = "<script>alert('xss')</script>";

Div(userInput)
// Renders: <div>&lt;script&gt;alert('xss')&lt;/script&gt;</div>

// Script and style tags preserve content (for actual code):
Script("const x = 5 < 10;")  // NOT escaped
Style("p { color: red; }")   // NOT escaped
```

## Common Patterns

### Forms
```typescript
Form([
  Div([
    Label("Name").setFor("name"),
    Input()
      .setId("name")
      .setName("name")
      .setType("text")
      .toggle("required")
  ]),
  Div([
    Label("Email").setFor("email"),
    Input()
      .setId("email")
      .setName("email")
      .setType("email")
      .toggle("required")
  ]),
  Button("Submit").setType("submit")
])
  .setAction("/submit")
  .setMethod("post")
```

### Lists
```typescript
Ul(
  ForEach(items, (item) =>
    Li(item.name)
  )
)
```

### Tables
```typescript
Table([
  Thead([
    Tr([
      Th("Name"),
      Th("Email"),
      Th("Role")
    ])
  ]),
  Tbody(
    ForEach(users, (user) =>
      Tr([
        Td(user.name),
        Td(user.email),
        Td(user.role)
      ])
    )
  )
])
```

### Navigation
```typescript
Nav(
  Ul(
    ForEach(navItems, (item) =>
      Li(
        A(item.label)
          .setHref(item.url)
          .setClass(item.active ? "active" : "")
      )
    )
  )
)
```

## Best Practices

1. **Use specialized tag methods** instead of `addAttribute()` for standard HTML properties
2. **Use control flow utilities** (IfThen, ForEach, etc.) instead of manual JavaScript loops
3. **Trust XSS protection** - don't manually escape content
4. **Chain methods** for clean, readable code
5. **Use TypeScript** for full type safety and IDE autocomplete
6. **Prefer `addClass()`** over `setClass()` when adding classes incrementally
7. **Use `defineIds()` for HTMX targets** - ensures type-safe references between views and controllers

## Complete Example

```typescript
import {
  Div, H1, P, Button, Ul, Li, A,
  ForEach, IfThen, render
} from "fluent-html";

function UserCard(user: { name: string; email: string; isAdmin: boolean }) {
  return Div([
    H1(user.name)
      .setClass("text-2xl font-bold"),
    P(user.email)
      .setClass("text-gray-600"),
    IfThen(
      user.isAdmin,
      () => Span("Admin").setClass("badge-admin")
    ),
    Button("Contact")
      .setType("button")
      .setClass("btn-primary")
  ])
    .setClass("card");
}

function UserList(users: Array<{ name: string; email: string; isAdmin: boolean }>) {
  return Div([
    H1("Users"),
    Ul(
      ForEach(users, user =>
        Li(UserCard(user))
      )
    )
  ]);
}
```
