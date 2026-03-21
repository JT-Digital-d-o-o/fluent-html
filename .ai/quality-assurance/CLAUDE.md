# Quality Assurance Guidelines

This project follows a **pragmatic testing pyramid** — fast unit tests at the base, targeted integration tests in the middle, and a manual checklist before deploy. Tests exist to catch regressions and document behavior, not to hit coverage numbers.

> Detailed references:
> - [unit-testing.md](unit-testing.md) — Vitest patterns for pure functions, schemas, utils
> - [integration-testing.md](integration-testing.md) — server.inject() routes, auth flows, Prisma, HTMX
> - [view-testing.md](view-testing.md) — fluent-html render output, component branches, OOB swaps
> - [manual-checklist.md](manual-checklist.md) — Pre-deploy browser QA checklist

---

## Testing Pyramid for SSR Apps

This stack (Fastify + fluent-html + HTMX + Prisma) is server-rendered. The testing strategy reflects that — most logic lives on the server, so most tests run on the server too.

### DO: Follow the pyramid — more unit tests, fewer integration tests
```
                 ┌─────────┐
                 │ Manual  │  ← browser checklist before deploy
                 │  QA     │
                ├───────────┤
               │ Integration │  ← server.inject() route tests
               │   Tests     │    (auth, forms, redirects, OOB)
              ├───────────────┤
             │  View Tests     │  ← render() in-memory, no server
             │                 │    components, branches, OOB swaps
            ├───────────────────┤
           │   Unit Tests        │  ← pure functions, schemas,
           │                     │    formatters, type guards
           └─────────────────────┘
```

### DO: Test at the right layer
```
Unit tests (fast, no I/O):
- Formatters:       formatDate(), formatCurrency()
- Validators:       isValidEmail(), parseId()
- Schema logic:     JSON Schema validation outcomes
- Config helpers:   isProdEnv(), isDevEnv()
- Type guards:      isAdmin(), hasPermission()
- Pure transforms:  mapUserToView(), buildBreadcrumbs()

View tests (fast, render() in-memory, no server):
- Components:       render UserCard, FormField → check content
- Control flow:     IfThen/IfThenElse/ForEach/Match branches
- Form views:       fields present, inline errors, HTMX attributes
- OOB swaps:        correct IDs, hx-swap-oob attribute
- Union views:      each variant of discriminated union props
- Layouts:          nav, footer, title, CSS/JS includes

Integration tests (server.inject, real or test DB):
- Auth flows:       register → login → access protected → logout
- Form submissions: POST with valid/invalid data → check response HTML
- Auth guards:      protected route without cookie → 401/redirect
- File operations:  upload → download → delete
- HTMX responses:   correct swap targets, OOB elements, hx-trigger headers
- Error paths:      duplicate email, missing fields, not found

Manual QA (browser, before deploy):
- HTMX navigation:  links swap correctly, scroll:top works
- Form UX:          inline errors appear, fields retain values
- Auth cookie:      persists across refresh, clears on logout
- Responsive:       layout works on mobile/tablet breakpoints
- Payment flows:    Stripe checkout → webhook → status update
```

### DON'T: Write integration tests for things unit tests cover
```typescript
// WRONG — testing formatDate through an HTTP round-trip
it("should show formatted date on user page", async () => {
  const response = await server.inject({ method: "GET", url: "/users/1" });
  expect(response.body).toContain("Jan 15, 2026");
});

// CORRECT — test formatDate directly, fast and isolated
it("should format date", () => {
  expect(formatDate(new Date("2026-01-15"))).toBe("Jan 15, 2026");
});
```

### DON'T: Write unit tests for glue code with no logic
```typescript
// WRONG — testing that Fastify calls a handler (framework's job)
it("should register the /users route", () => {
  expect(server.hasRoute("/users")).toBe(true);
});

// CORRECT — test the route's behavior via server.inject
it("should return user list page", async () => {
  const response = await server.inject({ method: "GET", url: "/users" });
  expect(response.statusCode).toBe(200);
  expect(response.body).toContain("Users");
});
```

