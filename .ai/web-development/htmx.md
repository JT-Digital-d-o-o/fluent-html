# HTMX Guidelines

## Type-safe targets with defineIds

Never hardcode ID strings:
```typescript
export const ids = defineIds(["user-list", "user-count"] as const);
Div().setId(ids.userList)
Button("Load").hxGet("/api", { target: ids.userList })
hx("/api", { target: "#userList" })  // ✗ typos cause silent failures
```

## Type-safe routes with defineRoutes

Never hardcode endpoint strings. Typed params (`"string"`, `"number"`, or an enum tuple) give compile-time safety:
```typescript
// Shared prefix avoids repetition (like Fastify's register prefix)
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  detail: { method: "get",    path: "/:id", params: { id: "number" } as const },
  delete: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);

// Typed params are enforced at call sites:
userRoutes.detail.resolve({ id: 42 })        // ✓ id must be number
userRoutes.detail.resolve({ id: "42" })       // ✗ compile error
```

**Enum params** — a `readonly` tuple constrains a segment to a token set; a `params` key that isn't a `:param` in the path is a compile error (was a silent no-op):
```typescript
export const orderRoutes = defineRoutes("/orders", {
  byStatus: { method: "get", path: "/:status", params: { status: ["open", "paid", "void"] as const } },
} as const);
orderRoutes.byStatus.resolve({ status: "open" })     // ✓ one of "open" | "paid" | "void"
orderRoutes.byStatus.resolve({ status: "shipped" })  // ✗ compile error — not in the enum
// { path: "/:id", params: { ic: "number" } }          // ✗ "ic" is not a :param in the path
```

**Wildcard (splat) params** — a trailing `*` (or `*name`) captures the rest of the path as one required `string` param; each segment is url-encoded but `/` is preserved (catch-all). A splat route takes no declared `params`. A wildcard anywhere but the end **throws at `defineRoutes` time** (`only a trailing "/*" or "/*name" splat is supported`) — the failure is at definition, not at click time:
```typescript
export const fileRoutes = defineRoutes("/files", {
  tree: { method: "get", path: "/*" },          // → required `splat`
  blob: { method: "get", path: "/blob/*path" }, // → required `path`
} as const);
fileRoutes.tree.resolve({ splat: "a/b/c" })   // ✓ "/files/a/b/c"   (slashes kept)
fileRoutes.blob.resolve({ path: "x/y.png" })  // ✓ "/files/blob/x/y.png"
fileRoutes.tree.resolve()                      // ✗ compile error — splat required
fileRoutes.tree.resolve({ rest: "a" })         // ✗ compile error — the key is "splat"
defineRoutes({ x: { method: "get", path: "/a/*mid/b" } })  // ✗ throws — mid-path wildcard
```

**Path grammar & value rules** (type and runtime are cross-tested to agree):
- **Param names** are `[A-Za-z0-9_]`. A **suffix** after the name works and keys on the identifier: `path: "/export/:id.csv"` → param `id`, and `resolve({ id: "5" })` → `/export/5.csv` (not `:id.csv`).
- **`number` param values must be finite.** `NaN`, `±Infinity`, and magnitudes that serialize to exponential (`1e21`) **throw at resolve time** rather than emitting `/users/NaN`. Pass a finite integer.
- **Prefix params are typeable.** A `:param` in the shared prefix can carry a declared type — the `params` map is validated against the joined path:
  ```typescript
  defineRoutes("/users/:userId", {
    posts: { method: "get", path: "/posts", params: { userId: "number" } as const },
  } as const);   // posts.resolve({ userId: 42 }) → "/users/42/posts"
  ```
- **Not supported:** regex params, optional segments, mid-path wildcards.

**Always use shared prefix** when routes share a common base path:
```typescript
// ✓
defineRoutes("/dashboard", {
  overview: { method: "get", path: "/" },
  project:  { method: "get", path: "/:repoName" },
} as const);

// ✗ repeating the prefix in every path
defineRoutes({
  overview: { method: "get", path: "/dashboard" },
  project:  { method: "get", path: "/dashboard/:repoName" },
} as const);
```

## Using routes in views

