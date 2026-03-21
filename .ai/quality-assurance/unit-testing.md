# Unit Testing

Vitest patterns for testing pure functions, schemas, formatters, and type guards. Unit tests are the base of the pyramid — fast, no I/O, no server.

---

## Setup

### Vitest config
```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "tests/", "**/*.d.ts", "**/*.config.*"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### File placement
```
tests/
  unit/
    helpers.test.ts           ← general helpers
    auth.password.test.ts     ← password hashing/comparison
    auth.permissions.test.ts  ← permission checks
    formatters.test.ts        ← date, currency formatters
    [feature].test.ts         ← feature-specific pure logic
```

---

## Testing Pure Functions

### DO: Test input → output with clear expectations
```typescript
import { describe, it, expect } from "vitest";
import { formatDate, formatCurrency } from "../../src/shared/formatters";

describe("formatDate", () => {
  it("should format a date as readable string", () => {
    const date = new Date("2026-01-15T12:00:00Z");
    expect(formatDate(date)).toBe("Jan 15, 2026");
  });

  it("should handle start of year", () => {
    expect(formatDate(new Date("2026-01-01"))).toContain("Jan");
  });

  it("should handle end of year", () => {
    expect(formatDate(new Date("2026-12-31"))).toContain("Dec");
  });
});

