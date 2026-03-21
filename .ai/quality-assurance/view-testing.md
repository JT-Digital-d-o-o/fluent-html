# View Testing

Testing fluent-html views via `render()`, verifying component output, control flow branches (IfThen, ForEach, Match), OOB swap structure, and HTMX attributes.

---

## Rendering Views for Testing

fluent-html views are functions that return element trees. Use `render()` to get the HTML string and assert on its contents.

### DO: Render components and check output
```typescript
import { describe, it, expect } from "vitest";
import { render } from "fluent-html";
import { UserCard } from "../../src/shared/components/user-card";

describe("UserCard", () => {
  it("should render user name and email", () => {
    const html = render(UserCard({ name: "Alice", email: "alice@example.com" }));

    expect(html).toContain("Alice");
    expect(html).toContain("alice@example.com");
  });

  it("should include the user avatar when provided", () => {
    const html = render(UserCard({
      name: "Alice",
      email: "alice@example.com",
      avatar: "/img/alice.jpg",
    }));

    expect(html).toContain("/img/alice.jpg");
    expect(html).toContain("alt=");
  });

  it("should not render avatar when null", () => {
    const html = render(UserCard({
      name: "Alice",
      email: "alice@example.com",
      avatar: null,
    }));

    expect(html).not.toContain("<img");
  });
});
```

### DON'T: Assert on exact HTML output — it's brittle and hard to maintain
```typescript
// WRONG — breaks when you change a class, add whitespace, or reorder attributes
expect(html).toBe('<div class="p-4 bg-white rounded-lg"><h2>Alice</h2><p>alice@example.com</p></div>');

// CORRECT — check for meaningful content
expect(html).toContain("Alice");
expect(html).toContain("alice@example.com");
```

---

## Testing Control Flow

### DO: Test IfThen branches — truthy and falsy paths
```typescript
// Component uses IfThen for conditional rendering:
// IfThen(user.avatar, (avatar) => Img().setSrc(avatar))

describe("UserProfile", () => {
  it("should render avatar when present", () => {
    const html = render(UserProfile({ ...baseUser, avatar: "/photo.jpg" }));
    expect(html).toContain("<img");
    expect(html).toContain("/photo.jpg");
  });

  it("should omit avatar when null", () => {
    const html = render(UserProfile({ ...baseUser, avatar: null }));
    expect(html).not.toContain("<img");
  });
});
```

### DO: Test IfThenElse — both branches
```typescript
// IfThenElse(user.name, (name) => Span(name), () => Span("Anonymous"))

describe("UserLabel", () => {
  it("should show user name when available", () => {
    const html = render(UserLabel({ name: "Alice" }));
    expect(html).toContain("Alice");
    expect(html).not.toContain("Anonymous");
  });

  it("should show Anonymous when name is null", () => {
    const html = render(UserLabel({ name: null }));
    expect(html).toContain("Anonymous");
  });
});
```

### DO: Test ForEach — empty list and populated list
```typescript
// ForEach(users, (user) => Li(user.name))

describe("UserList", () => {
  it("should render each user", () => {
    const html = render(UserList({
      users: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ],
    }));

    expect(html).toContain("Alice");
    expect(html).toContain("Bob");
  });

  it("should render empty state for no users", () => {
    const html = render(UserList({ users: [] }));
    expect(html).not.toContain("<li");
    // Check for empty state message if the component renders one
    expect(html).toContain("No users");
  });
});
```

### DO: Test Match — all branches including default
```typescript
// Match(status, {
//   active: () => Span("Active").textColor("green-600"),
//   error:  () => Span("Error").textColor("red-600"),
// }, () => Span("Unknown"))

describe("StatusBadge", () => {
  it("should render active status", () => {
    const html = render(StatusBadge({ status: "active" }));
    expect(html).toContain("Active");
    expect(html).toContain("green");
  });

  it("should render error status", () => {
    const html = render(StatusBadge({ status: "error" }));
    expect(html).toContain("Error");
    expect(html).toContain("red");
  });

  it("should render default for unknown status", () => {
    const html = render(StatusBadge({ status: "other" as any }));
    expect(html).toContain("Unknown");
  });
});
```

---

## Testing Discriminated Union Views

### DO: Test each variant of a view with discriminated union props
```typescript
type UsersViewProps =
  | { state: "list"; users: User[] }
  | { state: "form"; error?: string }
  | { state: "detail"; user: User };

describe("UsersView", () => {
  it("should render list state", () => {
    const html = render(UsersView({
      state: "list",
      users: [{ id: 1, name: "Alice", email: "a@test.com" }],
    }));
    expect(html).toContain("Alice");
  });

  it("should render form state", () => {
    const html = render(UsersView({ state: "form" }));
    expect(html).toContain("<form");
  });

  it("should render form state with error", () => {
    const html = render(UsersView({ state: "form", error: "Email required" }));
    expect(html).toContain("Email required");
  });

  it("should render detail state", () => {
    const html = render(UsersView({
      state: "detail",
      user: { id: 1, name: "Alice", email: "a@test.com" },
    }));
    expect(html).toContain("Alice");
    expect(html).toContain("a@test.com");
  });
});
```

---

## Testing Form Components

