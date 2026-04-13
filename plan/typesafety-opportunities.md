# fluent-html: Type Safety & Advanced Pattern Opportunities

> Analysis date: 2026-04-13 | Version: 5.10.0 | Perspective: full-stack dev (Fastify + Prisma + HTMX)

---

## 1. ~~IfThen FALSY VALUE BUG~~ (Done)

**Status:** Verified correct, tests added (v5.10.0)

The implementation was already correct — `!= null` properly passes `0`, `""`, and `NaN` through. The gap was the absence of tests. Added 6 tests in `test/control-flow.test.ts` covering:
- `IfThen` with `0`, `""`, `NaN` (all pass through to then-branch)
- `IfThenElse` with `0`, `""`, `NaN` (all take then-branch, not else)

---

## 2. ~~ROUTE PATH PARAMS — NO COMPILE-TIME MISSING-PARAM GUARD~~ (Done)

**Status:** Runtime guard + stricter types added (v5.10.0)

Two changes:

1. **Runtime guard** — `assertNoUnresolvedParams()` in `src/routes.ts` throws if any `:param` placeholder survives substitution, in both the route callable and `.resolve()`. Error includes the param name and template path for easy debugging.

2. **Stricter `RouteDef` type** — `path` changed from `string` to `` `/${string}` ``, and the prefixed overload constrains the prefix the same way. Forgetting `as const` or using a path without a leading `/` is now a compile error.

4 tests added in `test/routes.ts` covering missing single param, all params missing, and the happy path.

---

## 3. ~~HxSwap ESCAPE HATCH~~ (Done) / HxTrigger / HxTarget — ESCAPE HATCHES

**HxSwap — Done (v5.10.0):** Removed `(string & {})` from `HxSwap`. Added missing modifier variants (`scroll:window:top`, `scroll:window:bottom`, `show:window:top`, `show:window:bottom`, `show:none`) so the typed union covers real-world patterns. Invalid modifier combos are now compile errors.

**Remaining (kept as-is):**

| Type | Escape hatch? | Rationale for keeping |
|------|--------------|------|
| `HxTrigger` | Yes — `(string & {})` | Custom events, filter syntax too complex to enumerate |
| `HxTarget` | Yes — `StandardCSSSelector = string` | CSS selectors are open-ended |
| `BooleanAttribute` | Yes — `(string & {})` | Custom boolean attrs are intentional |

---

## 4. ~~NO TYPED VIEW PROPS SYSTEM~~ (Rejected)

**Status:** Rejected — plain typed functions are sufficient.

