# fluent-html

Type-safe, zero-dependency HTML builder for TypeScript. All text content is **automatically XSS-escaped**.

## Element Creation

```typescript
Div("Hello")                       // text child
Div(P("One"), P("Two"))            // variadic children — NEVER wrap in arrays
Div()                              // empty element
El("custom-tag", P("Content"))    // dynamic/custom elements
Empty()                            // renders nothing (useful for conditional responses)
Raw("<svg>...</svg>")              // trusted HTML only — bypasses XSS escaping
```

## Tag Methods

**Use typed methods** — never `addAttribute` for standard HTML props:

```typescript
Button("Save").setType("submit")                                       // ButtonTag
Input().setType("email").setPlaceholder("you@example.com").setName("email")  // InputTag (generic) — for one-off elements without a schema — else prefer formFor<T>()
Input("number").setMin(0).setMax(100).setStep(5)                               // NumericInputTag (type-safe min/max)
Input("date").setMin("2024-01-01")                                              // DateTimeInputTag (string min/max)
Textarea().setPlaceholder("Message").setName("msg").setRows(5)         // TextareaTag — for one-off elements without a schema — else prefer formFor<T>()
Select(Option("A").setValue("1"), Option("B").setValue("2")).setName("x") // SelectTag — for one-off elements without a schema — else prefer formFor<T>()
A("Link").setHref("/page").setTarget("_blank")                         // AnchorTag
Img().setSrc("/img.jpg").setAlt("Photo").setLoading("lazy")            // ImgTag
Form(/* children */).setAction("/submit").setMethod("post")            // FormTag
```

**Universal methods** on all tags:

```typescript
Div()
  .setId("my-id")
  .setClass("a b")                 // replace all classes
  .addClass("c")                   // append class
  .setClasses(["a", "b", false])   // filter falsy values
  .setStyle("color: red")          // string — replaces the style attribute
  .setStyles({ color: "red" })     // object — replaces (camelCase → kebab-case)
  .setDataAttrs({ userId: "123" }) // ✓ data-user-id="123" (auto kebab-case)
  .setAria({ label: "Close", expanded: "false" }) // ✓ aria-label (note: "false" string, not boolean)
  .addAttribute("role", "dialog")  // escape hatch — ONLY when no typed setter exists
```

✗ never reach for `addAttribute` when a typed setter exists:

```typescript
.addAttribute("data-user-id", "123")          // ✗ → .setDataAttrs({ userId: "123" })
.addAttribute("aria-label", "Close")          // ✗ → .setAria({ label: "Close" })
.addAttribute("style", `width: ${pct}%`)      // ✗ → .setStyle(...) (addAttribute double-renders style)
.addAttribute("data-a", x).addAttribute("data-b", y)  // ✗ → .setDataAttrs({ a: x, b: y }) (batch)
```

- `setDataAttrs` / `setAria` batch multiple attrs in one call and auto-convert camelCase → kebab.
- `setAria` keys autocomplete to known ARIA names; `aria-expanded`/`aria-pressed` want the **string** `"false"`, not boolean `false`.
- `setStyle`/`setStyles` both **replace** (set* = override; to compose, pass the full object once) — never `addAttribute("style", …)`.
- `addAttribute` is enforced by the `prefer-set-method` ESLint rule — `eslint --fix` rewrites the ✗ forms automatically.

**Boolean attributes** — `.toggle()` only:

```typescript
Input().toggle("required")                        // always on
Input().toggle("required", isRequired)            // conditional
Option(city).toggle("selected", city === current) // expression
```

**Void elements** reject children (silently ignored at render):

```typescript
Input()   // ✓ no children
Img()     // ✓ no children
Hr()      // ✓ no children
```

## Type-Safe Forms — `formFor<T>()`

Constrains field names to keys of a schema type — typos become compile errors:

