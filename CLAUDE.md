**IMPORTANT: Lint the code often.**

**IMPORTANT: SSR HTMX apps — prefer HTMX over client-side JS; CSR/JS needs explicit sign-off.** See [§ HTMX-First Architecture](#htmx-first-architecture).

# Project Guidelines

**Stack:** Fastify v5 + TypeScript + fluent-html + HTMX + Tailwind CSS (SSR app)

> References: [fluent-html.md](fluent-html.md) | [htmx.md](htmx.md) | [views.md](views.md) | [fastify.md](fastify.md) | [typescript.md](typescript.md) | [performance.md](performance.md)

> **Additional guidelines** (read when relevant):
> - [Analytics](../analytics/CLAUDE.md) — Read when implementing tracking, defining metrics, or making data-driven product decisions
> - [Marketing](../marketing/CLAUDE.md) — Read when building landing pages, writing copy, setting up emails, or planning growth experiments
> - [Quality Assurance](../quality-assurance/CLAUDE.md) — Read when writing tests, fixing bugs, or preparing for deployment
> - [Brand Book](../brand-book/CLAUDE.md) — Read when styling UI, choosing colors/fonts, writing copy, or using logos
> - [Project Management](../project-management/CLAUDE.md) — Read when managing tasks, logging bugs, or recording architecture decisions

---

## HTMX-First Architecture

SSR apps. Interactivity = HTMX swapping server-rendered partials. Client-side JS / CSR is a last resort needing explicit sign-off.

- **Server round-trip by default** — state changes, lists, forms, modals, inline edits swap a server-rendered partial (`reply.renderView(...)`). Never build/mutate UI in the browser.
- **`.behavior()` for pure-client interactions** (toggle, drawer, clipboard, dismiss, back, focus) — never inline `<script>` / `onclick`. See [§ HTMX](#htmx).
- **No `public/js/` additions, no SPA frameworks** (React/Vue/Alpine). Think it's impossible without JS? Get sign-off first, scope JS to that feature.
- **OK reasons:** canvas, interactive charts, media editors, offline, sub-round-trip latency. **Not OK:** "easier", "fewer requests", habit, porting a client-side pattern.

---

## Code Editing Rules

- **Only change what was requested** — do not rewrite or refactor surrounding code. Never uncomment intentionally commented-out code.
- **Confirm the target** before writing files — ask which repo/directory if ambiguous. Common: `guidelines/` for guides, project repos for project content, `public/` for static files.

---

## Content & Copy

- **Never assume a client has launched** — don't imply existing business, customers, or established processes unless explicitly stated.

---

## SVG & Visual Assets

- **Apply changes precisely as specified** — exact colors, opacity values, positions.
- **No decorative flourishes** (constellation patterns, complex backgrounds) unless asked.
- **Small incremental changes** — expect multiple positional tweaking rounds.

---

## Tailwind CSS (v4)

- **No dynamic class interpolation** — prefer literal fluent calls; when a token must come from a variable, put it in `defineTheme()`'s `staticManifest` so the extractor still emits it.
- **v4 build wiring** — fluent classes never appear as literal text in source, so v4's auto-detection can't see them. A prebuild step (`generateFluentSafelist`) writes a `@source inline("…")` **file** your CSS `@import`s (a real file — Tailwind only resolves disk `@import`s). Never `content.extract` (removed in v4) or a hand-rolled `combinedExtractor`; use `@import "tailwindcss"` (not `@tailwind` directives).
- **v4 semantics** — bare `.ring()` = 1px (was 3px) + `currentColor`; bare `.border()` = `currentColor` (add a color: `.border("gray-300")`); `Button()` has **no default cursor** (add `.cursor("pointer")`); prefer `.flex().gap()` over `space-*`; `.outline("hidden")` over `.outline("none")`; gradients are `.gradient()`/`.bgLinear()` → `bg-linear-*` (not v3 `bg-gradient-*`).

---

## Deployment

- **Deploy scripts are interactive** and cannot be run via Bash. After code changes, just commit and push — let the user handle deployment unless they explicitly ask otherwise.

---

## Project Management (MANDATORY)

If `project/pm/` exists, follow the [Project Management Guidelines](../project-management/CLAUDE.md) — updates are **non-optional**, do them inline as you work, not at the end.

**PM scripts** (run these when starting work or when asked for status):
- `npm run focus` — prioritized "what's next" list: critical bugs, uphill stories needing decisions, then executable tasks
- `npm run hill` — hill phase overview: what needs decisions (uphill) vs ready to execute (downhill), flags stuck scopes
- `npm run tree` — scope tree with task counts and hill status at each level

---

## fluent-html

> Full reference: [fluent-html.md](fluent-html.md)

**Variadic children** — never wrap in arrays:
```typescript
Div(H1("Title"), P("Body"))              // ✓
Div([H1("Title"), P("Body")])            // ✗
```

**Specialized tag methods** — never use addAttribute for standard props:
```typescript
Button("Save").setType("submit")         // ✓
Button().addAttribute("type", "submit")  // ✗
```

**`formFor<T>()`** — use for type-safe form fields; never untyped `.setName()` when a schema exists. `T` is the controller's request type — import it, don't redeclare. See [fluent-html.md § Type-Safe Forms](fluent-html.md#type-safe-forms--formfort).

**Control flow:**
```typescript
IfThen(user.isAdmin, () => Button("Admin Panel"))
ForEach(users, (user) => Li(user.name))
Match(status, {
  active: () => Span("Active"),
  error:  () => Span("Error"),
}, () => Span("Unknown"))
```

**Discriminated union `Match`** — pass a discriminant key for automatic type narrowing:
```typescript
Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),   // s narrowed to { status: "error"; message: string }
  success: (s) => UserList(s.data),   // s narrowed to { status: "success"; data: User[] }
})
```

Reach for `Match` on a discriminant whenever you dispatch on a string field or a DU prop — never chained `IfThen` or a derived boolean:
```typescript
IfThen(x.status === "PENDING", () => …)                        // ✗ chain: non-exhaustive, no narrowing
IfThen(x.status === "DONE",    () => …)                        // ✗
const isOk = props.state === "success"                          // ✗ flag: loses the union; needs re-checks
Match(x, "status", { PENDING: (s) => …, DONE: (s) => … })      // ✓ exhaustive, each branch narrowed
```

**IfThen narrows nullable values** — callback receives the non-null type:
```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))           // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string
IfThen(user.avatar, () => Img().setSrc(user.avatar!))           // ✗ don't re-check/cast
IfThen(!!user.avatar, () => Img().setSrc(user.avatar!))         // ✗ !! collapses to boolean → forces !
IfThen(user.avatar != null, () => Img().setSrc(user.avatar!))  // ✗ same problem via != null
user.name ? Span(user.name) : Span("Anon")                     // ✗ use IfThenElse
IfThen(items.length > 0, () => List(items))                    // ✗ paired with the next line…
IfThen(items.length === 0, () => Empty())                      // ✗ …use IfThenElse (one eval, can't drift)
```

**Boolean attributes** — `.toggle()` with optional condition:
```typescript
Input().toggle("required")                        // ✓ always on
Input().toggle("required", isRequired)            // ✓ conditional
Option(city).toggle("selected", city === current) // ✓ expression
```

**Arbitrary values** — unit-based overloads for sizing/spacing/position:
```typescript
Div().minH("px", 180)       // → min-h-[180px]
Div().w("rem", 12)          // → w-[12rem]
// Units: px | rem | em | % | vh | vw | dvh | svh | lvh
// Methods: w, h, minW, maxW, minH, maxH, p, m (+ px…pr, mx…mr), gap, top, right, bottom, left, inset
```

**Escape hatches (6.8+) — one per situation, never `setClass`/`addClass` styling** (lint-blocked at error level):
- Arbitrary value of a covered utility → bracket arm or unit overload: `.text("[13px]")`, `.opacity("[0.33]")`, `.w("px", 180)`
- CSS property with no Tailwind utility → `.cssProp("mask-repeat", "no-repeat")` → `[mask-repeat:no-repeat]` (literal args only — non-literals fail the safelist build)
- Legit non-Tailwind class (JS hook, third-party) → `.cssClass("js-map-container")`
- Runtime-computed style value → `.setStyle(...)` (extractor-opaque, dynamic-safe)

**Conditional modifiers & composition:**
```typescript
Button("Save").when(isLoading, t => t.toggle("disabled").opacity("50"))

const card = (t: Tag) => t.p("6").bg("white").rounded("lg").shadow("md");
Div("Content").apply(card)
```

**Scoped context** — use for cross-cutting values read by many components (i18n, theme, auth, nonce, feature flags) instead of prop drilling. Use props for component-specific data. **Never use `AsyncLocalStorage`** for render-time data — context is sufficient for synchronous rendering:
- `createContext(defaultValue)` — returns default when no scope active
- `createRequiredContext(name)` — throws if accessed outside a scope (use for auth, request data)

---

## Fluent Tailwind Styling

**Method name = Tailwind class prefix** (`.bg`, `.p`, `.text`, `.px`/`.mt`, …) — derive the method from the class you know. Merged prefixes take every value family their prefix does; the argument discriminates (`.text("lg")` / `.text("red-500")` / `.text("center")`). Negative utilities go through `.neg("mt-2")`; compound prefixes keep the longest camelCase name (`text-shadow-lg` → `.textShadow("lg")`).

**Fluent methods** — not `setClass` with Tailwind strings (fluent methods provide type safety + IDE autocomplete). **`.on()` for pseudo-classes, `.at()` for breakpoints** — not `addClass`:
```typescript
Button("Save")
  .px("4").bg("blue-500").text("white").rounded()
  .transition("colors")
  .on("hover", t => t.bg("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ring("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md", t => t.px("8").text("lg"))
```

**Theming** — define tokens once with `defineTheme(tokens)`; never hand-maintain theme objects, per-app `inputStyle`, or `@theme` CSS by hand. One `tokens` const → typed methods + `@theme` CSS + safelist. Custom tokens become typed via a once-written `declare module` that **derives** from the const (`ThemeKeys<typeof tokens, "colors">`) — add tokens to the const, never edit the augmentation. Component "presets" (card/button styles) are user-land `.apply()` helpers, **not** `defineTheme` (tokens only: colors/spacing/fontSize/radius/shadow).
```typescript
const tokens = { colors: { brand: "#ff5500" } } as const;
export const theme = defineTheme(tokens);
declare module "fluent-html" { interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {} }

Div().bg("brand")        // ✓ typed token
Div().bg("brnad")        // ✗ compile error (closed unions)
const card = (t: Tag) => t.p("6").rounded("lg").shadow("md");  // ✓ preset = composition
Div().apply(card)                // ✓ NOT defineTheme
```

---

## HTMX

> Full reference: [htmx.md](htmx.md) — read when implementing HTMX interactions

Critical rules:
- **SSR-first** — every interaction is a server round-trip that swaps a rendered partial; client-side JS needs a strong, stated reason (see [§ HTMX-First Architecture](#htmx-first-architecture))
- **`defineRoutes`** for endpoints, **`defineIds`** for targets — never hardcode strings
- **`outerMorph`** swap by default — preserves focus, scroll, animations
- **`setHtmx`** for in-app navigation — never `setHref` (causes full reload)
- **`.resolve(query?)`** for redirects — never manual URL builders or query string concatenation
- **`hxResponse(view).…build()`** for any response needing HX-* headers (redirect, push-url, trigger, reswap) — never `reply.header("HX-*", ...)` by hand
- **Anchors with `setHtmx`** need `.cursor("pointer")`
- **Back navigation** — default to `.behavior("back")` for any "go back / return to previous" affordance; never hardcode a parent route. Breadcrumbs are *not* back navigation — each crumb targets a specific ancestor via `setHtmx`.
- **Partial swaps** for multi-section updates in one response
- **htmx 4**: attributes don't inherit — use `:inherited` modifier
- **Almost everything uses full-layout swap** targeting `ids.mainContent` — including forms, modals, and inline edits. Feature-specific targets are rare; default to the full-layout pattern.

**`defineRoutes` / `defineIds`** — define in `[feature].routes.ts`. Use typed params (`"string"`, `"number"`, or an enum tuple) for compile-time safety:
```typescript
export const ids = defineIds(["mainContent", "userList", "userCount"] as const);
export const userRoutes = defineRoutes("/users", {
  list:   { method: "GET",  path: "/" },
  create: { method: "POST", path: "/" },
  detail: { method: "GET",  path: "/:id", params: { id: "number" } as const },
} as const);
```

**Full layout navigation** — the default pattern:
```typescript
A("Settings").setHtmx(settingsRoutes.index({
  swap: "outerMorph scroll:top",
  target: ids.mainContent,
  pushUrl: true,
})).cursor("pointer")
```

**Partial swaps** — surgical multi-section updates in one response; reach for these before defaulting to full-layout replacement:
```typescript
render(Partial(ids.mainContent, List(items)), Partial(ids.navBadge, Span(`${items.length}`)))  // ✓
```

**`.behavior()` for client-side interactions** — never raw inline JS. Emits flat `data-behavior-*` attributes (zero inline JS, strict-CSP-safe) executed by the fluent-behaviors runtime asset loaded once in the layout head:
```typescript
Button("Toggle").behavior("toggle", { target: ids.filterPanel })
Button("Menu").behavior("drawer", { target: ids.mobileMenu, backdrop: ids.menuBackdrop, trapFocus: true })
Button("Copy").behavior("clipboard", { value: apiKey, feedback: { mode: "text", text: "Copied!" } })
A("Back").behavior("back").cursor("pointer")
```
Built-in (10): `toggle`, `toggleClass`, `remove`, `clipboard`, `drawer`, `onEscape`, `onClickOutside`, `resetOnSuccess`, `back`, `focus`. Overlap rule: `drawer` for overlay bundles; `toggle` for simple show/hide; `onClickOutside` for non-overlay dismissal. There is no inline-JS hatch; never hand-write `data-behavior*` attributes.

**Back navigation — default to `.behavior("back")`** — for any "Back" / "Return" control, pop the browser history stack rather than re-navigating to a hardcoded route. `back` emits a native `history.back()`, so it returns the user to wherever they actually came from and restores HTMX's prior page snapshot (content + scroll) — correct regardless of entry path:
```typescript
A("← Back").behavior("back").cursor("pointer")        // ✓ returns to the previous page
A("← Back").setHtmx(projectRoutes.list({ ... }))      // ✗ assumes the user came from the list
```
**Breadcrumbs target specific ancestors** — a crumb must always reach its exact route, regardless of history, so use `setHtmx` to that route. Reserve `.behavior("back")` for a standalone "Back" affordance, not the breadcrumb trail:
```typescript
// Breadcrumb: Home › Projects › Acme
A("Projects").setHtmx(projectRoutes.list({ target: ids.mainContent, pushUrl: true })).cursor("pointer")  // ✓
```
`back` takes no options and relies on a prior history entry existing; there is no built-in `forward` / `go(n)`.

---

## View Composition

> Full reference: [views.md](views.md) — read when building views or creating new features

- **Components = plain functions** with a typed props object (never positional args)
- **One view file per page/endpoint response** — split by interaction, not size
- **Each view exports a single main function** + any tightly-coupled sub-components
- **Shared components** (rows, cards, badges) in `[feature].components.ts`
- **Keep `ids` in `[feature].routes.ts`** — views import them, never define their own
- **Discriminated unions** for page states — use `Match()`, not conditionals
- **!IMPORTANT:** Always abstract and reuse components — avoid code duplication
- **!IMPORTANT: Decompose large page functions** — a page function should be a thin composition shell (~30 lines max of view code). Extract named sub-components for each logical section (header, navigation, content areas). Each `Match` branch with non-trivial logic should be its own named component. See [views.md § Decomposing page functions](views.md#decomposing-page-functions).

---

## Prisma

**Use `include`/`select`** — never query in loops (N+1).

**Use Prisma generated types** for view props:
```typescript
type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>;
function UserDetail(user: UserWithPosts) { ... }
```

---

## Fastify

> Full reference: [fastify.md](fastify.md)

**Feature module structure:**
```
src/[feature]/
  [feature].routes.ts       # Route definitions (defineRoutes + ids)
  [feature].controller.ts   # Request handlers
  [feature].schema.ts       # JSON Schema + TS interfaces
  [feature].utils.ts        # Helpers
  views/
    [feature].list.view.ts    # List/table view
    [feature].form.view.ts    # Create/edit form
    [feature].detail.view.ts  # Single-item detail
    [feature].components.ts   # Shared components (rows, cards, badges)
```

**`handle` helper** — bind routes via `defineRoutes` route refs, never raw `server.get`/`server.post`:
```typescript
const getUsers = handle(server, userRoutes.list, async (_request, reply) => { ... });
const postUser = handle(server, userRoutes.create,
  { schema: createUserSchema },
  async (request: FastifyRequest<{ Body: CreateUserReq }>, reply) => { ... },
);
```

**Handler naming:** `httpVerb` + `SemanticName` in camelCase (`getLoginPage`, `postLogin`, `deleteUser`).

**SSR responses only** — no JSON errors:
```typescript
reply.renderView(PageView());                                         // ✓
reply.code(422).renderView(CreateUserForm({ email: "Email taken" })); // ✓ validation error
reply.redirect("/path");                                              // ✓ redirect
reply.code(400).send({ error: "Bad request" });                       // ✗ not a REST API
```

**Auth via preHandler:**
```typescript
const getDashboard = handle(server, dashboardRoutes.index,
  { preHandler: [requireAuth] },
  async (request, reply) => { ... },
);
```

**Always `as const` on JSON Schema type values** — inference breaks without it:
```typescript
properties: { email: { type: "string" as const } }  // ✓
properties: { email: { type: "string" } }            // ✗
```

---

## TypeScript

> Full reference: [typescript.md](typescript.md)

- **Narrowest type by default** — `as const`, `satisfies`, `const` type parameters, literal types. Widen only when you have a reason to.
- **`type` over `interface`** (exception: Fastify module augmentation)
- **Discriminated unions** for state — no optional booleans, no bags of optionals
- **String literal unions** — never bare `string` where only specific values are valid
- **Exhaustive checks** with `assertNever`
- **Branded types** to prevent ID mixups (`UserId`, `PostId`)
- **No magic constants** — extract into named variables

---

## Security

- **Authentication endpoints must have rate limiting** — every login, password reset, and OTP verification endpoint must include rate limiting (by IP and by identifier). No exceptions. Without it, attackers can brute-force credentials at thousands of attempts per second.
- **Use identical error messages for auth failures** — never reveal whether an email exists or a password is wrong. Always: `"Invalid email or password"`. Different messages enable user enumeration.

---

## SSH & Production Access

- SSH credentials for production are in `.deploy.json` — use these when the user asks to SSH to prod
- **Always confirm with the user** before SSHing to production — never connect without explicit approval, even when diagnosing live issues
