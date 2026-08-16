# Fluent HTML

**A fluent, type-safe HTML builder for TypeScript.** Chainable Tailwind styling with closed
unions, first-class HTMX support, typed routes/ids/forms, automatic XSS protection. Zero
dependencies, SSR-ready.

[fluent-html.com](https://fluent-html.com)

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

This README is the **census-ranked head**: the top 50 methods (**92.5%** of every method call
site measured across the consumer fleet) and the 10 structural patterns. It is intentionally short — the
type system and your repo's exemplar code teach the rest.

**Where everything else lives**

| Document | What's in it |
|---|---|
| [REFERENCE.md](REFERENCE.md) | The full long-form reference (HTMX, routes, behaviors, elements, XSS, …) |
| [generated/full-surface.md](generated/full-surface.md) | Every callable with its fleet call-site count (generated) |
| [FLUENT-STYLING.md](FLUENT-STYLING.md) | The styling system in depth |
| [TAILWIND-SETUP.md](TAILWIND-SETUP.md) | Tailwind v4 build wiring + safelist extractor |

Counts below come from `node scripts/census/method-census.mjs --markdown 50`: **46 consumer
repos, 8,817 non-generated `.ts` files, 197,837 method call sites**. They are **alias-merged** —
most of the fleet is still pinned pre-7.0.0, so a pre-rename spelling (`.textColor()`,
`.padding()`, `.on("hover", …)`, `.at("md", …)`) counts for the canonical name it became; the
second column counts only the repos already on 7.0.0+. JS/DOM name collisions are corrected
(`Array.from`, `res.text()`, `userRoutes.list()`, …). `--corpus` prints the repo list.

---

## The top 50 methods

Method name = Tailwind class prefix — derive the method from the class you know
(`px-4` → `.px("4")`). Merged methods take every value family their prefix does; the
argument discriminates (`.text("lg")` / `.text("primary")` / `.text("center")`). All values
are closed unions: a typo or an off-scale value is a compile error.

| # | Method | Fleet | 7.0.0+ | One-line signature |
|---|---|---|---|---|
| 1 | `.text(value)` | 35682 | 1919 | Merged `text-*`: size, color, align, or wrap; `.text("px", 13)` for arbitrary |
| 2 | `.p(...)` | 14550 | 625 | Padding — all sides, `(side, value)`, or unit overload; also `.px/.py/.pt/…` |
| 3 | `.m(...)` | 12138 | 614 | Margin — same forms; also `.mx/.my/.mt/…` |
| 4 | `.font(value)` | 10157 | 484 | Merged `font-*`: weight or family |
| 5 | `.flex(value?)` | 9843 | 487 | Flex container (bare), shorthand (`"1"`), direction (`"col"`), or wrap |
| 6 | `.border(...)` | 9248 | 423 | Merged: width, style, or color; all sides, one side, or `(side, value)` |
| 7 | `.bg(color)` | 8293 | 441 | Background color token |
| 8 | `.rounded(value?)` | 6552 | 306 | Border radius — all corners, or `(corner, size)` |
| 9 | `.setClass(cls)` | 5961 | 21 | **Escape hatch** — replaces the class attribute; styling through it is lint-blocked (see below) |
| 10 | `.gap(value)` | 5596 | 286 | Flex/grid gap — both axes or `("x"\|"y", value)` |
| 11 | `.items(value)` | 4972 | 241 | Cross-axis alignment (`"center"`, `"start"`, …) |
| 12 | `.addClass(cls)` | 4780 | 45 | **Escape hatch** — raw class append; same lint block as `.setClass` (see below) |
| 13 | `.addAttribute(name, value)` | 3946 | 18 | **Escape hatch** — untyped attribute for the long tail; use the typed `set*` setter when one exists |
| 14 | `.w(value)` | 3538 | 280 | Width — scale, fractions, keywords, or `("px", 180)` |
| 15 | `.cursor(value)` | 3118 | 248 | Mouse cursor (buttons need `.cursor("pointer")` — no default) |
| 16 | `.apply(styler)` | 2660 | 461 | Apply a reusable `Styler` preset (`(t) => t.p("6").rounded("card")`) |
| 17 | `.hover(styles)` | 2657 | 147 | `hover:` styles as a typed object (see pattern 8) |
| 18 | `.justify(value)` | 2551 | 128 | Main-axis distribution (`"between"`, `"center"`, …) |
| 19 | `.setType(type)` | 2353 | 119 | `type` attribute (`Button().setType("submit")`, `Input().setType("email")`) |
| 20 | `.h(value)` | 2249 | 197 | Height — same forms as `.w()` |
| 21 | `.transition(value?)` | 2188 | 99 | Transitioned property group (bare = default set) |
| 22 | `.maxW(value)` | 2187 | 95 | Max-width — named container sizes or unit overload |
| 23 | `.setHtmx(htmx)` | 2127 | 44 | Attach an HTMX request (`setHtmx(route())` or `setHtmx(hx(url, opts))`) |
| 24 | `.setId(id)` | 1538 | 98 | Element id — takes an `Id` from `defineIds` (or a string) |
| 25 | `.gridCols(n)` | 1524 | 10 | Grid column count / `none` / `subgrid` |
| 26 | `.setName(name)` | 1465 | 44 | Form control `name` (schema-typed inside `Form<T>`) |
| 27 | `.setHref(href)` | 1408 | 82 | Anchor href — branded: `ResolvedRoute` \| literal external (`https://…`, `mailto:…`, `#…`) |
| 28 | `.shadow(value?)` | 1375 | 111 | Box shadow — bare default, theme size, or color |
| 29 | `.when(cond, fn)` | 1336 | 32 | Conditional modifier: `t => t.…` runs when cond is truthy (narrowed non-null value passed) |
| 30 | `.md(styles)` | 1279 | 57 | `md:` styles as a typed object; nesting stacks (`md: { hover: … }`) |
| 31 | `.setValue(value)` | 1195 | 28 | Form control `value` attribute |
| 32 | `.toggle(attr, cond?)` | 1130 | 108 | Boolean attribute (`required`, `selected`, `disabled`) — optionally conditional |
| 33 | `.tracking(value)` | 1124 | 37 | Letter spacing |
| 34 | `.sm(styles)` | 1031 | 68 | `sm:` styles — same object form as `.md` |
| 35 | `.setPlaceholder(text)` | 996 | 41 | Input placeholder |
| 36 | `route.resolve(params?, query?)` | 983 | 132 | Resolved URL as a branded `ResolvedRoute` — the only sanctioned query-string path |
| 37 | `.grid()` | 935 | 49 | Grid container |
| 38 | `.leading(value)` | 889 | 39 | Line height |
| 39 | `.block()` | 875 | 50 | `display: block` — one method per display value, not `.display("block")` |
| 40 | `.uppercase()` | 842 | 23 | Uppercase transform |
| 41 | `.lg(styles)` | 836 | 71 | `lg:` styles — same object form as `.md` |
| 42 | `.shrink(0?)` | 758 | 42 | Allow shrinking (bare) or `shrink-0` |
| 43 | `.overflow(value)` | 719 | 36 | Overflow — both axes or `("x"\|"y", value)` |
| 44 | `.setFill(color)` | 680 | 71 | SVG `fill` presentation attribute (class-based color is `.fill()`) |
| 45 | `.setContent(content)` | 488 | 66 | Meta tag content |
| 46 | `.hidden()` | 477 | 33 | `display: none` — the sibling of `.block()`/`.inlineBlock()`/`.grid()` |
| 47 | `.setStyles(record)` | 473 | 26 | Inline styles from an object — extractor-opaque, for runtime-computed values |
| 48 | `.setSrc(url)` | 435 | 28 | Image/script/media source |
| 49 | `.setRel(rel)` | 422 | 33 | Link/anchor `rel` (`"stylesheet"`, `"preconnect"`, `"noopener"`) |
| 50 | `.relative()` | 417 | 36 | `position: relative` — siblings `.absolute()`/`.fixed()`/`.sticky()`/`.static()` |

**The three escape hatches in this table are not vocabulary to imitate.** `.setClass()` (#9),
`.addClass()` (#12) and `.addAttribute()` (#13) rank where they do on *legacy* code: in the repos
already on 7.0.0+ they collapse to #81 (21 sites, 0.19%), #42 (45 sites) and #87 (18 sites,
0.16%). Tailwind styling through `.addClass`/`.setClass` is **lint-blocked at error level** — use
the typed methods, and reach for the narrowest hatch when a utility genuinely has no method
(pattern 10). `.addAttribute()` stays the sanctioned hatch for the untyped attribute long tail;
anything with a typed `set*` setter should use it.

**Just outside the head, and rising:** `.behavior(name, options)` — 402 sites, #51 fleet-wide but
**#31 among 7.0.0+ repos** — is the sanctioned client-side interaction primitive (`toggle`,
`drawer`, `clipboard`, `back`, `onEscape`, …), emitted as `data-behavior-*` attributes with zero
inline JS: `Button("Menu").behavior("drawer", { target: ids.menu, trapFocus: true })`. Also
climbing in canonical-era code: `.ring()`, `.whenElse()`, and the 7.0.0-new directional
shorthands (`.mt()`, `.px()`, …), whose fleet counts understate them because most repos predate
them.

The standalone pattern functions rank alongside the head: `IfThen` (3843), `ForEach` (2283),
`IfThenElse` (991), `defineRoutes` (673), `hx` (612), `defineIds` (348), `Match` (169).

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

- [Website](https://fluent-html.com) · [CHANGELOG](CHANGELOG.md) · [Full reference](REFERENCE.md) · [Full surface (generated)](generated/full-surface.md)
- [GitHub](https://github.com/JT-Digital-d-o-o/fluent-html) · [npm](https://www.npmjs.com/package/fluent-html)

## License

ISC