---

## When to Write Tests

### DO: Write tests for code that has logic, branching, or validation
```
Always test:
- Functions with if/else, switch, or Match() branching
- Schema validation (valid input passes, invalid input fails)
- Auth guards and permission checks
- Data transformations (DB row → view props)
- Error handling paths (duplicate email, missing record, bad input)

Skip tests for:
- Simple pass-through routes with no branching
- Static view components with no conditional logic
- Configuration objects
- Type definitions
```

### DO: Write a test when you fix a bug — prevent regressions
```typescript
// Bug: duplicate email registration crashes instead of showing error
// Fix: catch unique constraint error and re-render form

it("should show error for duplicate email instead of crashing", async () => {
  // Register first user
  await server.inject({
    method: "POST", url: "/auth/register",
    payload: { email: "dup@test.com", name: "A", password: "pass123", passwordConfirm: "pass123" },
  });

  // Same email again — should show form error, not 500
  const response = await server.inject({
    method: "POST", url: "/auth/register",
    payload: { email: "dup@test.com", name: "B", password: "pass123", passwordConfirm: "pass123" },
  });

  expect(response.statusCode).toBe(200);
  expect(response.body).toContain("already exists");
});
```

### DON'T: Chase coverage numbers — test behavior, not lines
```
// WRONG mindset:
"We need 80% coverage — let me add tests for every getter and setter"

// CORRECT mindset:
"What can break? What would a regression look like? Test those paths."
```

---

## Test File Structure

### DO: Follow the project's module structure
```
src/auth/
  auth.controller.ts
  auth.schema.ts
  auth.view.ts

tests/
  integration/
    auth.test.ts           ← tests auth routes via server.inject
  unit/
    auth.schema.test.ts    ← tests schema validation logic
    auth.password.test.ts  ← tests hashing, comparison
```

### DO: Use descriptive test names that read as behavior
```typescript
// GOOD — describes what happens, not what the code does
describe("POST /auth/register", () => {
  it("should register a new user and redirect", async () => { ... });
  it("should reject duplicate email registration", async () => { ... });
  it("should reject mismatched passwords", async () => { ... });
});

// GOOD — unit test names describe input → output
describe("formatCurrency", () => {
  it("should format cents as dollars with two decimals", () => { ... });
  it("should handle zero amount", () => { ... });
  it("should use the specified currency symbol", () => { ... });
});
```

### DON'T: Name tests after implementation details
```typescript
// WRONG — if the implementation changes, the test name is meaningless
it("should call prisma.user.create with correct params", () => { ... });
it("should set the cookie with httpOnly flag", () => { ... });

// CORRECT — describes the observable outcome
it("should create the user in the database", () => { ... });
it("should set an auth cookie on successful login", () => { ... });
```

---

## Test Setup & Teardown

### DO: Clean up test data in beforeAll/afterAll
```typescript
const TEST_USER = {
  email: "test@example.com",
  name: "Test User",
  password: "testpassword123",
};

describe("Feature", () => {
  beforeAll(async () => {
    await server.ready();
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    await server.close();
  });
});
```

### DO: Use unique test data per test file to avoid collisions
```typescript
// auth.test.ts
const TEST_USER = { email: "auth-test@example.com", ... };

// files.test.ts
const TEST_USER = { email: "files-test@example.com", ... };
```

### DON'T: Depend on test execution order
```typescript
// WRONG — test B assumes test A ran first
it("should create a user", async () => { ... });
it("should login with the user created above", async () => { ... });

// CORRECT — each test sets up what it needs, or use beforeAll
beforeAll(async () => {
  // create user and store auth cookie for all tests
});
```

---

## Mocking

### DO: Mock external services (S3, email, AI, payment providers)
```typescript
// Mock storage — tests don't need real S3
vi.mock("../../src/files/storage.plugin", () => ({
  default: async (fastify: any) => {
    fastify.decorate("storage", {
      upload: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      getUrl: vi.fn().mockResolvedValue("https://example.com/signed-url"),
    });
  },
}));
```

