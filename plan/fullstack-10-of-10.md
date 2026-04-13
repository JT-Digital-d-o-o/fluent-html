# Full-Stack Integration: 8/10 → 10/10

> Current assessment: Route definitions are type-safe, `handle()` binds correctly, `renderView` works. But the **seams between layers leak types**: route params are always `string`, form field names are unconstrained, and Prisma query shapes don't enforce their contract with views.
>
> What separates 8 from 10: **the type system follows data from the URL through the handler, into the database query, back through the view, and into the HTML form — with no manual casts, no untyped strings, and no hope-based `include` matching.**

---

## 1. Typed Route Params — Not Just `string`

**Impact: High | Effort: Medium**

**Problem:** Every route param is `string`. A route like `/:id` where `id` is a UUID or number requires manual `parseInt` or validation in every handler. The type system can't distinguish `/users/:id` (UUID) from `/posts/:page` (number).

**Current:**
```typescript
// routes.ts — all params are string
type RouteCallable<Def> = HasParams<Def['path']> extends true
  ? (params: { [K in ExtractParams<Def['path']>]: string }, ...) => HTMX
  : ...

// handler — manual coercion, no safety
const getUser = handle(server, userRoutes.detail, async (request, reply) => {
  const id = request.params.id;  // string — is it a UUID? a number? who knows
  const user = await server.prisma.user.findUnique({ where: { id } });
});
```

**Fix — param type metadata on route definitions:**

```typescript
export const userRoutes = defineRoutes("/users", {
  list:   { method: "get",  path: "/" },
  detail: { method: "get",  path: "/:id", params: { id: "uuid" } },
  page:   { method: "get",  path: "/page/:page", params: { page: "number" } },
} as const);

// Calling the route — id accepts string (UUIDs are strings), page accepts number
userRoutes.detail({ id: "550e8400-..." })     // ✓
userRoutes.detail({ id: 42 })                  // ✗ compile error — uuid must be string
userRoutes.page({ page: 3 })                   // ✓
userRoutes.page({ page: "three" })             // ✗ compile error — expects number

// .resolve() — same typed params
userRoutes.detail.resolve({ id: userId })      // ✓ string
userRoutes.page.resolve({ page: 3 })           // ✓ number → stringified in URL
```

**Type-level design:**

```typescript
type ParamTypeMap = {
  string: string;
  number: number;
  uuid: string;  // UUIDs are strings, but semantically distinct
};

type ParamTypeName = keyof ParamTypeMap;

type RouteDef = {
  readonly method: HxHttpMethod;
  readonly path: `/${string}`;
  readonly params?: Readonly<Record<string, ParamTypeName>>;
};

// Extract resolved param types from definition
type ResolveParamTypes<Def extends RouteDef> =
  Def extends { params: infer P }
    ? { [K in ExtractParams<Def['path']>]: K extends keyof P
        ? P[K] extends ParamTypeName ? ParamTypeMap[P[K]] : string
        : string }
    : { [K in ExtractParams<Def['path']>]: string };
```

**Runtime:** `number` params get `String()` before URL encoding. `uuid` params get a format check (optional, dev-only). The metadata is available on the route object for downstream use (Fastify schema generation, Prisma query typing).

**Backward compatible:** Routes without `params` keep the current behavior (all `string`).

**Files:** `src/routes.ts`

---

## 2. Typed Form Fields — `setName` Constrained to Schema Keys

**Impact: High | Effort: Low**

**Problem:** `.setName("nmae")` compiles fine. Form field names are `string`, with no connection to the schema that validates them on the server.

**Current:**
```typescript
// forms.ts
setName(name?: string): this {  // any string
  this.name = name;
  return this;
}

// usage — typo not caught
Form(
  Input("text").setName("emial"),   // ✗ should be "email", no error
  Input("text").setName("name"),
)
```

**Fix — `formFor` helper that constrains field names:**

```typescript
// New export from fluent-html
export function formFor<T extends Record<string, unknown>>() {
  return {
    input<K extends keyof T & string>(
      name: K,
      type?: InputType
    ): InputTag {
      return Input(type).setName(name);
    },
    textarea<K extends keyof T & string>(name: K): TextareaTag {
      return Textarea().setName(name);
    },
    select<K extends keyof T & string>(name: K, ...children: View[]): SelectTag {
      return Select(...children).setName(name);
    },
    hidden<K extends keyof T & string>(name: K, value: string): InputTag {
      return Input("hidden").setName(name).setValue(value);
    },
  };
}
```

