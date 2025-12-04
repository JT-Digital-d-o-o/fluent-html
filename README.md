# Lambda.html

A **type-safe**, **zero-dependency** HTML builder for TypeScript with built-in **XSS protection** and **HTMX integration**.

[![npm version](https://img.shields.io/npm/v/lambda.html.svg)](https://www.npmjs.com/package/lambda.html)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Why Lambda.html?

- **🔒 Type-Safe by Design** — Compile-time errors for invalid HTML structures, attributes, and HTMX configurations
- **🛡️ Built-in XSS Protection** — All text content and attributes are automatically escaped
- **⚡ Zero Dependencies** — Pure TypeScript, no runtime overhead
- **🔗 First-Class HTMX Support** — Type-safe HTMX attributes with autocomplete
- **🎨 CSS Framework Agnostic** — Works seamlessly with Tailwind CSS, Bootstrap, or any CSS
- **📦 Tiny Bundle** — Minimal footprint for server-side rendering

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

- [Core Concepts](#core-concepts)
- [Type-Safe HTML Elements](#type-safe-html-elements)
- [XSS Protection](#xss-protection)
- [HTMX Integration](#htmx-integration)
- [Control Flow](#control-flow)
- [Composable Components](#composable-components)
- [Complete API Reference](#complete-api-reference)

---

## Core Concepts

### The `View` Type

Everything in Lambda.html is a `View`:

```typescript
type View = Tag | string | View[];
```

This means you can:
- Return a single element: `Div("Hello")`
- Return plain text: `"Hello"`
- Return arrays: `[H1("Title"), P("Content")]`

### Method Chaining

All elements support fluent method chaining:

```typescript
const card = Div("Content")
  .setId("my-card")
  .setClass("card shadow-lg")
  .addClass("hover:shadow-xl")
  .setStyle("max-width: 400px")
  .addAttribute("data-testid", "card-component");
```

### Nested Elements

Pass children as the first argument:

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

---

## Type-Safe HTML Elements

Lambda.html provides **typed element functions** with attribute-specific methods.

### Input Elements

```typescript
// Text input with validation
Input()
  .setType("email")
  .setName("email")
  .setPlaceholder("Enter your email")
  .setPattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")
  .setToggles(["required"])

// Number input with constraints
Input()
  .setType("number")
  .setName("quantity")
  .setMin(1)
  .setMax(100)
  .setStep(5)

// File input
Input()
  .setType("file")
  .setName("documents")
  .setAccept(".pdf,.doc,.docx")
  .setMultiple()
```

### Form Elements

```typescript
// Complete form
Form([
  Label("Username").setFor("username"),
  Input()
    .setType("text")
    .setId("username")
    .setName("username")
    .setAutocomplete("username")
    .setToggles(["required"]),
  
  Label("Password").setFor("password"),
  Input()
    .setType("password")
    .setId("password")
    .setName("password")
    .setMinlength(8),
  
  Button("Sign In").setType("submit")
])
  .setAction("/login")
  .setMethod("post")
  .setAutocomplete("on")
```

### Select with Options

```typescript
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
])
  .setName("country")
  .setToggles(["required"])
```

### Table with Typed Cells

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
    Tr([
      Th("Widget B").setScope("row"),
      Td("$2,000").setRowspan(2),
      Td("$2,200"),
      Td("$4,200").setColspan(2),
    ]),
  ]),
]).setClass("w-full border-collapse")
```

### Media Elements

```typescript
// Responsive image with lazy loading
Img()
  .setSrc("hero.jpg")
  .setAlt("Hero image")
  .setSrcset("hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w")
  .setSizes("(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px")
  .setLoading("lazy")
  .setDecoding("async")

// Video with multiple sources and captions
Video([
  Source().setSrc("video.webm").setType("video/webm"),
  Source().setSrc("video.mp4").setType("video/mp4"),
  Track()
    .setSrc("captions-en.vtt")
    .setKind("subtitles")
    .setSrclang("en")
    .setLabel("English")
    .setDefault(),
  "Your browser does not support video."
])
  .setControls()
  .setPoster("poster.jpg")
  .setPreload("metadata")
```

---

## XSS Protection

Lambda.html **automatically escapes** all text content and attribute values to prevent Cross-Site Scripting (XSS) attacks.

### Automatic Escaping

```typescript
// User input is automatically escaped
const userInput = '<script>alert("xss")</script>';
const safe = Div(userInput);

console.log(render(safe));
// Output: <div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>
```

### Attribute Escaping

```typescript
// Attributes are also escaped
const malicious = '"><script>alert(1)</script>';
const element = Div().setClass(malicious);

console.log(render(element));
// Output: <div class="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"></div>
```

### Raw Content for Scripts and Styles

Script and Style elements are **not escaped** (as they contain code, not user content):

```typescript
// Script content is NOT escaped (intentional)
Script(`
  if (count < 10 && count > 0) {
    console.log('<valid>');
  }
`)
// Output: <script>if (count < 10 && count > 0) { console.log('<valid>'); }</script>

// Style content is NOT escaped (intentional)
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
    H2(user.name),      // Escaped automatically
    P(user.bio),        // Escaped automatically
  ]).setClass("user-card");
}

// Even malicious data is safely rendered
const user = {
  name: '<script>steal(cookies)</script>',
  bio: '"><img src=x onerror=alert(1)>'
};

render(UserCard(user));
// All content is properly escaped, XSS prevented
```

---

## HTMX Integration

Lambda.html provides **complete type-safe HTMX support** with the `hx()` helper function.

### Basic HTMX Requests

```typescript
import { hx } from 'lambda.html';

// GET request (default)
Button("Load More")
  .setHtmx(hx("/api/items"))

// POST request
Button("Submit")
  .setHtmx(hx("/api/submit", { method: "post" }))

// PUT request
Button("Update")
  .setHtmx(hx("/api/update/123", { method: "put" }))

// DELETE request
Button("Delete")
  .setHtmx(hx("/api/delete/123", { method: "delete" }))
```

### Target and Swap

```typescript
// Target specific element
Button("Load Content")
  .setHtmx(hx("/api/content", {
    target: "#content-area",
    swap: "innerHTML"
  }))

// Swap strategies
Div()
  .setHtmx(hx("/api/item", { swap: "outerHTML" }))      // Replace entire element
  .setHtmx(hx("/api/item", { swap: "beforeend" }))     // Append to children
  .setHtmx(hx("/api/item", { swap: "afterbegin" }))    // Prepend to children
  .setHtmx(hx("/api/item", { swap: "beforebegin" }))   // Insert before element
  .setHtmx(hx("/api/item", { swap: "afterend" }))      // Insert after element
```

### Triggers

```typescript
// Click trigger (default for buttons)
Button("Click Me")
  .setHtmx(hx("/api/click", { trigger: "click" }))

// Load trigger (fires on page load)
Div()
  .setId("stats")
  .setHtmx(hx("/api/stats", { trigger: "load" }))

// Revealed trigger (lazy loading)
Div()
  .setClass("lazy-section")
  .setHtmx(hx("/api/content", { trigger: "revealed" }))

// Debounced input
Input()
  .setType("search")
  .setName("q")
  .setHtmx(hx("/api/search", {
    trigger: "keyup changed delay:300ms",
    target: "#search-results"
  }))

// Polling
Div()
  .setId("notifications")
  .setHtmx(hx("/api/notifications", {
    trigger: "every 30s"
  }))
```

### Form Handling

```typescript
// Form with HTMX
Form([
  Input().setType("text").setName("title"),
  Textarea().setName("content").setRows(5),
  Button("Save").setType("submit")
])
  .setHtmx(hx("/api/posts", {
    method: "post",
    trigger: "submit",
    swap: "outerHTML",
    indicator: "#loading"
  }))

// File upload with encoding
Form([
  Input().setType("file").setName("avatar").setAccept("image/*"),
  Button("Upload").setType("submit")
])
  .setHtmx(hx("/api/upload", {
    method: "post",
    encoding: "multipart/form-data"
  }))
```

### Advanced HTMX Features

```typescript
// Confirmation dialog
Button("Delete Account")
  .setClass("bg-red-500 text-white px-4 py-2")
  .setHtmx(hx("/api/account", {
    method: "delete",
    confirm: "Are you sure you want to delete your account? This cannot be undone."
  }))

// Loading indicator
Button("Save")
  .setHtmx(hx("/api/save", {
    method: "post",
    indicator: "#save-spinner"
  }))

// Custom headers
Div()
  .setHtmx(hx("/api/data", {
    headers: { "X-Custom-Header": "value" }
  }))

// Include additional elements
Button("Submit")
  .setHtmx(hx("/api/submit", {
    method: "post",
    include: "#extra-fields"
  }))

// Send additional values
Button("Action")
  .setHtmx(hx("/api/action", {
    vals: { timestamp: Date.now(), source: "button" }
  }))

// URL manipulation
A("View Details")
  .setHref("/details/123")
  .setHtmx(hx("/api/details/123", {
    pushUrl: true,
    target: "#main"
  }))

// Sync requests
Button("Save")
  .setHtmx(hx("/api/save", {
    method: "post",
    sync: "closest form:abort"  // Abort previous request
  }))

// Select specific content from response
Div()
  .setHtmx(hx("/api/page", {
    select: "#main-content",
    selectOob: "#sidebar"
  }))
```

### Type-Safe Target Helpers

```typescript
import { id, clss } from 'lambda.html';

// Type-safe target selectors
Button("Load")
  .setHtmx(hx("/api/data", {
    target: id("content"),    // Returns "#content"
  }))

Button("Update All")
  .setHtmx(hx("/api/update", {
    target: clss("item"),     // Returns ".item"
  }))
```

### Complete HTMX Example: Infinite Scroll

```typescript
function InfiniteScrollList(items: Item[], page: number): View {
  return Div([
    Ul(
      ForEach(items, item => 
        Li(item.title).setClass("p-4 border-b")
      )
    ).setId("item-list"),
    
    // Load more trigger
    Div()
      .setId("load-more")
      .setClass("h-20")
      .setHtmx(hx(`/api/items?page=${page + 1}`, {
        trigger: "revealed",
        swap: "outerHTML",
        select: "#load-more-content"
      }))
  ]);
}
```

---

## Control Flow

Lambda.html provides functional control flow constructs for conditional and iterative rendering.

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
    () => Div([
      Span(`Welcome, ${user!.name}`),
      A("Logout").setHref("/logout")
    ]),
    () => Div([
      A("Login").setHref("/login"),
      A("Sign Up").setHref("/signup")
    ])
  );
}
```

### SwitchCase

```typescript
import { SwitchCase } from 'lambda.html';

type Status = 'pending' | 'approved' | 'rejected';

function StatusBadge(status: Status): View {
  return SwitchCase([
    {
      condition: status === 'pending',
      component: () => Span("Pending").setClass("badge-yellow")
    },
    {
      condition: status === 'approved',
      component: () => Span("Approved").setClass("badge-green")
    },
    {
      condition: status === 'rejected',
      component: () => Span("Rejected").setClass("badge-red")
    },
  ], () => Span("Unknown").setClass("badge-gray"));
}
```

### ForEach Variants

```typescript
import { ForEach, ForEach1, ForEach2, ForEach3, Repeat } from 'lambda.html';

// Basic iteration
const items = ["Apple", "Banana", "Cherry"];
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
Div(Repeat(3, () => 
  Span("⭐")
))
```

---

## Composable Components

Build reusable, type-safe components as pure functions.

### Basic Component Pattern

```typescript
interface ButtonProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: string;
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
    `.trim());
  
  if (props.disabled) {
    button.setDisabled();
  }
  
  if (props.onClick) {
    button.setHtmx(hx(props.onClick, { method: 'post' }));
  }
  
  return button;
}

