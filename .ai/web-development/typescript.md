# TypeScript Guidelines

Focus: **make illegal states unrepresentable** — use the type system to eliminate bugs at compile time.

Principle: **prefer the narrowest type possible** — default to `as const`, `satisfies`, `const` type parameters, and literal types. Widen only when you have a reason to.

## `type` over `interface`

Types are more composable (unions, intersections, mapped/conditional types).

```typescript
type User = { id: string; name: string; email: string };
type AdminUser = User & { role: "admin"; permissions: string[] };
```

Exception: `interface` only for Fastify module augmentation.

## Discriminated Unions — the core pattern

Model states as a union with a literal discriminant. Each branch carries only its data:

```typescript
type ViewState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };
```

Use `Match` with a discriminant key for automatic narrowing — each callback receives the narrowed variant:
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
    active:    () => Span("Active").background("green-100").textColor("green-800"),
    pending:   () => Span("Pending").background("yellow-100").textColor("yellow-800"),
    suspended: () => Span("Suspended").background("red-100").textColor("red-800"),
  });
}
```

## Narrow Props with Unions

No bags of optionals — each variant carries only its relevant fields:

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

Adding a new member to a union immediately surfaces every switch/Match that needs updating.

## Branded Types

Prevent mixing up values that share the same underlying type:

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
const themes = {
  light: { bg: "white", text: "gray-900" },
  dark:  { bg: "gray-900", text: "white" },
} satisfies Record<string, { bg: string; text: string }>;
// themes.light.bg is type "white", not string
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

Use `const` on generic type parameters to infer literal types from callers — the function-level equivalent of `as const`:

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
