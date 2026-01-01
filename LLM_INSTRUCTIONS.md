# Lambda.html AI Guide

Type-safe HTML builder for TypeScript with HTMX support and optional reactivity.

## Quick Reference

**Core capabilities:**
- Type-safe HTML elements with method chaining
- Built-in XSS protection (automatic escaping)
- First-class HTMX support with type-safe configuration
- Optional reactive system for client-side state management
- Flow control (IfThen, SwitchCase, ForEach, Repeat)
- Overlay positioning utility
- Zero dependencies

**Key imports:**
```typescript
// Basic building
import { Div, P, Button, render } from 'lambda.html';

// HTMX
import { hx, id, clss, closest, find } from 'lambda.html';

// Flow control
import { IfThen, IfThenElse, SwitchCase, ForEach, ForEach1,
         ForEach2, ForEach3, Repeat } from 'lambda.html';

// Utilities
import { El, Empty, Overlay } from 'lambda.html';

// Layout helpers (v4.0+)
import { VStack, HStack, Grid } from 'lambda.html';

// HTMX patterns (v4.0+)
import { SearchInput, InfiniteScroll } from 'lambda.html';

// Form patterns (v4.0+)
import { FormField } from 'lambda.html';

// Interactive components (v4.0+)
import { Toggle, Tabs, Accordion, KeyedList } from 'lambda.html';

// Reactive system
import { compile, renderWithScript, generateScript } from 'lambda.html';
```

## Core Concepts

```typescript
import { Div, P, Button, Span, render } from 'lambda.html';

// Elements are functions that return Tag objects
const view = Div([
  P("Hello"),
  Span("World")
]);

console.log(render(view));
// <div><p>Hello</p>\n<span>World</span></div>
```

## Type-Safe Chaining

All methods return `this` for chaining. Element-specific methods only exist on relevant tags:

```typescript
// Common methods (all tags)
Div("Content")
  .setId("main")
  .setClass("container")
  .addClass("active")
  .setStyle("color: red")
  .addAttribute("data-id", "123")

// New utility methods (v4.0+)
Button("Save")
  .setClasses(["btn", isDisabled && "btn-disabled", "btn-primary"])  // Filters falsy
  .setStyles({ backgroundColor: "blue", fontSize: "16px" })          // camelCase → kebab-case
  .setDataAttrs({ testid: "save-btn", userId: "123" })               // data-*
  .setAria({ label: "Save document", disabled: false })              // aria-*

// Input-specific (only on InputTag)
Input()
  .setType("email")
  .setName("email")
  .setPlaceholder("you@example.com")
  .setMin(0).setMax(100)  // for type="number"
  .setPattern("[a-z]+")
  .setAutocomplete("email")

// Button-specific
Button("Submit").setType("submit").setDisabled()

// Form-specific
Form().setAction("/api").setMethod("post").setEnctype("multipart/form-data")

// Table-specific
Th("Header").setColspan(2).setScope("col")
Td("Cell").setRowspan(3)

// Anchor-specific
A("Link").setHref("/page").setTarget("_blank").setRel("noopener")

// Image-specific
Img().setSrc("photo.jpg").setAlt("Photo").setLoading("lazy")
```

## Boolean Attributes

```typescript
Input().setToggles(["required", "disabled", "readonly"])
// <input required disabled readonly>
```

## Flow Control

```typescript
import { IfThen, IfThenElse, SwitchCase, ForEach, ForEach1, ForEach2, ForEach3, Repeat } from 'lambda.html';

// Conditional
IfThen(user.isAdmin, () => Span("Admin Badge"))

IfThenElse(
  isLoggedIn,
  () => Span(`Welcome, ${user.name}`),
  () => A("Login").setHref("/login")
)

// Multi-branch
SwitchCase([
  { condition: status === 'pending',  component: () => Span("⏳ Pending") },
  { condition: status === 'approved', component: () => Span("✅ Approved") },
  { condition: status === 'rejected', component: () => Span("❌ Rejected") },
], () => Span("Unknown"))  // default

// Iteration
Ul(ForEach(items, item => Li(item.name)))

// With index
Ul(ForEach1(items, (item, i) => Li(`${i + 1}. ${item.name}`)))

// Range iteration (0 to high, exclusive)
Ul(ForEach2(5, i => Li(`Item ${i}`)))  // 0, 1, 2, 3, 4

// Range iteration (low to high, exclusive)
Ul(ForEach3(2, 7, i => Li(`Item ${i}`)))  // 2, 3, 4, 5, 6

// Repeat N times
Div(Repeat(5, () => Span("⭐")))
```

## HTMX

