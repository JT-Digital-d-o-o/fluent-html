# Fluent HTML

**A fluent, type-safe HTML builder for TypeScript.** Chainable Tailwind styling with closed
unions, first-class HTMX support, typed routes/ids/forms, automatic XSS protection. Zero
dependencies, SSR-ready.

```bash
npm install fluent-html
```

```typescript
import { Div, H1, Button, render } from "fluent-html";

render(
  Div(
    H1("Dashboard").text("2xl").font("bold"),
    Button("Refresh").px("4").py("2").bg("primary").text("on-accent").rounded("control")
      .cursor("pointer").setHtmx(dashboardRoutes.refresh()),
  ).p("6").flex().flex("col").gap("4"),
);
```

This README is the **census-ranked head**: the top 50 methods (≈ 87% of all real call sites
across the consumer fleet) and the 10 structural patterns. It is intentionally short — the
type system and your repo's exemplar code teach the rest.

**Where everything else lives**

| Document | What's in it |
|---|---|
| [REFERENCE.md](REFERENCE.md) | The full long-form reference (HTMX, routes, behaviors, elements, XSS, …) |
| [generated/full-surface.md](generated/full-surface.md) | Every callable with its fleet call-site count (generated) |
| [FLUENT-STYLING.md](FLUENT-STYLING.md) | The styling system in depth |
| [TAILWIND-SETUP.md](TAILWIND-SETUP.md) | Tailwind v4 build wiring + safelist extractor |

Regenerate the census: `node scripts/census/method-census.mjs --markdown 50` (counts below
are from that script; it scans the consumer repos and corrects JS/DOM name collisions).

---

## The top 50 methods

Method name = Tailwind class prefix — derive the method from the class you know
(`px-4` → `.px("4")`). Merged methods take every value family their prefix does; the
argument discriminates (`.text("lg")` / `.text("primary")` / `.text("center")`). All values
are closed unions: a typo or an off-scale value is a compile error.

| # | Method | Call sites | One-line signature |
|---|---|---|---|
| 1 | `.addAttribute(name, value)` | 2229 | Untyped attribute escape hatch — use the typed `set*` setter when one exists |
| 2 | `.flex(value?)` | 2225 | Flex container (bare), shorthand (`"1"`), direction (`"col"`), or wrap |
| 3 | `.text(value)` | 1612 | Merged `text-*`: size, color, align, or wrap; `.text("px", 13)` for arbitrary |
| 4 | `.rounded(value?)` | 1564 | Border radius — all corners, or `(corner, size)` |
| 5 | `.addClass(cls)` | 1561 | Raw class append — legacy-heavy count; Tailwind styling through it is lint-blocked |
| 6 | `.gap(value)` | 1519 | Flex/grid gap — both axes or `("x"\|"y", value)` |
| 7 | `.border(...)` | 1242 | Merged: width, style, or color; all sides, one side, or `(side, value)` |
| 8 | `.setClass(cls)` | 1204 | Replace the class attribute — same lint rule as `.addClass` |
| 9 | `.w(value)` | 963 | Width — scale, fractions, keywords, or `("px", 180)` |
| 10 | `.cursor(value)` | 829 | Mouse cursor (buttons need `.cursor("pointer")` — no default) |
| 11 | `.apply(styler)` | 690 | Apply a reusable `Styler` preset (`(t) => t.p("6").rounded("card")`) |
| 12 | `.h(value)` | 628 | Height — same forms as `.w()` |
| 13 | `.setType(type)` | 590 | `type` attribute (`Button().setType("submit")`, `Input().setType("email")`) |
| 14 | `.transition(value?)` | 536 | Transitioned property group (bare = default set) |
| 15 | `.m(...)` | 520 | Margin — all sides, `(axis/side, value)`, or unit overload; also `.mx/.my/.mt/…` |
| 16 | `.p(...)` | 496 | Padding — same forms; also `.px/.py/.pt/…` |
| 17 | `.maxW(value)` | 490 | Max-width — named container sizes or unit overload |
| 18 | `.setHtmx(htmx)` | 481 | Attach an HTMX request (`setHtmx(route())` or `setHtmx(hx(url, opts))`) |
| 19 | `.setId(id)` | 440 | Element id — takes an `Id` from `defineIds` (or a string) |
| 20 | `.bg(color)` | 427 | Background color token |
| 21 | `.setHref(href)` | 416 | Anchor href — branded: `ResolvedRoute` \| literal external (`https://…`, `mailto:…`, `#…`) |
| 22 | `.when(cond, fn)` | 379 | Conditional modifier: `t => t.…` runs when cond is truthy (narrowed non-null value passed) |
| 23 | `.font(value)` | 369 | Merged `font-*`: weight or family |
| 24 | `.setName(name)` | 342 | Form control `name` (schema-typed inside `Form<T>`) |
| 25 | `route.resolve(params?, query?)` | 327 | Resolved URL as a branded `ResolvedRoute` — the only sanctioned query-string path |
| 26 | `.tracking(value)` | 326 | Letter spacing |
| 27 | `.gridCols(n)` | 324 | Grid column count / `none` / `subgrid` |
| 28 | `.toggle(attr, cond?)` | 322 | Boolean attribute (`required`, `selected`, `disabled`) — optionally conditional |
| 29 | `.shadow(value?)` | 320 | Box shadow — bare default, theme size, or color |
| 30 | `.leading(value)` | 276 | Line height |
| 31 | `.uppercase()` | 273 | Uppercase transform |
| 32 | `.setValue(value)` | 256 | Form control `value` attribute |
| 33 | `.setFill(color)` | 219 | SVG `fill` presentation attribute (class-based color is `.fill()`) |
| 34 | `.items(value)` | 217 | Cross-axis alignment (`"center"`, `"start"`, …) |
| 35 | `.grid()` | 196 | Grid container |
| 36 | `.overflow(value)` | 189 | Overflow — both axes or `("x"\|"y", value)` |
| 37 | `.shrink(0?)` | 188 | Allow shrinking (bare) or `shrink-0` |
| 38 | `.setPlaceholder(text)` | 179 | Input placeholder |
| 39 | `.setD(path)` | 131 | SVG path data |
| 40 | `.setContent(content)` | 130 | Meta tag content |
| 41 | `.setStrokeWidth(n)` | 128 | SVG stroke-width presentation attribute |
| 42 | `.setStyles(record)` | 126 | Inline styles from an object — extractor-opaque, for runtime-computed values |
| 43 | `.ring(value?)` | 115 | Ring width (bare = **1px** in v4) or color |
| 44 | `.setViewBox(str)` | 115 | SVG viewBox |
| 45 | `.justify(value)` | 114 | Main-axis distribution (`"between"`, `"center"`, …) |
| 46 | `.setStroke(color)` | 111 | SVG `stroke` presentation attribute |
| 47 | `.setSrc(url)` | 110 | Image/script/media source |
| 48 | `.hover(styles)` | 108 | `hover:` styles as a typed object (see pattern 8) |
| 49 | `.opacity(value)` | 103 | Element opacity 0–100 |
| 50 | `.fill(color)` | 102 | SVG fill color via `fill-*` class (`"none"` to unset) |

