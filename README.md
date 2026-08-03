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
    .text("3xl")
    .font("bold"),

  Button("Get Started")
    .px("6")
    .py("3")
    .bg("blue-500")
    .text("white")
    .rounded("lg")
    .shadow()
).p("8").maxW("4xl").mx("auto");

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
- **First-class HTMX 4** - Type-safe routes with typed params, triggers, swaps, targets, morph strategies, and more
- **100+ Tailwind methods** - Gradients, filters, group/peer, arbitrary values with unit overloads, and more
- **XSS protection** - Text and attributes escaped automatically; URL setters scheme-sanitized (`javascript:`/hostile `data:` blocked)
- **Zero dependencies** - Pure TypeScript, ~15KB minified
- **SSR-ready** - Built for server-side rendering, optimized render path

---

## Quick Examples

### Fluent Styling

```typescript
// Chainable Tailwind-friendly methods
Card(
  H2("Dashboard").text("xl").font("semibold"),
  P("Welcome back!").text("gray-600")
)
  .bg("white")
  .p("6")
  .rounded("xl")
  .shadow("lg")

// Variants are typed style objects — keys are the same canonical names
Button("Save")
  .bg("blue-500").text("white").px("4").rounded()
  .hover({ bg: "blue-600" })
  .disabled({ opacity: "50", cursor: "not-allowed" })
  .md({ px: "8", text: "lg" })

// Escape hatches, in order: arbitrary CSS → .cssProp(); non-Tailwind class hooks → .cssClass()
Div("Content").cssProp("mask-repeat", "no-repeat").cssClass("js-map-container")
```

### HTMX 4 with Full Type Safety

```typescript
// Type-safe routes — shared prefix, typed params, typos are compile errors
const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  delete: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);

Button("Load").setHtmx(userRoutes.list({ target: ids.userList }))
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }))  // id must be number

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

// Query params on ad-hoc URLs — url-encoded + join-aware (prefer route callables when the route is modeled)
Button("Search").setHtmx(hx("/search", { query: { q: term, scope: "open" } }))  // → hx-get="/search?q=…&scope=open"
```

### Forms with Validation

```typescript
type Subscribe = { email: string };

// `state` (prefill values + validation errors) comes from your controller.
// The typed binding wires name/id/label-for/value/aria from the field key — no repetition.
Form<Subscribe>({ errors }, (f) => [
  f.label("email", "Email"),
  f.input("email", "email").setPlaceholder("you@example.com").setAutocomplete("email").toggle("required"),
  f.error("email"),                             // <span> linked via aria-describedby when errored
  Button("Subscribe").setType("submit"),
])
  .setHtmx(hx("/api/subscribe", { method: "post", swap: "outerMorph" }))
```

### Conditional Modifiers

Use `.when()` to conditionally modify a tag without breaking the chain:

```typescript
Button("Save")
  .px("4").rounded()
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.bg("blue-600").text("white"))
```

`.whenElse()` adds a second modifier for the other branch (the chain-level mirror of `IfThenElse`):

```typescript
Button("Save").whenElse(isLoading, t => t.toggle("disabled"), t => t.bg("blue-500"))
Span().whenElse(user.name, (t, name) => t.setTitle(name), t => t.setTitle("Anon"))
```

A boolean condition runs the modifier when `true`; a **nullable value** runs it when non-null (`!= null`, like `IfThen`) and passes the narrowed value — so a present-but-falsy `0` or `""` still runs. Use `.addChild(...)` inside a modifier to conditionally append children (the structural counterpart to `.apply`/`.when`):

```typescript
Button("Save").when(isLoading, t => t.addChild(Spinner()))
Ul().addChild(...users.map(u => Li(u.name)))   // append after construction
```

`.whenMatch()` completes the family (`IfThen → when`, `IfThenElse → whenElse`, `Match → whenMatch`): one modifier per variant of a string/number discriminant. The two-argument form is exhaustive — a missing case is a compile error, so adding a union member surfaces every `whenMatch` that needs updating. Pass a default modifier to match a subset:

```typescript
Span(status).whenMatch(status, {          // status: "active" | "pending" | "closed"
  active:  t => t.bg("green-100").text("green-700"),
  pending: t => t.bg("amber-100").text("amber-700"),
  closed:  t => t.bg("gray-100").text("gray-600"),
})
Button(label).whenMatch(tone, { danger: t => t.bg("red-500") }, t => t.bg("gray-200"))
```

Never chain `.when()` on one discriminant — it re-tests the value per branch and a new union member compiles silently, rendering unstyled:

```typescript
Span().when(status === "active", t => t.bg("green-100"))
      .when(status === "closed", t => t.bg("gray-100"))                            // ✗
Span().whenMatch(status, { active: t => t.bg("green-100"), closed: t => t.bg("gray-100") })  // ✓
```

Keep each branch's fluent calls literal so the Tailwind extractor sees the classes statically. That holds even when variant names coincide with tokens: `Div().maxW(width)` type-checks for `width: "lg" | "2xl"`, but a variable argument is invisible to the extractor — and the general discriminant maps each variant to several properties, which no single dynamic call can express.

### Reusable Modifiers

Use `.apply()` to compose reusable modifier functions. A style-fn typed against the base `Tag` composes onto any element subclass (`Button`, `Input`, `A`, …) and may return anything:

```typescript
const card = (t: Tag) => t.rounded().shadow().p("4").bg("white");
const danger = (t: Tag) => t.border("red-500").text("red-700");

// Apply single or multiple modifiers
Div("Warning").apply(card, danger)
Button("Delete").apply(card, danger)   // base-Tag style-fns work on subclasses

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
Ul(ForEachElse(items, item => Li(item.name), () => Li("Nothing here")))  // empty fallback
Ul(ForEachKeyed(items, item => item.id, item => Li(item.name)))  // stamps id=<key> so HTMX morph matches by key on reorder
Nav(Intersperse(crumbs, c => A(c.label), () => Span("/")))  // separator between, never after the last

// Value mapping — the value analogue of Match (keeps the literal union)
MatchValue(trend, { up: "↑", down: "↓" }, "→")          // "↑" | "↓" | "→"

// Two-branch tag modifier (mirrors IfThenElse, not truthiness)
Button("Save").whenElse(isLoading, t => t.toggle("disabled"), t => t.bg("blue-500"))

// The match trio: MatchValue = value per property, whenMatch = modifier per variant, Match = view per variant
Span(MatchValue(tone, { ok: "✓", err: "✗" }))
Div().whenMatch(tone, { ok: t => t.text("green-700"), err: t => t.text("red-700") })
Match(tone, { ok: () => OkBanner(), err: () => ErrBanner() })
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
- [Type-Safe Routes](#type-safe-routes) - Compile-time-safe HTMX endpoints with typed params
- [Partial Multi-Swap](#partial-multi-swap) - Update multiple page sections in one response
- [Global HTMX Config](#global-htmx-config) - Type-safe global htmx configuration
- [HTML Elements](#html-elements) - 60+ typed elements with generic `Input()` factory
- [Control Flow](#control-flow-1) - IfThen, Match, ForEach
- [ESLint Plugin](#eslint-plugin) - 16 rules catching style overwrites, class conflicts, HTMX pitfalls & more
- [Tailwind CSS Extractor](#tailwind-css-extractor) - Generate CSS from fluent method calls
- [API Reference](#api-reference) - Full reference & TypeDoc

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

// Self-polling status panel — poll only while work is in flight; the settled
// re-render omits the trigger, and the outerHTML replace tears down the timer
StatusPanel(job)
  .when(!job.done, t => t.setHtmx(hx(`/jobs/${job.id}/status`, {
    trigger: "every 2s",
    target: "this",
    swap: "outerHTML",  // never a morph — see below
  })))

// Multiple triggers
Button("Action").setHtmx(hx("/api/action", {
  trigger: "click, keyup[key=='Enter']"
}))
```

