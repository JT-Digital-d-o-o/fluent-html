# Changelog

All notable changes to Fluent HTML will be documented in this file.

## [5.11.0] - Type-Safe Routes & Contexts

### ✨ New Features

#### Typed Route Parameters

`defineRoutes()` now supports typed path parameters — `string`, `number`, and `uuid`. The type is enforced at compile time and validated at resolve time:

```typescript
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",  path: "/" },
  detail: { method: "get",  path: "/:id", params: { id: "number" } as const },
  bySlug: { method: "get",  path: "/:slug", params: { slug: "string" } as const },
  byUuid: { method: "get",  path: "/:uuid", params: { uuid: "uuid" } as const },
} as const);

userRoutes.detail.resolve({ id: 42 })      // "/users/42" — id must be number
userRoutes.bySlug.resolve({ slug: "hello" }) // "/users/hello" — slug must be string
```

#### Required Context (`createRequiredContext`)

New `createRequiredContext()` for values that **must** have an active scope — throws if accessed outside one. Use for values like request-specific auth where a missing scope is always a bug:

```typescript
const AuthCtx = createRequiredContext<User>("AuthCtx");

function handler(user: User) {
  using _ = AuthCtx.scope(user);
  return Page();
}

function Page() {
  const user = AuthCtx.current;  // User — throws if no scope active
  return Div(`Hello, ${user.name}`);
}
```

Compare with `createContext(defaultValue)` which returns the default silently.

#### Strict `HxSwap` Type

`HxSwap` is now a strict union type — invalid swap values are compile errors instead of being silently accepted.

---

## [5.10.0] - Performance, Inputs & Styling

### ✨ New Features

#### Generic `Input()` Factory

`Input()` now accepts an optional type argument that locks `min`, `max`, and `step` to the correct types:

```typescript
Input("number").setMin(0).setMax(100).setStep(5)   // min/max: number
Input("date").setMin("2024-01-01")                   // min/max: string
Input("range").setMin(0).setMax(10).setStep(0.5)    // min/max: number
Input("email")                                       // no min/max/step
Input()                                              // all types allowed
```

#### 29 New Tailwind Fluent Methods

Added fluent methods for gradients, filters, typography, and more:

- **Gradients:** `gradientTo(direction)`, `from(color)`, `via(color)`, `to(color)`
- **Filters:** `blur()`, `brightness()`, `contrast()`, `grayscale()`, `hueRotate()`, `invert()`, `saturate()`, `sepia()` — plus `backdrop*` variants for all
- **Group/Peer:** `group(name?)`, `peer(name?)` — support named variants like `group/form`
- **Typography:** `fontFamily()`, `antialiased()`, `tabularNums()`, `underlineOffset()`, `lineClamp()`, `breakAll()`, `listStyleType()`, `listStylePosition()`
- **Colors:** `shadowColor()`
- **Layout:** `gridAutoFlow()`, `gridAutoRows()`, `gridAutoCols()`, `placeContent()`, `placeItems()`, `placeSelf()`
- **Other:** `ease()`, `skewX()`, `skewY()`, `willChange()`, `overscroll()`, `resize()`, `neg(cls)`

#### Arbitrary Value Unit Overloads

Sizing, spacing, and position methods now accept a `(unit, amount)` overload for arbitrary values:

```typescript
Div().w("px", 180)        // → w-[180px]
Div().h("rem", 2.5)       // → h-[2.5rem]
Div().minH("vh", 50)      // → min-h-[50vh]
Div().padding("px", 12)   // → p-[12px]
Div().top("em", 1.5)      // → top-[1.5em]
```

Units: `px`, `rem`, `em`, `%`, `vh`, `vw`, `dvh`, `svh`, `lvh`. Available on `w`, `h`, `minW`, `maxW`, `minH`, `maxH`, `padding`, `margin`, `gap`, `top`, `right`, `bottom`, `left`, `inset`.

#### Recursion Schemes

Three new recursion schemes for View tree processing, complementing the existing `foldView`:

- **`paraView(alg, view)`** — Paramorphism: like `foldView`, but the `tag` handler also receives the original subtree
- **`unfoldView(coalg, seed)`** — Anamorphism: builds a View tree by recursively expanding a seed
- **`hyloView(coalg, alg, seed)`** — Hylomorphism: fused unfold-then-fold in a single pass without intermediate allocation