### DO: Verify form fields, action, and method
```typescript
describe("CreateUserForm", () => {
  it("should render all required fields", () => {
    const html = render(CreateUserForm());

    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('type="submit"');
  });

  it("should render inline errors when provided", () => {
    const html = render(CreateUserForm({
      errors: { email: "Email already in use" },
    }));

    expect(html).toContain("Email already in use");
  });

  it("should not render error markup when no errors", () => {
    const html = render(CreateUserForm());
    expect(html).not.toContain("already in use");
  });
});
```

### DO: Verify HTMX attributes on forms
```typescript
it("should have correct HTMX attributes", () => {
  const html = render(CreateUserForm());

  expect(html).toContain('hx-post="/users/create"');
  expect(html).toContain('hx-target');
  expect(html).toContain('hx-swap');
});
```

---

## Testing OOB Swap Structure

### DO: Verify OOB elements have correct IDs and hx-swap-oob attribute
```typescript
import { render, withOOB, OOB, Span, Div } from "fluent-html";
import { ids } from "../../src/shared/ids";

describe("OOB responses", () => {
  it("should include OOB swap elements with correct IDs", () => {
    const html = render(withOOB(
      Div("Main content").setId(ids.mainContent),
      OOB(ids.userCount, Span("42")),
      OOB(ids.pageTitle, Span("Users")),
    ));

    // Main content
    expect(html).toContain('id="main-content"');
    expect(html).toContain("Main content");

    // OOB swaps
    expect(html).toContain('hx-swap-oob');
    expect(html).toContain('id="user-count"');
    expect(html).toContain("42");
    expect(html).toContain('id="page-title"');
    expect(html).toContain("Users");
  });
});
```

---

## Testing HTMX Target IDs

### DO: Verify defineIds targets are used correctly
```typescript
import { defineIds } from "fluent-html";

const ids = defineIds(["user-list", "user-count"] as const);

describe("HTMX target IDs", () => {
  it("should use type-safe IDs in rendered output", () => {
    const html = render(UserListPage({ users: [] }));

    // Verify the target element exists with the correct ID
    expect(html).toContain(`id="${ids.userList.slice(1)}"`); // ids.userList = "#user-list"

    // Verify hx-target references the same ID
    expect(html).toContain(`hx-target="${ids.userList}"`);
  });
});
```

---

## Testing Layout Components

### DO: Test that layouts wrap content correctly
```typescript
describe("PageLayout", () => {
  it("should include navigation and footer", () => {
    const html = render(PageLayout({ title: "Test" }, Div("Content")));

    expect(html).toContain("<nav");
    expect(html).toContain("<footer");
    expect(html).toContain("Content");
  });

  it("should set the page title", () => {
    const html = render(PageLayout({ title: "Settings" }, Div("Body")));
    expect(html).toContain("<title>Settings</title>");
  });

  it("should include HTMX and Tailwind CSS links", () => {
    const html = render(PageLayout({ title: "Test" }, Div("Body")));
    expect(html).toContain("htmx");
    expect(html).toContain(".css");
  });
});
```

---

## Testing Reusable Components

### DO: Test shared UI components in isolation
```typescript
describe("FormField", () => {
  it("should render label and input", () => {
    const html = render(FormField({ id: "email", label: "Email" }));

    expect(html).toContain('for="email"');
    expect(html).toContain('id="email"');
    expect(html).toContain('name="email"');
    expect(html).toContain("Email");
  });

  it("should set input type", () => {
    const html = render(FormField({ id: "pass", label: "Password", type: "password" }));
    expect(html).toContain('type="password"');
  });

  it("should render error message when provided", () => {
    const html = render(FormField({ id: "email", label: "Email", error: "Required" }));
    expect(html).toContain("Required");
  });

  it("should not render error markup when no error", () => {
    const html = render(FormField({ id: "email", label: "Email" }));
    expect(html).not.toContain("Required");
  });
});
```

---

## When to Use Snapshots

### DO: Use snapshots sparingly — only for complex static components
```typescript
// Snapshots can be useful for detecting accidental changes to static layouts
describe("Footer", () => {
  it("should match snapshot", () => {
    const html = render(Footer());
    expect(html).toMatchSnapshot();
  });
});
```

### DON'T: Use snapshots for components with dynamic data
```typescript
// WRONG — snapshot includes timestamps, IDs, etc. that change every run
it("should match snapshot", () => {
  const html = render(UserCard({ ...user, createdAt: new Date() }));
  expect(html).toMatchSnapshot(); // fails on every run
});

// CORRECT — use explicit assertions for dynamic content
it("should render user info", () => {
  const html = render(UserCard(user));
  expect(html).toContain(user.name);
  expect(html).toContain(user.email);
});
```

---

## Web Template: Page Rendering Tests

### DO: Smoke-test all registered pages render without errors
```typescript
import { getRoutes, renderPage } from "../src/pages/index.js";

describe("page rendering", () => {
  it("should have registered routes", () => {
    const routes = getRoutes();
    expect(routes.length).toBeGreaterThan(0);
    expect(routes).toContain("/");
  });

  it("should render all registered pages without errors", () => {
    for (const route of getRoutes()) {
      const view = renderPage(route);
      expect(view).not.toBeNull();
    }
  });
});
```

This pattern catches import errors, missing components, and render-time crashes across all pages in one test.

---

## File Placement

```
tests/
  unit/
    components/
      form-field.test.ts     ← shared component tests
      user-card.test.ts
    views/
      users.view.test.ts     ← feature view tests
      auth.view.test.ts
  integration/
    auth.test.ts             ← full route tests (include view output checks)
```

Keep view tests in `tests/unit/` — they run `render()` in-memory with no server or database.