> **Polling swaps `outerHTML`, never a morph.** htmx clears an `every` timer only when the polled node leaves the DOM. A morph keeps the old node — and its timer — alive after the settled re-render drops the trigger; the stale tick then fires with no `hx-get`, fetches the page URL, and nests the full document inside the panel. Replacing the node each poll lets the trigger-less terminal render actually stop the timer. For the same reason, a poll endpoint must always respond with the polled fragment (a terminal, trigger-less variant for gone/error states) — never a full error page.

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

// Preload — prefetch on hover, cached by click time (boost + preload are htmx options, not boolean attrs)
A("Dashboard").setHref("/dashboard").hxGet("/dashboard", { boost: true, preload: "mouseover" })

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
type Register = { email: string; password: string };

Form<Register>({ values, errors }, (f) =>
  Fieldset(
    Legend("User Registration"),

    f.label("email", "Email"),
    f.input("email", "email")
      .setPlaceholder("you@example.com")
      .setAutocomplete("email")
      .toggle("required"),
    f.error("email"),

    f.label("password", "Password"),
    f.input("password", "password")
      .setMinlength(8)
      .setAutocomplete("new-password")
      .toggle("required"),
    f.error("password"),

    Button("Register")
      .setType("submit")
      .bg("blue-500").text("white")
      .px("4").py("2").rounded()
      .cursor("pointer"),
  ).flex().flex("col").gap("4"),
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
  list:   { path: "/" },                 // method defaults to "get" — spell it out only when it isn't
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

// Query parameters — nullish values are silently skipped
reply.redirect(userRoutes.list.resolve({ page: "2", sort: "name" }))           // "/users?page=2&sort=name"
reply.redirect(userRoutes.delete.resolve({ id: user.id }, { tab: "posts" }))   // "/users/42?tab=posts"
userRoutes.list.resolve({ page: "1", filter: undefined })                       // "/users?page=1"

// Query parameters in HTMX calls
Button("Page 2").setHtmx(userRoutes.list({ query: { page: "2" } }))
```

### Wildcard (Splat) Routes

A trailing `*` (or named `*name`) captures the rest of the path as one required `string` param — for file trees, scoped slugs, and other catch-alls. Each segment is url-encoded but `/` separators are preserved. Only a *trailing* `/*` is a splat, and a splat route takes no declared `params`.

```typescript
const fileRoutes = defineRoutes("/files", {
  tree: { method: "get", path: "/*" },          // → required `splat`
  blob: { method: "get", path: "/blob/*path" }, // → required `path`
} as const);

fileRoutes.tree.resolve({ splat: "a/b/c" })   // "/files/a/b/c"         (slashes preserved)
fileRoutes.blob.resolve({ path: "x/y.png" })  // "/files/blob/x/y.png"

fileRoutes.tree.resolve()              // ✗ missing splat — compile error
fileRoutes.tree.resolve({ rest: "x" }) // ✗ wrong key (it's "splat") — compile error
```

### Typed Route Parameters

Route params can be typed as `string`, `number`, or an **enum** — a `readonly` literal tuple that constrains the segment to a token set. The type is enforced at compile time (and a `number` value is checked for finiteness at resolve time), and a `params` key that isn't a `:param` in the path is itself a compile error:

```typescript
export const userRoutes = defineRoutes("/users", {
  detail:   { method: "get", path: "/:id",     params: { id: "number" } as const },
  bySlug:   { method: "get", path: "/:slug",   params: { slug: "string" } as const },
  byStatus: { method: "get", path: "/:status", params: { status: ["active", "archived"] as const } },
} as const);

userRoutes.detail.resolve({ id: 42 })              // "/users/42" — id must be number
userRoutes.detail.resolve({ id: "42" })            // ✗ compile error — number expected
userRoutes.byStatus.resolve({ status: "active" })  // ✓ — one of "active" | "archived"
userRoutes.byStatus.resolve({ status: "deleted" }) // ✗ compile error — not in the enum
// { path: "/:id", params: { ic: "number" } }       // ✗ compile error — "ic" is not a :param in the path
```

### Typed Query Parameters

By default `.resolve(query)` and `{ query }` take a loose bag of params (nullish values are silently skipped). Declare a `query` map — the same `ParamType` vocabulary as path params (`string`, `number`, or an enum tuple) — to type the query string too. Every declared key is **optional**; wrong types and undeclared keys become compile errors:

```typescript
export const productRoutes = defineRoutes({
  list: { path: "/products", query: { page: "number", sort: ["asc", "desc"] } as const },
} as const);

productRoutes.list.resolve({ page: 2, sort: "asc" })  // "/products?page=2&sort=asc"
productRoutes.list.resolve()                          // "/products" — every declared key is optional
productRoutes.list({ query: { page: 3 } })            // hx-get="/products?page=3"

productRoutes.list.resolve({ sort: "up" })  // ✗ compile error — not in the enum
productRoutes.list.resolve({ page: "2" })   // ✗ compile error — number expected
productRoutes.list.resolve({ limit: 10 })   // ✗ compile error — "limit" is not a declared query key
```

A route with no `query` map keeps the loose bag, so routes you don't annotate are unchanged.

The prefix is optional — you can still pass route definitions directly without one. Routes expose `.method`, `.path` (with prefix applied), and `.resolve()` (for param + query substitution). Views and controllers always stay in sync.

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

When a partial's target is (or contains) a self-polling element, pass `"outerHTML"` — the default morph preserves settled poller nodes and their `every` timers, resurrecting a poll a plain replace would have stopped (see [Triggers with Modifiers](#triggers-with-modifiers)).

> **Note:** the old `OOB()` / `withOOB()` helpers were **removed** in 6.1.1 (htmx 4 replaced OOB swaps). Migrate `OOB(id, content)` → `Partial(id, content)`, and `withOOB(main, ...oob)` → a plain array `[main, ...partials]`.

---

## Full HTML Document

`Document(...)` renders a complete page — it prefixes `<!DOCTYPE html>` and is chainable like `HTML()` (`.setLang(...)`). Plain `HTML(...)` stays byte-identical (no DOCTYPE), and `Doctype()` emits just the declaration.

```typescript
import { Document, Head, Body, Title, Meta, P } from 'fluent-html';

Document(
  Head(Title("My App"), Meta().setCharset("UTF-8")),
  Body(P("Hello")),
).setLang("en")
// <!DOCTYPE html>
// <html lang="en"><head><title>My App</title><meta charset="UTF-8"></head>
// <body><p>Hello</p></body></html>
```

### Head-element types & resource hints

The head-element setters are typed with **open unions** — the canonical set autocompletes, custom/vendor values still compile via the `(string & {})` tail. `setFetchPriority` is the typed Core Web Vitals priority hint (closed `'high' | 'low' | 'auto'`); promote the LCP resource with `'high'`, de-prioritise below-the-fold work with `'low'`.

```typescript
import { Head, Meta, Link, Script, Img } from 'fluent-html';

Head(
  Meta().setCharset("utf-8"),
  Meta().setName("viewport").setContent("width=device-width, initial-scale=1"),
  Meta().setName("theme-color").setContent("#0b0b0b"),
  Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossOrigin(""),
  Link().setRel("preload").setHref("/fonts/inter.woff2").setAs("font").setType("font/woff2").setCrossOrigin(""),
  Link().setRel("modulepreload").setHref("/app.js").setFetchPriority("low"),
  Script().setSrc("/app.js").setType("module"),
);

Img().setSrc("/hero.avif").setAlt("").setFetchPriority("high");   // LCP image promotion
```

Exported types: `FetchPriority` (closed), `LinkElementRel` (distinct from the anchor-rel `LinkRel`), `LinkAs`, `LinkType`, `ScriptType`, `MetaName`, `Charset` — plus `Base().setTarget` reuses `BrowsingContext`.

### Media & resource-hint attributes

`setCrossOrigin` is uniform across media — `Video`/`Audio`/`Img`/`Link`/`Script` all take it (required for cross-origin `<track>` captions, untainted `<canvas>` frame capture, and Web-Audio source nodes). `setReferrerPolicy` (closed `ReferrerPolicy`) is now uniform across `A`/`Img`/`Link`/`Script`/`Area`/`Iframe`. Size each `<source>` in an art-directed `<picture>` to kill CLS, preload the LCP image responsively, and ship a per-scheme `theme-color`:

```typescript
Video(Track().setSrc("https://cdn/x.vtt").setKind("captions")).setCrossOrigin("anonymous");
Img().setSrc("/avatar.jpg").setReferrerPolicy("no-referrer");
Picture(Source().setSrcset("/hero.avif").setMedia("(min-width:768px)").setWidth(1280).setHeight(720));
Link().setRel("preload").setAs("image")
  .setImagesrcset("/hero-480.jpg 480w, /hero-1080.jpg 1080w").setImagesizes("100vw");  // distinct from setSizes (icon grammar)
Meta().setName("theme-color").setContent("#0b0b0b").setMedia("(prefers-color-scheme: dark)");
```

`<source>` deliberately has **no** `referrerpolicy` (the spec defines none); it carries `width`/`height` only.

### Iframe security — `sandbox` & `allow`

The two `<iframe>` attributes that *are* the security boundary are typed. `setSandbox` takes variadic closed `SandboxToken`s — a misspelled token is a compile error, not a silently-weakened policy — and each call replaces the list. `setAllow` is a Permissions-Policy directive **record** (names autocomplete; values are the allowlist grammar `'self'`/`'none'`/`*`/origins):

```typescript
Iframe().setSrcdoc(html).setSandbox("allow-scripts", "allow-same-origin");  // "allow-same-orign" → compile error
Iframe().setSandbox();                                              // sandbox="" — fully locked default
Iframe().setSrc(mapUrl).setAllow({ geolocation: "'self'", camera: "*" });   // allow="geolocation 'self'; camera *"
Iframe().setAllow({ fullscreen: "" });                              // empty value → bare name → allow="fullscreen"
Iframe().setAllow({});                                              // allow="" — deny all
```

Directive *names* are an open union (`(string & {})` tail) so new spec directives don't need a lib bump — meaning a misspelled directive name still compiles (autocomplete-assisted only), unlike the fully-closed `SandboxToken`.

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

## Behavior System

**Type-safe client-side interactions with zero inline JS.** `.behavior()` emits flat `data-behavior-*` attributes only; one versioned, immutable, ~6KB runtime asset (`dist/fluent-behaviors.<version>.js`, capture-phase document delegation, no per-element binding) executes them. Works under **strict CSP** (per-request nonce + `strict-dynamic`, no `unsafe-eval`, no `unsafe-inline`) and survives any number of htmx swaps/morphs by construction — attributes are server-authoritative, and the listener set never changes.

### The 10 built-in verbs

| Verb             | Options                                                                 | Trigger    | Does |
|------------------|-------------------------------------------------------------------------|------------|------|
| `toggle`         | `{ target: Id \| Id[]; force?; display?; event? }`                      | click      | Toggle the `hidden` class (multi-target; `display` sets `style.display` when shown) |
| `toggleClass`    | `{ target: Id \| Id[]; class; force?; event? }`                         | click      | Toggle any class |
| `remove`         | `{ target: Id \| "@self" \| {closest}; animateOut?; animateOutTimeoutMs?; event? }` | click | Remove the target; `animateOut` waits for `transitionend` with a timeout fallback — cannot hang |
| `clipboard`      | `{ value? \| path?; feedback?: { target?, mode: "text"\|"class", text?, class?, durationMs? } }` | click | Copy (origin-resolved `path` supported) with transient, morph-safe feedback |
| `drawer`         | `{ target: Id; class?; backdrop?; bodyClass?; closeOn?; trapFocus?; focusFirst? }` | click | The composite overlay: open class + backdrop + body scroll-lock + `aria-expanded` + focus management, atomically. At most one open. |
| `onEscape`       | `{ action: "click"\|"remove"\|"hide"; target?; scope?: "self"\|"document" }` | keydown | Escape handling; `scope: "document"` fires with focus anywhere |
| `onClickOutside` | `{ action: "hide"\|"remove"\|"click"; target? }`                        | click      | Dismiss when a click lands outside the carrier |
| `resetOnSuccess` | —                                                                       | htmx lifecycle | `form.reset()` only when the request succeeded (< 300) — a 422 keeps typed values |
| `back`           | —                                                                       | click      | `history.back()`, default-prevented (safe on `<a>`) |
| `focus`          | `{ target: Id }`                                                        | click      | Focus the target |

**Overlap rule** (one blessed path per situation): `drawer` for overlay bundles · `toggle` for simple show/hide · `onClickOutside` for non-overlay dismissal.

### Usage

```typescript
const ids = defineIds(["panel", "banner", "search", "mobile-menu", "menu-backdrop", "cancel-btn"] as const);

Button("Toggle").behavior("toggle", { target: ids.panel })
Button("Fade").behavior("toggleClass", { target: ids.panel, class: "opacity-50" })
Button("×").behavior("remove", { target: { closest: "[role=alert]" } })  // relative target
Button("Copy").behavior("clipboard", {
  path: "/invite/8f3k",                                     // resolved against location.origin
  feedback: { mode: "text", text: "Copied!", durationMs: 1500 },
})
Button("Menu").behavior("drawer", {
  target: ids.mobileMenu,
  backdrop: ids.menuBackdrop,
  bodyClass: "overflow-hidden",
  closeOn: ["escape", "backdrop", "nav"],                   // the default
  trapFocus: true,
  focusFirst: true,
})
Form(/* … */).behavior("onEscape", { action: "click", target: ids.cancelBtn })
Form(/* … */).behavior("resetOnSuccess")                    // reset only on < 300
A("← Back").behavior("back").cursor("pointer")
Button("Go").behavior("focus", { target: ids.search })

