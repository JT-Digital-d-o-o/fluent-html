# Quality Assurance Guidelines

Pragmatic testing pyramid — fast unit tests at the base, targeted integration tests in the middle. Tests catch regressions and document behavior, not hit coverage numbers.

> Pattern references (read these when writing tests):
> - [unit-testing.md](unit-testing.md) — Vitest patterns for pure functions, schemas, utils
> - [integration-testing.md](integration-testing.md) — server.inject() routes, auth flows, Prisma, HTMX
> - [view-testing.md](view-testing.md) — fluent-html render output, component branches, OOB swaps

---

## Which test layer to use

```
Unit tests (fast, no I/O):
  Formatters, validators, schema logic, config helpers, type guards, pure transforms

View tests (fast, render() in-memory, no server):
  Components, control flow branches (IfThen/ForEach/Match), form views,
  OOB swaps, discriminated union views, layouts

Integration tests (server.inject, real or test DB):
  Auth flows, form submissions, auth guards, file operations,
  HTMX responses (swap targets, OOB, hx-trigger headers), error paths
```

**Layer selection rules:**
- If it's a pure function with no I/O → unit test
- If it renders HTML but needs no server → view test
- If it needs HTTP request/response, auth cookies, or database → integration test
- Never test the same logic at two layers. If a unit test covers validation, don't also test that validation through an integration test.

---

## When to write tests

Always test:
- Functions with if/else, switch, or Match() branching
- Schema validation (valid input passes, invalid input fails)
- Auth guards and permission checks
- Data transformations (DB row → view props)
- Error handling paths (duplicate email, missing record, bad input)

Skip tests for:
- Pass-through routes — routes that call one function and return its result, with no `if`/`else`, `switch`, or `Match()` branching
- Static view components — views with no `IfThen`, `ForEach`, `Match`, or any conditional rendering; pure markup only
- Configuration objects and type definitions
- Framework behavior (Fastify routing, Prisma client methods)

**Always write a regression test when fixing a bug.**

---

## Key rules

- **Test behavior, not implementation.** Assert on observable outcomes (status codes, HTML content, DB records), not internal method calls.
- **Don't chase coverage numbers.** Ask "what can break?" not "what lines aren't covered?"
- **Don't assert on exact HTML.** Use `toContain()` for meaningful content, not `toBe()` for full markup.
- **Mock external services (S3, email, Stripe, AI), never the database.** Use a real test DB.
- **Use shared mocks from `tests/setup.ts`** — don't recreate mocks per test file.
- **Clean up test data in beforeAll/afterAll.** Use unique test emails per file (e.g. `auth-test@example.com`). Never `deleteMany({})` without a where clause.
- **Each test must be independent.** No shared mutable state, no dependency on execution order.
- **Snapshots: only for static view components with deep nesting (5+ levels) and no dynamic data.** Use explicit assertions everywhere else.
- **Descriptive test names that read as behavior:** `"should reject duplicate email"` not `"should call prisma.user.create"`.

---

## Running tests

```bash
npm run test                                    # all tests
npm run test:watch                              # watch mode
npm run test:coverage                           # coverage report
npx vitest run tests/integration/auth.test.ts   # specific file
npx vitest run -t "should register"             # name pattern
```

Run `npm run test && npm run lint` before pushing.
