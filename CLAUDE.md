**IMPORTANT: Lint the code often.**

# Project Guidelines

**Stack:** Fastify v5 + TypeScript + fluent-html + HTMX + Tailwind CSS (SSR app)

> References: [fluent-html.md](fluent-html.md) | [fluent-html-FLUENT-APIs.md](fluent-html-FLUENT-APIs.md) | [htmx.md](htmx.md) | [views.md](views.md) | [fastify.md](fastify.md) | [typescript.md](typescript.md)


> **Additional guidelines** (read when relevant):
> - [Analytics](.ai/analytics-guidelines/CLAUDE.md) — Read when implementing tracking, defining metrics, or making data-driven product decisions
> - [Marketing](.ai/marketing-guidelines/CLAUDE.md) — Read when building landing pages, writing copy, setting up emails, or planning growth experiments
> - [Quality Assurance](.ai/quality-assurance-guidelines/CLAUDE.md) — Read when writing tests, fixing bugs, or preparing for deployment
> - [Brand Book](.ai/jtdigital-brand-book/CLAUDE.md) — Read when styling UI, choosing colors/fonts, writing copy, or using logos
> - [Project Management](.ai/project-management-guidelines/CLAUDE.md) — Read when managing tasks, logging bugs, updating changelogs, or writing status updates

---

## Project Management (MANDATORY)

PM files live in `product/pm/`. These updates are **non-optional** — do them inline as you work, not at the end.

**On larger completion:**
1. Mark `[x]` in `product/pm/todo/[feature].md`
2. Add entry to `product/pm/changelog.md`

**On session end:**
3. Update `product/pm/status.md`

**Before implementing architecture decisions:**
4. Log to `product/pm/decisions.md`

**On bug discovery:**
5. Add to `product/pm/qa/[feature].md`

Status marks: `[ ]` todo · `[>]` in progress · `[r]` review · `[x]` done · `[-]` cancelled

---

## fluent-html

**Variadic children** — never wrap in arrays:
```typescript
Div(H1("Title"), P("Body"))              // ✓
Div([H1("Title"), P("Body")])            // ✗
```

**Specialized tag methods** — never use addAttribute for standard props:
```typescript
Button("Save").setType("submit")         // ✓
Input().setPlaceholder("Name")           // ✓
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

// Partial with default
Match(state, "status", {
  error: (s) => Alert(s.message),
}, () => Spinner())
```

**IfThen narrows nullable values** — callback receives the non-null type:
```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))           // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string
IfThen(user.avatar, () => Img().setSrc(user.avatar!))            // ✗ don't re-check/cast
user.name ? Span(user.name) : Span("Anon")                      // ✗ use IfThenElse
```

**Boolean attributes** — use `.toggle()` with optional condition:
```typescript
Input().toggle("required")                        // ✓ always on
Input().toggle("required", isRequired)            // ✓ conditional
Option(city).toggle("selected", city === current) // ✓ expression as condition
```

**Arbitrary values** — unit-based overloads for sizing/spacing/position:
```typescript
Div().minH("px", 180)       // → min-h-[180px]
Div().w("rem", 12)          // → w-[12rem]
Div().padding("em", 1.5)    // → p-[1.5em]
Div().gap("%", 50)          // → gap-[50%]
Div().top("vh", 100)        // → top-[100vh]
// Units: px | rem | em | % | vh | vw | dvh | svh | lvh
// Methods: w, h, minW, maxW, minH, maxH, padding, margin, gap, top, right, bottom, left, inset
```

Most types also accept escape-hatch strings: `.textSize("[13px]")`, `.opacity("[0.33]")`, `.zIndex("[999]")`


**Conditional modifiers & composition:**
```typescript
Button("Save").when(isLoading, t => t.toggle("disabled").opacity("50"))

const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
Div("Content").apply(card)
```

---

## HTMX

> Full reference: [htmx.md](htmx.md) — read when implementing HTMX interactions

Key rules:
- **`defineIds`** for targets, **`defineRoutes`** for endpoints — never hardcode strings
- **`outerMorph`** swap by default — preserves focus, scroll, animations
- **`setHtmx`** for in-app navigation — never `setHref` (causes full reload)
- **`.resolve()`** for redirects — never manual URL builders
- **Anchors with `setHtmx`** need `.cursor("pointer")`
- **Partial swaps** for multi-section updates in one response
- **htmx 4**: attributes don't inherit — use `:inherited` modifier