// Event override — resolved at emit time (focus→focusin, mouseenter→mouseover):
Button("Hover").behavior("toggle", { target: ids.panel, event: "mouseenter" })

// Compile errors:
Button("x").behavior("togle", { target: ids.panel })   // ❌ unknown verb
Form().behavior("resetOnSuccess", { foo: 1 })          // ❌ void takes no options
Button("x").behavior("toggle", { target: "panel" })    // ❌ raw string where an Id is required
```

### Rendered HTML

Flat, greppable data attributes — no JS strings, no `escapeJs`, plain HTML-attribute escaping:

```html
<button data-behavior="toggle" data-behavior-toggle-target="panel">Toggle</button>
<button data-behavior="drawer"
  data-behavior-drawer-target="mobile-menu"
  data-behavior-drawer-backdrop="menu-backdrop"
  data-behavior-drawer-body-class="overflow-hidden"
  data-behavior-drawer-trap-focus="true">Menu</button>
```

Render-time guards throw in **all** modes (including production): unknown verb, duplicate same-verb on one element, unknown option, option-type mismatch. Silent no-ops are structurally impossible.

### Multiple verbs, dispatch, consumption

`data-behavior` holds ordered verb tokens; all verbs on one element run in declaration order. Dispatch walks carriers innermost-first; a verb that acts **consumes** the event, so clicking a clipboard button inside a clickable row never also toggles the row. Keyboard verbs consume conditionally (an `onEscape` that didn't act lets an outer drawer's Escape close run).

```typescript
Button("+386 40 123 456")
  .behavior("toggleClass", { target: ids.tooltip, class: "tooltip-visible" })
  .behavior("clipboard", { value: "+386 40 123 456" })
