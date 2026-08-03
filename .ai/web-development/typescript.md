# TypeScript Guidelines

Focus: **make illegal states unrepresentable** — use the type system to eliminate bugs at compile time.

Principle: **prefer the narrowest type possible** — default to `as const`, `satisfies`, `const` type parameters, literal types. Widen only with a reason.

## `type` over `interface`

More composable (unions, intersections, mapped/conditional types).

```typescript
type User = { id: string; name: string; email: string };
type AdminUser = User & { role: "admin"; permissions: string[] };
```

Exception: `interface` only for Fastify module augmentation.

## Discriminated Unions — the core pattern

Model states as a union with a literal discriminant; each branch carries only its data:

```typescript
type ViewState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };
```

`Match` with a discriminant key narrows automatically — each callback receives the narrowed variant:
```typescript
function UserPage(state: ViewState<User[]>) {
  return Match(state, "status", {
    loading: ()  => Div("Loading..."),
    error:   (s) => Div(s.message),           // s: { status: "error"; message: string }
    success: (s) => ForEach(s.data, (u) => Li(u.name)), // s: { status: "success"; data: User[] }
  });
}
```

## String Literal Unions

Never bare `string` where only specific values are valid:

```typescript
type Status = "active" | "pending" | "suspended";

function StatusBadge(status: Status) {
  return Match(status, {
    active:    () => Span("Active").bg("success/10").text("success"),
    pending:   () => Span("Pending").bg("warning/10").text("warning"),
    suspended: () => Span("Suspended").bg("danger/10").text("danger"),
  });
}
```

## Narrow Props with Unions

No bags of optionals — each variant carries only its fields:

```typescript
// ✗ loose props, many impossible combinations
type ButtonProps = { label: string; variant?: string; href?: string; disabled?: boolean };

// ✓ each variant is explicit
type ButtonProps =
  | { variant: "primary"; label: string; disabled?: boolean }
  | { variant: "danger"; label: string; confirm: string }
  | { variant: "link"; label: string; href: string };
```

## Exhaustive Checks

Force the compiler to catch unhandled union members:

```typescript
function assertNever(x: never): never { throw new Error(`Unhandled: ${x}`); }
```

Adding a union member surfaces every switch/Match that needs updating.

## Branded Types

Prevent mixing values that share an underlying type:

```typescript
type Brand<T, B extends string> = T & { readonly __brand: B };
type UserId = Brand<string, "UserId">;
type PostId = Brand<string, "PostId">;

const UserId = (id: string) => id as UserId;
const PostId = (id: string) => id as PostId;

function getUser(id: UserId) { /* ... */ }
getUser(UserId("abc"));  // OK
getUser(PostId("xyz"));  // Compile error
```

## `satisfies` Operator

Validate a value matches a type **without widening**:

```typescript
const limits = {
  free: { seats: 3,  storageGb: 5 },
  pro:  { seats: 25, storageGb: 500 },
} satisfies Record<string, { seats: number; storageGb: number }>;
// limits.free.seats is type 3, not number
// ✗ don't model styling this way — a hand-maintained theme record is what defineTheme replaces,
//   and record[var] reaches a fluent method as a non-literal arg → dropped class
```

## `as const` Assertions

Preserve literal types for static arrays and objects. **Default to `as const`** for any value that shouldn't widen:

```typescript
const roles = ["admin", "editor", "viewer"] as const;  // readonly tuple, not string[]
export const ids = defineIds(["user-list", "user-count"] as const);

const config = { retries: 3, timeout: 5000 } as const; // ✓ { retries: 3; timeout: 5000 }
const config = { retries: 3, timeout: 5000 };           // ✗ { retries: number; timeout: number }
```

## `const` Type Parameters

`const` on generic type parameters infers literal types from callers — the function-level equivalent of `as const`:

```typescript
// ✓ infers literal tuple types from arguments
function defineRoutes<const T extends readonly string[]>(routes: T): T { return routes; }
const r = defineRoutes(["users", "posts"]); // type: readonly ["users", "posts"]

// ✗ without const, literals widen
function defineRoutes<T extends readonly string[]>(routes: T): T { return routes; }
const r = defineRoutes(["users", "posts"]); // type: readonly string[]
```

## `NoInfer<T>`

Prevent a type parameter from being inferred at a specific site — forces the caller to match a type decided elsewhere:

```typescript
function createHandler<T>(schema: Schema<T>, fallback: NoInfer<T>): Handler<T> { ... }
// T is inferred from schema only; fallback must match, never drives inference
```

## Intersection Types

Compose types by combining them:

```typescript
type Timestamps = { createdAt: Date; updatedAt: Date };
type UserRecord = User & Timestamps;

type WithPagination<T> = T & { page: number; totalPages: number };
```

## Utility Types

```typescript
Omit<User, "id" | "createdAt">     // Create form from model
Partial<CreateUserReq>              // Partial update
Pick<User, "id" | "name">          // View summary
Record<Status, { label: string }>  // Status config map
```

## Custom Type Guards

```typescript
type Guest = { kind: "guest" };
type Member = { kind: "member"; name: string };
type Visitor = Guest | Member;

const isMember = (v: Visitor): v is Member => v.kind === "member";
```

## Generics

```typescript
type HasId = { id: string };

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

type Column<T> = { key: keyof T; label: string };
function DataTable<T extends HasId>(items: T[], columns: Column<T>[]) { ... }
```

## Type-level tests (lock the compile-time contract)

Closed unions, `Form<T>` field-name narrowing, and typed route params are headline features — but `tsc` building + runtime tests passing does **not** catch a *type-only* regression (widened union, broken narrowing). Guard with compile-only `test/types/*.test-d.ts` files, checked by `tsc` in the build:

```typescript
// positive: compiles
Img().setFetchPriority("high");
// @ts-expect-error — FetchPriority is closed; a typo must NOT compile
Img().setFetchPriority("highh");
// @ts-expect-error — "emial" is not a key of the schema
Form<CreateUserReq>((f) => f.input("emial", "email"));
```

A `@ts-expect-error` whose line stops erroring becomes an "unused directive" build error — so a widened union or broken narrowing **fails the build**, not silently degrades. Zero deps (no tsd): `test/**` already in `tsconfig`.
