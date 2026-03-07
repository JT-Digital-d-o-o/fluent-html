// ------------------------------------
// Tests for Type-Safe Routes
// ------------------------------------

import { render, Button, Form } from "../src/index.js";
import { defineRoutes } from "../src/routes.js";
import { defineIds } from "../src/ids.js";

// ------------------------------------
// Test Runner
// ------------------------------------

let passCount = 0;
let failCount = 0;

function test(name: string, got: any, expected: any) {
  const gotStr = JSON.stringify(got);
  const expectedStr = JSON.stringify(expected);
  if (gotStr === expectedStr) {
    console.log(`\u2705 ${name}`);
    passCount++;
  } else {
    console.log(`\u274C ${name}`);
    console.log(`   Expected: ${expectedStr}`);
    console.log(`   Got:      ${gotStr}`);
    failCount++;
  }
}

function section(name: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`${name}`);
  console.log("=".repeat(50));
}

// ------------------------------------
// Route Definitions
// ------------------------------------

const routes = defineRoutes({
  list:   { method: "get",    path: "/users" },
  create: { method: "post",   path: "/users" },
  detail: { method: "get",    path: "/users/:id" },
  update: { method: "put",    path: "/users/:id" },
  delete: { method: "delete", path: "/users/:id" },
  nested: { method: "get",    path: "/users/:userId/posts/:postId" },
} as const);

// ------------------------------------
// Route Properties
// ------------------------------------

section("Route properties");

test("list.method is get",
  routes.list.method, "get");

test("list.path is /users",
  routes.list.path, "/users");

test("create.method is post",
  routes.create.method, "post");

test("delete.method is delete",
  routes.delete.method, "delete");

test("nested.path preserves template",
  routes.nested.path, "/users/:userId/posts/:postId");

// ------------------------------------
// Parameterless Routes
// ------------------------------------

section("Parameterless routes");

test("list() returns correct endpoint",
  routes.list().endpoint, "/users");

test("list() returns correct method",
  routes.list().method, "get");

test("create() returns correct method",
  routes.create().method, "post");

test("list() with target option",
  routes.list({ target: "#result" }).target, "#result");

test("list() with swap option",
  routes.list({ swap: "outerMorph" }).swap, "outerMorph");

test("list() with multiple options",
  (() => {
    const htmx = routes.list({ target: "#list", swap: "outerMorph", trigger: "load" });
    return [htmx.endpoint, htmx.method, htmx.target, htmx.swap, htmx.trigger];
  })(),
  ["/users", "get", "#list", "outerMorph", "load"]);

// ------------------------------------
// resolve()
// ------------------------------------

section("resolve()");

test("resolve() on parameterless route returns path",
  routes.list.resolve(), "/users");

test("resolve() on parameterized route substitutes params",
  routes.detail.resolve({ id: "42" }), "/users/42");

test("resolve() on multi-param route substitutes all params",
  routes.nested.resolve({ userId: "1", postId: "99" }), "/users/1/posts/99");

test("resolve() encodes special characters",
  routes.detail.resolve({ id: "hello world" }), "/users/hello%20world");

// ------------------------------------
// Parameterized Routes
// ------------------------------------

section("Parameterized routes");

test("detail() substitutes :id",
  routes.detail({ id: "42" }).endpoint, "/users/42");

test("detail() locks method to get",
  routes.detail({ id: "42" }).method, "get");

test("delete() locks method to delete",
  routes.delete({ id: "5" }).method, "delete");

test("update() locks method to put",
  routes.update({ id: "5" }).method, "put");

test("detail() with options",
  (() => {
    const htmx = routes.detail({ id: "7" }, { target: "#detail", swap: "outerMorph" });
    return [htmx.endpoint, htmx.method, htmx.target, htmx.swap];
  })(),
  ["/users/7", "get", "#detail", "outerMorph"]);

// ------------------------------------
// Multi-Param Routes
// ------------------------------------

section("Multi-param routes");

test("nested() substitutes both params",
  routes.nested({ userId: "1", postId: "99" }).endpoint, "/users/1/posts/99");

test("nested() method is get",
  routes.nested({ userId: "1", postId: "99" }).method, "get");

test("nested() with options",
  routes.nested({ userId: "1", postId: "99" }, { swap: "innerHTML" }).swap, "innerHTML");

// ------------------------------------
// URL Encoding
// ------------------------------------

section("URL encoding of param values");

test("encodes spaces",
  routes.detail({ id: "hello world" }).endpoint, "/users/hello%20world");

test("encodes slashes",
  routes.detail({ id: "a/b" }).endpoint, "/users/a%2Fb");

test("encodes special characters",
  routes.detail({ id: "foo&bar=baz" }).endpoint, "/users/foo%26bar%3Dbaz");