**Full layout navigation** — almost always use this pattern for screen navigations:
```typescript
A("Settings").setHtmx(settingsRoutes.index({
  swap: "outerMorph show:window:top",
  target: ids.mainContent,
  pushUrl: true,
})).cursor("pointer")
```

---

## View Composition

> Full reference: [views.md](views.md) — read when building views or creating new features

Key rules:
- **Components = plain functions** with a typed props object (never positional args)
- **One view file per page/endpoint response** — split by interaction, not size
- **Shared components** (rows, cards, badges) in `[feature].components.ts`
- **Discriminated unions** for page states — use `Match()`, not conditionals
- **!IMPORTANT:** Always abstract and reuse components — avoid code duplication

---

## Prisma

**Use `include`/`select`** — never query in loops (N+1):
```typescript
const user = await server.prisma.user.findUnique({
  where: { id },
  include: { posts: { orderBy: { createdAt: "desc" }, take: 10 }, profile: true },
});
```

**Use Prisma generated types** for view props:
```typescript
type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>;
function UserDetail(user: UserWithPosts) { ... }
```

---

## Fluent Tailwind Styling

**Chainable fluent methods** for all styles — base, variants, and breakpoints:
```typescript
Div().padding("4").margin("x", "auto").background("blue-500")
  .textColor("white").rounded("lg").shadow("md").flex().gap("4")
  .transition().duration("200").ring("2").ringColor("blue-300")
```

**Variant proxy** — `.on()` for pseudo-classes, `.at()` for breakpoints:
```typescript
Button("Save")
  .padding("x", "4").background("blue-500").textColor("white").rounded()
  .transition("colors")
  .on("hover", t => t.background("blue-600").scale("105"))
  .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
  .on("disabled", t => t.opacity("50").cursor("not-allowed"))
  .at("md", t => t.padding("x", "8").textSize("lg"))
```

Don't use `setClass` with long Tailwind strings — use fluent methods.
Don't use `addClass` for variants — use `.on()` and `.at()` instead.

---

## Fastify

**Feature module structure** (view details in [views.md](views.md)):
```
src/[feature]/
  [feature].routes.ts       # Route definitions (defineRoutes + ids)
  [feature].controller.ts   # Request handlers
  [feature].schema.ts       # JSON Schema + TS interfaces
  [feature].utils.ts        # Helpers
  views/                    # One file per page/endpoint response
```

**Type request generics + JSON Schema validation:**
```typescript
server.post(
  "/users",
  { schema: createUserSchema },
  async (request: FastifyRequest<{ Body: CreateUserReq }>, reply) => {
    const { email, name } = request.body;
  }
);
```

**SSR responses only** — no JSON errors:
```typescript
reply.renderView(PageView());                                         // ✓
reply.code(422).renderView(CreateUserForm({ email: "Email taken" })); // ✓ validation error (422 swaps in htmx 4)
reply.redirect("/path");                                              // ✓ redirect
reply.code(400).send({ error: "Bad request" });                       // ✗ not a REST API
```

**Auth via preHandler:**
```typescript
server.get("/dashboard", { preHandler: [requireAuth] }, async (request, reply) => { ... });
```

**Always `as const` on JSON Schema type values** — inference breaks without it:
```typescript
properties: { email: { type: "string" as const } }  // ✓
properties: { email: { type: "string" } }            // ✗
```

---

## TypeScript

**`type` over `interface`** (exception: Fastify module augmentation).

**Discriminated unions** for state — no optional booleans:
```typescript
type ViewState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };
// ✗ { loading?: boolean; error?: string; data?: User[] }
```

**String literal unions** — never bare `string` where only specific values are valid:
```typescript
type Status = "active" | "pending" | "suspended";
```

**Exhaustive checks** with `assertNever`:
```typescript
function assertNever(x: never): never { throw new Error(`Unhandled: ${x}`); }
```

**Branded types** to prevent ID mixups:
```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;
```

**`satisfies`** to validate without widening:
```typescript
const themes = {
  light: { bg: "white", text: "gray-900" },
  dark:  { bg: "gray-900", text: "white" },
} satisfies Record<string, { bg: string; text: string }>;
```

**Narrow props with union variants** — no bags of optionals:
```typescript
// ✓ each variant carries only its relevant fields
type ButtonProps =
  | { variant: "primary"; label: string; disabled?: boolean }
  | { variant: "danger"; label: string; confirm: string }
  | { variant: "link"; label: string; href: string };
```