```typescript
type CreateUserReq = { email: string; name: string; role: "admin" | "viewer" };
const f = formFor<CreateUserReq>();

Form(
  f.input("email", "email"),        // ✓ typed name + input type
  f.input("name", "text"),          // ✓
  f.input("nmae", "text"),          // ✗ compile error — not a key of CreateUserReq
  f.textarea("name"),               // ✓ typed textarea
  f.select("role",                  // ✓ typed select with children
    Option("Admin").setValue("admin"),
    Option("Viewer").setValue("viewer"),
  ),
  f.hidden("role", "admin"),        // ✓ typed hidden input with value
  Button("Submit").setType("submit"),
)
```

Returns standard `InputTag`/`TextareaTag`/`SelectTag` — full chaining works: `f.input("email", "email").setPlaceholder("you@example.com").toggle("required")`

Untyped `.setName()` still works for one-off elements outside a schema.

**Where `T` comes from:** the request type your controller validates. A schema exists ⇒ never bare `.setName()`:
```typescript
import type { SignInReq } from "../core/types.js";
const f = formFor<SignInReq>();
f.input("emial", "email")                  // ✗ compile error — not a key of SignInReq
Input().setType("email").setName("email")  // ✗ bypasses the schema — a rename fails only at runtime (422)
```

## Modifiers & Composition

```typescript
// .when() — conditionally apply modifications
Button("Save")
  .when(isLoading, t => t.toggle("disabled").opacity("50"))
  .when(isPrimary, t => t.background("blue-500").textColor("white"))

// .apply() — compose reusable modifier functions (accepts multiple)
const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
const hoverLift = (t: Tag) => t.transition().on("hover", t => t.shadow("lg"));
Div("Content").apply(card, hoverLift)
```

## Fluent Tailwind Styling

> Use fluent methods (not `setClass`) for type safety + IDE autocomplete. `.on()` for pseudo-classes, `.at()` for breakpoints. All methods are strictly typed — check the library's TypeScript definitions for the full API.

**`.on()` accepts any state prefix; `.at()` any breakpoint** — including relational, named-group, and arbitrary:
```typescript
parent.group()                                              // ✓ mark the hover/focus scope
child.on("group-hover", t => t.opacity("100"))              // ✓ responds to the parent
child.addClass("group-hover:opacity-100")                   // ✗ untyped escape hatch
Input().peer(); Label().on("peer-checked", t => t.textColor("blue-600"))  // ✓ peer state
.on("group-hover/info", …) .on("[&:has(input:checked)]", …) // ✓ named group + arbitrary
.at("sm", t => t.gridCols("2")).at("lg", t => t.gridCols("4"))  // ✓ responsive gridCols
.addClass("sm:grid-cols-2")                                 // ✗ raw breakpoint string
```

Key method categories: spacing (`padding`, `margin`, `gap`), colors (`background`, `textColor`, `borderColor`, `shadowColor`), typography (`textSize`, `fontWeight`, `fontFamily`, `lineClamp`), layout (`flex`, `grid`, `w`, `h`), effects (`shadow`, `opacity`, `blur`, `brightness`), gradients (`gradient`, `gradientTo`, `gradientRadial`, `gradientConic`, `from`/`via`/`to`), container queries (`containerQuery()` + `.at("@sm", …)`), group/peer (`group()`, `peer()`), transforms (`scale`, `rotate`, `translate`, `skewX`, `skewY`), transitions (`transition`, `duration`, `ease`).