// Usage
StyledButton({ text: "Save", variant: "primary", onClick: "/api/save" })
StyledButton({ text: "Cancel", variant: "secondary" })
StyledButton({ text: "Delete", variant: "danger", onClick: "/api/delete" })
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

// Usage
Card({
  title: "Getting Started",
  content: P("Learn how to build type-safe HTML with Lambda.html"),
  image: "/images/tutorial.jpg",
  footer: A("Read More →").setHref("/docs/getting-started")
})
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
  const rowClass = [
    options?.hoverable ? 'hover:bg-gray-50' : '',
  ].filter(Boolean).join(' ');

  return Table([
    Thead(
      Tr(
        ForEach(columns, col =>
          Th(col.header)
            .setScope("col")
            .setClass("px-4 py-3 text-left font-semibold")
        )
      ).setClass("bg-gray-100")
    ),
    Tbody(
      ForEach1(data, (row, index) =>
        Tr(
          ForEach(columns, col => {
            const value = row[col.key];
            const content = col.render 
              ? col.render(value, row) 
              : String(value);
            return Td(content).setClass("px-4 py-3");
          })
        )
          .setClass(rowClass)
          .addClass(options?.striped && index % 2 ? 'bg-gray-50' : '')
      )
    ),
  ]).setClass("w-full border-collapse");
}