Both proposed options (phantom `ViewProps<T>` type, `createView` factory) add abstraction without meaningful safety over what TypeScript already provides. The real pain point is Prisma query-view mismatches (#5), which is better solved by co-locating query shapes with views — no new wrapper needed.

---

## 5. PRISMA → VIEW TYPE FLOW GAP

The README recommends using Prisma's `GetPayload` types for view props:

```typescript
type UserWithPosts = Prisma.UserGetPayload<{ include: { posts: true } }>;
function UserDetail(user: UserWithPosts) { ... }
```

But there's no mechanism to **enforce** that the Prisma query matches the view's expectations. Common bug:

```typescript
// Handler:
const user = await prisma.user.findUnique({ where: { id } });
// Forgot: include: { posts: true }

// View expects posts, but they're undefined:
reply.renderView(UserDetail(user));  // TS doesn't error — posts is optional in base User type
```

**Opportunity — query-view binding:**

```typescript
// Define the query shape alongside the view
const userDetailQuery = {
  include: { posts: true, profile: true }
} as const satisfies Prisma.UserFindUniqueArgs['include'];

type UserDetailData = Prisma.UserGetPayload<{ include: typeof userDetailQuery }>;

function UserDetailView(props: { user: UserDetailData }) { /* ... */ }

// In handler — query and view are linked:
const user = await prisma.user.findUnique({
  where: { id },
  include: userDetailQuery,  // Same object, guaranteed match
});
reply.renderView(UserDetailView({ user }));
```

This pattern co-locates the query shape with the view that consumes it, eliminating the mismatch class of bugs entirely.

---

## 6. `foldView` TAG ATTRS ARE UNTYPED

When using `foldView`, the `tag` handler receives `TagAttrs` which types element-specific properties as `unknown`:

```typescript
// src/fold/types.ts
type TagAttrs = {
  id?: string;
  class?: string;
  style?: string;
  attributes: Record<string, string>;
  htmx?: HTMX;
  toggles?: string[];
  [key: string]: unknown;  // ← element-specific props are untyped
};
```

So extracting `src` from an `<img>` tag requires casting:

```typescript
foldView({
  tag: (el, attrs, children) => {
    if (el === 'img') {
      const src = attrs.src as string;  // Unsafe cast required
    }
    return children;
  },
  // ...
}, view);
```

**Opportunity — element-aware algebra:**

```typescript
// Type-safe tag handler with element narrowing
type ElementAttrs = {
  img: { src?: string; alt?: string; loading?: 'lazy' | 'eager' };
  a: { href?: string; target?: string; rel?: string };
  input: { type?: string; name?: string; value?: string };
  // ... other elements
};

interface TypedViewAlgebra<A> extends ViewAlgebra<A> {
  tag<E extends keyof ElementAttrs>(
    element: E,
    attrs: TagAttrs & ElementAttrs[E],
    children: A
  ): A;
}
```

This would let `foldView` narrow attrs based on the element name, eliminating unsafe casts.

---

## 7. BEHAVIOR SYSTEM — EXEMPLARY PATTERN TO EXTEND

The behavior system (`src/core/behavior-methods.ts`) is the **best type safety pattern** in the codebase. It uses a discriminated map to enforce that each behavior gets exactly the right payload:

```typescript
type BehaviorMap = {
  toggle:      { target: Id };
  toggleClass: { target: Id; class: string };
  clipboard:   { value: string };
  disable:     void;
  // ...
};

// Usage:
Button("Copy").behavior("clipboard", { value: apiKey })  // ✓ requires value
Button("Toggle").behavior("toggle", { target: ids.panel }) // ✓ requires target
Button("Submit").behavior("disable")                       // ✓ no payload
Button("Copy").behavior("clipboard")                       // ✗ missing { value }
```

**Extend this pattern to:**
- Custom behaviors (user-defined behavior map extension)
- HTMX event handlers (typed trigger → response mapping)
- Form validation rules (field name → validation constraint mapping)

---

## 8. ~~CONTEXT SYSTEM — GOOD BUT COULD BE STRONGER~~ (Done)

**Status:** `createRequiredContext` added (v5.10.0)

Added `createRequiredContext<T>(name: string)` in `src/control/context.ts`, exported from the public API. Accessing `.current` outside an active scope throws a descriptive error: `Context "AuthCtx" accessed outside of a scope. Wrap the call in AuthCtx.scope(value).`

```typescript
const AuthCtx = createRequiredContext<User>("AuthCtx");

function App(user: User) {
  using _ = AuthCtx.scope(user);
  return Div(Header(), Content());
}

function Header() {
  const user = AuthCtx.current;  // User — throws if no scope active
  return Span(user.name);
}
```

5 tests added in `test/context.test.ts` covering: throws outside scope, returns value inside scope, reverts after scope exit, nested scopes, and rendering integration.

---

## 9. DISCRIMINATED UNION MATCH — EXHAUSTIVENESS GEM

The `Match` function with discriminant key is genuinely excellent type-level programming:

```typescript
type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: User[] };

Match(state, "status", {
  loading: ()  => Spinner(),
  error:   (s) => Alert(s.message),   // s narrowed to { status: "error"; message: string }
  success: (s) => UserList(s.data),   // s narrowed to { status: "success"; data: User[] }
})
```

**What makes it great:**
- Compile-time exhaustiveness (forget a case → error)
- Automatic type narrowing per branch via `Extract<T, Record<K, V>>`
- Optional default for partial matches
- Works with any discriminant key, not just `"status"`

**Opportunity — extend to nested discriminants:**

```typescript
// Currently not supported:
type ApiResponse =
  | { type: "user"; data: { role: "admin" | "viewer"; /* ... */ } }
  | { type: "post"; data: { status: "draft" | "published" } };

// Would be nice:
Match(response, "type", {
  user: (r) => Match(r.data, "role", {
    admin: () => AdminPanel(),
    viewer: () => ViewerPanel(),
  }),
  post: (r) => /* ... */,
})
```

This already works by nesting `Match` calls. Document it as a recommended pattern.

---

## 10. ROUTE → HANDLER → VIEW TYPE CHAIN

The ideal full-stack type flow:

```
defineRoutes (path params typed)
    ↓
handle(server, route, handler)  (Fastify binds params/body types)
    ↓
prisma.query({ include: viewQuery })  (query shape matches view)
    ↓
ViewFunction(prismaResult)  (props match Prisma payload)
    ↓
render(view)  (View type, auto-escaped)
    ↓
reply.renderView(html)  (string response)
```

**Where types currently break in this chain:**

| Step | Type Safety | Gap |
|------|-------------|-----|
| Route definition → Fastify path | Manual — `handle()` binds but params are `string` | No numeric/UUID param parsing |
| Route params → Prisma query | Manual — `id` is string, Prisma may want number | No automatic coercion typing |
| Prisma result → View props | Manual — must match `include`/`select` | No co-location enforcement |
| View → rendered HTML | Automatic — `render()` escapes | `Raw()` bypasses escaping |
| HTMX target → DOM element | Type-safe via `defineIds` | String fallback still allowed |

**Biggest multiplier opportunity:** Co-locate Prisma query shapes with view functions (see #6). This single pattern eliminates the most common class of runtime errors in SSR apps.

---

## 11. MISSING: TYPED FORM SERIALIZATION

Forms submit data as `FormData` or URL-encoded strings. The schema system (`*.schema.ts`) validates at the Fastify level, but there's no type bridge from the HTML form to the schema:

```typescript
// schema.ts
const createUserSchema = {
  body: {
    type: "object" as const,
    required: ["email", "name"],
    properties: {
      email: { type: "string" as const },
      name: { type: "string" as const },
    },
  },
};

// view.ts — form field names are untyped strings:
Form(
  Input("text").setName("email"),     // "email" is just a string
  Input("text").setName("nmae"),      // Typo! Not caught by types
  Button("Submit").setType("submit"),
)
```

**Opportunity — typed form names:**

```typescript
type CreateUserBody = { email: string; name: string };

// Helper that restricts setName to valid field names:
function TypedInput<T>(field: keyof T & string, type?: InputType) {
  return Input(type).setName(field);
}

Form(
  TypedInput<CreateUserBody>("email", "text"),   // ✓
  TypedInput<CreateUserBody>("nmae", "text"),     // ✗ TypeScript error
)
```

Or at the form level:

```typescript
function TypedForm<T extends Record<string, unknown>>(
  ...children: View[]
): Tag {
  return Form(...children);
}
// With a builder that validates field names against T
```

---

## Summary of Priorities

| # | Opportunity | Category | Impact | Effort | Status |
|---|-----------|----------|--------|--------|--------|
| 1 | Fix/test IfThen falsy values | Bug | Critical | Low | **Done** — verified correct, 6 tests added |
| 2 | Route param runtime guard + stricter types | Safety | High | Low | **Done** — runtime guard + `/${string}` path type |
| 3 | Remove HxSwap escape hatch | Safety | Medium | Low | **Done** — strict union, added window modifiers |
| 4 | Typed view props convention | DX | High | Medium | **Rejected** — plain functions suffice |
| 5 | Prisma query-view co-location | DX | Very High | Medium | Open |
| 6 | Typed fold attrs per element | DX | Medium | Medium | Open |
| 7 | Extend behavior pattern | DX | Medium | Low | Open |
| 8 | Required context variant | Safety | Medium | Low | **Done** — `createRequiredContext` added |
| 9 | Document nested Match | Docs | Low | Trivial | Open |
| 10 | Route→Handler→View type chain | Architecture | Very High | High | Open |
| 11 | Typed form field names | Safety | High | Medium | Open |

**Remaining highest-leverage items:** 5 (Prisma query-view co-location) and 11 (typed form field names) — both catch bugs that currently only surface at runtime in production.