Built-in algebras: `ariaDescribeAlgebra` (paramorphism for accessibility audit). Built-in coalgebras: `tocCoalgebra`, `linkedTocCoalgebra` (generate `<ul>/<li>` TOC from flat heading list).

See [functional-patterns.md](functional-patterns.md) for full documentation.

### 🔧 Improvements

#### Render Performance

Optimized the render path: **+47% throughput** on flat pages, **+20%** on realistic nested pages. No API changes.

#### SVG Improvements

- `setStrokeWidth()` added to `SvgTag` (not just shape elements)
- `setWidth()`, `setHeight()`, `setStrokeWidth()` now accept `string | number` on `SvgTag`, `RectTag`, and `ForeignObjectTag`
- `setOpacity()` added to `SvgShapeTag`
- `G()` now returns `SvgShapeTag` (gains fill, stroke, transform methods)

---

## [5.9.1]

### 🔧 Improvements

- Updated codebase analysis: API Design now 10/10 (all dimensions at 10/10)

---

## [5.9.0] - Strict Types & API Cleanup

### 🚀 Breaking Changes

#### Strict Tailwind Types

The `Autocomplete<T> = T | (string & {})` escape hatch has been replaced with strict union types on all Tailwind method signatures. Wrong values don't compile. For arbitrary Tailwind values (e.g., `p-[37px]`), use `addClass()`.

#### `.toggle()` Only

`setToggles()` has been replaced by `.toggle()`:

```typescript
Input().toggle("required").toggle("disabled")
Input().toggle("required", isRequired)  // conditional
```

#### `Match()` Only

The deprecated `SwitchCase` export has been replaced by `Match()`.

#### Void Elements Reject Children

Void element factories (`Input`, `Img`, `Hr`, `Br`, `Source`, `Track`, `Col`, `Embed`, `Area`, `Wbr`, `Meta`, `Link`, `Base`) now accept zero arguments. Children passed to void elements are silently ignored at render time.

### ✨ New Features

#### Named Tailwind Types

Extracted 5 named types for better consumer DX:
- `TailwindPosition` — `"static" | "fixed" | "absolute" | "relative" | "sticky"`
- `TailwindTextAlign` — `"left" | "center" | "right" | "justify"`
- `TailwindFlexDirection` — `"row" | "col" | "row-reverse" | "col-reverse"`
- `TailwindJustifyContent` — `"start" | "end" | "center" | "between" | "around" | "evenly"`
- `TailwindAlignItems` — `"start" | "end" | "center" | "baseline" | "stretch"`

All types re-exported from `core/index.ts`.

#### Typed SVG Attribute Setters

All SVG elements now have typed tag classes with fluent attribute setters:

- **`SvgShapeTag`** (shared base) — `setFill()`, `setStroke()`, `setStrokeWidth()`, `setStrokeLinecap()`, `setStrokeLinejoin()`, `setStrokeDasharray()`, `setSvgOpacity()`, `setTransform()`
- **`CircleTag`** — `setCx()`, `setCy()`, `setR()`
- **`RectTag`** — `setX()`, `setY()`, `setWidth()`, `setHeight()`, `setRx()`, `setRy()`
- **`LineTag`** — `setX1()`, `setY1()`, `setX2()`, `setY2()`
- **`PathTag`** — `setD()`, `setFillRule()`, `setClipRule()`
- **`EllipseTag`** — `setCx()`, `setCy()`, `setRx()`, `setRy()`
- **`PolygonTag`** / **`PolylineTag`** — `setPoints()`
- **`SvgTextTag`** — `setX()`, `setY()`, `setDx()`, `setDy()`, `setTextAnchor()`, `setDominantBaseline()`, `setFontSize()`, `setFontFamily()`
- **`TspanTag`** — `setX()`, `setY()`, `setDx()`, `setDy()`
- **`UseTag`** — `setHref()`, `setX()`, `setY()`, `setWidth()`, `setHeight()`

> `setSvgOpacity()` is used instead of `setOpacity()` to avoid conflict with Tailwind's `.opacity()`.

---

## [6.0.0] - Greenfield v6

A greenfield, v4-native, instruction-set rewrite of the contract for new projects. Beyond the HTMX 4 migration, v6 reworks the everyday authoring surface (P3) and the keeper primitives (P4): one `.toggle()` boolean path, typed ARIA, complete/consistent setters, layout shortcuts, `.overlay()`, first-class control-flow/document APIs, typed `Form<T>` binding, native dialog behaviors, full SVG coverage, and `.htmxIndicator()`.