> For everyday navigation, forms, and sub-region updates prefer the **swap verbs** — these `setHtmx(route())` forms are the underlying layer they build on. See [§ Navigation API ladder](#navigation-api-ladder).

Method is locked, params are required, typos are compile errors:
```typescript
Button("Load").setHtmx(userRoutes.list())
Button("Load").setHtmx(userRoutes.list({ target: ids.userList }))
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))
userRoutes.lsit()            // ✗ typo — compile error
userRoutes.delete()          // ✗ missing params — compile error
```

## Using routes in controllers

Single-sourced paths:
```typescript
server.get(userRoutes.list.path, handler)       // "/users"
server.delete(userRoutes.delete.path, handler)  // "/users/:id"
```

## Resolved URLs

`.resolve()` for redirects and external links. Never write manual resolve helpers:
```typescript
reply.redirect(userRoutes.list.resolve())                  // "/users"
reply.redirect(userRoutes.delete.resolve({ id: user.id })) // "/users/42"

// With query parameters — nullish values are silently skipped
reply.redirect(userRoutes.list.resolve({ page: "2", sort: "name" }))           // "/users?page=2&sort=name"
reply.redirect(userRoutes.delete.resolve({ id: user.id }, { tab: "posts" }))   // "/users/42?tab=posts"

// Query parameters in HTMX calls
Button("Page 2").setHtmx(userRoutes.list({ query: { page: "2" } }))

// Ad-hoc URL not modeled by defineRoutes? hx() takes the same typed query bag (the escape hatch).
// Join-aware: a base already carrying "?" joins with "&", so a resolved searchUrl is safe to pass.
Button("Go").setHtmx(hx(searchUrl, { query: { _target: resultsId } }))   // searchUrl?…  or  searchUrl&…
hx("/search?event=E", { query: { q } })                                  // "/search?event=E&q=…"
// `query` builds the URL (url-encoded); `vals` (hx-vals) adds to the request BODY — never use vals for URL params

// ✗ NEVER hand-roll the query string — route callables (preferred) and hx({ query }) both encode + join
function resolveUser(id: string) { return `/users/${encodeURIComponent(id)}`; }
const url = route.resolve() + `?page=${page}`;                                                    // ✗ use resolve({ page })
const u2 = `${searchUrl}${searchUrl.includes("?") ? "&" : "?"}_target=${encodeURIComponent(id)}`; // ✗ use hx(searchUrl, { query: { _target: id } })
```

**Param substitution is boundary-aware** — `:id` does not corrupt an adjacent `:idCard`, and a param appearing more than once resolves every occurrence. Prefix-overlapping and repeated-param paths are safe; no manual-resolve workaround:
```typescript
// path: "/cards/:id/owner/:idCard" → only :id and :idCard are filled, independently
route.resolve({ id: 7, idCard: 42 })   // "/cards/7/owner/42"   ✓ (no :id-into-:idCard bleed)
// path: "/:locale/docs/:locale" → both occurrences resolved
route.resolve({ locale: "en" })        // "/en/docs/en"          ✓
```

## Navigation API ladder

One job, four APIs — pick the **top** rung that does it, drop down only when the rung above can't express what you need:

1. **Swap verbs** `.nav()` / `.submit()` / `.fragment()` / `.poll()` / `.search()` / `.onChange()` / `.fire()` — the default for navigation, in-place forms, sub-region updates, self-refreshing fragments, debounced filters, change-driven re-renders, and fire-and-forget actions. They bake target + swap + scroll + history; `.poll`, `.search` and `.onChange` bake the trigger as well (see [§ Full-layout navigations](#full-layout-navigations--the-swap-verbs), [§ Trigger verbs](#trigger-verbs--search-onchange-fire) and [§ Polling](#polling--the-poll-verb)).
2. **`setHtmx(route({...}))`** — a typed route ref when you need what the verbs don't impose: non-standard target, custom `swap`, `replaceUrl`, status-code routing beyond `{ invalid }`, or typed options (`confirm`/`vals`/`trigger`/`include`).
3. **`setHtmx(hx(url, {...}))`** — an ad-hoc URL not modeled by `defineRoutes` (a resolved search/external URL), with the same typed options + `query` bag.
4. **`hxGet`/`hxPost`/…** — only a **literal string endpoint** (no params, no route ref). The HTTP method is implicit, so the moment a route gains params or you call `.resolve()`, climb back to rung 1–2.

```typescript
A("Settings").nav(settingsRoutes.index()).cursor("pointer")                                          // 1 — navigation
Form(/* fields */).submit(userRoutes.create())                                                       // 1 — in-place form
Span(count).fragment(ids.userCount, statsRoutes.count())                                             // 1 — sub-region
Button("Delete").setHtmx(itemRoutes.delete({ id }, { confirm: "Sure?", target: ids.mainContent }))  // 2 — typed options
Button("Go").setHtmx(hx(searchUrl, { query: { _target: ids.results } }))                            // 3 — ad-hoc URL
Button("Load").hxGet("/api/items")                                                                   // 4 — literal endpoint
Button("Load").hxGet(itemRoutes.detail.resolve({ id }))                                              // ✗ route ref via hxGet — method now implicit; use rung 1–2
```

**Typed options — never `addAttribute("hx-*", …)`:** `confirm` / `vals` / `trigger` / `include` are fields of the options object:
```typescript
Input().setHtmx(searchRoutes.run({ trigger: "blur changed", include: "closest form", vals: { tab: "x" } })) // ✓
Button("Delete").hxDelete("/x").addAttribute("hx-confirm", "Sure?")                                          // ✗
```

Disable htmx processing on a subtree with `ignore` (emits the bare `hx-ignore`):
```typescript
Div(thirdPartyWidget).setHtmx(hx("/noop", { ignore: true }))  // ✓ <div hx-ignore> — not hx-disable (that's the disabled-elements selector)
```

## Swap strategies

**Prefer outerMorph** — preserves focus, scroll, animations; innerHTML loses the target element's id:
```typescript
hx("/users", { target: ids.userList, swap: "outerMorph" })  // ✓
hx("/users", { target: ids.userList, swap: "innerHTML" })    // ✗
```
Use `outerHTML` only to intentionally destroy and recreate DOM state.

**Morph swaps** — preserve DOM state (focus, scroll, animations):
```typescript
Button("Refresh").hxGet("/users", {
  target: ids.userList,
  swap: "outerMorph",
})
```

**Keyed lists for morph** — a morphed list needs stable per-row identity, or idiomorph matches rows by *position* and a reorder/insert/delete loses focus, scroll, and in-progress transitions. Use `ForEachKeyed` (not `ForEach`) for any list re-rendering into a morph swap — it stamps `id=<key>` on each row root:
```typescript
Ul(ForEachKeyed(users, (u) => u.id, (u) => Li(u.name)))   // ✓ <li id="42"> — morph matches by key
Ul(ForEach(users, (u) => Li(u.name)))                      // ✗ positional matching breaks on reorder
```

## Partial swaps

Update multiple page sections in one response:
```typescript
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

## File uploads (multipart)

htmx 4 sends FormData only when the element carries `hx-encoding="multipart/form-data"` — it does NOT fall back to the form's native `enctype` (htmx 2 did). `.setEnctype()` alone → urlencoded body → 406 "the request is not multipart" from `@fastify/multipart`. Always set both:

```typescript
Form<UploadFields>((f) => [f.input("file", "file"), Button("Upload").setType("submit")])
  .fragment(ids.assets, routes.upload({ id }, { encoding: "multipart/form-data" }))  // → hx-encoding
  .setEnctype("multipart/form-data")                                                 // no-JS fallback
```

Fields before the file input parse first — `@fastify/multipart` streams parts in DOM order and handlers typically stop reading at the file part.

## Status-code routing

**Validation failures: `{ invalid }` on `.nav`/`.submit`** — the request half of the mandated `reply.code(422).renderView(FormWithErrors(…))`. Success path untouched.

```typescript
Form(/* fields */).nav(authRoutes.signin(), { invalid: authIds.loginForm })
// → hx-status:422="swap:outerMorph target:#login-form push:false"
```

`push: false` because `hx-push-url` is unconditional (htmx pushes on **any** swapped response) — without it a rejected `.nav` submit strands the browser on a POST-only endpoint.

**The 422 must render the form region alone**, or the whole page nests inside the form. So the handler branches (a no-JS post has no swap target), and one exported component feeds both paths so they can't drift — the template's sign-in ships it:

```typescript
function renderSignInRejected(request: FastifyRequest, reply: FastifyReply, props: LoginPageProps): void {
  reply.code(422).renderView(isHtmxRequest(request) ? LoginForm(props) : LoginPage(props));
}
```

A handler that answers 422 with a whole page needs no `{ invalid }`. Anything beyond a 422 stays on the underlying options bag:
```typescript
Form(/* fields */).hxPost("/users/create", {
  target: ids.mainContent,
  swap: "outerMorph",
  status: {
    422: { target: ids.formErrors, swap: "innerHTML" },
    "5xx": { swap: "none" },
  }
})
```
A `status` bag the route already carries wins over `{ invalid }`; the two never merge into
one key. (`HxStatusKey` accepts exact codes and `Nxx` wildcards; htmx 4 also resolves a
middle wildcard like `42x` at runtime, which the type rejects.)

## Full-layout navigations — the swap verbs

Almost every interaction swaps the main content region (`ids.mainContent`). The app
template ships seven fluent **swap verbs** on `Tag` (`src/core/htmx/swap-verbs.ts`,
registered once at boot) that bake the `#main-content` target + loading indicator, so a
call site reads as the gesture it is instead of repeating a swap-options bag. **Use a
verb — don't hand-write the target/swap/pushUrl.**

| Verb | Emits | Use for |
|------|-------|---------|
| `.nav(route, { invalid? })` | morph `#main-content`, `show:top`, push history | navigation links + history-pushing submits |
| `.submit(route, { invalid? })` | morph `#main-content`, no scroll, no history | forms / in-place actions (re-render in place) |
| `.fragment(target, route, swap?)` | morph just `target` (default `outerMorph`) | sub-region / partial updates |
| `.poll(route, every?)` | `every 2s` trigger, target `this`, `outerHTML`, **no indicator** | fragments that re-fetch while work is in flight (see [§ Polling](#polling--the-poll-verb)) |
| `.search(route, delay?)`<br>`.search(target, route, delay?)` | `input changed delay:300ms` trigger, `sync: "replace"`, `include: "this"`, morph `#main-content` (or `target`) | debounced live filters / type-ahead (see [§ Trigger verbs](#trigger-verbs--search-onchange-fire)) |
| `.onChange(route)` | `change` trigger, `include: "closest form"`, morph `#main-content` | a control that re-renders on change (filter bars, property editors) |
| `.fire(route)` | `swap: "none"`, no target, no indicator | fire-and-forget actions whose response is not for the DOM |

```typescript
// Navigation link — a verb, NOT setHref
A("Settings").nav(settingsRoutes.index()).cursor("pointer")

// Form / in-place action — re-renders where the user is (no scroll-to-top)
Form(/* fields */).submit(userRoutes.create())

// Sub-region swap — update one element, not the whole layout
Span(count).fragment(ids.userCount, statsRoutes.count())
```

Extra route options flow through the verb (target/swap/pushUrl are imposed by it):
```typescript
A("Page 2").nav(userRoutes.list({ vals: { page: "2" } }))
Button("Save").submit(userRoutes.create({ trigger: "click once" }))
```

A button or form source also gets a default `disable` so it goes disabled while its request
runs — see [§ In-flight buttons](#in-flight-buttons). Passing `disable` yourself overrides it.

For a non-standard target, `replaceUrl`, or anything the verbs don't cover, drop to the
underlying form: `setHtmx(route({ target: ids.x, swap: "innerHTML", … }))`.

Update nav, title, and content in one response with `Partial` swaps:
```typescript
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.navBadge, Span(`${users.length}`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

## Trigger verbs — `.search`, `.onChange`, `.fire`

`.nav`/`.submit`/`.fragment` bake target + swap and leave the trigger at htmx's default, and `.fire` bakes only `swap`. `.poll`, `.search` and `.onChange` impose the **trigger** too, because each one folds away a runtime rule that is otherwise remembered.

Three 4.0.0-beta4 runtime facts these bake (each one silently wrong when hand-rolled):

- **default `hx-sync` is `"queue first"`** — one request in flight + one queued ⇒ every later one is **dropped**. `.search` emits `sync: "replace"`.
- **a GET collects the source element alone** (no `element.form || closest("form")` walk, unlike POST/PUT/PATCH): a `<select>` sends its own value, a non-control wrapper sends nothing. `.onChange` emits `include: "closest form"`.
- **every response swaps** (only 204/304 skip). `.fire` emits `swap: "none"`, keeps the button's disable, and still runs `HX-Trigger` headers.

```typescript
Input("text").search(userRoutes.list())                        // debounced, newest-wins, morphs #main-content
Input("text").search(ids.results, userRoutes.list(), "150ms")  // results fragment + custom debounce
f.select("status", STATUS_OPTIONS).onChange(paymentRoutes.admin())
Button("Dismiss").fire(tipRoutes.dismiss())
Input("text").setHtmx(userRoutes.list({ trigger: "input changed delay:300ms" }))  // ✗ "queue first" drops requests
Select().setHtmx(paymentRoutes.admin({ trigger: "change" }))                       // ✗ GET sends this select only
```

`.search` defaults to `include: "this"`; a route-level `include` wins and is how siblings ride along:
```typescript
Input("text").search(analyticsRoutes.events({ include: "closest tr" }))   // filter cells in a bare <tr>
Input("text").search(paymentRoutes.admin({ include: "closest form" }))    // search box inside a filter form
```

Widen the `include` rather than re-sending values as `vals` — `vals` is applied with `set`, overwriting the live DOM value with the last server-rendered one.

**Nothing may be built on `preload`/`optimistic`** — fluent-html types both and emits `hx-preload`; neither attribute exists in the runtime. One-off `sync`/`delay` beyond these args: drop to `setHtmx`.

## Polling — the `.poll()` verb

A fragment that re-fetches itself while work is in flight (job status, payment
settlement, export progress) uses **`.poll(route, every?)`** (default `"2s"`) — never a
hand-rolled `trigger: "every …"` options bag:

```typescript
StatusPanel(job)
  .when(!isTerminal(job), (t) => t.poll(jobRoutes.status({ id: job.id }), "5s"))
```

**The stop mechanism is the conditional render.** htmx clears an `every` timer only when
the polled node **leaves the DOM**. The verb swaps `outerHTML` (never a morph), so the
terminal render — the same fragment without the verb — replaces the node and the timer
dies with it. A morph would keep the settled node (and its timer) alive; the stale tick
then fires with no `hx-get`, fetches the page URL, and nests the full document inside
the panel, recursively. For the same reason, any `Partial` whose target **is or
contains** a poller must swap `"outerHTML"`, not the `outerMorph` default:

```typescript
render(Partial(ids.jobPanel, JobPanel(job), "outerHTML"))   // ✓ poller inside — replace, don't morph
render(Partial(ids.jobPanel, JobPanel(job)))                 // ✗ morph resurrects the settled poller's timer
```

**A poll endpoint always answers with the polled fragment** — never an error page. A
404/500 shell swapped into the slot replaces a status pill with a full app layout.
Gone/unauthorized states get a terminal, trigger-less variant carrying the **same
element id**; return the identical fragment for missing and cross-tenant so a
non-member can't probe existence.

**Every poll endpoint takes `pollRateLimit`** (`src/core/htmx/rate-limit.ts`) — a 2s poll is
~30 req/min per open tab against the global 100/min per-IP budget, so an unbucketed
poller lets a user watching a long job 429 their own navigation:

```typescript
handle(server, jobRoutes.status, { preHandler: [requireAuth], ...pollRateLimit },
  async (request, reply) => { /* cheap status render */ })
```

No indicator: a background refresh must not flash the global loader. If a poll panel
wants a visible spinner, it's part of the polled fragment itself. Don't build stop
conditions (max attempts, backoff) into call sites — the terminal render omitting the
verb *is* the stop. (Library side: fluent-html's `PollingTrigger` and `Partial` JSDoc
document the same hazard.)

## Anchors

**Anchors with a swap verb need `cursor("pointer")`** — no `href` means no pointer by default (verbs don't add it):
```typescript
A("Users").nav(userRoutes.list()).cursor("pointer")
```

**Never use `setHref` for in-app navigation** — causes a full page reload, bypassing HTMX:
```typescript
A("Users").nav(userRoutes.list()).cursor("pointer")                         // ✓ HTMX swap
A("Users").setHref(userRoutes.list.resolve())                               // ✗ full page reload
A("Users").setHref("/users")                                                // ✗ full page reload
```
`setHref` only for external links or download URLs.

## Explicit inheritance

htmx 4 does not inherit attributes by default. Use `:inherited` modifier:
```typescript
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")

// Or opt back in to htmx 2 behavior globally:
HtmxConfig({ implicitInheritance: true })
```

## Global htmx config

Via meta tag:
```typescript
Head(
  HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
  }),
  Script().setSrc("/htmx.js"),
)
```

## Per-element config

Replaces removed `hx-request`:
```typescript
Button("Upload").hxPost("/upload", {
  config: { timeout: 120000 },
})
```

## hxResponse

Server-driven navigation and events:
```typescript
const { html, headers } = hxResponse(Empty())
  .redirect("/users")
  .trigger("showToast", { message: "User created!" })
  .build();
reply.headers(headers);
reply.renderView(html);
```

**`.trigger(...)` is repeatable** — each call accumulates into a map that serializes **once** at `.build()` (bare names → `"a, b"`, detailed payloads → JSON). Chain freely; earlier triggers are never dropped, even when a later event name parses as JSON:
```typescript
hxResponse(view)
  .trigger("refreshList")
  .trigger("showToast", { message: "Saved" })   // ✓ both fire — accumulated, serialized at build()
  .build();
// ✗ never hand-roll reply.header("HX-Trigger", …) or collapse to a single call to "work around" dropped triggers
```

## Client-side behaviors

`.behavior(name, opts?)` emits flat `data-behavior-*` attributes — **zero inline JS**, executed by the versioned fluent-behaviors runtime asset (one nonce'd `<script defer src>` in the layout head; strict-CSP-safe, morph-proof by construction). Never hand-write `data-behavior*` attributes via `setDataAttrs`/`addAttribute` (lint-banned), and there is no `.hxOn()` — no inline-JS hatch exists.

The 10 built-ins:

| Verb | Options | Does |
|---|---|---|
| `toggle` | `{ target: Id \| Id[], force?, display?, event? }` | toggle `hidden` (multi-target; `display` sets `style.display` when shown) |
| `toggleClass` | `{ target: Id \| Id[], class, force?, event? }` | toggle any class |
| `remove` | `{ target: Id \| "@self" \| {closest}, animateOut?, animateOutTimeoutMs?, event? }` | remove target (`animateOut` + timeout fallback — cannot hang) |
| `clipboard` | `{ value? \| path?, feedback? }` | copy with transient, morph-safe feedback (`mode: "text" \| "class"`) |
| `drawer` | `{ target, class?, backdrop?, bodyClass?, closeOn?, trapFocus?, focusFirst? }` | the composite non-modal overlay — class + backdrop + scroll-lock + aria + focus, atomic, at most one open |
| `onEscape` | `{ action: "click"\|"remove"\|"hide", target?, scope? }` | Escape handling; `scope: "document"` fires with focus anywhere |
| `onClickOutside` | `{ action, target? }` | dismiss on outside click (NOT `popover="auto"` — that light-dismisses on the anchor input) |
| `resetOnSuccess` | — | `form.reset()` only on status < 300 (422 keeps typed values) |
| `back` | — | `history.back()`, default-prevented |
| `focus` | `{ target }` | focus the target |

```typescript
Button("Menu").behavior("drawer", { target: ids.mobileMenu, backdrop: ids.menuBackdrop, bodyClass: "overflow-hidden", trapFocus: true })
Button("Copy").behavior("clipboard", { path: invitePath, feedback: { mode: "text", text: "Copied!" } })
Form(…).behavior("resetOnSuccess").setHtmx(routes.save({ … }))
Button("×").behavior("remove", { target: { closest: "[role=alert]" }, animateOut: "fade-out" })
Button("Hover").behavior("toggle", { target: ids.panel, event: "mouseenter" })
```

**Overlap rule** — one blessed path per situation: `drawer` for overlay bundles; `toggle` for simple show/hide; `onClickOutside` for non-overlay dismissal. Deleted verbs and their successors: `disable` → htmx `disable:` route option; `openDialog`/`closeDialog` → Invoker Commands + `setClosedby`; `formResetOnSwap` → `resetOnSuccess`; `dismissOnEscape` → `onEscape` (with the document-scope fix); `scrollTo` → swap `scroll:top`; `selectAll` → gone.

Render-time throws in all modes: unknown verb, duplicate same-verb, unknown option, type mismatch. Extension verbs (`jt:` namespace) are registered at the **framework layer only** — apps consume them typed, never register.

## Native interactivity (Popover · Commands · anchor positioning)

For open/close and placement, **prefer the platform over hand-written JS** — emits **zero JS**, needs **no CSP nonce**. All targets are `Id`-typed.

**Invoker Commands** — JS-free `<button>` driving a `<dialog>` or popover. Modal dialogs are ALWAYS this native path (the `openDialog`/`closeDialog` verbs are deleted); non-modal/responsive overlays are the `drawer` verb:

```typescript
Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog)   // ✓ no inline JS, no nonce
Button("Done").setCommand("close").setCommandfor(ids.dialog)
```

| `command` | acts on |
| --- | --- |
| `show-modal` / `close` / `request-close` | `<dialog>` |
| `show-popover` / `hide-popover` / `toggle-popover` | popover |
| `--name` | author command (fires a `CommandEvent`) |

**Dialog dismiss** — `.setClosedby("any")` for native light-dismiss (click-outside + Esc), and `formmethod="dialog"` to close on submit — never hand-roll backdrop/Esc JS:
```typescript
Dialog(form, Button("Cancel").setType("submit").setFormmethod("dialog"))
  .setId(ids.dialog).setClosedby("any")              // ✓ <dialog closedby="any">
Dialog(...).addAttribute("closedby", "any")          // ✗ untyped — use .setClosedby()
```

**Popover** — `.setPopover()` defaults to `"auto"` (light-dismiss, Esc, top-layer); `"manual"` for explicit dismiss:

```typescript
Button("Filters").setPopovertarget(ids.panel)            // ✓ invoker
Div(...).setId(ids.panel).setPopover()                   // ✓ popover="auto"
Div(...).addAttribute("popover", "auto")                 // ✗ untyped — use .setPopover()
```

**Anchor positioning** — name an anchor, place a popover against it; **reuse one `Id`** so the link is provable:

```typescript
const menu = ids.userMenu;
Button("Account").setPopovertarget(menu).anchorName(menu)            // ✓ [anchor-name:--user-menu]
Div(...).setId(menu).setPopover().positionAnchor(menu).positionArea("bottom")
//   ✓ [position-anchor:--user-menu] position-area-bottom
```

Because `anchorName(id)`/`positionAnchor(id)` take an `Id` *variable*, the tailwind-extractor classifies those two classes as **unresolved** — safelist them in the build (only `positionArea("literal")` resolves statically).

## Loading indicators

`.htmxIndicator()` adds the library-known `htmx-indicator` class (shown only while a request targeting the element is in flight). Use it, not raw `.setClass("htmx-indicator")` — the method is whitelisted in the class vocabulary, so the Tailwind extractor and ESLint accept the class.

```typescript
Span("Saving…").htmxIndicator()
```

**The triggering element does not get `htmx-request`.** When `hx-indicator` is set, htmx puts the request class on the indicator *instead of* the trigger — and every swap verb points the indicator at the global bar. So an inline spinner revealed by `.htmx-request .htmx-indicator` on the button that fired the request never appears. Style the in-flight button off `:disabled` instead.

### In-flight buttons

The verbs supply a default `disable` for button and form sources — `"this"` on a button, `"findAll button"` on a form — so htmx disables the button for the request's duration. Nothing to remember at the call site, and a double-click can't fire twice:

```typescript
Button("Save").submit(userRoutes.create())        // ✓ hx-disable="this" — button greys out in flight
Form(/* fields */).submit(userRoutes.create())    // ✓ hx-disable="findAll button"
Button("Save").submit(userRoutes.create({ disable: "closest form" }))  // ✓ explicit disable still wins
Button("Save").setHtmx(userRoutes.create())       // ✗ raw setHtmx opts out — no disable, no feedback
```

`LoaderButton({ label, loadingLabel })` builds on that state: `group` on the button, `group-disabled:` on its children, so in flight the label swaps to `loadingLabel` and a spinner appears — pure CSS, no JS, no per-call-site wiring.

```typescript
LoaderButton({ label: "Redact faces", loadingLabel: "Uploading clip…" })   // inside a form, or chain .submit() on it
```

Reach for it when the wait is long enough to doubt the click landed (uploads, external APIs, anything measured in seconds). Every other button just dims, from a single `button:disabled { opacity: .6 }` rule in the layout. Never hand-roll a `.behavior("disable")`-style double-submit guard — that behavior was deleted precisely because the route option covers it.