test("leaves normal IDs unchanged",
  routes.detail({ id: "550e8400-e29b-41d4-a716-446655440000" }).endpoint,
  "/users/550e8400-e29b-41d4-a716-446655440000");

// ------------------------------------
// Integration: setHtmx() + render()
// ------------------------------------

section("Integration with setHtmx() and render()");

test("renders hx-get for list route",
  render(Button("Load").setHtmx(routes.list())),
  '<button hx-get="/users">Load</button>');

test("renders hx-delete for delete route",
  render(Button("Remove").setHtmx(routes.delete({ id: "5" }))),
  '<button hx-delete="/users/5">Remove</button>');

test("renders with target and swap",
  render(Button("Load").setHtmx(routes.list({ target: "#list", swap: "outerMorph" }))),
  '<button hx-get="/users" hx-target="#list" hx-swap="outerMorph">Load</button>');

test("renders hx-post for create route",
  render(Form(Button("Save").setType("submit")).setHtmx(routes.create())),
  '<form hx-post="/users"><button type="submit">Save</button></form>');

test("renders parameterized with options",
  render(Button("Edit").setHtmx(routes.update({ id: "3" }, { swap: "outerMorph" }))),
  '<button hx-put="/users/3" hx-swap="outerMorph">Edit</button>');

// ------------------------------------
// Integration: defineIds() targets
// ------------------------------------

section("Integration with defineIds()");

const ids = defineIds(["user-list", "user-detail"] as const);

test("Id target resolves to selector",
  routes.list({ target: ids.userList }).target, "#user-list");

test("renders with Id target",
  render(Button("Load").setHtmx(routes.list({ target: ids.userList }))),
  '<button hx-get="/users" hx-target="#user-list">Load</button>');

test("parameterized route with Id target",
  render(Button("View").setHtmx(routes.detail({ id: "1" }, { target: ids.userDetail, swap: "outerMorph" }))),
  '<button hx-get="/users/1" hx-target="#user-detail" hx-swap="outerMorph">View</button>');

// ------------------------------------
// Prefixed Routes
// ------------------------------------

const prefixedRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  detail: { method: "get",    path: "/:id" },
  update: { method: "put",    path: "/:id" },
  nested: { method: "get",    path: "/:userId/posts/:postId" },
} as const);

section("Prefixed route properties");

test("prefixed list.path is /users",
  prefixedRoutes.list.path, "/users");

test("prefixed list.method is get",
  prefixedRoutes.list.method, "get");

test("prefixed detail.path is /users/:id",
  prefixedRoutes.detail.path, "/users/:id");

test("prefixed nested.path preserves template",
  prefixedRoutes.nested.path, "/users/:userId/posts/:postId");

section("Prefixed parameterless routes");

test("prefixed list() returns correct endpoint",
  prefixedRoutes.list().endpoint, "/users");

test("prefixed list() returns correct method",
  prefixedRoutes.list().method, "get");

test("prefixed create() returns correct method",
  prefixedRoutes.create().method, "post");

test("prefixed list() with target option",
  prefixedRoutes.list({ target: "#result" }).target, "#result");

test("prefixed list() with multiple options",
  (() => {
    const htmx = prefixedRoutes.list({ target: "#list", swap: "outerMorph" });
    return [htmx.endpoint, htmx.method, htmx.target, htmx.swap];
  })(),
  ["/users", "get", "#list", "outerMorph"]);

section("Prefixed parameterized routes");

test("prefixed detail() substitutes :id",
  prefixedRoutes.detail({ id: "42" }).endpoint, "/users/42");

test("prefixed update() locks method to put",
  prefixedRoutes.update({ id: "5" }).method, "put");

test("prefixed detail() with options",
  (() => {
    const htmx = prefixedRoutes.detail({ id: "7" }, { target: "#detail", swap: "outerMorph" });
    return [htmx.endpoint, htmx.method, htmx.target, htmx.swap];
  })(),
  ["/users/7", "get", "#detail", "outerMorph"]);

test("prefixed nested() substitutes both params",
  prefixedRoutes.nested({ userId: "1", postId: "99" }).endpoint, "/users/1/posts/99");

section("Prefixed resolve()");

test("prefixed resolve() on parameterless route",
  prefixedRoutes.list.resolve(), "/users");

test("prefixed resolve() on parameterized route",
  prefixedRoutes.detail.resolve({ id: "42" }), "/users/42");

test("prefixed resolve() on multi-param route",
  prefixedRoutes.nested.resolve({ userId: "1", postId: "99" }), "/users/1/posts/99");

section("Prefixed routes: render integration");

test("prefixed renders hx-get for list route",
  render(Button("Load").setHtmx(prefixedRoutes.list())),
  '<button hx-get="/users">Load</button>');