### 🚀 Breaking Changes

#### Boolean attributes — `.toggle()` only (P3)

Every named boolean setter is **removed** — `setChecked`, `setDisabled`, `setReadonly`, `setMultiple`, `setAutofocus`, `setSelected`, `setOpen`, `setNovalidate`, `setControls`, `setAutoplay`, `setLoop`, `setMuted`, `setPlaysinline`, `setAsync`, `setDefer`, `setNomodule`, `setAllowfullscreen`, `setDefault`. Use `.toggle("name")`, which renders the attribute **bare** — fixing the old `checked="false"` → browser-sees-checked bug. `BooleanAttribute` is now a closed union, so a typo is a compile error.

```typescript
Input().setChecked()          // ✗ removed
Input().toggle("checked")     // ✓ → <input checked>
Button().toggle("disabled", isLoading)
```

#### Setter renames + fixes (P3)

No aliases (greenfield): `setCrossorigin` → `setCrossOrigin` (now also accepts `""` for preconnect / Google Fonts), `setReferrerpolicy` → `setReferrerPolicy`, `setSvgOpacity` → `setOpacity`. `setHttpEquiv` now emits the real `http-equiv` attribute (was the silently-dead `httpEquiv`).

#### Position/display passthroughs → shortcuts (P3)

`.position(v)`, `.display(v)`, and `.flex1()` are removed in favor of dedicated zero-arg shortcuts: `.absolute()`/`.relative()`/`.fixed()`/`.sticky()`/`.static()`, `.block()`/`.inline()`/`.inlineBlock()`/`.inlineFlex()`/`.inlineGrid()`/`.contents()`, and `.flexShorthand("1"|"auto"|"initial"|"none")`.

#### `formFor` → `Form<T>(state?, build)` (P4)

The `formFor<T>()` factory is replaced by the `Form<T>` HOF, which additionally auto-wires values/errors from `state`:

```typescript
Form<CreateUserReq>({ values, errors }, (f) => [
  f.input("email", "email"),   // value wired from state; name typed to keyof T
  f.error("email"),            // error <span> from state.errors
])
```

#### `Overlay()` → `.overlay()` (P3)

The `Overlay(content, overlay, position)` function is replaced by the `Tag.prototype.overlay(position?, ...content)` method (works on void elements, e.g. `Img().overlay("bottom-right", Badge("3"))`).

#### HTMX 4 Compatibility

Updated the HTMX integration from v2 to v4. This is a major update that aligns with htmx 4's new defaults and removed features.

**Removed attributes:**
- `selectOob` — removed from htmx 4
- `params` — removed from htmx 4
- `prompt` — removed from htmx 4
- `disinherit` / `inherit` — htmx 4 no longer inherits by default; use `:inherited` modifier instead
- `history` / `historyElt` — removed from htmx 4
- `request` — replaced by per-element `config`
- `ext` — extensions are now configured globally via `HtmxConfig()`

**Renamed attributes:**
- `disabledElt` → `disable` — aligns with htmx 4 naming
- `disable` (boolean) → `ignore` — `hx-disable` is now `hx-ignore` in htmx 4

**Removed response helpers:**
- `triggerAfterSwap()` / `triggerAfterSettle()` — removed from htmx 4's `HxResponse`

### ✨ New Features

#### Type-Safe Routes (`defineRoutes`)

New `defineRoutes()` function for compile-time-safe HTMX endpoints:

```typescript
// Shared prefix avoids path repetition
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  delete: { method: "delete", path: "/:id" },
} as const);

// Views — method is locked, params are required, typos are compile errors
Button("Load").setHtmx(userRoutes.list())
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))

// Controllers — single-sourced paths
server.get(userRoutes.list.path, handler)

// Resolved URLs for redirects, links, etc.
reply.redirect(userRoutes.delete.resolve({ id: user.id }))
```

Path parameters (`:id`) are extracted at the type level and required at call time. Routes expose `.method`, `.path`, and `.resolve()` for server-side use.

#### Query Parameters on Routes

Routes now accept query parameters on both the callable and `.resolve()`. Nullish values are silently skipped:

```typescript
// resolve() with query params
userRoutes.list.resolve({ page: "2", sort: "name" })                       // "/users?page=2&sort=name"
userRoutes.delete.resolve({ id: user.id }, { tab: "posts" })               // "/users/42?tab=posts"
userRoutes.list.resolve({ page: "1", filter: undefined })                   // "/users?page=1"

// HTMX calls with query params
Button("Page 2").setHtmx(userRoutes.list({ query: { page: "2" } }))
```