// data-behavior="toggleClass clipboard" — both fire, in order
```

The same verb twice on one element throws at render — to bind one verb to two events, wrap one in a child element.

### The runtime asset

The npm package version **is** the grammar + runtime version: the same release renders the attributes and ships `dist/fluent-behaviors.<version>.js` (built-ins asset, immutable-cacheable). The framework layer serves it and loads it with exactly one nonce'd `<script defer src>` in the layout head; the layout stamps `<html data-fluent-behaviors="<version>:<registryHash>">` and the runtime asserts the match (skew = one loud `console.error`; unknown verbs from a newer render skip with one `console.warn` + a `data-behavior-unknown` mark).

```typescript
import { behaviorRuntimeSource, behaviorStamp } from "fluent-html/behaviors";
const { fileName, source } = behaviorRuntimeSource();  // serve with immutable cache headers
Html(…).addAttribute("data-fluent-behaviors", behaviorStamp())
```

Extension verbs are **framework-layer-only** (the `jt:` pack in projects-template): `registerBehavior` (data-only spec + mandatory fixtures) on the server, `defineBehavior` from `fluent-html/behavior-runtime` on the client, compiled once by `buildBehaviorRuntime` (esbuild) into a registry-hashed asset. Apps consume typed verbs — they never register them.

### The escape-hatch ladder

1. A built-in verb (the table above).
2. The native tier — dialogs, popovers, invoker commands (next section).
3. An htmx round-trip (it's an SSR library — most "interactivity" is a swap).
4. Propose a verb to the framework pack (`jt:` namespace, framework PR).
5. (Rare, sign-off-gated) a scoped vanilla-JS island.

There is no inline-JS hatch: `.hxOn()` is gone, `on*` attributes are blocked, and hand-written `data-behavior-*` via raw-attribute APIs is lint-banned.

### Native Interactivity (Popover · Commands · anchor positioning)

For open/close and placement, prefer the platform over hand-written JS — these emit **zero JavaScript** and need **no CSP nonce**. All targets are `Id`-typed.

**Invoker Commands** — a JS-free `<button>` that drives a `<dialog>` or popover:

```typescript
Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog)   // <button command="show-modal" commandfor="dialog">
Button("Done").setCommand("close").setCommandfor(ids.dialog)
```

| `command` | acts on |
| --- | --- |
| `show-modal` / `close` / `request-close` | `<dialog>` |
| `show-popover` / `hide-popover` / `toggle-popover` | popover |
| `--name` | author command (fires a `CommandEvent`) |

**Dialogs** — `setClosedby("any")` gives native light-dismiss (click-outside + Esc); a submit button with `formmethod="dialog"` closes the dialog with its value:

```typescript
Dialog(
  EditForm(),
  Button("Cancel").setType("submit").setFormmethod("dialog"),     // close on submit
).setId(ids.dialog).setClosedby("any")                            // <dialog closedby="any">
Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog) // opens it
```

**Popover** — `setPopover()` defaults to `"auto"` (light-dismiss, Esc, top-layer):

```typescript
Button("Filters").setPopovertarget(ids.panel)            // invoker
Div(/* … */).setId(ids.panel).setPopover()               // popover="auto"
Div(/* … */).setPopover("manual")                        // explicit dismiss only
```

**Anchor positioning** — name an anchor, place a popover against it (reuse one `Id`):

```typescript
const menu = ids.userMenu;
Button("Account").setPopovertarget(menu).anchorName(menu)         // style="anchor-name: --user-menu"
Div(/* … */).setId(menu).setPopover().positionAnchor(menu).positionArea("bottom-span-right")
//   style="position-anchor: --user-menu; position-area: bottom span-right"
```

> **The native/behavior boundary (one blessed path each):** modal dialogs are always native — `setCommand`/`setCommandfor` + `<dialog>` `setClosedby` (the old `openDialog`/`closeDialog` verbs are gone). Non-modal and responsive overlays (mobile off-canvas, pinned sidebars) are the `drawer` verb — `dialog.showModal()` is wrong for them. Autocomplete/dropdown dismissal is `onClickOutside` + `toggle`, **not** `popover="auto"` — auto-popovers light-dismiss when you click back into the anchor input. All three anchor-positioning methods emit **inline style**, not classes: their values are arbitrary custom-idents (`anchorName`/`positionAnchor` take a per-instance `Id`) or the multi-keyword `position-area` grammar — none of which Tailwind v4 has a native utility for, so a class would silently render nothing. `positionArea` stays type-safe via a closed token union (`"bottom-span-right"` → `position-area: bottom span-right`), with a `[…]` arm for the full grammar; nothing needs safelisting.

---

## Fluent Styling API

Fluent HTML provides a **fluent, chainable API** for Tailwind CSS classes, making your styling code more expressive and maintainable.

### Quick Start

```typescript
import { Div, Button } from 'fluent-html';