**v4 semantics** (don't silently get v3 looks): bare `.ring()` = 1px + `currentColor`; bare `.border()` = `currentColor` (add `.borderColor(...)`); `Button()` has no default cursor (add `.cursor("pointer")`); prefer `.flex().gap()` over `space-*`; `.outlineHidden()` over `.outline("none")`. Scales gained an `xs` slot (`shadow-sm` is now medium-ish).

**Arbitrary values** — unit overloads for sizing/spacing/position:
```typescript
Div().w("px", 180)       // → w-[180px]
Div().h("rem", 2.5)      // → h-[2.5rem]
```

**Gradients (v4 `bg-linear-*`)** — fluent chain, never raw string:
```typescript
Div().gradient("blue-500", "cyan-500", "to-r")                              // ✓ shorthand → bg-linear-to-r from-… to-…
Div().gradientTo("to-r").from("blue-500").via("indigo-500").to("cyan-500")  // ✓ typed, extractor-safe
Div().gradientRadial()  // bg-radial   ·   Div().gradientConic()  // bg-conic
Div().addClass("bg-gradient-to-r from-blue-500 to-cyan-500")               // ✗ raw string (v3 name) — breaks TW scan
```

### Theming — `defineTheme()`

Define design tokens **once** → typed autocomplete on the fluent methods + the v4 `@theme` CSS + the extractor safelist. Tokens only (`colors`/`spacing`/`fontSize`/`radius`/`shadow`); component presets stay user-land `.apply()` helpers.

```ts
// theme.ts — the one place tokens live
import { defineTheme, type ThemeKeys } from "fluent-html";

const tokens = {
  colors:  { brand: "#ff5500", forest: "#2d5016" },
  spacing: { gutter: "1.5rem" },
} as const;

export const theme = defineTheme(tokens);

// One line per family — written once, derives from `tokens` (add tokens freely).
declare module "fluent-html" {
  interface FluentCustomColors  extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
}
```
```ts
Div().background("brand").padding("gutter")   // ✓ your tokens, autocompleted + typo-checked
Div().background("brnad")                     // ✗ compile error (closed unions — `(string & {})` is gone)
```

### Tailwind v4 build wiring

fluent methods append class strings at render time — they are **invisible to v4's auto content detection**. Wire the extractor as a plugin (or generate a safelist file):

The wiring is deliberately dumb: a prebuild step writes the safelist to a **real `.css` file** that your CSS `@import`s (a real file — Tailwind only resolves `@import`s from disk). No bundler plugin.

```ts
// scripts/build-safelist.ts — run before the CSS build (a "prebuild" npm script)
import { writeFileSync } from "node:fs";
import { generateFluentSafelist, globFiles } from "fluent-html-tailwind-extractor";
import { theme } from "./theme";

writeFileSync("./src/fluent-safelist.css",
  generateFluentSafelist(globFiles(["./src/**/*.ts", "./public/**/*.html"]), { theme, onUnresolved: "error" }));
```
```css
/* app.css */
@import "tailwindcss";
@import "./fluent-safelist.css";   /* the generated file — add it to .gitignore */
```
```jsonc
// package.json
"scripts": { "prebuild": "tsx scripts/build-safelist.ts", "build": "postcss src/app.css -o dist/app.css" }
```

- `onUnresolved: "error"` (default) — a `.background(c)` with a non-literal arg fails the build (a dropped class is an unstyled element with no other warning). Cover variable-driven tokens with `defineTheme`'s `staticManifest`.

- `onUnresolved: "error"` (default) — a fluent call with a non-literal arg (`.background(c)`) fails the build (a dropped class is an unstyled element with no other warning). Cover variable-driven tokens via `defineTheme`'s `staticManifest`.
- ✗ `content.extract: { ts: fluentHtmlExtractor }` — removed in v4. ✗ `@tailwind base/components/utilities` — use `@import "tailwindcss"`.

## Control Flow

**`IfThen` narrows nullable values** — callback receives the non-null type. Do NOT re-check, cast, or use ternaries:

```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))            // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string

Match(status, {
  active: () => Badge("Active"),
  error:  () => Badge("Error"),
}, () => Badge("Unknown"))                         // pattern matching + optional default

// Discriminated union Match — pass a key for automatic type narrowing
Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),               // s: { status: "error"; message: string }
  success: (s) => UserList(s.data),               // s: { status: "success"; data: User[] }
})

// Partial discriminated union with default
Match(state, "status", {
  error: (s) => Alert(s.message),
}, () => Spinner())

ForEach(users, (user, i) => Li(user.name))         // array
ForEach(5, i => Div(`Item ${i}`))                  // 0..n
ForEach(1, 6, i => Div(`Item ${i}`))               // range
Repeat(3, () => Br())                              // simple repeat

// ✗ chained IfThen on a discriminant — non-exhaustive, no narrowing (F-A-021)
IfThen(reservation.status === "PENDING",   () => Confirm())
IfThen(reservation.status === "CONFIRMED", () => Remove())
// ✓ Match on the discriminant key — exhaustive (drop the default), each branch narrowed
Match(reservation, "status", {
  PENDING:   (r) => Confirm(),
  CONFIRMED: (r) => Remove(),
}, () => Empty())

// ✗ DU prop via boolean flag — variant fields need re-checks, new variant silently ignored (F-A-103)
const isSuccess = props.state === "success"
IfThenElse(isSuccess, () => Ok(), () => Retry())
// ✓ Match the whole prop — `s.message` typed without re-narrowing
Match(props, "state", {
  success: ()  => Ok(),
  error:   (s) => Retry(s.message),                 // s: { state:"error"; message: string }
})

// ✗ paired IfThen — evaluates the condition twice, branches can drift (F-A-025)
IfThen(items.length > 0,  () => List(items))
IfThen(items.length === 0, () => EmptyState())
// ✓ IfThenElse — one expression, one eval, always synchronized
IfThenElse(items.length > 0, () => List(items), () => EmptyState())

// ✗ !! / != null collapse the value to boolean before IfThen narrows → forces ! (F-A-105)
IfThen(!!url, () => Img().setSrc(url!))
IfThen(quote != null, () => Card(quote!))
// ✓ pass the value; the callback arg is the narrowed non-null value
IfThen(url,   (u) => Img().setSrc(u))
IfThen(quote, (q) => Card(q))

// ✗ Array.from to make a range — allocates an intermediate array (F-A-026)
ForEach(Array.from({ length: count }, (_, i) => i), (i) => Item(i))
// ✓ count overload
ForEach(count, (i) => Item(i))
```

## Scoped Context

Use for cross-cutting values (theme, auth, locale, nonce) instead of prop drilling. **Never use `AsyncLocalStorage`** — `createContext` is sufficient for synchronous rendering.

```typescript
const ThemeCtx = createContext<"light" | "dark">("light");       // returns default when no scope
const AuthCtx = createRequiredContext<User>("AuthCtx");          // throws if no scope active

function handler(user: User) {
  using _t = ThemeCtx.scope("dark");
  using _a = AuthCtx.scope(user);
  return Page();
}

function Header() {
  const theme = ThemeCtx.current;  // reads innermost scope
  const user = AuthCtx.current;    // throws if called without scope
}
```

Use `createContext(default)` for values with sensible defaults. Use `createRequiredContext(name)` when a missing scope is always a bug.

## HTMX Integration

> Full patterns: [htmx.md](htmx.md) — `defineRoutes`, `defineIds`, `setHtmx`, `Partial` swaps, `hxResponse`.

## Rendering

```typescript
render(Div("Hello"))               // <div>Hello</div>
render(Li("One"), Li("Two"))       // multiple elements, no wrapper
HTML(Head(), Body()).setLang("en") // document root
renderWithNonce(nonce, view)       // applies CSP nonce to all Script/Style tags
```

## SVG Elements

All SVG shapes have typed attribute setters via `SvgShapeTag` base (`setFill`, `setStroke`, `setStrokeWidth`, `setSvgOpacity`, `setTransform`):

```typescript
Svg(
  Circle().setCx("50").setCy("50").setR("40").setFill("none").setStroke("blue"),
  Rect().setX("10").setY("10").setWidth("80").setHeight("80").setRx("5"),
  Path().setD("M10 80 C40 10, 65 10, 95 80").setFill("none"),
  Line().setX1("0").setY1("0").setX2("100").setY2("100"),
  Text("Hello").setX("10").setY("50").setTextAnchor("start").setFontSize("16"),
  Use().setHref("#icon").setX("0").setY("0"),
)
```

> `setSvgOpacity()` avoids conflict with Tailwind's `.opacity()`.

## Types

```typescript
import type { View } from "fluent-html";
// View = Tag | string | RawString | View[]

// Named Tailwind types (exported for consumer use)
import type { TailwindPosition, TailwindTextAlign, TailwindFlexDirection, TailwindJustifyContent, TailwindAlignItems } from "fluent-html";
```
