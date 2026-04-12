**IMPORTANT: Lint the code often.**

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

## Project Management (MANDATORY)

If `project/pm/` exists, follow the [Project Management Guidelines](../project-management/CLAUDE.md) — updates are **non-optional**, do them inline as you work, not at the end.

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

**IfThen narrows nullable values** — callback receives the non-null type:
```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))           // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string
IfThen(user.avatar, () => Img().setSrc(user.avatar!))            // ✗ don't re-check/cast
user.name ? Span(user.name) : Span("Anon")                      // ✗ use IfThenElse
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
// Methods: w, h, minW, maxW, minH, maxH, padding, margin, gap, top, right, bottom, left, inset
```

Escape-hatch strings: `.textSize("[13px]")`, `.opacity("[0.33]")`, `.zIndex("[999]")`

**Conditional modifiers & composition:**
```typescript
Button("Save").when(isLoading, t => t.toggle("disabled").opacity("50"))

const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
Div("Content").apply(card)
```

---

## Fluent Tailwind Styling

**Fluent methods** — not `setClass` with Tailwind strings (fluent methods provide type safety + IDE autocomplete). **`.on()` for pseudo-classes, `.at()` for breakpoints** — not `addClass`:
```typescript
Button("Save")
  .padding("x", "4").background("blue-500").textColor("white").rounded()
  .transition("colors")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md", t => t.padding("x", "8").textSize("lg"))
```

---

## HTMX

> Full reference: [htmx.md](htmx.md) — read when implementing HTMX interactions

Critical rules:
- **`defineRoutes`** for endpoints, **`defineIds`** for targets — never hardcode strings
- **`outerMorph`** swap by default — preserves focus, scroll, animations
- **`setHtmx`** for in-app navigation — never `setHref` (causes full reload)
- **`.resolve(query?)`** for redirects — never manual URL builders or query string concatenation
- **Anchors with `setHtmx`** need `.cursor("pointer")`
- **Partial swaps** for multi-section updates in one response
- **htmx 4**: attributes don't inherit — use `:inherited` modifier
- **Almost everything uses full-layout swap** targeting `ids.mainContent` — including forms, modals, and inline edits. Feature-specific targets are rare; default to the full-layout pattern.

**`defineRoutes` / `defineIds`** — define in `[feature].routes.ts`:
```typescript
export const ids = defineIds(["mainContent", "userList", "userCount"] as const);
export const userRoutes = defineRoutes("/users", {
  list:   { method: "GET",  path: "/" },
  create: { method: "POST", path: "/" },
  detail: { method: "GET",  path: "/:id" },
});
```

**Full layout navigation** — the default pattern:
```typescript
A("Settings").setHtmx(settingsRoutes.index({
  swap: "outerMorph show:window:top",
  target: ids.mainContent,
  pushUrl: true,
})).cursor("pointer")
```

**`.behavior()` for client-side interactions** — never raw inline JS:
```typescript
Button("Toggle").behavior("toggle", { target: ids.filterPanel })
Button("Copy").behavior("clipboard", { value: apiKey })
Button("Submit").behavior("disable")
A("Back").behavior("back").cursor("pointer")
```
Built-in: `toggle`, `toggleClass`, `remove`, `clipboard`, `disable`, `focus`, `scrollTo`, `selectAll`, `back`.

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