// Instead of raw Tailwind strings (lint-blocked — they bypass the type system
// and the safelist extractor), write:
Div("Content")
  .p("4")
  .bg("red-500")
  .mx("8")
  .text("white")
  .rounded("lg")
  .shadow("md")
```


### Type-Safe Autocomplete

All fluent methods have **type-safe parameters** with IDE autocomplete for Tailwind values:

```typescript
Div()
  .w("full")              // IDE suggests: "full", "1/2", "screen", "64", etc.
  .bg("red-500")          // IDE suggests: all color-shade combinations
  .rounded("lg")          // IDE suggests: "sm", "md", "lg", "xl", "full", etc.
  .tracking("wide")       // IDE suggests: "tighter", "tight", "normal", "wide", etc.
```

The type system enforces valid Tailwind values — wrong values don't compile. For arbitrary values, use the bracket arms (`.text("[13px]")`) or the `(unit, amount)` overloads (`.w("px", 180)`); for CSS properties Tailwind has no utility for, use `.cssProp()`.

Method names equal Tailwind class prefixes — if you know the class, you know the method. Merged prefixes (`text`, `font`, `border`, `ring`, `shadow`, `flex`, …) accept every value family their prefix does, and the argument discriminates exactly like Tailwind itself: `.text("lg")` → `text-lg`, `.text("red-500")` → `text-red-500`, `.text("center")` → `text-center`.

### Spacing Methods

**Padding:**
```typescript
.p("4")                          // p-4 (all sides)
.px("4")                         // px-4 (horizontal)
.py("4")                         // py-4 (vertical)
.pt("4")                         // pt-4 (also .pb() .pl() .pr())
```

**Margin:**
```typescript
.m("4")                          // m-4 (all sides)
.mx("auto")                      // mx-auto (center horizontally)
.my("4")                         // my-4 (vertical)
.mt("8")                         // mt-8 (also .mb() .ml() .mr())
```

### Color & Typography

**Colors:**
```typescript
.bg("red-500")                   // bg-red-500
.text("gray-700")                // text-gray-700
.border("gray-300")              // border-gray-300
```

**Typography:**
```typescript
.text("xl")                      // text-xl
.text("center")                  // text-center
.font("bold")                    // font-bold (families too: .font("mono"))
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
.flex("col")                     // flex-col
.justify("center")               // justify-center
.items("center")                 // items-center
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
.relative()                      // relative
.absolute()                      // absolute  (also .fixed() .sticky() .static())
.block()                         // block     (also .inline() .inlineFlex() .inlineGrid() .contents())
.z("10")                         // z-10
.opacity("50")                   // opacity-50
.cursor("pointer")               // cursor-pointer
.overflow("hidden")              // overflow-hidden
```

### Variants Are Typed Style Objects

A variant takes an object whose keys are the same canonical style names as the methods — `hover:bg-blue-600` is `.hover({ bg: "blue-600" })`. Keys and values are spell-checked by TypeScript (`opcaity` → "Did you mean 'opacity'?" — two levels deep), so a variant can never silently emit an unprefixed or dead class.

```typescript
Button("Save")
  .px("4").py("2")
  .bg("blue-500")
  .text("white")
  .rounded()
  .hover({ bg: "blue-600", scale: "105" })
  .focus({ ring: "2", outline: "none" })
  .disabled({ opacity: "50", cursor: "not-allowed" })