### DO: Use the shared test mocks from tests/setup.ts
```typescript
import { mockMailer, mockS3, mockAnthropic } from "../setup";

// These are pre-configured vi.fn() mocks ready to use
```

### DON'T: Mock the database — use a real test database
```typescript
// WRONG — mocking Prisma gives false confidence
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockReturnValue({
    user: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: "Mock" }) },
  }),
}));

// CORRECT — use a real test database (docker-compose, SQLite)
// Tests catch actual query issues, constraint violations, migrations
import { prisma } from "../setup";
const user = await prisma.user.findUnique({ where: { id: 1 } });
```

### DON'T: Over-mock — if you mock everything, you're testing nothing
```typescript
// WRONG — this test proves nothing
it("should return user", async () => {
  vi.spyOn(prisma.user, "findUnique").mockResolvedValue(fakeUser);
  vi.spyOn(reply, "renderView").mockReturnValue(undefined);
  await handler(request, reply);
  expect(reply.renderView).toHaveBeenCalled(); // so what?
});

// CORRECT — test the actual response via server.inject
it("should return user page", async () => {
  const user = await prisma.user.create({ data: testUserData });
  const response = await server.inject({ method: "GET", url: `/users/${user.id}` });
  expect(response.statusCode).toBe(200);
  expect(response.body).toContain(testUserData.name);
});
```

---

## Assertion Patterns

### DO: Assert on behavior, not implementation
```typescript
// Auth test — check observable outcomes
expect(response.statusCode).toBe(302);                              // redirected
expect(response.headers.location).toBe("/");                        // to correct URL
expect(response.headers["set-cookie"]).toBeDefined();               // cookie was set

// Form error — check user-facing message
expect(response.statusCode).toBe(200);                              // re-rendered form
expect(response.body).toContain("Passwords do not match");          // error shown

// Database side effect — verify the record
const user = await prisma.user.findUnique({ where: { email } });
expect(user).not.toBeNull();
expect(user!.role).toBe("USER");
```

### DO: Assert on HTML content for SSR responses
```typescript
// Check that the page contains expected elements
expect(response.headers["content-type"]).toContain("text/html");
expect(response.body).toContain("Users");           // page title
expect(response.body).toContain(user.name);         // data rendered
expect(response.body).toContain('id="user-list"');   // HTMX target exists
```

### DON'T: Assert on exact HTML structure — it's brittle
```typescript
// WRONG — breaks when you add a class or reorder attributes
expect(response.body).toBe('<div class="p-4"><h1>Users</h1></div>');

// CORRECT — check for meaningful content
expect(response.body).toContain("Users");
expect(response.body).toContain(user.email);
```

---

## Common Anti-Patterns

### DON'T: Test framework behavior
```typescript
// WRONG — Fastify already tests its own routing
it("should return 404 for unknown route", async () => {
  const res = await server.inject({ method: "GET", url: "/nonexistent" });
  expect(res.statusCode).toBe(404);
});
```

### DON'T: Write tests that pass regardless of implementation
```typescript
// WRONG — this always passes
it("should do something", async () => {
  const response = await server.inject({ method: "GET", url: "/users" });
  expect(response).toBeDefined(); // every response is defined
});
```

### DON'T: Duplicate tests across unit and integration layers
```typescript
// If you test password validation in a unit test:
describe("validatePassword", () => {
  it("should reject passwords shorter than 8 chars", () => { ... });
});

// Then DON'T also test it through the full registration flow:
// WRONG
it("should reject short password during registration", async () => {
  const res = await server.inject({ method: "POST", url: "/auth/register", ... });
  expect(res.body).toContain("too short");
});
// The unit test already covers this — integration test adds nothing
```

---

## Running Tests

### DO: Know the test commands
```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run a specific test file
npx vitest run tests/integration/auth.test.ts

# Run tests matching a name pattern
npx vitest run -t "should register"
```

### DO: Run tests before pushing — CI should never be the first to catch failures
```bash
# Quick check before push
npm run test && npm run lint
```