```typescript
import { hx, id, clss, closest, find } from 'lambda.html';

// Basic requests
Button("Load").setHtmx(hx("/api/data"))                          // GET
Button("Save").setHtmx(hx("/api/save", { method: "post" }))      // POST
Button("Delete").setHtmx(hx("/api/item/1", { method: "delete" }))

// Targeting
Button("Load").setHtmx(hx("/api", { target: "#results" }))
Button("Load").setHtmx(hx("/api", { target: id("results") }))    // helper
Button("Load").setHtmx(hx("/api", { target: closest("tr") }))    // find ancestor
Button("Load").setHtmx(hx("/api", { target: find(".content") })) // find descendant

// Swap strategies
Div().setHtmx(hx("/api", { swap: "innerHTML" }))     // replace content (default)
Div().setHtmx(hx("/api", { swap: "outerHTML" }))     // replace element
Ul().setHtmx(hx("/api", { swap: "beforeend" }))      // append

// Triggers
Input().setHtmx(hx("/search", { trigger: "keyup changed delay:300ms" }))
Div().setHtmx(hx("/content", { trigger: "revealed" }))   // lazy load
Div().setHtmx(hx("/poll", { trigger: "every 5s" }))      // polling

// Common patterns
Form([
  Input().setType("text").setName("q"),
  Button("Search")
]).setHtmx(hx("/search", {
  method: "post",
  target: "#results",
  swap: "innerHTML",
  indicator: "#loading"
}))

// Infinite scroll
Div().setHtmx(hx("/feed?page=2", {
  trigger: "revealed",
  swap: "beforeend"
}))

// Live search
Input()
  .setType("search")
  .setName("q")
  .setHtmx(hx("/search", {
    trigger: "keyup changed delay:300ms",
    target: "#results"
  }))
```

## Components

Build reusable components as functions:

```typescript
interface CardProps {
  title: string;
  content: View;
  footer?: View;
}

function Card({ title, content, footer }: CardProps): View {
  return Div([
    H2(title).setClass("card-title"),
    Div(content).setClass("card-body"),
    IfThen(!!footer, () => Div(footer!).setClass("card-footer"))
  ]).setClass("card");
}

// Usage
Card({
  title: "Welcome",
  content: P("Hello world"),
  footer: Button("OK")
})
```

## XSS Protection

All text content is automatically escaped:

```typescript
const userInput = '<script>alert("xss")</script>';
render(Div(userInput));
// <div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>
```

Script and Style content is NOT escaped (they contain code):

```typescript
Script("if (a < b) { console.log('ok'); }")  // preserved as-is
```

## Reactive (Client-Side)

For client-side interactivity without full frameworks:

```typescript
import { compile, renderWithScript } from 'lambda.html/reactive';

const view = Div([
  Span().bindText("'Count: ' + count"),
  Button("+").onClick("count++"),
  Button("-").onClick("count--"),
  Div("High!").bindShow("count > 10")
]).bindState({ count: 0 });

// Validate bindings at compile time
const error = compile(view);
if (error) {
  console.error(error.message);
  // Example error: Variable "count" in bindText(...) is not bound.
  // Add it to bindState({ count: ... })
}

// Render with embedded reactive script
console.log(renderWithScript(view, render));
// Outputs HTML + <script> tag with reactive logic
```

**Compilation errors:**
- Unbound variables: References to state not in `bindState()`
- Variable shadowing: Nested `bindState()` using same variable names
- All errors are caught before runtime

**Alternative rendering:**
```typescript
import { generateScript } from 'lambda.html/reactive';

compile(view);
const html = render(view);
const script = generateScript(view);
// Use html and script separately
```

**API Pattern:**
- `bind*` — data → DOM (bindText, bindShow, bindHide, bindClass, bindAttr, bindStyle, bindValue)
- `on*` — DOM → data (onClick, onInput, onChange, onSubmit, onKeydown)

**Two-way binding:**
```typescript
Input()
  .bindValue("name")
  .onInput("name = this.value")
```

**Expressions** reference state variables directly:
```typescript
.bindText("count")
.bindShow("items.length > 0")
.bindClass("active", "tab === 1")
.onClick("count++")
.onInput("query = this.value")
```

## Overlay

Position content over other elements with flexible positioning:

```typescript
import { Overlay, OverlayPosition } from 'lambda.html';

// Basic overlay (center by default)
Overlay(
  Img().setSrc("photo.jpg").setAlt("Photo"),
  Span("New").setClass("badge")
)

// Position options: 'top' | 'bottom' | 'top-left' | 'top-right' |
//                   'bottom-left' | 'bottom-right' | 'left' | 'right' | 'center'

// Top-right badge
Overlay(
  Div("Card content...").setClass("card"),
  Span("Sale!").setClass("badge-sale"),
  "top-right"
)

// Center notification
Overlay(
  Div("Page content"),
  Div([
    H3("Loading..."),
    Div().setClass("spinner")
  ]).setClass("modal"),
  "center"
)

// Bottom notification bar
Overlay(
  Section("Main content"),
  Div("Cookie notice").setClass("notice-bar"),
  "bottom"
)
```