// → px-4 py-2 bg-blue-500 text-white rounded
//   hover:bg-blue-600 hover:scale-105
//   focus:ring-2 focus:outline-none
//   disabled:opacity-50 disabled:cursor-not-allowed
```

**Tier-1 variants** — the common states and breakpoints are direct methods:

| Category | Methods |
|---|---|
| Interaction | `.hover()` `.focus()` `.focusVisible()` `.focusWithin()` `.active()` |
| Form state | `.disabled()` `.checked()` |
| Theme | `.dark()` |
| Position | `.first()` `.last()` `.odd()` `.even()` |
| Group/peer | `.groupHover()` `.peerChecked()` (pair with `.group()`/`.peer()`) |
| Pseudo-elements | `.before()` `.after()` (add `content: true` to render) |
| Breakpoints | `.sm()` `.md()` `.lg()` `.xl()` `.xl2()` (`xl2` emits `2xl:` — `2xl` isn't an identifier) |

**Value forms** inside the object:

```typescript
Div().hover({
  bg: "blue-600",                       // value utilities — same unions as the methods
  truncate: true,                       // no-arg utilities are boolean flags
  ring: true,                           // optional-value utilities: true = bare form (ring)
  minH: "[180px]",                      // arbitrary values use the [...] arm
  translateY: "-0.5",                   // positional args flatten into keys (gapX, overflowY, …)
  border: ["top", "red-500"],           // multi-arg utilities take readonly tuples
  italic: undefined,                    // undefined and false are skipped
})
```

`undefined`-valued keys make conditionals plain expressions — no wrapper, no lambda:

```typescript
Div().hover({ bg: isActive ? "blue-600" : undefined, italic: isDraft })
```

One key per prefix per object — when one prefix takes two value families (ring width *and* ring color), chain a second call: `.focus({ ring: "2" }).focus({ ring: "blue-300" })`.

### The Long Tail: `.variant(name, styles)`

Everything beyond the tier-1 set goes through the generic form — same object, any `TailwindState | TailwindBreakpoint` name (fully type-safe):

```typescript
Div().variant("data-[state=open]", { rounded: "lg" })
Div().variant("group-focus", { ring: "2" })
Div().variant("has-[:checked]", { bg: "blue-50" })
Div().variant("@sm", { flex: "row" })          // container query (see .containerQuery())
Div().variant("2xl", { px: "16" })             // exact Tailwind spelling of xl2
```

**Supported states** (via `TailwindState`): interaction (`visited`, …), form (`enabled`, `indeterminate`, `required`, `invalid`, `valid`), position (`empty`, `first-of-type`, `last-of-type`, `only`, `only-of-type`), pseudo-elements (`placeholder`, `selection`, `marker`, `file`), group/peer states incl. named scopes (`group-hover/name`), the nine ARIA boolean heads plus `aria-[…]`, `data-[…]`, structural `nth-*`, children `*`/`**`, `not-*` negation, `supports-[…]`, arbitrary `[&>li]` selectors, relational `has-[…]`/`group-has-[…]`/`peer-has-[…]`/`in-[…]`, and the v4 additions (`print`, `motion-reduce`/`safe`, `starting`, `open`, `inert`, `rtl`/`ltr`, …).

**Breakpoints** (via `TailwindBreakpoint`): `sm`–`2xl` plus container-query forms `@3xs`…`@7xl`, `@max-lg`, `@[480px]`, and named scopes `@lg/sidebar` for children of a `.containerQuery()` element.

### Composing Variants

Nest tier-1 names inside the object to stack prefixes — "on hover, at medium screens" is a nested key:

```typescript
Button("Save")
  .bg("blue-500")
  .md({ px: "8", hover: { bg: "blue-700" } })
// → bg-blue-500 md:px-8 md:hover:bg-blue-700

Card()
  .dark({ bg: "gray-900", hover: { bg: "gray-800" } })
// → dark:bg-gray-900 dark:hover:bg-gray-800
```

Reusable variant fragments are plain objects — spread them, and pin extracted consts with `satisfies` (excess-property spell-checking doesn't reach through a plain variable):

```typescript
const glow = { shadow: "lg", ring: "2" } satisfies VariantStyleObject;
Button("Go").hover({ ...glow, bg: "blue-600" })
```

### Real-World Example

```typescript
const card = Div(
  H2("Card Title")
    .text("2xl")
    .font("bold")
    .mb("4"),

  P("Card content goes here...")
    .text("gray-600")
    .mb("6"),

  Div(
    Button("Cancel")
      .px("4")
      .py("2")
      .border()
      .border("gray-300")
      .rounded(),

    Button("Submit")
      .px("4")
      .py("2")
      .bg("blue-500")
      .text("white")
      .rounded()
      .shadow()
  )
    .flex()
    .gap("4")
    .justify("end")
)
  .bg("white")
  .p("6")
  .rounded("xl")
  .shadow("lg")
  .w("full")
  .maxW("md");
```

### Mixing with Traditional Styles

You can freely mix fluent methods with traditional class names:

```typescript
Div()
  .p("4")                              // Typed utility
  .bg("red-500")                       // Typed utility
  .hover({ bg: "red-600" })            // Variant style object
  .cssProp("mask-repeat", "no-repeat") // Arbitrary CSS → [mask-repeat:no-repeat]
  .cssClass("js-hook");                // Non-Tailwind class marker
```

### Type Safety

All methods return the correct type for full IDE autocomplete:

```typescript
Button("Click")
  .p("4")                        // Available on all Tags
  .setType("submit")             // Button-specific method
  .bg("blue-500")                // Available on all Tags
  .toggle("disabled", isLoading);// Boolean attributes — one .toggle() path
```

The fluent API generates standard Tailwind CSS classes. Make sure Tailwind is included in your project. For a complete API reference, see the [styling documentation](https://github.com/your-repo/fluent-html/blob/main/STYLING.md).

### Theming — `defineTheme()`

Define your design tokens **once**. `defineTheme` gives you three things from that one source: typed autocomplete on the fluent methods, the Tailwind v4 `@theme` CSS, and the extractor safelist.

```ts
// theme.ts — the one place your tokens live
import { defineTheme, type ThemeKeys } from "fluent-html";

const tokens = {
  colors:  { brand: "#ff5500", forest: "#2d5016" },
  spacing: { gutter: "1.5rem", bleed: "2.5rem" },
} as const;

export const theme = defineTheme(tokens);

// One line per token family. Written once — it derives from `tokens`, so adding
// a token above needs NO edit here. Required for the typed autocomplete below.
declare module "fluent-html" {
  interface FluentCustomColors  extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
}
```

Now your tokens are first-class on every fluent method — autocompleted, and typo-checked:

```ts
Div().bg("brand").p("gutter")   // ✓ autocompletes; both are your tokens
Div().bg("brnad")               // ✗ compile error — caught at build, not at runtime
Div().bg("blue-500")            // ✓ built-ins still work
Div().bg("[#1a2b3c]")           // ✓ arbitrary values still work
```

Wire the CSS + safelist once — generate a `.css` file in a prebuild step and `@import` it:

```ts
// scripts/build-safelist.ts  (run before your CSS build)
import { writeFileSync } from "node:fs";
import { generateFluentSafelist, globFiles } from "fluent-html-tailwind-extractor";
import { theme } from "./theme";

writeFileSync("./src/fluent-safelist.css",
  generateFluentSafelist(globFiles(["./src/**/*.ts"]), { theme }));