Supports `string`, `number`, and `boolean` values. Keys and values are properly encoded via `encodeURIComponent`.

#### Scoped Context (`createContext`)

New `createContext()` for implicit, request-safe values without prop drilling. Uses TC39 Explicit Resource Management (`using`) for automatic cleanup:

```typescript
const ThemeCtx = createContext<"light" | "dark">("light");

function Page(theme: "light" | "dark") {
  using _ = ThemeCtx.scope(theme);
  return Div(Header(), Content());
}

function Header() {
  const theme = ThemeCtx.current;  // reads innermost scope
  return Nav().background(theme === "dark" ? "gray-900" : "white");
}
```

Stack-based: nested `scope()` calls compose safely, disposal pops automatically.

#### Morph Swap Strategies

New swap styles for DOM-preserving morphs:
- `outerMorph` — morph the target element itself (preserves focus, scroll, animations)
- `innerMorph` — morph the target's children

Short swap aliases: `before`, `after`, `prepend`, `append`.

#### Partial Multi-Swap (`Partial`)

New `Partial()` helper replaces OOB swaps with htmx 4's `<hx-partial>` element:

```typescript
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
)
```

`OOB()` and `withOOB()` are now deprecated.

#### Global HTMX Config (`HtmxConfig`)

New `HtmxConfig()` helper for type-safe global htmx configuration via `<meta>` tag:

```typescript
Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
    implicitInheritance: true,
  }),
)
```

#### Per-Element Config

New `config` option replaces the removed `hx-request` attribute:

```typescript
Button("Upload").hxPost("/upload", { config: { timeout: 120000 } })
```

#### Status-Code Routing

Route HTMX responses to different targets based on HTTP status codes:

```typescript
Form().hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
    "5xx": { swap: "none" },
  }
})
```

#### Preload & Optimistic UI

- `preload` — prefetch responses on hover before click
- `optimistic` — show expected content before server responds

#### Typed accessibility setters (P3)

`setRole(AriaRole)`, `setTabindex(number)`, `setTitle(string)`, and a retyped `setAria(AriaAttrs)` with closed `AriaAttributeName` keys + boolean/tristate values. `setAria({ haspopup: true })` now emits the correct `aria-haspopup` (was the mangled `aria-has-popup`).

#### Expanded element setters + `_sk` tuple (P3)

`setInputmode` (Input/Textarea), `setHreflang` (Link/Anchor), `setCapture` (Input), SVG `setStrokeDashoffset`/`setStrokeOpacity`, and an optional `OptionTag.setValue()`. Internally, `_sk` schema keys gained a `[prop, attr]` tuple form so a JS field can emit a differently-named attribute (e.g. `httpEquiv` → `http-equiv`).

#### Negative transforms + layout shortcuts (P3)

`.translate`/`.rotate`/`.skewX`/`.skewY` accept negatives and emit them correctly (`-translate-y-1`, not the dropped `translate-y--1`). Plus the position/display shortcuts and `.flexShorthand()` noted in Breaking Changes.

#### Control-flow & document APIs (P3)

- `ForEachElse(items, renderItem, emptyView)` — list with an empty fallback.
- `Tag.whenElse(cond|value, then, else)` — two-branch modifier (mirrors `IfThenElse`, not truthiness — `""`/`0` take the `then` branch).
- `Document(...)` / `Doctype()` — a full document that emits `<!DOCTYPE html>` (`DocumentTag extends HtmlTag`, chainable); plain `HTML(...)` stays byte-identical.
- `.hxOn(event, js)` — typed one-off `hx-on:*` handler (event validated, js attribute-escaped).

#### `.overlay()` + type-only exports (P3)

SwiftUI-style `.overlay()` (see Breaking Changes). The 15 HTMX/`Id` type re-exports are now `export type` — TS1205-safe under `verbatimModuleSyntax`.

#### Typed form binding — `Form<T>` (P4)

`Form<T>(state?, build)` (see Breaking Changes), with `FormState<T>`/`FormBinding<T>`/`ErrorBag<T>` types, value/error auto-wiring (including `<select>` selected state), and `FormTag.multipart()`.

#### Native dialog behaviors + behavior widening (P4)