The overlay creates a container with `position: relative` containing:
- The base content
- An absolutely positioned overlay element with appropriate positioning styles
- `z-index: 10` on the overlay layer

## Utilities

```typescript
import { El, Empty } from 'lambda.html';

// Create custom elements
El("custom-element", "Content")
El("article", [H2("Title"), P("Body")])

// Empty view (useful for conditional rendering)
IfThen(isLoading, () => Spinner(), Empty)
```

## Advanced Reactive Features

**Additional event handlers:**
```typescript
Input()
  .onFocus("isFocused = true")
  .onBlur("isFocused = false")
  .onKeydown("if (event.key === 'Escape') query = ''")

Form()
  .onSubmit("handleSubmit()")
```

**Reactive bindings:**
```typescript
// Bind HTML content (⚠️ XSS risk - use only with trusted data)
Div().bindHtml("richContent")

// Bind attributes dynamically
Button("Submit")
  .bindAttr("disabled", "isSubmitting")
  .bindAttr("aria-label", "'Submit ' + formName")

// Bind styles dynamically
Div()
  .bindStyle("color", "textColor")
  .bindStyle("width", "progress + '%'")
  .bindStyle("backgroundColor", "isActive ? 'green' : 'gray'")
```

**Multiple event handlers:**
```typescript
// Call onClick multiple times to add multiple handlers
Button("Track Click")
  .onClick("clickCount++")
  .onClick("lastClicked = Date.now()")
  .onClick("trackAnalytics()")
```

## Layout Helpers (v4.0+)

```typescript
import { VStack, HStack, Grid } from 'lambda.html';

// Vertical stack (flexbox column)
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

// Horizontal stack (flexbox row)
HStack([
  Button("Cancel"),
  Button("Save")
], {
  spacing: "0.5rem",
  justify: "flex-end"
})

// Grid layout
Grid([Card1, Card2, Card3, Card4], {
  columns: 2,           // or "1fr 2fr 1fr"
  gap: "1rem",
  className: "grid"
})
```

## HTMX Pattern Helpers (v4.0+)

```typescript
import { SearchInput, InfiniteScroll } from 'lambda.html';

// Debounced search
SearchInput({
  endpoint: "/api/search",
  target: "#results",
  delay: 300,
  placeholder: "Search products...",
  name: "q"
})

// Infinite scroll
InfiniteScroll({
  endpoint: `/api/items?page=${nextPage}`,
  loadingText: "Loading more items...",
  threshold: "100px"
})
```

## Form Helpers (v4.0+)

```typescript
import { FormField } from 'lambda.html';

// Form field with label and error
FormField({
  label: "Email Address",
  name: "email",
  type: "email",
  placeholder: "you@example.com",
  required: true,
  error: "Please enter a valid email"
})
```

## Interactive Components (v4.0+)

```typescript
import { Toggle, Tabs, Accordion, KeyedList } from 'lambda.html';

// Toggle/disclosure
Toggle({
  label: "Show Details",
  content: Div([P("Hidden content"), P("More details...")]),
  defaultOpen: false
})

// Tabs
Tabs([
  { label: "Profile", content: ProfileView() },
  { label: "Settings", content: SettingsView() },
  { label: "History", content: HistoryView() }
], {
  defaultTab: 0
})

// Accordion
Accordion([
  { title: "Section 1", content: Content1() },
  { title: "Section 2", content: Content2() }
], {
  allowMultiple: false,
  defaultOpen: [0]
})

// Keyed list
KeyedList(
  users,
  (user) => user.id,
  (user, index) => Div([H3(user.name), P(user.email)])
)
```

## Common Patterns

**Layout with overlay notifications:**
```typescript
Overlay(
  Div([
    Header("My App"),
    Main(content),
    Footer("© 2025")
  ]),
  Div("Saved!").bindShow("showNotification").setClass("toast"),
  "top"
)
```

**HTMX infinite scroll:**
```typescript
Div(items).setHtmx(hx("/api/more", {
  trigger: "revealed",
  swap: "beforeend",
  target: closest("div")
}))
```

**Reactive form with validation:**
```typescript
Form([
  Input()
    .bindValue("email")
    .onInput("email = this.value")
    .setType("email"),
  Span("Invalid email").bindShow("email && !email.includes('@')"),
  Button("Submit")
    .setType("submit")
    .bindAttr("disabled", "!email || !email.includes('@')")
]).onSubmit("handleSubmit()").bindState({ email: "" })
```

**Conditional rendering with HTMX:**
```typescript
IfThenElse(
  isAuthenticated,
  () => Button("Logout").setHtmx(hx("/api/logout", { method: "post" })),
  () => A("Login").setHref("/login")
)
```

**Dynamic lists with state:**
```typescript
Div([
  Input().onInput("query = this.value").setPlaceholder("Search..."),
  Ul(ForEach(items, item =>
    Li(item.name).bindShow(`item.name.includes(query)`)
  ))
]).bindState({ query: "", items: [...] })
```