```
```css
/* app.css */
@import "tailwindcss";
@import "./fluent-safelist.css";   /* generated, gitignored */
```
(No Vite? Run `generateFluentSafelist(files, { theme })` in a prebuild script and write the file yourself.)

`defineTheme` takes **design tokens only** (`colors` / `spacing` / `fontSize` / `radius` / `shadow`). Component "presets" (card/button style bundles) are user-land `.apply()` helpers, not `defineTheme`. The themeable unions are **closed** — a typo is a compile error, not an unstyled element at runtime.

> **Why the `declare module` block?** A runtime call can't add to a compile-time type, so the typed-token magic needs one module augmentation. It's written **once** and *derives* its keys from `tokens` via `ThemeKeys<typeof tokens, "…">` — add tokens freely, never touch it again. Skip the block and tokens still work at runtime (CSS/safelist), you just lose autocomplete + typo-checking.

---

## XSS Protection

Fluent HTML **automatically escapes** all text content and attribute values, so
attacker-controlled data can never break out of a text node or a quoted attribute.
On top of that, URL-valued attributes set through the typed setters
(`setHref`/`setSrc`/`setAction`/…) are **scheme-sanitized** — a `javascript:` or
hostile `data:` URL is neutralized before it reaches the output. No configuration
needed.

Two deliberate bypasses remain your responsibility: `Raw(...)` emits HTML verbatim,
and the untyped `addAttribute(...)` escape hatch is not scheme-sanitized (see
[Raw HTML](#raw-html-bypass-escaping) and [URL Scheme Sanitization](#url-scheme-sanitization)).

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

### URL Scheme Sanitization

HTML-escaping stops attribute *breakout*, but it does not stop a `javascript:` URL
from executing when the link is clicked, or a `data:text/html` URL from loading an
attacker-authored document. So the typed URL setters — `setHref`, `setSrc`,
`setAction`, `setFormaction`, `setData`, `setPoster`, `setCite` — also run their
value through scheme sanitization:

```typescript
render(A("Profile").setHref(user.website));
// user.website = "javascript:steal(cookies)"  →  <a href="about:blank">Profile</a>
// user.website = "https://example.com"         →  <a href="https://example.com">Profile</a>
```

- **Blocked** (rewritten to `about:blank`): `javascript:`, `vbscript:`, and scriptable
  `data:` URLs (`data:text/html`, `data:image/svg+xml`) — including obfuscated forms
  (`JaVaScript:`, `java&Tab;script:`, leading control characters).
- **Allowed** (byte-identical): relative URLs, fragments (`#id`), query refs,
  protocol-relative `//host`, `http(s)`, `mailto:`, `tel:`, and non-scriptable
  `data:` media (`data:image/png`, `data:audio/*`, `data:video/*`, `data:font/*`).

The sanitizer is exported as `sanitizeUrl(url)` if you need it directly. The one
opt-out is the untyped `addAttribute("href", value)` bag, which is emitted verbatim
(after breakout-escaping) — reach for it deliberately in the rare case you truly need
a `javascript:` URL.

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
// Text and attribute values from user data are escaped automatically
function UserCard(user: { name: string; bio: string }): View {
  return Div(
    H2(user.name),      // ← Escaped automatically
    P(user.bio),        // ← Escaped automatically
  ).cssClass("user-card");
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
  .rounded("lg").shadow("lg")
  .hover({ shadow: "xl" })
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

`Input()` accepts an optional type argument for type-safe `min`/`max`/`step`:

```typescript
// Generic factory — min/max/step types match the input type
Input("number").setMin(0).setMax(100).setStep(5)     // min/max: number
Input("date").setMin("2024-01-01")                    // min/max: string
Input("range").setMin(0).setMax(10).setStep(0.5)     // min/max: number
Input("email")                                        // no min/max/step available
Input()                                               // all types allowed

// Text input with validation
Input()
  .setType("email")
  .setName("email")
  .setPlaceholder("Enter your email")
  .setPattern("[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$")
  .setAutocomplete("email")
  .toggle("required")

// Number input with constraints
Input("number")
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

#### Form-control completeness

```typescript
// File inputs — array overload joins with "," (ergonomics + autocomplete; `accept`
// is open by spec, so this does NOT type-check each token)
Input("file").setName("avatar").setAccept(["image/png", "image/jpeg", "image/webp"]);

// dirname — submits the entered text's resolved direction under a companion field
// (convention `${name}.dir`); pass a field name, not a direction value
Textarea().setName("comment").setDirname("comment.dir");   // server gets comment.dir=ltr|rtl

// Structured autocomplete across Input/Textarea/Select — the full WHATWG token set
// with shipping/billing prefixes and a webauthn suffix. IDE autocomplete + hover docs
// only; the open tail means typos still compile (not typo-rejection)
Input("text").setName("card").setAutocomplete("cc-number");
Input("text").setName("zip").setAutocomplete("shipping postal-code");
Select(/* options */).setName("country").setAutocomplete("country");

// Per-submit-button form-association overrides (parity with <form>). FormEnctype is
// CLOSED — a typo here IS a compile error (the one typo-rejecting union of the set)
Button("Upload").setType("submit").setFormaction("/upload")
  .setFormenctype("multipart/form-data").setFormtarget("_blank");

// <output for> is a space-separated id SET — variadic, Id-typed
Output().setFor(ids.a, ids.b).setName("result");   // <output for="a b">
```

Exported unions for app-side prop typing: `AutofillField` / `AddressField` / `AddressPurpose` (autocomplete DX) and `FormEnctype` (closed, typo-rejecting).

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
).w("full").cssProp("border-collapse", "collapse")
```

#### Accessible tables — `scope` vs `headers`

For simple, regular tables `setScope` is enough — a header governs its row or column. For complex tables (irregular or spanning headers), associate each data cell with its header cells by id: use the **same** `defineIds` token on the header's `.setId(...)` and the cell's `.setHeaders(...)`, so a typo is a compile error against the registry:

```typescript
const ids = defineIds(["price-col", "q3-row"] as const);

Th("Price (USD)").setId(ids.priceCol).setScope("col").setAbbr("Price");  // abbr = condensed label for AT
Td("$42").setHeaders(ids.priceCol, ids.q3Row);                          // <td headers="price-col q3-row">
```

`setHeaders` overrides; `addHeaders` appends (duplicate ids collapsed); an empty call clears the attribute (no dead `headers=""`). `setAbbr` is `th`-only. Pass the raw id token (or an `Id`), **not** a `#selector`, and don't also use `addAttribute("headers", …)` (it double-emits). The `scope` value type is exported as `TableCellScope` for typing component props.

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
    .toggle("default"),
  "Your browser does not support video."
)
  .toggle("controls")
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

All SVG shape elements extend `SvgShapeTag` with shared methods: `setFill()`, `setStroke()`, `setStrokeWidth()`, `setStrokeLinecap()`, `setStrokeLinejoin()`, `setStrokeDasharray()`, `setStrokeDashoffset()`, `setStrokeOpacity()`, `setOpacity()`, `setFilter()`, `setTransform()`.