describe("formatCurrency", () => {
  it("should format cents as dollars", () => {
    expect(formatCurrency(1500)).toBe("$15.00");
  });

  it("should handle zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
```

### DON'T: Test trivial getters or pass-through functions
```typescript
// WRONG — no logic, no branching, nothing can break
it("should return the user name", () => {
  const user = { name: "Alice" };
  expect(user.name).toBe("Alice");
});
```

---

## Testing Config Helpers

### DO: Test environment detection functions
```typescript
import { describe, it, expect } from "vitest";
import { isProdEnv, isDevEnv } from "../../src/core/config";

describe("isProdEnv", () => {
  it("should return false in test environment", () => {
    expect(isProdEnv()).toBe(false);
  });
});

describe("isDevEnv", () => {
  it("should return false in test environment", () => {
    expect(isDevEnv()).toBe(false);
  });
});
```

### DO: Test config parsing with edge cases
```typescript
describe("parsePort", () => {
  it("should parse valid port string", () => {
    expect(parsePort("3000")).toBe(3000);
  });

  it("should return default for invalid input", () => {
    expect(parsePort("not-a-number")).toBe(3000);
  });

  it("should return default for undefined", () => {
    expect(parsePort(undefined)).toBe(3000);
  });
});
```

---

## Testing Password Utilities

### DO: Test hashing and comparison as a pair
```typescript
import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../../src/auth/auth.password";

describe("password utilities", () => {
  it("should hash and verify a password", async () => {
    const hash = await hashPassword("mypassword123");
    expect(hash).not.toBe("mypassword123"); // not stored in plain text
    expect(await comparePassword("mypassword123", hash)).toBe(true);
  });

  it("should reject wrong password", async () => {
    const hash = await hashPassword("correct");
    expect(await comparePassword("wrong", hash)).toBe(false);
  });

  it("should produce different hashes for same input (salted)", async () => {
    const hash1 = await hashPassword("same");
    const hash2 = await hashPassword("same");
    expect(hash1).not.toBe(hash2);
  });
});
```

---

## Testing Schema Validation

JSON Schemas with `as const` drive Fastify request validation. Test that they accept valid input and reject invalid input.

### DO: Test schema validation outcomes
```typescript
import { describe, it, expect } from "vitest";
import Ajv from "ajv";
import { createUserSchema } from "../../src/auth/auth.schema";

const ajv = new Ajv();

describe("createUserSchema", () => {
  const validate = ajv.compile(createUserSchema.body);

  it("should accept valid input", () => {
    const valid = validate({
      email: "user@example.com",
      name: "Alice",
      password: "password123",
      passwordConfirm: "password123",
    });
    expect(valid).toBe(true);
  });

  it("should reject missing email", () => {
    const valid = validate({
      name: "Alice",
      password: "password123",
      passwordConfirm: "password123",
    });
    expect(valid).toBe(false);
    expect(validate.errors?.[0].params.missingProperty).toBe("email");
  });

  it("should reject empty body", () => {
    expect(validate({})).toBe(false);
  });
});
```

### DON'T: Test JSON Schema syntax — trust the library
```typescript
// WRONG — testing that AJV works, not your schema
it("should be a valid JSON Schema", () => {
  expect(schema.body.type).toBe("object");
  expect(schema.body.properties.email.type).toBe("string");
});
```

---

## Testing Type Guards

### DO: Test both positive and negative cases
```typescript
import { describe, it, expect } from "vitest";

// Type guard
function isAdmin(user: { role: string }): user is { role: "ADMIN" } {
  return user.role === "ADMIN";
}

describe("isAdmin", () => {
  it("should return true for admin users", () => {
    expect(isAdmin({ role: "ADMIN" })).toBe(true);
  });

  it("should return false for regular users", () => {
    expect(isAdmin({ role: "USER" })).toBe(false);
  });

  it("should return false for empty role", () => {
    expect(isAdmin({ role: "" })).toBe(false);
  });
});
```

---

## Testing Data Transformations

### DO: Test mapping functions that transform DB records for views
```typescript
describe("mapUserToViewProps", () => {
  it("should transform user record to view props", () => {
    const dbUser = {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      createdAt: new Date("2026-01-01"),
      password: "hashed",
    };

    const props = mapUserToViewProps(dbUser);

    expect(props).toEqual({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      joinedAt: "Jan 1, 2026",
    });
    // password should not leak into view props
    expect(props).not.toHaveProperty("password");
  });
});
```

### DO: Test edge cases for transformations
```typescript
describe("buildBreadcrumbs", () => {
  it("should return home for root path", () => {
    expect(buildBreadcrumbs("/")).toEqual([{ label: "Home", href: "/" }]);
  });

  it("should build nested path breadcrumbs", () => {
    expect(buildBreadcrumbs("/users/settings")).toEqual([
      { label: "Home", href: "/" },
      { label: "Users", href: "/users" },
      { label: "Settings", href: "/users/settings" },
    ]);
  });
});
```

---

## Testing Discriminated Unions

### DO: Test each branch of discriminated union logic
```typescript
type Status = "active" | "pending" | "suspended";

function getStatusLabel(status: Status): string {
  switch (status) {
    case "active":    return "Active";
    case "pending":   return "Pending";
    case "suspended": return "Suspended";
  }
}

describe("getStatusLabel", () => {
  it("should return label for each status", () => {
    expect(getStatusLabel("active")).toBe("Active");
    expect(getStatusLabel("pending")).toBe("Pending");
    expect(getStatusLabel("suspended")).toBe("Suspended");
  });
});
```

---

## Patterns to Follow

### DO: Group related tests with describe blocks
```typescript
describe("auth utilities", () => {
  describe("hashPassword", () => {
    it("should produce a hash", () => { ... });
    it("should salt the hash", () => { ... });
  });

  describe("comparePassword", () => {
    it("should match correct password", () => { ... });
    it("should reject wrong password", () => { ... });
  });
});
```

### DO: Use test.each for parameterized tests
```typescript
import { it, expect } from "vitest";

it.each([
  [100,   "$1.00"],
  [1500,  "$15.00"],
  [0,     "$0.00"],
  [9999,  "$99.99"],
])("formatCurrency(%i) → %s", (cents, expected) => {
  expect(formatCurrency(cents)).toBe(expected);
});
```

### DON'T: Share mutable state between tests
```typescript
// WRONG — test order matters, flaky
let counter = 0;
it("first", () => { counter++; expect(counter).toBe(1); });
it("second", () => { expect(counter).toBe(1); }); // depends on "first"

// CORRECT — each test is independent
it("first", () => { let counter = 0; counter++; expect(counter).toBe(1); });
it("second", () => { let counter = 0; expect(counter).toBe(0); });
```

### DON'T: Use snapshots for unit tests — explicit assertions are clearer
```typescript
// WRONG — snapshot hides what you're actually verifying
it("should format date", () => {
  expect(formatDate(new Date("2026-01-15"))).toMatchSnapshot();
});

// CORRECT — explicitly state the expected output
it("should format date", () => {
  expect(formatDate(new Date("2026-01-15"))).toBe("Jan 15, 2026");
});
```

For the snapshot rule (when they're OK in view tests), see [CLAUDE.md](CLAUDE.md#key-rules).