- `behavior("openDialog"/"closeDialog", { target })` — call native `<dialog>.showModal()`/`.close()` (free backdrop / Esc / focus-trap / top-layer).
- `toggle`/`toggleClass`/`remove` gained `event?`, `force?`, and `animateOut?`.
- New `formResetOnSwap` / `dismissOnEscape` behaviors.

#### Complete SVG coverage (P4)

Typed container builders — `LinearGradient`/`RadialGradient`/`Stop`, `ClipPath`, `Mask`, `Filter`/`FeGaussianBlur` — plus the missing stroke setters, so icons and effects are typed Views instead of `Raw("<svg…>")` strings.

#### `.htmxIndicator()` (P4)

Sanctioned method emitting the library-known `htmx-indicator` class, recognised by the Tailwind extractor and ESLint (unlike a raw `.setClass("htmx-indicator")`).

#### New & updated ESLint rules

`prefer-toggle` (boolean `addAttribute` → `.toggle()`), `no-removed-v4-utilities`, `no-raw-icon-string`, and an extended `prefer-set-method` (drops the removed boolean setters; flags `aria-*`/`data-*`/`style`/role/title/tabindex).

---

## [5.8.1]

### 🔧 Improvements

#### Type Safety Improvements

- **Literal string unions** — replaced bare `string` types with specific literal unions where only certain values are valid
- **Branded `Id` type** — prevents mixing up different ID types at compile time
- **Type guards** — `isTag()` and `isRawString()` for safe runtime type narrowing
- **Constrained `.toggle()`** — now accepts only valid `BooleanAttribute` names

---

## [5.8.0]

### 🔧 Improvements

#### Test Suite Migration

- Migrated entire test suite from custom test runner to `node:test` (built-in Node.js test runner)
- All tests now run with `node --test` — no external test framework needed

#### Code Quality

- Refactored `buildHtmx` to data-driven architecture, eliminating repetitive conditional branches
- Extracted `resolveSelector` utility for consistent ID/selector handling
- Removed deprecated `ForEach1`, `ForEach2`, `ForEach3` aliases
- Output target updated to ES2020 with ESM modules

---

## [5.7.1]

### ✨ New Features

#### Variadic `render()`

`render()` now accepts variadic arguments, making multi-element responses cleaner:

```typescript
render(Partial(ids.list, items), Partial(ids.count, count))
```

#### New ESLint Rules

Six new rules added to the `fluent-html` ESLint plugin:

- **`no-setclass-in-when-apply-callback`** — prevents `setClass()` inside `.when()` / `.apply()` callbacks (overwrites earlier classes)
- **`prefer-variadic-children`** — suggests `Div(a, b)` over `Div([a, b])`
- **`no-conditional-in-setclass`** — flags template literals/ternaries in `setClass()`; suggests `.setClasses()` or `.when()`
- **`no-innerhtml-swap`** — prevents `swap: "innerHTML"` (loses target ID); auto-fixes to `"outerHTML"`
- **`prefer-set-method`** — suggests `.setType("submit")` over `.addAttribute("type", "submit")`; auto-fixable
- **`no-raw-ids`** — flags hardcoded `.setId("string")` and `target: "#string"`; suggests `defineIds()`

### 🔧 Improvements

- `no-known-modifiers-in-setclass` now also checks `addClass()` calls (skips pseudo-class prefixed classes like `hover:`)
- `no-setclass-after-fluent-modifier` recognizes `when()` and `apply()` as fluent modifiers

---

## [5.7.0]

### ✨ New Features

#### Conditional Modifier (`.when()`)

Conditionally apply modifications to a tag without breaking the chain:

```typescript
Button("Save")
  .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
  .when(isPrimary, t => t.addClass("bg-blue-500 text-white"))
```

#### Composable Modifier (`.apply()`)

Apply reusable modifier functions for consistent styling patterns:

```typescript
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");

Div("Warning").apply(card, danger)
```

---

## [5.6.0]

### 🔧 Improvements

- Documentation updates across README, AI instructions, and styling guides to reflect variadic children as the recommended pattern
- Removed deprecated array-only iteration helpers

---

## [5.5.0]

### ✨ New Features

#### Variadic Children

Element constructors now accept **variadic children** instead of requiring an array:

```typescript
// Before (array required for multiple children)
Div([H1("Title"), P("Body")])

// After (variadic — no array needed)
Div(H1("Title"), P("Body"))
```

The array form still works but variadic is now the recommended style. Use arrays only when passing a dynamic `View[]` variable (e.g., from `ForEach` or `.map()`).