**Usage:**
```typescript
type CreateUserReq = { email: string; name: string; role: "admin" | "viewer" };

const f = formFor<CreateUserReq>();

Form(
  f.input("email", "email"),        // ✓
  f.input("name", "text"),          // ✓
  f.input("nmae", "text"),          // ✗ compile error — not a key of CreateUserReq
  f.select("role",
    Option("Admin").setValue("admin"),
    Option("Viewer").setValue("viewer"),
  ),
  Button("Submit").setType("submit"),
)
```

**Why a factory, not a generic `setName`:** Making `InputTag.setName` generic would require threading a type parameter through the entire Tag class hierarchy. A standalone `formFor<T>()` factory is zero-cost, doesn't touch existing code, and provides the same safety at the call site.

**Files:** new `src/form.ts`, export from `src/index.ts`

---

## 3. Prisma Query-View Co-location — Enforced, Not Just Recommended

**Impact: Very High | Effort: Medium**

**Problem:** Views declare what data shape they need (via Prisma `GetPayload` types), but nothing enforces that the handler's query actually provides it. Forgetting `include: { posts: true }` compiles fine — `posts` is optional in the base model.

**Current (broken silently):**
```typescript
// view
type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>;
function UserDetail(props: { user: UserWithPosts }) { ... }

// handler — forgot include, no compile error
const user = await prisma.user.findUnique({ where: { id } });
reply.renderView(UserDetail({ user }));  // ✗ runtime: user.posts is undefined
```

**Fix — `defineQuery` binds query shape to its result type:**

```typescript
// New export from fluent-html (or app-level pattern)
import type { Prisma, PrismaClient } from "@prisma/client";

export function defineQuery<
  Model extends keyof PrismaClient,
  Args extends Record<string, unknown>,
>(
  _model: Model,
  args: Args,
) {
  return {
    args,
    // Type-only: the return type of this query
    _type: {} as Prisma.Result<PrismaClient[Model], Args, "findUnique">,
  };
}
```

**Usage:**
```typescript
// user.queries.ts — co-located with or imported by the view
export const userDetailQuery = defineQuery("user", {
  include: { posts: true, profile: true },
} as const);

// Type extracted from the query definition
export type UserDetailData = typeof userDetailQuery._type;

// user.detail.view.ts
function UserDetail(props: { user: NonNullable<UserDetailData> }) {
  // user.posts is typed as Post[] — guaranteed by the query shape
}

// user.controller.ts — query and view are linked
const user = await server.prisma.user.findUnique({
  where: { id },
  ...userDetailQuery.args,  // same shape, guaranteed match
});
if (!user) return reply.code(404).renderView(NotFound());
reply.renderView(UserDetail({ user }));  // ✓ types match
```

**Why this works:** The view's props type is derived from the same object that defines the query args. Change the query, the view type updates. Remove an `include`, the view breaks at compile time.

**Alternative (lighter, no helper needed):** Document and lint for this pattern:

```typescript
// The canonical pattern — no new API, just discipline
const userDetailArgs = {
  include: { posts: true, profile: true },
} as const satisfies Prisma.UserFindUniqueArgs;

type UserDetailData = Prisma.UserGetPayload<typeof userDetailArgs>;

// handler uses userDetailArgs.include, view uses UserDetailData
```

