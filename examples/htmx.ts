/**
 * HTMX integration example — Routes, IDs, interactive form
 *
 * Run: npx tsx examples/htmx.ts
 */
import {
  Div, Form, Input, Button, Span, Label, Fieldset, Legend,
  defineRoutes, defineIds, Partial,
  render,
} from '../src/index.js';

// 1. Type-safe routes — shared prefix, typos are compile errors
const userRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  delete: { method: "delete", path: "/:id" },
} as const);

// 2. Type-safe IDs — compile-time validated HTMX targets
const ids = defineIds(["user-list", "user-count", "create-form"] as const);

// 3. Interactive form with HTMX
const createUserForm = Form(
  Fieldset(
    Legend("Add User"),

    Label("Name").setFor("name"),
    Input()
      .setType("text")
      .setId("name")
      .setName("name")
      .setPlaceholder("Jane Doe")
      .toggle("required"),

    Label("Email").setFor("email"),
    Input()
      .setType("email")
      .setId("email")
      .setName("email")
      .setPlaceholder("jane@example.com")
      .setAutocomplete("email")
      .toggle("required"),

    Button("Create User").setType("submit"),
  ),
)
  .setId(ids.createForm)
  .setHtmx(userRoutes.create({ target: ids.userList, swap: "outerMorph" }));

// 4. Page layout with HTMX targets
const page = Div(
  Div().setId(ids.userList),
  Span("0 users").setId(ids.userCount),
  createUserForm,

  // Load users on page load
  Button("Refresh")
    .setHtmx(userRoutes.list({ target: ids.userList })),
);

console.log(render(page));

// 5. Multi-swap response (what a controller would return)
const multiSwapResponse = render(
  Partial(ids.userList, Div("Updated user list...")),
  Partial(ids.userCount, Span("3 users")),
);

console.log("\n--- Multi-swap response ---");
console.log(multiSwapResponse);

// 6. Route utilities for controllers
console.log("\n--- Route info ---");
console.log("List path:", userRoutes.list.path);       // "/users"
console.log("Delete path:", userRoutes.delete.path);    // "/users/:id"
console.log("Resolved:", userRoutes.delete.resolve({ id: "42" })); // "/users/42"