#### HTMX Shorthand Methods

New shorthand methods on all tags for the most common HTMX operations:

```typescript
// Before — always needed the hx() wrapper
Button("Load").setHtmx(hx("/api/items"))
Button("Save").setHtmx(hx("/api/save", { method: "post", target: "#result" }))

// After — shorthand methods with the HTTP method baked in
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: "#result" })
Button("Update").hxPut("/api/item/1")
Button("Patch").hxPatch("/api/item/1")
Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" })
```

#### setHtmx Overloads

`setHtmx` now accepts an endpoint string and options directly, in addition to a pre-built HTMX object:

```typescript
// New — inline args (method defaults to GET)
Button("Load").setHtmx("/api/items")
Button("Save").setHtmx("/api/save", { method: "post", target: "#result" })

// Still works — pre-built hx() object
Button("Load").setHtmx(hx("/api/items"))
```

#### HxOptions Type

New exported `HxOptions` type derived from the `HTMX` interface. Eliminates duplication between the interface and the `hx()` function signature:

```typescript
import type { HxOptions } from 'fluent-html';

// HxOptions = Partial<Omit<HTMX, 'endpoint' | 'method' | 'target'>>
//           & { method?: HxHttpMethod; target?: HxTarget | Id }
```

#### Nullable Value Overloads for IfThen / IfThenElse

`IfThen` and `IfThenElse` now accept a nullable value (`T | null | undefined`) instead of a boolean. When the value is non-null, it is passed into the callback with its type narrowed to `T`:

```typescript
const user: User | null = getUser();

// Before — requires !! and !
IfThen(!!user, () => Span(`Welcome, ${user!.name}`))

// After — type-safe, no assertions needed
IfThen(user, (u) => Span(`Welcome, ${u.name}`))

// Works with IfThenElse too
IfThenElse(user, (u) => Span(`Welcome, ${u.name}`), () => A("Login").setHref("/login"))
```

## [5.1.0] - 2025-01

### ✨ New Features

#### Type-Safe Fluent Styling

All fluent styling methods now have **type-safe parameters** with IDE autocomplete for Tailwind values:

```typescript
Div()
  .w("full")              // IDE suggests: "full", "1/2", "screen", "64", etc.
  .background("red-500")  // IDE suggests: all color-shade combinations
  .rounded("lg")          // IDE suggests: "sm", "md", "lg", "xl", "full", etc.
```

The type system suggests valid Tailwind values while still allowing custom/arbitrary values when needed via the `Autocomplete<T>` helper type.

#### New Text Styling Methods

Added 10 new fluent methods for common text styling:

- `.bold()` - Shorthand for `font-bold`
- `.italic()` - Add `italic` class
- `.uppercase()` - Text transform to uppercase
- `.lowercase()` - Text transform to lowercase
- `.capitalize()` - Capitalize first letter of each word
- `.underline()` - Add underline decoration
- `.lineThrough()` - Add line-through decoration
- `.truncate()` - Truncate with ellipsis
- `.leading(value)` - Line height (`leading-tight`, `leading-relaxed`, etc.)
- `.tracking(value)` - Letter spacing (`tracking-wide`, `tracking-tight`, etc.)

**Example:**
```typescript
Span("IMPORTANT")
  .bold()
  .uppercase()
  .tracking("wide")
  .textColor("red-500")

P("Long text that might overflow...")
  .truncate()
  .w("48")
```

---

## [4.0.0-beta.1] - 2025-01

### 🎉 New Feature: Reactive System

Fluent HTML now includes a **minimal, compile-time-checked reactive system** for client-side rendering with automatic state management and DOM updates.

#### ✨ Key Features

**Declarative Reactive Bindings:**
- `.bindText(expr)` - Bind expression to textContent
- `.bindHtml(expr)` - Bind expression to innerHTML (⚠️ XSS risk)
- `.bindShow(expr)` / `.bindHide(expr)` - Conditional visibility
- `.bindClass(className, expr)` - Dynamic CSS classes
- `.bindAttr(attrName, expr)` - Dynamic attributes
- `.bindStyle(propName, expr)` - Dynamic inline styles
- `.bindValue(expr)` - Two-way input binding

