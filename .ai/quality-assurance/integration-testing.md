# Integration Testing

Fastify route testing via `server.inject()`, auth flows, Prisma database assertions, HTMX response validation, and external service mocking.

---

## server.inject() Basics

Fastify's `server.inject()` sends a synthetic HTTP request without starting a real server. It's the primary tool for integration tests.

### DO: Use server.inject for route testing
```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { server } from "../../src/core/server";

describe("GET /users", () => {
  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  it("should return the users page", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/users",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.body).toContain("Users");
  });
});
```

### DO: Always call server.ready() in beforeAll and server.close() in afterAll
```typescript
beforeAll(async () => {
  await server.ready(); // ensures all plugins are loaded
});

afterAll(async () => {
  await server.close(); // releases DB connections, timers, etc.
});
```

### DON'T: Start a real HTTP server in tests
```typescript
// WRONG — slow, port conflicts, flaky
beforeAll(async () => {
  await server.listen({ port: 3001 });
});

// CORRECT — server.inject is in-process, no ports needed
const response = await server.inject({ method: "GET", url: "/users" });
```

---

## Auth Flow Testing

### DO: Test the full auth lifecycle
```typescript
import { server } from "../../src/core/server";
import { prisma } from "../setup";

const TEST_USER = {
  email: "auth-test@example.com",
  name: "Auth Test User",
  password: "testpassword123",
};

describe("Auth Routes", () => {
  beforeAll(async () => {
    await server.ready();
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
    await server.close();
  });

  describe("POST /auth/register", () => {
    it("should register a new user and redirect", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: TEST_USER.email,
          name: TEST_USER.name,
          password: TEST_USER.password,
          passwordConfirm: TEST_USER.password,
        },
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/");
      expect(response.headers["set-cookie"]).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: TEST_USER.email },
      });
      expect(user).not.toBeNull();
      expect(user!.name).toBe(TEST_USER.name);
      expect(user!.role).toBe("USER");
    });

    it("should reject duplicate email registration", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: TEST_USER.email,
          name: TEST_USER.name,
          password: TEST_USER.password,
          passwordConfirm: TEST_USER.password,
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("already exists");
    });

    it("should reject mismatched passwords", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/register",
        payload: {
          email: "new@example.com",
          name: "New User",
          password: "password123",
          passwordConfirm: "password456",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("Passwords do not match");
    });
  });

  describe("POST /auth/signin", () => {
    it("should sign in with valid credentials and redirect", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/signin",
        payload: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      const response = await server.inject({
        method: "POST",
        url: "/auth/signin",
        payload: {
          email: TEST_USER.email,
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("Invalid email or password");
    });
  });

  describe("GET /auth/logout", () => {
    it("should clear cookie and redirect to login", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/auth/logout",
      });

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/auth/login");
    });
  });
});
```

---

## Testing Protected Routes

### DO: Obtain auth cookie and pass it to subsequent requests
```typescript
describe("Protected Routes", () => {
  let authCookie: string;

  beforeAll(async () => {
    await server.ready();

    // Create user and sign in to get cookie
    await prisma.user.deleteMany({ where: { email: "protected-test@example.com" } });
    const hashedPassword = await hashPassword("testpassword123");
    await prisma.user.create({
      data: { email: "protected-test@example.com", name: "Test", password: hashedPassword },
    });

    const loginResponse = await server.inject({
      method: "POST",
      url: "/auth/signin",
      payload: { email: "protected-test@example.com", password: "testpassword123" },
    });
    const setCookie = loginResponse.headers["set-cookie"];
    authCookie = Array.isArray(setCookie) ? setCookie[0] : setCookie || "";
  });

  it("should reject unauthenticated access", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/dashboard",
    });

    // Expect redirect to login or 401
    expect([302, 401]).toContain(response.statusCode);
  });

  it("should allow authenticated access", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/dashboard",
      headers: { cookie: authCookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toContain("Dashboard");
  });
});
```