The standalone pattern functions rank alongside the head: `IfThen` (1010), `ForEach` (608),
`IfThenElse` (274), `hx` (170), `defineRoutes` (129), `defineIds` (79), `Match` (54).

---

## The 10 structural patterns

### 1. Typed routes — `defineRoutes` + route callables

Route strings live in exactly one place; call sites get params/query typed and URLs branded.

```typescript
export const userRoutes = defineRoutes("/users", {
  list:   { path: "/", query: { page: "number" } as const },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
} as const);

Button("Load").setHtmx(userRoutes.list({ query: { page: 2 } }))  // callable → HTMX object
userRoutes.detail.resolve({ id: 7 })                             // → "/users/7" as ResolvedRoute
userRoutes.list.path                                             // "/users" (server registration)
```

`.resolve()` returns a **branded `ResolvedRoute`** (8.0.0): route-bearing sinks (`hx()`,
`setHtmx()`, `hxGet`/`hxPost`, `A().setHref()`) reject plain strings, so hardcoded paths,
hand-concatenated query strings (`resolve() + "?page=" + p` — a compile error), and raw
user input can't become request targets. Literal `https://…`/`mailto:…`/`tel:…`/`#…` pass as
`ExternalHref`; runtime-computed externals use `externalUrl(url)`; static assets use
`assetUrl("/favicon.svg")`.

### 2. Typed targets — `defineIds`

```typescript
export const ids = defineIds(["userList", "userCount"] as const);
Div().setId(ids.userList)                                   // id="user-list"
Button("↻").setHtmx(userRoutes.list({ target: ids.userList }))  // hx-target="#user-list"
render(Partial(ids.userList, List(users)), Partial(ids.userCount, Span(`${n}`)))  // multi-swap
```

A typo'd id key is a compile error; `Partial` swaps several regions from one response.

### 3. Typed forms — `Form<T>`

