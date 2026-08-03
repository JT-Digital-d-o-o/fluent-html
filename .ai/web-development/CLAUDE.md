**IMPORTANT: SSR HTMX apps — prefer HTMX over client-side JS; CSR/JS needs explicit sign-off.** See [§ HTMX-First Architecture](#htmx-first-architecture).

**IMPORTANT: "Design" always means pure HTML + Tailwind CSS. Nothing else** — no React/Vue/Alpine, no Figma or image mockups, no Bootstrap or other CSS frameworks, no hand-written CSS. See [§ Designs](#designs).

**IMPORTANT: Lint the code often.**

# Project Guidelines

**Stack:** Fastify v5 + TypeScript + fluent-html + HTMX + Tailwind CSS (SSR app)

> References: [fluent-html.md](.ai/web-development/fluent-html.md) | [htmx.md](.ai/web-development/htmx.md) | [views.md](.ai/web-development/views.md) | [fastify.md](.ai/web-development/fastify.md) | [typescript.md](.ai/web-development/typescript.md) | [performance.md](.ai/infrastructure/performance.md)

> **Additional guidelines** (read when relevant):
> - [Analytics](.ai/analytics/CLAUDE.md) — Read when implementing tracking, defining metrics, or making data-driven product decisions
> - [Marketing](.ai/marketing/CLAUDE.md) — Read when building landing pages, writing copy, setting up emails, or planning growth experiments
> - [Quality Assurance](.ai/quality-assurance/CLAUDE.md) — Read when writing tests, fixing bugs, or preparing for deployment
> - [Brand Book](.ai/brand-book/CLAUDE.md) — Read when styling UI, choosing colors/fonts, writing copy, or using logos
> - [Project Management](.ai/project-management/CLAUDE.md) — Read when managing tasks, logging bugs, or recording architecture decisions
> - [Infrastructure](.ai/infrastructure/CLAUDE.md) — Read when a project needs rendering (RenderBox), LLM inference, the message broker, object storage, or hosting

---

## Designs

**Company-wide, no exceptions.** When anyone at JT Digital says **"design"** — a mockup, a prototype, a page comp, "make a design for X" — the deliverable is **pure HTML + Tailwind CSS. Nothing else.**

- **Yes:** self-contained `.html` file(s) styled entirely with Tailwind utility classes.
- **No:** React / Vue / Alpine / any JS framework; Figma files or image mockups; Bootstrap / Bulma / other CSS frameworks; hand-written CSS, `<style>` blocks, or CSS modules; component libraries (MUI, shadcn, …).
- **Static-first** — show each state as its own screen. If an interaction genuinely must be demonstrated, minimal inline vanilla JS only, never a framework.
- **Brand still applies** — colors, type, spacing, and components come from the [Brand Book](.ai/brand-book/CLAUDE.md).

Turning a design into the running app is a *separate* step: SSR views are authored in **fluent-html**, which emits the same HTML + Tailwind (see [§ HTMX-First Architecture](#htmx-first-architecture)). The *design* is raw HTML + Tailwind; the *app* reproduces it in fluent-html. Don't blur the two — never ship raw `.html` as app views, and never hand a fluent-html file over as "the design."

---

## HTMX-First Architecture

SSR apps. Interactivity = HTMX swapping server-rendered partials. Client-side JS / CSR is a last resort needing explicit sign-off.

- **Server round-trip by default** — state changes, lists, forms, modals, inline edits swap a server-rendered partial (`reply.renderView(...)`). Never build/mutate UI in the browser.
- **`.behavior()` for pure-client interactions** (toggle, drawer, clipboard, dismiss, back, focus) — never inline `<script>` / `onclick`. See [§ HTMX](#htmx).
- **No `public/js/` additions, no SPA frameworks** (React/Vue/Alpine). Think it's impossible without JS? Get sign-off first, scope JS to that feature.
- **OK reasons:** canvas, interactive charts, media editors, offline, sub-round-trip latency. **Not OK:** "easier", "fewer requests", habit, porting a client-side pattern.

---

## Code Editing Rules

- **DON'T write superfluous comments** — comment only on a real need (non-obvious *why*, a gotcha), and think twice even then. Never narrate what the code already says.
- **Only change what was requested** — do not rewrite or refactor surrounding code. Never uncomment intentionally commented-out code.
- **Confirm the target** before writing files — ask which repo/directory if ambiguous. Common: `guidelines/` for guides, project repos for project content, `public/` for static files.

---

## Content & Copy

- **No em dashes (—) in prose or copy. Strict.** Rewrite with a comma, a colon, parentheses, or two sentences. Applies to all user-facing text: UI copy, emails, landing pages, marketing. En dash (–) is fine only for numeric ranges (`9–5`), never as a sentence connector.
- **Never assume a client has launched:** don't imply existing business, customers, or established processes unless explicitly stated.

---

## SVG & Visual Assets

- **Apply changes precisely as specified** — exact colors, opacity values, positions.
- **No decorative flourishes** (constellation patterns, complex backgrounds) unless asked.
- **Small incremental changes** — expect multiple positional-tweaking rounds.

---

## Tailwind CSS (v4)

- **No dynamic class interpolation** — prefer literal fluent calls; when a token must come from a variable, put it in `defineTheme()`'s `staticManifest` so the extractor still emits it.
- **v4 build wiring** — fluent classes never appear as literal text in source, so v4's auto-detection can't see them. A prebuild step (`generateFluentSafelist`) writes a `@source inline("…")` **file** your CSS `@import`s (a real file — Tailwind only resolves disk `@import`s). Never `content.extract` (removed in v4) or a hand-rolled `combinedExtractor`; use `@import "tailwindcss"`, not `@tailwind` directives.
- **v4 semantics** — bare `.ring()` = 1px (was 3px) + `currentColor`; bare `.border()` = `currentColor` (add a color: `.border("gray-300")`); `Button()` has **no default cursor** (add `.cursor("pointer")`); prefer `.flex().gap()` over `space-*`; `.outline("hidden")` over `.outline("none")`; gradients are `.gradient()`/`.bgLinear()` → `bg-linear-*` (not v3 `bg-gradient-*`).

---

## Deployment

- **Deploy scripts are interactive** and cannot be run via Bash. After code changes, commit and push — let the user handle deployment unless they explicitly ask otherwise.
- **No PM2, no process supervisors.** Prod host (cPanel/LiteSpeed) runs apps as on-demand `lsnode` processes; PM2 daemons die silently there. Never add `ecosystem.config`, `pm2` commands, or long-lived workers. Off-request work → declarative cron; heavy compute → AMQP fleet via `submitService` (submit and return, no local worker).

---

## Project Management (MANDATORY)

If `project/pm/` exists, follow the [Project Management Guidelines](.ai/project-management/CLAUDE.md) — updates are **non-optional**, do them inline as you work, not at the end. **Every session: read `roadmap.md` first, run `npm run focus`, and update `roadmap.md` last.** PM is born lazy (`npm run pm:init`, then scope files only when work begins) and kept live (never let it go dark while code ships).

**PM scripts** (start of work / status): run `npm run focus` first. Full set in the [PM Tooling table](.ai/project-management/CLAUDE.md#tooling).

---

## fluent-html

> Full reference: [fluent-html.md](.ai/web-development/fluent-html.md)

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

**`Form<T>()`** — typed form binding; field names constrained to schema keys (a typo is a compile error); never untyped `.setName()` when a schema exists. `T` is the controller's request type — import it, don't redeclare. See [fluent-html.md § Type-Safe Forms](.ai/web-development/fluent-html.md#type-safe-forms--formt).

**Control flow:**
```typescript
IfThen(user.isAdmin, () => Button("Admin Panel"))
ForEach(users, (user) => Li(user.name))
Match(status, {
  active: () => Span("Active"),
  error:  () => Span("Error"),
}, () => Span("Unknown"))
```

**Lists — `ForEach`, never raw `.map()`:** only `ForEach` carries the count/range overloads and the `ForEachKeyed` morph-stable upgrade path; a spread/array `.map()` silently forfeits keyed reconciliation (focus/scroll on reorder). The `prefer-foreach` lint (eslint-plugin-fluent-html ≥ v1.9.0) flags and autofixes **every** form — spread, array child, and the tempting named-component ref `Div(...ITEMS.map(Card))`. This is *not* `prefer-variadic-children` (that one only catches a literal `[a, b]` array, never a `.map()` call), so on a project pinned below v1.9.0 nothing flags a `.map()` child — write `ForEach` by hand.
```typescript
Ul(ForEach(users, (u) => Li(u.name)))      // ✓ the list primitive
Div(ForEach(STATS, StatBlock))             // ✓ named component ref — pass it straight to ForEach
Ul(...users.map((u) => Li(u.name)))        // ✗ spread .map — prefer-foreach → Ul(ForEach(users, …))
Div(...STATS.map(StatBlock))               // ✗ same violation, named ref → Div(ForEach(STATS, StatBlock))
Ul(users.map((u) => Li(u.name)))           // ✗ array child — prefer-foreach (NOT prefer-variadic-children)
```

**Keyed iteration** — `ForEachKeyed(items, keyOf, render)` stamps a stable `id` per row root so idiomorph matches rows by key across reorder/insert/delete (plain `ForEach` morphs positionally, losing focus/scroll). `render` must return a `Tag`.
```typescript
ForEachKeyed(users, (u) => u.id, (u) => Li(u.name))   // id stamped from keyOf automatically
```

**Discriminated union `Match`** — pass a discriminant key for automatic type narrowing:
```typescript
Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),   // s narrowed to { status: "error"; message: string }
  success: (s) => UserList(s.data),   // s narrowed to { status: "success"; data: User[] }
})
```

Reach for `Match` on a discriminant whenever you dispatch on a string field or DU prop — never chained `IfThen` or a derived boolean:
```typescript
IfThen(x.status === "PENDING", () => …)                        // ✗ chain: non-exhaustive, no narrowing
IfThen(x.status === "DONE",    () => …)                        // ✗
const isOk = props.state === "success"                          // ✗ flag: loses the union; needs re-checks
Match(x, "status", { PENDING: (s) => …, DONE: (s) => … })      // ✓ exhaustive, each branch narrowed
```

**Value mapping & separators** — not a ternary for a value lookup:
```typescript
MatchValue(trend, { up: "↑", down: "↓" }, "→")          // ✓ value→value, keeps the literal union; cases are plain values
Intersperse(crumbs, c => A(c.label), () => Span("/"))    // ✓ separator between mapped Views, never after the last
state === "ok" ? "success" : "text-faint"                // ✗ value lookup as ternary → MatchValue
// a MatchValue result assigns into .bg()/.border() only if every value is a real theme token
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
// Methods: w, h, minW, maxW, minH, maxH, p, m (+ px…pr, mx…mr), gap, top, right, bottom, left, inset,
//          text, leading, tracking, underlineOffset
// text's unit overload is an escape hatch, not the default — type stays on the named scale
```

**Escape hatches (6.8+) — one per situation, never `setClass`/`addClass` styling** (lint-blocked at error level):
- Arbitrary value of a covered utility → bracket arm or unit overload: `.opacity("[0.33]")`, `.z("[999]")`, `.w("px", 180)`
- CSS property with no Tailwind utility → `.cssProp("mask-repeat", "no-repeat")` → `[mask-repeat:no-repeat]` (literal args only — non-literals fail the safelist build)
- Legit non-Tailwind class (JS hook, third-party) → `.cssClass("js-map-container")`
- Runtime-computed style value → `.setStyle(...)` (extractor-opaque, dynamic-safe)

**Conditional modifiers & composition:**
```typescript
Button("Save").when(isLoading, t => t.toggle("disabled").opacity("50"))
Badge(label).whenElse(active,                              // ✓ one Tag, two mutually-exclusive branches
  t => t.bg("success/10").text("success"),
  t => t.bg("surface-2").text("text-faint"))
Badge(label).when(active, t => …).when(!active, t => …)   // ✗ .when(x)/.when(!x) pair — use whenElse

Span(s).whenMatch(s, {                                     // ✓ one modifier per variant — missing case = compile error
  active: t => t.bg("success/10").text("success"),
  closed: t => t.bg("surface-2").text("text-dim") })
Span(s).when(s === "active", t => t.bg("success/10"))
       .when(s === "closed", t => t.bg("surface-2"))  // ✗ chained .when on a discriminant — use whenMatch

const card = (t: Tag) => t.p("6").bg("surface").rounded("card").shadow("md");
Div("Content").apply(card)
```
`.when`/`.whenElse` run on `!= null` and pass the narrowed non-null value, like `IfThen`.

`.whenMatch(value, cases, defaultFn?)` (v6.5+) is the styling twin of `Match`; a subset of cases needs an explicit `defaultFn`. Keep each branch's fluent calls literal so the extractor sees the classes. The family: `IfThen → when`, `IfThenElse → whenElse`, `Match → whenMatch`.

---

## Fluent Tailwind Styling

**Method name = Tailwind class prefix** (`.bg`, `.p`, `.text`, `.px`/`.mt`, …) — derive the method from the class you know. Merged prefixes take every value family their prefix does; the argument discriminates (`.text("lg")` / `.text("red-500")` / `.text("center")`). Negative utilities go through `.neg("mt-2")`; compound prefixes keep the longest camelCase name (`text-shadow-lg` → `.textShadow("lg")`).

**Fluent methods** — not `setClass` with Tailwind strings (fluent methods give type safety + IDE autocomplete). **Variants are typed style objects** — tier-1 states/breakpoints are direct methods (`.hover({…})`, `.md({…})`), the long tail goes through `.variant(name, {…})` — never `addClass`:
```typescript
Button("Save")
  .px("4").bg("primary").text("on-accent").rounded("control")
  .transition("colors")
  .hover({ bg: "primary-700", scale: "105" })
  .focus({ ring: "2", outline: "hidden" })
  .focus({ ring: "primary/40" })            // one key per prefix — 2nd family chains
  .disabled({ opacity: "50", cursor: "not-allowed" })
  .md({ px: "8", text: "lg", hover: { bg: "primary-800" } })  // nesting stacks: md:hover:*
```
Keys = the canonical style names; `true` for no-arg utilities (`truncate: true`), `undefined`/`false` skipped (`bg: cond ? "primary-700" : undefined`), tuples for multi-arg (`border: ["top", "line-strong"]`). Tier-1: `hover focus focusVisible focusWithin active disabled checked dark first last odd even groupHover peerChecked before after sm md lg xl xl2` (`xl2` → `2xl:`). Everything else: `.variant("data-[state=open]", {…})`, `.variant("@sm", {…})`.

**Theming** — define tokens once with `defineTheme(tokens)`; never hand-maintain theme objects, per-app `inputStyle`, or `@theme` CSS. One `tokens` const → typed methods + `@theme` CSS + safelist. Custom tokens become typed via a once-written `declare module` that **derives** from the const (`ThemeKeys<typeof tokens, "colors">`) — add tokens to the const, never edit the augmentation. Component "presets" (card/button styles) are user-land `.apply()` helpers, **not** `defineTheme` (tokens only: colors/spacing/fontSize/radius/shadow).

**Never write a palette literal in a view.** `gray-*` / `blue-*` / `slate-*` survive no rebrand: every color goes through a token. Token names are **roles, not a numeric ramp** (`surface-2`, `text-dim`, `line-strong` — not `ink-300`); two jobs sharing one hex today are two tokens. **Tints come from the opacity modifier** (`bg("success/10")`), never a `success-100` sibling. A **dark surface is a second prefixed family** (`night-*`) added when a design needs one — purely additive, so don't guess it up front. Keep the scales closed: `rounded("card" | "control")` with `rounded("full")` literal (a pill is a shape, not a brand), and `.text()` sizes on the named scale, never `.text("rem", 0.82)`.
```typescript
const tokens = {
  colors: { primary: "#2563eb", surface: "…", "text-dim": "…", line: "…", danger: "…" },
  radius: { card: "0.75rem", control: "0.5rem" },
} as const satisfies ThemeSpec;
export const theme = defineTheme(tokens);
declare module "fluent-html" { interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {} }

Div().bg("surface").border("line")   // ✓ typed role tokens
Span(msg).bg("danger/10")            // ✓ tint via the opacity modifier
Div().bg("gray-100")                 // ✗ palette literal — dies on the next rebrand
Div().bg("surfcae")                  // ✗ compile error (closed unions)
const card = (t: Tag) => t.p("6").rounded("card").shadow("md");  // ✓ preset = composition
Div().apply(card)                // ✓ NOT defineTheme
```

---

## HTMX

> Full reference: [htmx.md](.ai/web-development/htmx.md) — read when implementing HTMX interactions

Critical rules:
- **SSR-first** — every interaction is a server round-trip that swaps a rendered partial; client-side JS needs a strong, stated reason (see [§ HTMX-First Architecture](#htmx-first-architecture))
- **`defineRoutes`** for endpoints, **`defineIds`** for targets — never hardcode strings
- **`outerMorph`** swap by default — preserves focus, scroll, animations
- **Swap verb (`.nav`/`.submit`/`.fragment`) for in-app navigation — never `setHref`** (full reload); see the [navigation ladder](.ai/web-development/htmx.md#navigation-api-ladder) for when to drop to `setHtmx`/`hx`. A trigger-shaped gesture has a verb too: `.search` (debounced filter), `.onChange` (control re-render), `.poll` (self-refresh)
- **`.resolve(query?)`** / route callables (`route({ query })`) for redirects & links, **`hx(url, { query })`** for ad-hoc URLs — never manual URL builders or query string concatenation (both url-encode + join `?`/`&`; `query` ≠ `vals`, which is the request body)
- **`hxResponse(view).…build()`** for any response needing HX-* headers (redirect, push-url, trigger, reswap) — never `reply.header("HX-*", ...)` by hand
- **Anchors with a swap verb** need `.cursor("pointer")` (the verbs don't add it)
- **Back navigation** — default to `.behavior("back")` for any "go back / return to previous" affordance; never hardcode a parent route. Breadcrumbs are *not* back navigation — each crumb targets its specific ancestor via `.nav()`.
- **Partial swaps** for multi-section updates in one response
- **In-flight buttons come free** — any button that fires a request auto-disables (and dims) until the response lands; never add a double-submit guard. For a slow action (upload, external API) use `LoaderButton({ label, loadingLabel })` — adds a label swap and spinner. Don't style the trigger off `.htmx-request` (it goes to the global bar, not the trigger). Raw `.setHtmx()` opts out.
- **htmx 4**: attributes don't inherit — use `:inherited` modifier
- **File uploads: pass `{ encoding: "multipart/form-data" }` in the route options AND `.setEnctype(...)`** — htmx 4 sends FormData only with `hx-encoding` (no longer falls back to the form's `enctype`); `.setEnctype()` alone → urlencoded → 406 "the request is not multipart". See [htmx.md § File uploads](.ai/web-development/htmx.md#file-uploads-multipart).
- **Swap verbs** `.nav()` / `.submit()` / `.fragment()` / `.poll()` / `.search()` / `.onChange()` / `.fire()` (in `src/core/htmx/swap-verbs.ts`) — `.nav(route)` for navigation links + history-pushing submits (morph `ids.mainContent` + `show:top` + push), `.submit(route)` for in-place forms/actions (no scroll/history), `.fragment(target, route, swap?)` for sub-region updates. Drop to `setHtmx(route({…}))` only for what the verbs don't cover (non-standard target, `replaceUrl`, status routing beyond `{ invalid }`).
- **Trigger verbs — `.search(route, delay?)` / `.search(target, route, delay?)`, `.onChange(route)`, `.fire(route)`** — never hand-rolled `trigger:` bags. `.search` emits `sync: "replace"` (debounced filter); `.onChange` emits `include: "closest form"` and reads best on the **control**; `.fire` emits `swap: "none"`. `.search` defaults to `include: "this"`; a route-level `include` (`"closest form"`, `"closest tr"`) wins. Widen the `include` instead of re-sending values as `vals` (`vals` is `set` — it overwrites what the user just typed).
- **Validation re-renders: `.submit(route, { invalid: ids.form })`** (also on `.nav`) — `hx-status:422` → the form region, plus `push:false` (`hx-push-url` is unconditional, so a rejected submit would strand the browser on the POST endpoint). The 422 must then render **the form region alone**: handler branches on `isHtmxRequest`, one exported component feeds both paths (see template sign-in). Full-page 422s need no `{ invalid }`. A route-level `status` bag wins.
- **Nothing may be built on `preload` / `optimistic`** — fluent-html types both and emits `hx-preload`; neither attribute exists in the htmx 4.0.0-beta4 runtime.
- **Self-polling fragments: `.poll(route, every?)`** — never a hand-rolled `trigger: "every …"` bag. Swaps `outerHTML`, never a morph (a morph resurrects settled pollers). Stop by omitting the verb (`.when(!terminal, t => t.poll(...))`). Poll endpoints answer with the polled fragment (terminal trigger-less variant for gone states, same element id) and take `pollRateLimit`. A `Partial` touching a poller swaps `"outerHTML"`. See [htmx.md § Polling](.ai/web-development/htmx.md#polling--the-poll-verb).

**`defineRoutes` / `defineIds`** — define in `[feature].routes.ts`. Use typed params (`"string"`, `"number"`, or an enum tuple) for compile-time safety:
```typescript
export const ids = defineIds(["mainContent", "userList", "userCount"] as const);
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",  path: "/" },
  create: { method: "post", path: "/" },
  detail: { method: "get",  path: "/:id", params: { id: "number" } as const },
} as const);
```

**Full-layout navigation** — the default pattern, via the swap verbs:
```typescript
A("Settings").nav(settingsRoutes.index()).cursor("pointer")   // morph #main-content + show:top + push history
Form(/* fields */).submit(userRoutes.create())                // in-place re-render (no scroll/history)
```

**Partial swaps** — surgical multi-section updates in one response; reach for these before full-layout replacement:
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
Built-in (10): `toggle`, `toggleClass`, `remove`, `clipboard`, `drawer`, `onEscape`, `onClickOutside`, `resetOnSuccess`, `back`, `focus`. Overlap rule: `drawer` for overlay bundles; `toggle` for simple show/hide; `onClickOutside` for non-overlay dismissal. Deleted → successors: `disable` → htmx `disable:` route option; `openDialog`/`closeDialog` → Invoker Commands + `setClosedby`; `formResetOnSwap` → `resetOnSuccess`; `dismissOnEscape` → `onEscape`; `scrollTo` → swap `scroll:top`. There is no inline-JS hatch (`.hxOn` is gone); never hand-write `data-behavior*` attributes. New verbs are framework-layer (`jt:` pack) — apps never register.

**Native open/close — prefer Commands/Popover over the dialog behaviors** (zero JS, no nonce):
```typescript
Button("Open").setCommand("show-modal").setCommandfor(ids.dialog)   // ✓ <button command commandfor> — drives a <dialog>
Button("Menu").setPopovertarget(ids.menu)                            // ✓ popover invoker
Div(...).setId(ids.menu).setPopover()                                // ✓ popover="auto" (light-dismiss + top-layer)
Dialog(...).setId(ids.dialog).setClosedby("any")                     // ✓ native dialog light-dismiss (click-outside + Esc)
Button("Cancel").setType("submit").setFormmethod("dialog")           // ✓ submit-and-close a <dialog>
Button("Open").behavior("openDialog", { target: ids.dialog })        // ✗ legacy JS path — kept, but not for new code
Div(...).addAttribute("popover", "auto")                             // ✗ untyped — use .setPopover()
```
Place a popover against its trigger by reusing one `Id`: `.anchorName(id)` on the trigger, `.positionAnchor(id).positionArea("bottom")` on the popover. See [§ HTMX](#htmx).

**Back navigation — default to `.behavior("back")`** — for any "Back" / "Return" control, pop the browser history stack rather than re-navigating to a hardcoded route. `back` emits a native `history.back()`, returning the user wherever they came from and restoring HTMX's prior page snapshot (content + scroll) — correct regardless of entry path:
```typescript
A("← Back").behavior("back").cursor("pointer")        // ✓ returns to the previous page
A("← Back").nav(projectRoutes.list())                 // ✗ assumes the user came from the list
```
**Breadcrumbs target specific ancestors** — a crumb must reach its exact route regardless of history, so use `.nav()` to that route. Reserve `.behavior("back")` for a standalone "Back" affordance, not the breadcrumb trail:
```typescript
// Breadcrumb: Home › Projects › Acme
A("Projects").nav(projectRoutes.list()).cursor("pointer")  // ✓
```
`back` takes no options and relies on a prior history entry existing; there is no built-in `forward` / `go(n)`.

---

## View Composition

> Full reference: [views.md](.ai/web-development/views.md) — read when building views or creating new features

- **Components = plain functions** with a typed props object (never positional args)
- **One view file per page/endpoint response** — split by interaction, not size
- **Each view exports a single main function** + any tightly-coupled sub-components
- **Shared components** (rows, cards, badges) in `[feature].components.ts`
- **Keep `ids` in `[feature].routes.ts`** — views import them, never define their own
- **Discriminated unions** for page states — use `Match()`, not conditionals
- **!IMPORTANT:** Always abstract and reuse components — avoid code duplication
- **!IMPORTANT: Decompose large page functions** — a page function is a thin composition shell (~30 lines max of view code). Extract named sub-components per logical section (header, navigation, content areas). Each `Match` branch with non-trivial logic is its own named component. See [views.md § Decomposing page functions](.ai/web-development/views.md#decomposing-page-functions).

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

> Full reference: [fastify.md](.ai/web-development/fastify.md)

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

## SEO

The template owns sitemap.xml, robots.txt, canonicals, and meta tags — never hand-roll any of them (no hand-emitted `Meta`/`Link` head tags, no static sitemap files, no `reply.header("X-Robots-Tag", ...)`).

- **Every public GET route must register with the sitemap** in its controller: `server.sitemap.add(route)` (in the sitemap) or `server.sitemap.exclude(route)` (out of it + `X-Robots-Tag: noindex`). The CI drift audit fails on any unaccounted route. Routes with a `preHandler` guard are auto-skipped — auth'd pages are never sitemap material and need no call.
- **`exclude` is for reachable-but-not-search-material** — auth pages, token/verification links, public share pages.
- **Parameterized public pages** use `sitemap.addDynamic(route, provider)` — the provider returns `{ params, lastmod? }` rows (typically a DB query). A failing or hanging provider degrades the sitemap; it never 500s or hangs it.
- **Page meta goes through Layout's `seo` prop** — `Layout({ title, seo: { description, ogImage?, jsonLd? } })`. Self-referencing canonicals are emitted automatically (and suppressed on excluded routes).

```typescript
server.sitemap.add(homeRoutes.index, legalRoutes.privacy);       // ✓ static public pages
server.sitemap.exclude(authRoutes.login, authRoutes.register);   // ✓ reachable, not indexable
server.sitemap.addDynamic(blogRoutes.post, async () =>           // ✓ per-entity public pages
  (await db.post.findMany()).map((p) => ({ params: { slug: p.slug }, lastmod: p.updatedAt })));
// guarded routes (preHandler) need nothing — automatically out of scope
```

CI also runs an on-page audit over every sitemap-registered page: meta description present, exactly one `h1`, unique titles, canonical tag, resolvable `og:image`.

---

## TypeScript

> Full reference: [typescript.md](.ai/web-development/typescript.md)

- **Narrowest type by default** — `as const`, `satisfies`, `const` type parameters, literal types. Widen only when you have a reason to.
- **`type` over `interface`** (exception: Fastify module augmentation)
- **Discriminated unions** for state — no optional booleans, no bags of optionals
- **String literal unions** — never bare `string` where only specific values are valid
- **Exhaustive checks** with `assertNever`
- **Branded types** to prevent ID mixups (`UserId`, `PostId`)
- **No magic constants** — extract into named variables

---

## Security

- **Authentication endpoints must have rate limiting** — every login, password reset, and OTP verification endpoint must rate-limit (by IP and by identifier). No exceptions.
- **Use identical error messages for auth failures** — never reveal whether an email exists or a password is wrong. Always: `"Invalid email or password"`. Different messages enable user enumeration.

---

## SSH & Production Access

- SSH credentials for production are in `.deploy.json` — use these when the user asks to SSH to prod
- **Always confirm with the user** before SSHing to production — never connect without explicit approval, even when diagnosing live issues