test("prefixed renders hx-delete with params",
  render(Button("Remove").setHtmx(prefixedRoutes.detail({ id: "5" }))),
  '<button hx-get="/users/5">Remove</button>');

test("prefixed renders with target and swap",
  render(Button("Load").setHtmx(prefixedRoutes.list({ target: "#list", swap: "outerMorph" }))),
  '<button hx-get="/users" hx-target="#list" hx-swap="outerMorph">Load</button>');

section("Prefixed routes with defineIds()");

test("prefixed route with Id target",
  render(Button("Load").setHtmx(prefixedRoutes.list({ target: ids.userList }))),
  '<button hx-get="/users" hx-target="#user-list">Load</button>');

test("prefixed param route with Id target",
  render(Button("View").setHtmx(prefixedRoutes.detail({ id: "1" }, { target: ids.userDetail, swap: "outerMorph" }))),
  '<button hx-get="/users/1" hx-target="#user-detail" hx-swap="outerMorph">View</button>');

// ------------------------------------
// Id resolution for select, indicator, disable, include
// ------------------------------------

const extraIds = defineIds(["content", "spinner", "form-fields", "submit-btn"] as const);

section("Id resolution: select");

test("select accepts Id object",
  routes.list({ select: extraIds.content }).select, "#content");

test("select still accepts plain string",
  routes.list({ select: "#other" }).select, "#other");

test("renders hx-select with Id",
  render(Button("Load").setHtmx(routes.list({ select: extraIds.content }))),
  '<button hx-get="/users" hx-select="#content">Load</button>');

section("Id resolution: indicator");

test("indicator accepts Id object",
  routes.list({ indicator: extraIds.spinner }).indicator, "#spinner");

test("indicator still accepts plain string",
  routes.list({ indicator: ".loading" }).indicator, ".loading");

test("renders hx-indicator with Id",
  render(Button("Load").setHtmx(routes.list({ indicator: extraIds.spinner }))),
  '<button hx-get="/users" hx-indicator="#spinner">Load</button>');

section("Id resolution: disable");

test("disable accepts Id object",
  routes.list({ disable: extraIds.submitBtn }).disable, "#submit-btn");

test("renders hx-disable with Id",
  render(Button("Load").setHtmx(routes.list({ disable: extraIds.submitBtn }))),
  '<button hx-get="/users" hx-disable="#submit-btn">Load</button>');

section("Id resolution: include");

test("include accepts Id object",
  routes.list({ include: extraIds.formFields }).include, "#form-fields");

test("renders hx-include with Id",
  render(Button("Load").setHtmx(routes.list({ include: extraIds.formFields }))),
  '<button hx-get="/users" hx-include="#form-fields">Load</button>');

section("Id resolution: multiple Id fields together");

test("multiple Id fields resolve correctly",
  (() => {
    const htmx = routes.list({
      target: ids.userList,
      select: extraIds.content,
      indicator: extraIds.spinner,
      include: extraIds.formFields,
    });
    return [htmx.target, htmx.select, htmx.indicator, htmx.include];
  })(),
  ["#user-list", "#content", "#spinner", "#form-fields"]);

test("renders all Id fields together",
  render(Button("Load").setHtmx(routes.list({
    target: ids.userList,
    select: extraIds.content,
    indicator: extraIds.spinner,
  }))),
  '<button hx-get="/users" hx-target="#user-list" hx-select="#content" hx-indicator="#spinner">Load</button>');

section("Id resolution: parameterized routes");

test("parameterized route with Id select",
  routes.detail({ id: "42" }, { select: extraIds.content }).select, "#content");

test("parameterized route renders with Id indicator",
  render(Button("View").setHtmx(routes.detail({ id: "1" }, { indicator: extraIds.spinner }))),
  '<button hx-get="/users/1" hx-indicator="#spinner">View</button>');

section("Prefixed registry immutability");

test("prefixed registry is frozen",
  Object.isFrozen(prefixedRoutes), true);

// ------------------------------------
// Registry Immutability
// ------------------------------------

section("Registry immutability");

test("registry is frozen",
  Object.isFrozen(routes), true);

// ------------------------------------
// Type-Level Compile Checks (documented)
// ------------------------------------
// These would cause TypeScript errors if uncommented:
//
// routes.lsit()                                  // Property 'lsit' does not exist
// routes.detail()                                // Expected 1-2 arguments, got 0
// routes.detail({ userId: "1" })                 // Property 'id' is missing
// routes.nested({ userId: "1" })                 // Property 'postId' is missing
// routes.list({ id: "1" })                       // Argument not assignable (no params expected)

// ------------------------------------
// Summary
// ------------------------------------

console.log(`\n${"=".repeat(50)}`);
console.log(`Test Results: ${passCount} passed, ${failCount} failed`);
console.log("=".repeat(50));

if (failCount > 0) {
  process.exit(1);
}