// Usage
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "User" },
];

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

### Modal Component

```typescript
interface ModalProps {
  id: string;
  title: string;
  content: View;
  actions?: View;
}

function Modal(props: ModalProps): View {
  return Dialog([
    Div([
      // Header
      Div([
        H2(props.title).setClass("text-xl font-semibold"),
        Button("✕")
          .setClass("text-gray-400 hover:text-gray-600")
          .addAttribute("onclick", `document.getElementById('${props.id}').close()`)
      ]).setClass("flex justify-between items-center pb-4 border-b"),
      
      // Content
      Div(props.content).setClass("py-4"),
      
      // Actions
      IfThen(!!props.actions, () =>
        Div(props.actions!).setClass("pt-4 border-t flex justify-end gap-2")
      ),
    ]).setClass("p-6")
  ])
    .setId(props.id)
    .setClass("rounded-lg shadow-xl max-w-md w-full backdrop:bg-black/50");
}

// Usage
Modal({
  id: "confirm-modal",
  title: "Confirm Action",
  content: P("Are you sure you want to proceed?"),
  actions: [
    Button("Cancel")
      .setClass("px-4 py-2 border rounded")
      .addAttribute("onclick", "document.getElementById('confirm-modal').close()"),
    Button("Confirm")
      .setClass("px-4 py-2 bg-blue-500 text-white rounded")
      .setHtmx(hx("/api/confirm", { method: "post" }))
  ]
})
```

