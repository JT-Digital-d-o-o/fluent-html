# Project Guidelines

**Stack:** Fastify v5 + TypeScript + fluent-html + HTMX + Tailwind CSS (SSR app)

> References: [fluent-html.md](fluent-html.md) | [fluent-html-FLUENT-APIs.md](fluent-html-FLUENT-APIs.md) | [fastify.md](fastify.md) | [typescript.md](typescript.md)

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

**IfThen narrows nullable values** — callback receives the non-null type:
```typescript
IfThen(user.avatar, (avatar) => Img().setSrc(avatar))           // avatar: string
IfThenElse(user.name, (name) => Span(name), () => Span("Anon")) // name: string
IfThen(user.avatar, () => Img().setSrc(user.avatar!))            // ✗ don't re-check/cast
user.name ? Span(user.name) : Span("Anon")                      // ✗ use IfThenElse
```

**Conditional modifiers & composition:**
```typescript
Button("Save").when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))

const card = (t: Tag) => t.padding("6").background("white").rounded("lg").shadow("md");
Div("Content").apply(card)
```

---

## HTMX

**Type-safe targets with defineIds** — never hardcode ID strings:
```typescript
export const ids = defineIds(["user-list", "user-count"] as const);
Div().setId(ids.userList)
Button("Load").hxGet("/api", { target: ids.userList })
hx("/api", { target: "#userList" })  // ✗ typos cause silent failures
```

**Type-safe routes with defineRoutes** — never hardcode endpoint strings:
```typescript
export const userRoutes = defineRoutes({
  list:   { method: "get",    path: "/users" },
  create: { method: "post",   path: "/users" },
  delete: { method: "delete", path: "/users/:id" },
} as const);

// Views — method is locked, params are required, typos are compile errors
Button("Load").setHtmx(userRoutes.list())
Button("Load").setHtmx(userRoutes.list({ target: ids.userList }))
Button("Delete").setHtmx(userRoutes.delete({ id: user.id }, { target: ids.userList }))
userRoutes.lsit()            // ✗ typo — compile error
userRoutes.delete()          // ✗ missing params — compile error

// Controllers — single-sourced paths
server.get(userRoutes.list.path, handler)       // "/users"
server.delete(userRoutes.delete.path, handler)  // "/users/:id"
```

**Shorthand methods** for simple requests, **setHtmx(hx())** for complex:
```typescript
Button("Load").hxGet("/api/items")
Button("Save").hxPost("/api/save", { target: ids.result })

Form(/* fields */).setHtmx(hx("/search", {
  method: "post", target: ids.results,
  swap: "outerMorph", indicator: "#spinner"
}))
```

**Prefer outerMorph swap** — preserves focus, scroll, animations; innerHTML loses the target element's id:
```typescript
hx("/users", { target: ids.userList, swap: "outerMorph" })  // ✓
hx("/users", { target: ids.userList, swap: "innerHTML" })    // ✗
```
Use `outerHTML` only when you intentionally want to destroy and recreate DOM state.

**Partial swaps** — update multiple page sections in one response:
```typescript
render(
  Partial(ids.mainContent, UserList(users)),
  Partial(ids.userCount, Span(`${users.length} users`)),
  Partial(ids.pageTitle, H1("Users")),
)
```

**Status-code routing** for validation and error responses:
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

**Explicit inheritance** — htmx 4 does not inherit attributes by default. Use `:inherited` modifier:
```typescript
Div(
  Button("Delete 1").hxDelete("/item/1"),
  Button("Delete 2").hxDelete("/item/2"),
).addAttribute("hx-confirm:inherited", "Are you sure?")

// Or opt back in to htmx 2 behavior globally:
HtmxConfig({ implicitInheritance: true })
```

**Global htmx config** via meta tag:
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

**Per-element config** — replaces removed `hx-request`:
```typescript
Button("Upload").hxPost("/upload", {
  config: { timeout: 120000 },
})
```

**hxResponse** for server-driven navigation and events:
```typescript
const { html, headers } = hxResponse(Empty())
  .redirect("/users")
  .trigger("showToast", { message: "User created!" })
  .build();
reply.headers(headers);
reply.renderView(html);
```

**Morph swaps** — preserve DOM state (focus, scroll, animations):
```typescript
Button("Refresh").hxGet("/users", {
  target: ids.userList,
  swap: "outerMorph",
})
```

**Preload** — start fetch on hover, cached by click time:
```typescript
A("Dashboard").setHref("/dashboard").toggle("hx-boost").toggle("hx-preload")
```

---

## View Composition

**Components = plain functions with a typed props object** (never positional args):
```typescript
type FormFieldProps = { id: string; label: string; type?: string; error?: string };

function FormField({ id, label, type = "text", error }: FormFieldProps) {
  return Div(
    Label(label).setFor(id).fontWeight("medium").textSize("sm"),
    Input().setId(id).setName(id).setType(type)
      .w("full").padding("2").border().borderColor("gray-300").rounded(),
    IfThen(error, (msg) => P(msg).textColor("red-500").textSize("sm"))
  );
}
```

**Discriminated unions for page states:**
```typescript
type UsersViewProps =
  | { state: "list"; users: User[] }
  | { state: "form"; error?: string }
  | { state: "detail"; user: User };

export function UsersView(props: UsersViewProps) {
  return Match(props.state, {
    list:   () => UserListSection(props.users),
    form:   () => UserFormSection(props.error),
    detail: () => UserDetailSection(props.user),
  });
}
```

**Inline form validation errors:**
```typescript
type FormErrors = { [field: string]: string | undefined };

function CreateUserForm(errors: FormErrors = {}) {
  return Form(
    FormField({ id: "name", label: "Name", error: errors.name }),
    FormField({ id: "email", label: "Email", type: "email", error: errors.email }),
    Button("Create").setType("submit")
  ).hxPost("/users/create", { target: ids.mainContent, swap: "outerMorph" });
}
// Controller re-renders with errors: reply.renderView(CreateUserForm({ email: "Email already in use" }));
```

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

**Chainable fluent methods** for base styles, **addClass** for pseudo-classes/responsive:
```typescript
Div().padding("4").margin("x", "auto").background("blue-500")
  .textColor("white").rounded("lg").shadow("md").flex().gap("4")

Button("Click").padding("x", "4").background("blue-500").rounded()
  .addClass("hover:bg-blue-600 focus:ring-2 md:w-1/2")
```

Don't use `setClass` with long Tailwind strings for base utilities — use fluent methods.

---

## Fastify

**Feature module structure:**
```
src/[feature]/
  [feature].routes.ts       # Route definitions (defineRoutes)
  [feature].controller.ts   # Routes (imports routes for path registration)
  [feature].schema.ts       # JSON Schema + TS interfaces
  [feature].view.ts         # Views (imports routes for setHtmx + ids for targets)
  [feature].utils.ts        # Helpers
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