The lighter pattern is already documented in `typesafety-opportunities.md` (#5). The question is whether to ship a helper that makes it harder to get wrong, or just document the `satisfies` pattern and rely on code review.

**Recommendation:** Ship the `satisfies` pattern as documented guidance + an ESLint rule in `fluent-html-eslint-plugin` that flags Prisma `findUnique`/`findMany` calls where the `include`/`select` is an inline literal rather than a shared reference. The helper is Prisma-specific and shouldn't live in fluent-html core.

**Files:** documentation update in `fluent-html.md`, new ESLint rule in `fluent-html-eslint-plugin`

---

## 4. `handle()` — Route Params Flow Into `request.params`

**Impact: High | Effort: Medium**

**Problem:** `handle()` registers a Fastify route but doesn't propagate the route definition's param types into the handler's `request.params`. The handler must manually type `FastifyRequest<{ Params: { id: string } }>`.

**Current:**
```typescript
// handler — params manually typed, can diverge from route definition
const getUser = handle(server, userRoutes.detail,
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    // What if route has /:userId but handler types { id }? No error.
  },
);
```

**Fix — `handle()` infers params from route definition:**

```typescript
// Enhanced handle() signature
type RouteParams<R extends RouteRef> = R extends RouteCallable<infer Def>
  ? HasParams<Def['path']> extends true
    ? { [K in ExtractParams<Def['path']>]: string }
    : {}
  : {};

export function handle<R extends RouteRef, Schema extends RouteGenericInterface = {}>(
  server: FastifyInstance,
  route: R,
  handler: (
    request: FastifyRequest<Schema & { Params: RouteParams<R> }>,
    reply: FastifyReply,
  ) => Promise<void>,
): R;

// With options overload
export function handle<R extends RouteRef, Schema extends RouteGenericInterface = {}>(
  server: FastifyInstance,
  route: R,
  opts: RouteShorthandOptions,
  handler: (
    request: FastifyRequest<Schema & { Params: RouteParams<R> }>,
    reply: FastifyReply,
  ) => Promise<void>,
): R;
```

**Usage:**
```typescript
const getUser = handle(server, userRoutes.detail, async (request, reply) => {
  request.params.id    // ✓ string — inferred from "/:id"
  request.params.foo   // ✗ compile error — no :foo in route
});
```

**Note:** This lives in the app's `route-handler.ts`, not in fluent-html core (Fastify is an app dependency). But fluent-html should export the `RouteParams` utility type for apps to use.

**Files:** `src/routes.ts` (export `RouteParams` type), app's `route-handler.ts`

---

## 5. Schema ↔ Type Single Source of Truth

**Impact: Medium | Effort: Medium**

**Problem:** JSON Schema for Fastify validation and TypeScript types are maintained separately. They can diverge silently.

**Current:**
```typescript
// schema.ts — two definitions of the same thing
export const createUserSchema = {
  body: {
    type: "object" as const,
    required: ["email", "name"],
    properties: {
      email: { type: "string" as const },
      name: { type: "string" as const },
    },
  },
};

export type CreateUserReq = { email: string; name: string };
// What if someone adds a field to the schema but not the type?
```

**Fix — derive the type from the schema:**

```typescript
import type { FromSchema } from "json-schema-to-ts";

export const createUserSchema = {
  body: {
    type: "object",
    required: ["email", "name"],
    properties: {
      email: { type: "string" },
      name: { type: "string" },
    },
    additionalProperties: false,
  },
} as const;

export type CreateUserReq = FromSchema<typeof createUserSchema.body>;
// { email: string; name: string } — derived, not duplicated
```

**Note:** This uses the existing `json-schema-to-ts` library (one dependency). The schema is the single source of truth. The type follows automatically.

**Integration with `formFor`:** Since the type is derived from the schema, `formFor<CreateUserReq>()` constrains form field names to exactly the schema's property keys. Change the schema, the form fields update or break at compile time.

**Files:** app-level pattern (documented), optional `json-schema-to-ts` dependency

---

## Summary

| # | Change | Where it lives | Impact | Effort |
|---|--------|---------------|--------|--------|
| 1 | Typed route params (`uuid`, `number`, `string`) | `src/routes.ts` | High | Medium |
| 2 | `formFor<T>()` — typed form field names | new `src/form.ts` | High | Low |
| 3 | Prisma query-view co-location guidance + ESLint rule | docs + eslint plugin | Very High | Medium |
| 4 | `RouteParams<R>` utility type for `handle()` | `src/routes.ts` | High | Medium |
| 5 | `FromSchema` for schema → type derivation | app pattern (docs) | Medium | Low |

**What ships in fluent-html core:** #1 (typed params), #2 (`formFor`), #4 (`RouteParams` export).

**What ships as ecosystem guidance:** #3 (Prisma co-location + ESLint rule), #5 (schema derivation pattern).

**What doesn't change:** `setName(string)` on `InputTag` stays as-is for backward compatibility. `formFor` is the recommended path for new code; existing untyped forms continue to work.