**Event Handlers:**
- `.onClick(statement)` - Click event handler
- `.onInput(statement)` - Input event handler
- `.onChange(statement)` - Change event handler
- `.onSubmit(statement)` - Form submit handler (with automatic preventDefault)
- `.onKeydown(statement)` - Keyboard event handler
- `.onFocus(statement)` / `.onBlur(statement)` - Focus event handlers

**Compile-Time Validation:**
- `compile(view)` validates all reactive bindings before runtime
- Checks that all `data.xxx` references are bound by `bindState()`
- Prevents variable shadowing in nested state
- Provides helpful error messages for unbound variables

**Simple API Pattern:**
- `bind*` methods for reactive data → DOM
- `on*` methods for DOM events → data mutations
- All expressions reference state via `data.propertyName`

#### 📝 Usage Example

```typescript
import { Div, Button, Span, compile, renderWithScript } from 'fluent-html';

const counter = Div([
  Button("Increment").onClick("data.count++"),
  Span().bindText("'Count: ' + data.count"),
  Div("High count!").bindShow("data.count > 5")
]).bindState({ count: 0 });

const error = compile(counter);
if (error) throw new Error(error.message);

console.log(renderWithScript(counter));
// Outputs HTML + <script> with reactive behavior
```

#### 🔧 New API Functions

- `compile(view)` - Validate reactive bindings and assign unique IDs
- `generateScript(view)` - Generate JavaScript for reactive behavior
- `renderWithScript(view, renderFn?)` - Convenience function combining render() and generateScript()
- `resetIdCounter()` - Reset global ID counter (useful for testing)

#### 🏗️ Implementation Details

- Zero runtime dependencies - generates vanilla JavaScript
- Automatic ID assignment for reactive elements
- Efficient DOM updates via `update()` function
- Event handlers automatically call `update()` after mutations
- IIFE wrapper for state isolation
- Support for nested `bindState()` for component composition

#### 📚 Documentation

See the new **Reactive System** section in README.md for:
- Complete API documentation
- Reactive binding examples
- Event handler patterns
- Compile-time validation guide
- Complete working examples (counter, todo list, forms, tabs)

---

## [3.0.0] - 2025-01

### 🚀 Breaking Changes

This is a major release with a **completely redesigned API**. The new API uses **method chaining** instead of object configuration, providing superior IDE autocomplete and type safety.

#### Before (v1.x / v2.x)
```typescript
Div({
  id: "container",
  class: "flex items-center",
  child: Text("Hello")
})
```

#### After (v3.0.0)
```typescript
Div("Hello")
  .setId("container")
  .setClass("flex items-center")
```

### ✨ New Features

#### 🎯 IDE-Powered Development

The new type system provides **intelligent autocomplete** for:
- All HTMX triggers (`click`, `load`, `revealed`, `keyup changed delay:300ms`, etc.)
- All HTMX swap strategies (`innerHTML`, `outerHTML scroll:top`, etc.)
- All HTMX sync modes (`drop`, `abort`, `queue last`, etc.)
- Element-specific methods (`.setColspan()` only on `Th`/`Td`, `.setMin()` only on `Input`, etc.)

#### 🛡️ Built-in XSS Protection

All text content and attributes are **automatically HTML-escaped**:
- Text content: `<script>` → `&lt;script&gt;`
- Attributes: `"><script>` → `&quot;&gt;&lt;script&gt;`
- Script/Style elements are NOT escaped (intentional - they contain code)
- No opt-out, no `Raw()` helper - security by default

#### ⚡ Complete HTMX 2.0 Support

Full type-safe support for all HTMX 2.0 attributes:
- **Methods**: `get`, `post`, `put`, `patch`, `delete`
- **Targeting**: `target`, `swap`, `swapOob`, `select`, `selectOob`
- **Triggers**: All DOM events, `load`, `revealed`, `intersect`, polling, SSE, WebSocket
- **URL**: `pushUrl`, `replaceUrl` (with custom URL support)
- **Data**: `vals`, `headers`, `include`, `params`, `encoding`
- **Validation**: `validate`, `confirm`, `prompt`
- **Loading**: `indicator`, `disabledElt`
- **Sync**: `drop`, `abort`, `replace`, `queue`, `queue first`, `queue last`, `queue all`
- **Inheritance**: `disinherit`, `inherit`
- **History**: `history`, `historyElt`
- **Other**: `preserve`, `request`, `boost`, `disable`, `ext`

#### 🔧 Selector Helpers