```typescript
// Circle with typed setters
Svg(
  Circle().setCx("50").setCy("50").setR("40")
    .setFill("none").setStroke("blue").setStrokeWidth("2"),

  Rect().setX("10").setY("10").setWidth("80").setHeight("80")
    .setRx("5").setFill("red-500").setOpacity("0.5"),

  Path().setD("M10 80 C40 10, 65 10, 95 80").setFill("none").setStroke("black"),

  Line().setX1("0").setY1("0").setX2("100").setY2("100").setStroke("gray"),

  Ellipse().setCx("50").setCy("50").setRx("40").setRy("20").setFill("green"),

  Polygon().setPoints("50,5 20,99 95,39 5,39 80,99").setFill("purple"),

  Text("Hello SVG").setX("10").setY("50")
    .setTextAnchor("start").setFontSize("16").setFontFamily("sans-serif"),

  Use().setHref("#my-symbol").setX("0").setY("0"),
)
```

> **Note:** `setOpacity()` sets the SVG `opacity` presentation attribute. It routes through an internal `_sk` field so it doesn't collide with Tailwind's `.opacity()` styling method.

Gradients, clipping, masking, and filters have typed builders too — `LinearGradient`/`RadialGradient` + `Stop`, `ClipPath`, `Mask`, and `Filter` + `FeGaussianBlur` — so icons and effects are typed Views, never `Raw("<svg…>")` strings:

```typescript
Svg(
  Defs(
    LinearGradient(
      Stop().setOffset("0%").setStopColor("var(--brand)"),
      Stop().setOffset("100%").setStopColor("var(--forest)"),
    ).setId("g").setX1("0").setY1("0").setX2("1").setY2("1"),
  ),
  Rect().setWidth("100").setHeight("100").setFill("url(#g)"),
)
```

### Interactive Elements

```typescript
// Details/Summary (accordion)
Details(
  Summary("Click to expand"),
  P("Hidden content revealed when opened."),
).toggle("open")

// Dialog (modal) — zero JS via Invoker Commands + closedby
const modal = createId("confirm-modal");
Dialog(
  H2("Confirm Action"),
  P("Are you sure you want to proceed?"),
  Button("Cancel").setCommand("close").setCommandfor(modal),
  Button("Confirm").bg("blue-500").text("white"),
).setId(modal).setClosedby("any")

// Progress and Meter
Progress().setValue(70).setMax(100)
Meter().setValue(0.7).setMin(0).setMax(1).setLow(0.3).setHigh(0.8).setOptimum(0.5)
```

### Edit & quotation attributes

`Ins`/`Del` carry `setCite` (URL of the change rationale) and `setDatetime`
(when the edit happened, free-text like `Time`); `Q`/`Blockquote` carry
`setCite` (URL of the quoted source):

```typescript
Ins("added clause").setCite("/audit/12").setDatetime("2026-06-29T10:00")
Del("removed clause").setDatetime("2026-06-29")
Blockquote(P(article.excerpt)).setCite(article.url)
Q(snippet.text).setCite(snippet.sourceUrl)
```

`setCite` is scheme-sanitized like `setHref`/`setSrc` (a `javascript:`/`data:text/html`
value is neutralized to `about:blank`), in addition to being HTML-escaped on render.

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
      Span("Admin").cssClass("badge badge-red")
    ),
    IfThen(user.isPremium, () =>
      Span("Premium").cssClass("badge badge-gold")
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
      Img().setSrc(src).setAlt(props.title).cssClass("card-img")
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
    pending:  () => Span("Pending").text("yellow-600"),
    approved: () => Span("Approved").text("green-600"),
    rejected: () => Span("Rejected").text("red-600"),
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
  Span(`Item ${i}`).inlineBlock().p("2")
))

// Range iteration (start to end-1)
Div(ForEach(1, 6, i =>
  Button(`Page ${i}`).px("3").py("1")
))

// Repeat n times
Div(Repeat(5, () => Span("⭐")))
```

> **Note:** The legacy `ForEach1`, `ForEach2`, `ForEach3` aliases have been removed. Use `ForEach` with the appropriate overload.

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
  rules: fluentHtml.configs.recommended.rules
}];
```

### Style Overwrite Prevention

The plugin catches the most common fluent-html mistake — calling `.setClass()` after fluent methods, which silently **replaces** all previously set classes:

```typescript
// 🚨 error: setClass after fluent modifier — bg("green-700") and p("4") are lost
Div().bg("green-700").p("4").setClass("bg-red-500 flex")

// ✅ auto-fixed — fluent methods append safely
Div().bg("green-700").p("4").bg("red-500").flex()
```

It also catches `.setClass()` inside `.when()` / `.apply()` callbacks and multiple `.setClass()` calls in the same chain — both of which silently discard styles.

### Key Rules

| Rule | Severity | Fix | What it catches |
|------|----------|-----|-----------------|
| `no-tailwind-in-raw-class` | error | ✅ | Tailwind utilities in raw class strings — autofixes to the fluent chain (incl. variant objects for variant tokens) |
| `no-dynamic-class-argument` | error | — | Non-literal `.addClass()`/`.setClass()`/`.cssClass()` args — invisible to the safelist extractor |
| `no-tailwind-in-cssclass` | error | ✅ | Tailwind utilities mis-filed in the `.cssClass()` non-Tailwind marker |
| `no-setclass-after-fluent-modifier` | error | — | `.setClass()` after fluent methods overwrites styles |
| `no-multiple-setclass-in-chain` | error | — | Multiple `.setClass()` calls — earlier ones are lost |
| `no-setclass-in-when-apply-callback` | error | — | `.setClass()` in callbacks overwrites outer styles |
| `no-innerhtml-swap` | error | ✅ | `innerHTML` swap loses target element id |
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

**The problem:** Tailwind scans source files for class names, but fluent methods like `.bg("red-500")` don't look like `bg-red-500` — so Tailwind won't generate the CSS.

```bash
npm install fluent-html-tailwind-extractor --save-dev
```

fluent classes never appear as literal text in source, so Tailwind v4's auto-detection can't see them. A prebuild step (`generateFluentSafelist`) writes a `@source inline(...)` file your CSS imports. See **[TAILWIND-SETUP.md](TAILWIND-SETUP.md)** for the full v4 wiring.

See the [full documentation](https://github.com/JT-Digital-d-o-o/fluent-html-tailwind-extractor) for advanced configuration.

---

## API Reference

Everything is fully typed, so your editor's autocomplete is the fastest reference. For the complete surface:

- **Styling** — [FLUENT-STYLING.md](FLUENT-STYLING.md): every chainable Tailwind method, object-form variants (`.hover({…})`/`.variant()`), and `defineTheme()`.
- **Tailwind v4 setup** — [TAILWIND-SETUP.md](TAILWIND-SETUP.md).
- **Generated TypeDoc** — run `npm run docs` for element factories, control-flow combinators, and HTMX/route/id helpers with full signatures.

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