### DON'T: Bypass auth guards in tests — test them as users experience them
```typescript
// WRONG — skipping auth to test the page
server.inject({ method: "GET", url: "/dashboard", headers: { "x-test-bypass": "true" } });

// CORRECT — use a real auth cookie obtained via login
server.inject({ method: "GET", url: "/dashboard", headers: { cookie: authCookie } });
```

---

## Testing Form Submissions

### DO: Test both valid and invalid form submissions
```typescript
describe("POST /users/create", () => {
  it("should create user and redirect on valid input", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/users/create",
      headers: { cookie: authCookie },
      payload: {
        name: "New User",
        email: "newuser@example.com",
      },
    });

    expect(response.statusCode).toBe(302);

    const user = await prisma.user.findUnique({
      where: { email: "newuser@example.com" },
    });
    expect(user).not.toBeNull();
  });

  it("should re-render form with errors on invalid input", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/users/create",
      headers: { cookie: authCookie },
      payload: {
        name: "",       // required field missing
        email: "bad",   // invalid email
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    // Form should show inline errors
    expect(response.body).toContain("error"); // error class or message present
  });
});
```

---

## Testing HTMX Responses

### DO: Check response headers for HTMX directives
```typescript
describe("HTMX responses", () => {
  it("should include HX-Trigger header for toast notification", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/users/create",
      headers: {
        cookie: authCookie,
        "hx-request": "true", // simulate HTMX request
      },
      payload: { name: "New User", email: "new@example.com" },
    });

    // hxResponse().trigger("showToast") sets this header
    const trigger = response.headers["hx-trigger"];
    expect(trigger).toBeDefined();
    expect(trigger).toContain("showToast");
  });

  it("should include HX-Redirect header for navigation", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/users/create",
      headers: {
        cookie: authCookie,
        "hx-request": "true",
      },
      payload: { name: "New User", email: "new@example.com" },
    });

    expect(response.headers["hx-redirect"]).toBe("/users");
  });
});
```

### DO: Verify OOB swap targets exist in the response
```typescript
it("should include OOB swap elements", async () => {
  const response = await server.inject({
    method: "GET",
    url: "/users",
    headers: { cookie: authCookie, "hx-request": "true" },
  });

  expect(response.statusCode).toBe(200);
  // OOB swaps include hx-swap-oob attribute
  expect(response.body).toContain('hx-swap-oob');
  // Check that specific OOB targets are present
  expect(response.body).toContain('id="user-count"');
});
```

### DON'T: Test HTMX client-side behavior in server tests
```typescript
// WRONG — server tests can't verify DOM swapping
it("should swap the user list in the DOM", async () => {
  // This belongs in a browser/E2E test, not server.inject
});

// CORRECT — verify the server sends the right HTML and headers
it("should return HTML with correct swap target id", async () => {
  const response = await server.inject({ method: "GET", url: "/users" });
  expect(response.body).toContain('id="user-list"');
});
```

---

## Testing File Uploads

### DO: Mock the storage plugin, test the route behavior
```typescript
import { vi } from "vitest";

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

describe("File uploads", () => {
  it("should reject upload without auth", async () => {
    const form = buildMultipartPayload("test.txt", "text/plain", "hello");

    const response = await server.inject({
      method: "POST",
      url: "/files/upload",
      headers: form.headers,
      payload: form.body,
    });

    expect(response.statusCode).toBe(401);
  });

  it("should upload when authenticated", async () => {
    const form = buildMultipartPayload("test.txt", "text/plain", "hello world");

    const response = await server.inject({
      method: "POST",
      url: "/files/upload",
      headers: { ...form.headers, cookie: authCookie },
      payload: form.body,
    });

    expect(response.statusCode).toBe(200);
  });
});
```

### DO: Use the multipart payload helper
```typescript
function buildMultipartPayload(filename: string, contentType: string, content: string) {
  const boundary = "----TestBoundary" + Date.now();
  const body =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    `Content-Type: ${contentType}\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--\r\n`;

  return {
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
    body,
  };
}
```

---

## Database Assertions