Type-safe helpers for HTMX extended selectors:
```typescript
import { id, clss, closest, find, next, previous } from 'fluent-html';

id("content")      // → "#content"
clss("items")      // → ".items"
closest("tr")      // → "closest tr"
find(".content")   // → "find .content"
next("div")        // → "next div"
previous("li")     // → "previous li"
```

#### 📦 60+ HTML Elements

Complete HTML5 coverage with typed attribute methods:

**New semantic elements**: `Nav`, `Aside`, `Figure`, `Figcaption`, `Address`, `Hgroup`, `Search`

**New text elements**: `H5`, `H6`, `Strong`, `Em`, `Mark`, `Small`, `Sub`, `Sup`, `Abbr`, `Cite`, `Q`, `Dfn`, `Kbd`, `Samp`, `Var`, `Br`, `Wbr`, `Bdi`, `Bdo`, `Ruby`, `Rt`, `Rp`, `Blockquote`, `Pre`, `Code`

**New list elements**: `Dl`, `Dt`, `Dd`, `Menu`

**New table elements**: `Tfoot`, `Caption`, `Colgroup`, `Col` (with typed `ThTag`/`TdTag` supporting `colspan`/`rowspan`/`scope`)

**New form elements**: `Fieldset`, `Legend`, `Datalist`, `Output`, `Optgroup`

**Enhanced Input**: `step`, `pattern`, `minlength`, `maxlength`, `autocomplete`, `autofocus`, `checked`, `disabled`, `readonly`, `multiple`, `list`

**Enhanced Textarea**: `minlength`, `maxlength`, `wrap`, `autocomplete`, `autofocus`, `disabled`, `readonly`

**Enhanced Button**: `formaction`, `formmethod`, `disabled`

**New interactive elements**: `Details` (with `open`, `name`), `Summary`, `Dialog` (with `open`)

**New media elements**: `Audio`, `Source`, `Track`, `Picture`, `Canvas`, `Svg` + SVG primitives (`Path`, `Circle`, `Rect`, `Line`, `Polygon`, `Polyline`, `Ellipse`, `G`, `Defs`, `Use`, `Text`, `Tspan`)

**New embedded elements**: `Iframe` (with `sandbox`, `allow`, `loading`), `ObjectEl`, `Embed`, `MapEl`, `Area`

**New document elements**: `Title`, `Meta` (with `charset`, `name`, `content`, `httpEquiv`, `property`), `Link` (with `rel`, `href`, `type`, `media`, `sizes`, `crossorigin`, `integrity`, `as`), `Style`, `Base`, `Noscript`

**Enhanced Script**: `src`, `async`, `defer`, `integrity`, `crossorigin`, `nomodule`

**New data elements**: `Time` (with `datetime`), `Data` (with `value`), `Progress` (with `value`/`max`), `Meter` (with `value`/`min`/`max`/`low`/`high`/`optimum`), `Slot` (with `name`)

#### 🔄 Control Flow Improvements

- `ForEach1` - iteration with index
- `ForEach2` - range iteration (0 to n)
- `ForEach3` - range iteration (start to end)
- `Repeat` - repeat content n times

### 🔧 Improvements

- **Zero dependencies** - pure TypeScript
- **Cleaner HTML output** - no unnecessary whitespace
- **Better TypeScript support** - stricter types throughout
- **Smaller bundle size** - optimized render function
- **229 tests** - comprehensive test coverage

### 📦 Migration Guide

1. **Update element syntax:**
   ```typescript
   // Old
   Div({ class: "container", child: P({ child: Text("Hello") }) })
   
   // New
   Div(P("Hello")).setClass("container")
   ```

2. **Update HTMX usage:**
   ```typescript
   // Old
   Button({ htmx: { method: "post", endpoint: "/api" }, child: Text("Submit") })
   
   // New
   Button("Submit").setHtmx(hx("/api", { method: "post" }))
   ```

3. **Update control flow:**
   ```typescript
   // Old
   ForEach(items, item => Li({ child: Text(item) }))
   
   // New
   ForEach(items, item => Li(item))
   ```

4. **Text nodes no longer need `Text()` wrapper:**
   ```typescript
   // Old
   P({ child: Text("Hello") })
   
   // New
   P("Hello")
   ```

### 🐛 Bug Fixes

- Fixed inconsistent attribute ordering
- Fixed whitespace in rendered output
- Fixed boolean attribute rendering

---

## [2.x] - Previous Versions

See [GitHub releases](https://github.com/JT-Digital-d-o-o/fluent-html/-/releases) for previous version history.