---

## Complete API Reference

### Element Functions

#### Structural Elements
`Div`, `Main`, `Header`, `Footer`, `Section`, `Article`, `Nav`, `Aside`, `Figure`, `Figcaption`, `Address`, `Hgroup`, `Search`

#### Text Content
`P`, `H1`-`H6`, `Span`, `Blockquote`, `Pre`, `Code`, `Hr`, `Br`, `Wbr`

#### Inline Semantics
`Strong`, `Em`, `B`, `I`, `U`, `S`, `Mark`, `Small`, `Sub`, `Sup`, `Abbr`, `Cite`, `Q`, `Dfn`, `Kbd`, `Samp`, `Var`, `Bdi`, `Bdo`, `Ruby`, `Rt`, `Rp`

#### Lists
`Ul`, `Ol`, `Li`, `Dl`, `Dt`, `Dd`, `Menu`

#### Tables
`Table`, `Thead`, `Tbody`, `Tfoot`, `Tr`, `Th`, `Td`, `Caption`, `Colgroup`, `Col`

#### Forms
`Form`, `Input`, `Textarea`, `Button`, `Label`, `Select`, `Option`, `Optgroup`, `Datalist`, `Fieldset`, `Legend`, `Output`

#### Interactive
`Details`, `Summary`, `Dialog`

#### Media
`Img`, `Picture`, `Source`, `Video`, `Audio`, `Track`, `Canvas`, `Svg`, `Path`, `Circle`, `Rect`, `Line`, `Polygon`, `Polyline`, `Ellipse`, `G`, `Defs`, `Use`, `Text`, `Tspan`

#### Embedded
`Iframe`, `ObjectEl`, `Embed`

#### Links
`A`, `MapEl`, `Area`

#### Document
`HTML`, `Head`, `Body`, `Title`, `Meta`, `Link`, `Style`, `Script`, `Base`, `Noscript`, `Template`

#### Data/Time
`Time`, `Data`, `Progress`, `Meter`, `Slot`

#### Utilities
`El` (custom elements), `Empty`, `Overlay`

### Common Methods (All Tags)

| Method                      | Description            |
| --------------------------- | ---------------------- |
| `.setId(id)`                | Set element ID         |
| `.setClass(classes)`        | Set CSS classes        |
| `.addClass(class)`          | Append CSS class       |
| `.setStyle(css)`            | Set inline styles      |
| `.addAttribute(key, value)` | Add custom attribute   |
| `.setHtmx(hx(...))`         | Add HTMX behavior      |
| `.setToggles([...])`        | Add boolean attributes |

### Control Flow Functions

| Function                       | Description                 |
| ------------------------------ | --------------------------- |
| `IfThen(cond, then)`           | Render if condition is true |
| `IfThenElse(cond, then, else)` | Conditional rendering       |
| `SwitchCase(cases, default)`   | Multi-branch conditional    |
| `ForEach(items, render)`       | Iterate over items          |
| `ForEach1(items, render)`      | Iterate with index          |
| `ForEach2(n, render)`          | Iterate 0 to n-1            |
| `ForEach3(start, end, render)` | Iterate start to end-1      |
| `Repeat(n, render)`            | Repeat n times              |

### HTMX Helper

```typescript
hx(endpoint: string, options?: {
  method?: 'get' | 'post' | 'put' | 'delete';
  target?: string;
  trigger?: string;
  swap?: 'innerHTML' | 'outerHTML' | 'beforeend' | 'afterbegin' | ...;
  pushUrl?: boolean;
  replaceUrl?: boolean;
  confirm?: string;
  indicator?: string;
  include?: string;
  vals?: object;
  headers?: object;
  encoding?: 'multipart/form-data';
  validate?: boolean;
  ext?: string;
  params?: string;
  select?: string;
  selectOob?: string;
  sync?: string;
})
```

---

## License

ISC © Toni K. Turk (director of TSS Digital Studios d.o.o.)

---

## Contributing

Contributions are welcome! Please visit the [GitLab repository](https://gitlab.com/seckmaster/lambda.html) to report issues or submit merge requests.