### DO: Verify side effects in the database
```typescript
it("should create the user in the database", async () => {
  await server.inject({
    method: "POST",
    url: "/auth/register",
    payload: { email: "verify@test.com", name: "Test", password: "pass123", passwordConfirm: "pass123" },
  });

  const user = await prisma.user.findUnique({ where: { email: "verify@test.com" } });
  expect(user).not.toBeNull();
  expect(user!.name).toBe("Test");
  expect(user!.role).toBe("USER");
});

it("should delete the file from the database", async () => {
  await server.inject({ method: "DELETE", url: `/files/${fileId}` });

  const file = await prisma.file.findUnique({ where: { id: fileId } });
  expect(file).toBeNull();
});
```

### DO: Clean up test data to avoid collisions
```typescript
beforeAll(async () => {
  // Delete in dependency order: files before users (foreign keys)
  await prisma.file.deleteMany({ where: { user: { email: TEST_USER.email } } });
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
});

afterAll(async () => {
  await prisma.file.deleteMany({ where: { user: { email: TEST_USER.email } } });
  await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
});
```

### DON'T: Use deleteMany({}) without a where clause — that wipes all records
```typescript
// WRONG — deletes ALL users, including seed data
await prisma.user.deleteMany({});

// CORRECT — scope cleanup to test-specific records
await prisma.user.deleteMany({ where: { email: TEST_USER.email } });
```

---

## Testing Error Paths

### DO: Test validation errors, not-found, and unauthorized responses
```typescript
describe("error handling", () => {
  it("should return error for non-existent resource", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/files/999999/download",
    });
    expect(response.statusCode).toBe(404);
  });

  it("should show form error for invalid input", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: { email: "not-an-email", name: "", password: "x", passwordConfirm: "y" },
    });

    expect(response.statusCode).toBe(200); // re-renders form
    expect(response.body).toContain("error"); // error feedback present
  });

  it("should handle missing required fields gracefully", async () => {
    const response = await server.inject({
      method: "POST",
      url: "/auth/register",
      payload: {}, // empty body
    });

    // Should not crash — either 400 (schema validation) or 200 (form re-render)
    expect([200, 400]).toContain(response.statusCode);
  });
});
```

---

## Testing Payment Webhooks

### DO: Mock the payment provider SDK and test webhook handling
```typescript
describe("Stripe webhook", () => {
  it("should handle checkout.session.completed event", async () => {
    const event = {
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          customer_email: TEST_USER.email,
          amount_total: 1999,
          currency: "usd",
        },
      },
    };

    const response = await server.inject({
      method: "POST",
      url: "/payments/webhook/stripe",
      headers: {
        "stripe-signature": "test_signature", // mocked verification
        "content-type": "application/json",
      },
      payload: JSON.stringify(event),
    });

    expect(response.statusCode).toBe(200);

    // Verify payment was recorded
    const payment = await prisma.payment.findFirst({
      where: { stripeSessionId: "cs_test_123" },
    });
    expect(payment).not.toBeNull();
  });
});
```

---

## Common Patterns

### DO: Use a helper to extract auth cookie
```typescript
async function getAuthCookie(email: string, password: string): Promise<string> {
  const response = await server.inject({
    method: "POST",
    url: "/auth/signin",
    payload: { email, password },
  });
  const setCookie = response.headers["set-cookie"];
  return Array.isArray(setCookie) ? setCookie[0] : setCookie || "";
}
```

### DO: Test redirects by checking status and location header
```typescript
// Redirect assertions
expect(response.statusCode).toBe(302);
expect(response.headers.location).toBe("/dashboard");

// NOT a redirect — page re-rendered with errors
expect(response.statusCode).toBe(200);
expect(response.body).toContain("Error message");
```

### DON'T: Follow redirects in tests — assert on the redirect itself
```typescript
// WRONG — following the redirect tests the target route, not the current one
// server.inject doesn't follow redirects by default (this is correct behavior)

// CORRECT — assert the redirect was issued
expect(response.statusCode).toBe(302);
expect(response.headers.location).toBe("/users");
```