```typescript
Form<CreateUserReq>(                     // T = the controller's request type — import it
  f => f.input("email").setType("email"),    // "emial" would be a compile error
  f => f.input("password").setType("password"),
)
```

### 4. The `Match` family — dispatch on a discriminant

```typescript
Match(state, "status", {                  // discriminant key ⇒ narrowing + exhaustiveness
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),       // s narrowed to the error arm
  success: (s) => UserList(s.data),
})
MatchValue(trend, { up: "↑", down: "↓" }, "→")   // value→value lookup, not a ternary
```

Never chain `IfThen(x.status === …)` on a discriminant — a missing case should be a
compile error, not a silent fall-through.

### 5. Lists — `ForEach` / `ForEachKeyed`, never `.map()`

```typescript
Ul(ForEach(users, (u) => Li(u.name)))
ForEachKeyed(users, (u) => u.id, (u) => Li(u.name))  // keyed morphs: focus/scroll survive reorder
```

### 6. Conditionals — `IfThen` / `IfThenElse` with narrowing

```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))            // callback gets the non-null value
IfThenElse(user.name, (name) => Span(name), () => Span("Anon"))
```

No `!!x`, no `x != null`, no `!` in the callback — the value-passing form narrows for you.

### 7. Conditional styling — `.when` / `.whenElse` / `.whenMatch` + `Styler`

```typescript
Badge(label).whenElse(active,
  t => t.bg("success/10").text("success"),
  t => t.bg("surface-2").text("text-faint"))
Span(s).whenMatch(s, { active: t => t.bg("success/10"), closed: t => t.bg("surface-2") })

const card: Styler = (t) => t.p("6").bg("surface").rounded("card").shadow("md");
Div("Content").apply(card)                // presets are user-land Stylers, not theme config
```

The family maps 1:1 onto the view primitives: `IfThen → when`, `IfThenElse → whenElse`,
`Match → whenMatch`.

### 8. Variants — typed style objects, not class strings

```typescript
Button("Save")
  .px("4").bg("primary").rounded("control").transition("colors")
  .hover({ bg: "primary-700", scale: "105" })
  .focus({ ring: "2", outline: "hidden" })
  .md({ px: "8", hover: { bg: "primary-800" } })     // nesting stacks: md:hover:*
  .variant("data-[state=open]", { rounded: "lg" })   // the long tail
```

Keys are the canonical style names; `true` for no-arg utilities; `undefined`/`false` skipped;
tuples for multi-arg (`border: ["top", "line-strong"]`).

### 9. Theming — `defineTheme` + role tokens

```typescript
const tokens = {
  colors: { primary: "#2563eb", surface: "…", "text-dim": "…" },
  radius: { card: "0.75rem", control: "0.5rem" },
} as const satisfies ThemeSpec;
export const theme = defineTheme(tokens);
declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentColorConfig { defaultPalette: false }   // palette literals stop compiling
}
Div().bg("surface")        // ✓ role token
Div().bg("gray-100")       // ✗ compile error — tokens are roles, tints via bg("danger/10")
```

### 10. Escape hatches — one per situation

```typescript
Div().opacity("[0.33]")                          // arbitrary value of a covered utility
Div().cssProp("mask-repeat", "no-repeat")        // CSS property with no utility → [prop:value]
Div().cssClass("js-map-container")               // legit non-Tailwind class hook
Div().setStyle(`--x: ${runtime}px`)              // runtime-computed style (extractor-opaque)
Div().neg("mt-2")                                // negative utility passthrough
A("Pay").setHref(externalUrl(checkoutUrl))       // runtime external URL past the route brand
```

Never style through `addClass`/`setClass` (lint-blocked at error level); never widen past
the narrowest hatch that works.

---

## 8.0.0 in one paragraph

Element storage fields are privatized (a blind `.src()` guess now self-heals as
"Did you mean 'setSrc'?"), route sinks are branded (pattern 1), `TailwindColor` is exported
from the package root, and ~38 zero-use methods were deleted (`hxPut`/`hxPatch`/`hxDelete`,
backdrop filters except `backdropBlur`, masks, 3D transforms, snap/scroll-margin,
place/break/isolation/hyphens/scheme/field-sizing families) — their CSS stays reachable via
`.cssProp()`/`.variant()`. See [CHANGELOG.md](CHANGELOG.md) for migration notes.

## Links

- [CHANGELOG](CHANGELOG.md) · [Full reference](REFERENCE.md) · [Full surface (generated)](generated/full-surface.md)
- [GitHub](https://github.com/JT-Digital-d-o-o/fluent-html) · [npm](https://www.npmjs.com/package/fluent-html)

## License

ISC
