import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Button, Form } from "../src/index.js";
import { defineRoutes } from "../src/routes.js";
import { defineIds } from "../src/ids.js";

const routes = defineRoutes({
  list:   { method: "get",    path: "/users" },
  create: { method: "post",   path: "/users" },
  detail: { method: "get",    path: "/users/:id" },
  update: { method: "put",    path: "/users/:id" },
  delete: { method: "delete", path: "/users/:id" },
  nested: { method: "get",    path: "/users/:userId/posts/:postId" },
} as const);

describe("Route properties", () => {
  it("list.method is get", () => {
    assert.deepStrictEqual(routes.list.method, "get");
  });
  it("list.path is /users", () => {
    assert.deepStrictEqual(routes.list.path, "/users");
  });
  it("create.method is post", () => {
    assert.deepStrictEqual(routes.create.method, "post");
  });
  it("delete.method is delete", () => {
    assert.deepStrictEqual(routes.delete.method, "delete");
  });
  it("nested.path preserves template", () => {
    assert.deepStrictEqual(routes.nested.path, "/users/:userId/posts/:postId");
  });
});

describe("Parameterless routes", () => {
  it("list() returns correct endpoint", () => {
    assert.deepStrictEqual(routes.list().endpoint, "/users");
  });
  it("list() returns correct method", () => {
    assert.deepStrictEqual(routes.list().method, "get");
  });
  it("create() returns correct method", () => {
    assert.deepStrictEqual(routes.create().method, "post");
  });
  it("list() with target option", () => {
    assert.deepStrictEqual(routes.list({ target: "#result" }).target, "#result");
  });
  it("list() with swap option", () => {
    assert.deepStrictEqual(routes.list({ swap: "outerMorph" }).swap, "outerMorph");
  });
  it("list() with multiple options", () => {
    const htmx = routes.list({ target: "#list", swap: "outerMorph", trigger: "load" });
    assert.deepStrictEqual(
      [htmx.endpoint, htmx.method, htmx.target, htmx.swap, htmx.trigger],
      ["/users", "get", "#list", "outerMorph", "load"]
    );
  });
});

describe("resolve()", () => {
  it("on parameterless route returns path", () => {
    assert.deepStrictEqual(routes.list.resolve(), "/users");
  });
  it("on parameterized route substitutes params", () => {
    assert.deepStrictEqual(routes.detail.resolve({ id: "42" }), "/users/42");
  });
  it("on multi-param route substitutes all params", () => {
    assert.deepStrictEqual(routes.nested.resolve({ userId: "1", postId: "99" }), "/users/1/posts/99");
  });
  it("encodes special characters", () => {
    assert.deepStrictEqual(routes.detail.resolve({ id: "hello world" }), "/users/hello%20world");
  });
});

describe("Parameterized routes", () => {
  it("detail() substitutes :id", () => {
    assert.deepStrictEqual(routes.detail({ id: "42" }).endpoint, "/users/42");
  });
  it("detail() locks method to get", () => {
    assert.deepStrictEqual(routes.detail({ id: "42" }).method, "get");
  });
  it("delete() locks method to delete", () => {
    assert.deepStrictEqual(routes.delete({ id: "5" }).method, "delete");
  });
  it("update() locks method to put", () => {
    assert.deepStrictEqual(routes.update({ id: "5" }).method, "put");
  });
  it("detail() with options", () => {
    const htmx = routes.detail({ id: "7" }, { target: "#detail", swap: "outerMorph" });
    assert.deepStrictEqual(
      [htmx.endpoint, htmx.method, htmx.target, htmx.swap],
      ["/users/7", "get", "#detail", "outerMorph"]
    );
  });
});

describe("Multi-param routes", () => {
  it("nested() substitutes both params", () => {
    assert.deepStrictEqual(routes.nested({ userId: "1", postId: "99" }).endpoint, "/users/1/posts/99");
  });
  it("nested() method is get", () => {
    assert.deepStrictEqual(routes.nested({ userId: "1", postId: "99" }).method, "get");
  });
  it("nested() with options", () => {
    assert.deepStrictEqual(routes.nested({ userId: "1", postId: "99" }, { swap: "innerHTML" }).swap, "innerHTML");
  });
});

describe("URL encoding of param values", () => {
  it("encodes spaces", () => {
    assert.deepStrictEqual(routes.detail({ id: "hello world" }).endpoint, "/users/hello%20world");
  });
  it("encodes slashes", () => {
    assert.deepStrictEqual(routes.detail({ id: "a/b" }).endpoint, "/users/a%2Fb");
  });
  it("encodes special characters", () => {
    assert.deepStrictEqual(routes.detail({ id: "foo&bar=baz" }).endpoint, "/users/foo%26bar%3Dbaz");
  });
  it("leaves normal IDs unchanged", () => {
    assert.deepStrictEqual(
      routes.detail({ id: "550e8400-e29b-41d4-a716-446655440000" }).endpoint,
      "/users/550e8400-e29b-41d4-a716-446655440000"
    );
  });
});

describe("Integration with setHtmx() and render()", () => {
  it("renders hx-get for list route", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list())),
      '<button hx-get="/users">Load</button>'
    );
  });
  it("renders hx-delete for delete route", () => {
    assert.strictEqual(
      render(Button("Remove").setHtmx(routes.delete({ id: "5" }))),
      '<button hx-delete="/users/5">Remove</button>'
    );
  });
  it("renders with target and swap", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list({ target: "#list", swap: "outerMorph" }))),
      '<button hx-get="/users" hx-target="#list" hx-swap="outerMorph">Load</button>'
    );
  });
  it("renders hx-post for create route", () => {
    assert.strictEqual(
      render(Form(Button("Save").setType("submit")).setHtmx(routes.create())),
      '<form hx-post="/users"><button type="submit">Save</button></form>'
    );
  });
  it("renders parameterized with options", () => {
    assert.strictEqual(
      render(Button("Edit").setHtmx(routes.update({ id: "3" }, { swap: "outerMorph" }))),
      '<button hx-put="/users/3" hx-swap="outerMorph">Edit</button>'
    );
  });
});

describe("Integration with defineIds()", () => {
  const ids = defineIds(["user-list", "user-detail"] as const);

  it("Id target resolves to selector", () => {
    assert.deepStrictEqual(routes.list({ target: ids.userList }).target, "#user-list");
  });
  it("renders with Id target", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list({ target: ids.userList }))),
      '<button hx-get="/users" hx-target="#user-list">Load</button>'
    );
  });
  it("parameterized route with Id target", () => {
    assert.strictEqual(
      render(Button("View").setHtmx(routes.detail({ id: "1" }, { target: ids.userDetail, swap: "outerMorph" }))),
      '<button hx-get="/users/1" hx-target="#user-detail" hx-swap="outerMorph">View</button>'
    );
  });
});

const prefixedRoutes = defineRoutes("/users", {
  list:   { method: "get",    path: "/" },
  create: { method: "post",   path: "/" },
  detail: { method: "get",    path: "/:id" },
  update: { method: "put",    path: "/:id" },
  nested: { method: "get",    path: "/:userId/posts/:postId" },
} as const);

describe("Prefixed route properties", () => {
  it("prefixed list.path is /users", () => {
    assert.deepStrictEqual(prefixedRoutes.list.path, "/users");
  });
  it("prefixed list.method is get", () => {
    assert.deepStrictEqual(prefixedRoutes.list.method, "get");
  });
  it("prefixed detail.path is /users/:id", () => {
    assert.deepStrictEqual(prefixedRoutes.detail.path, "/users/:id");
  });
  it("prefixed nested.path preserves template", () => {
    assert.deepStrictEqual(prefixedRoutes.nested.path, "/users/:userId/posts/:postId");
  });
});

describe("Prefixed parameterless routes", () => {
  it("returns correct endpoint", () => {
    assert.deepStrictEqual(prefixedRoutes.list().endpoint, "/users");
  });
  it("returns correct method", () => {
    assert.deepStrictEqual(prefixedRoutes.list().method, "get");
  });
  it("create() returns correct method", () => {
    assert.deepStrictEqual(prefixedRoutes.create().method, "post");
  });
  it("with target option", () => {
    assert.deepStrictEqual(prefixedRoutes.list({ target: "#result" }).target, "#result");
  });
  it("with multiple options", () => {
    const htmx = prefixedRoutes.list({ target: "#list", swap: "outerMorph" });
    assert.deepStrictEqual(
      [htmx.endpoint, htmx.method, htmx.target, htmx.swap],
      ["/users", "get", "#list", "outerMorph"]
    );
  });
});

describe("Prefixed parameterized routes", () => {
  it("detail() substitutes :id", () => {
    assert.deepStrictEqual(prefixedRoutes.detail({ id: "42" }).endpoint, "/users/42");
  });
  it("update() locks method to put", () => {
    assert.deepStrictEqual(prefixedRoutes.update({ id: "5" }).method, "put");
  });
  it("detail() with options", () => {
    const htmx = prefixedRoutes.detail({ id: "7" }, { target: "#detail", swap: "outerMorph" });
    assert.deepStrictEqual(
      [htmx.endpoint, htmx.method, htmx.target, htmx.swap],
      ["/users/7", "get", "#detail", "outerMorph"]
    );
  });
  it("nested() substitutes both params", () => {
    assert.deepStrictEqual(prefixedRoutes.nested({ userId: "1", postId: "99" }).endpoint, "/users/1/posts/99");
  });
});

describe("Prefixed resolve()", () => {
  it("on parameterless route", () => {
    assert.deepStrictEqual(prefixedRoutes.list.resolve(), "/users");
  });
  it("on parameterized route", () => {
    assert.deepStrictEqual(prefixedRoutes.detail.resolve({ id: "42" }), "/users/42");
  });
  it("on multi-param route", () => {
    assert.deepStrictEqual(prefixedRoutes.nested.resolve({ userId: "1", postId: "99" }), "/users/1/posts/99");
  });
});

describe("Prefixed routes: render integration", () => {
  const ids = defineIds(["user-list", "user-detail"] as const);

  it("renders hx-get for list route", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(prefixedRoutes.list())),
      '<button hx-get="/users">Load</button>'
    );
  });
  it("renders hx-delete with params", () => {
    assert.strictEqual(
      render(Button("Remove").setHtmx(prefixedRoutes.detail({ id: "5" }))),
      '<button hx-get="/users/5">Remove</button>'
    );
  });
  it("renders with target and swap", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(prefixedRoutes.list({ target: "#list", swap: "outerMorph" }))),
      '<button hx-get="/users" hx-target="#list" hx-swap="outerMorph">Load</button>'
    );
  });
  it("route with Id target", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(prefixedRoutes.list({ target: ids.userList }))),
      '<button hx-get="/users" hx-target="#user-list">Load</button>'
    );
  });
  it("param route with Id target", () => {
    assert.strictEqual(
      render(Button("View").setHtmx(prefixedRoutes.detail({ id: "1" }, { target: ids.userDetail, swap: "outerMorph" }))),
      '<button hx-get="/users/1" hx-target="#user-detail" hx-swap="outerMorph">View</button>'
    );
  });
});

describe("Id resolution: select", () => {
  const extraIds = defineIds(["content", "spinner", "form-fields", "submit-btn"] as const);

  it("select accepts Id object", () => {
    assert.deepStrictEqual(routes.list({ select: extraIds.content }).select, "#content");
  });
  it("select still accepts plain string", () => {
    assert.deepStrictEqual(routes.list({ select: "#other" }).select, "#other");
  });
  it("renders hx-select with Id", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list({ select: extraIds.content }))),
      '<button hx-get="/users" hx-select="#content">Load</button>'
    );
  });
});

describe("Id resolution: indicator", () => {
  const extraIds = defineIds(["content", "spinner", "form-fields", "submit-btn"] as const);

  it("indicator accepts Id object", () => {
    assert.deepStrictEqual(routes.list({ indicator: extraIds.spinner }).indicator, "#spinner");
  });
  it("indicator still accepts plain string", () => {
    assert.deepStrictEqual(routes.list({ indicator: ".loading" }).indicator, ".loading");
  });
  it("renders hx-indicator with Id", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list({ indicator: extraIds.spinner }))),
      '<button hx-get="/users" hx-indicator="#spinner">Load</button>'
    );
  });
});

describe("Id resolution: disable", () => {
  const extraIds = defineIds(["content", "spinner", "form-fields", "submit-btn"] as const);

  it("disable accepts Id object", () => {
    assert.deepStrictEqual(routes.list({ disable: extraIds.submitBtn }).disable, "#submit-btn");
  });
  it("renders hx-disable with Id", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list({ disable: extraIds.submitBtn }))),
      '<button hx-get="/users" hx-disable="#submit-btn">Load</button>'
    );
  });
});

describe("Id resolution: include", () => {
  const extraIds = defineIds(["content", "spinner", "form-fields", "submit-btn"] as const);

  it("include accepts Id object", () => {
    assert.deepStrictEqual(routes.list({ include: extraIds.formFields }).include, "#form-fields");
  });
  it("renders hx-include with Id", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list({ include: extraIds.formFields }))),
      '<button hx-get="/users" hx-include="#form-fields">Load</button>'
    );
  });
});

describe("Id resolution: multiple Id fields together", () => {
  const ids = defineIds(["user-list", "user-detail"] as const);
  const extraIds = defineIds(["content", "spinner", "form-fields", "submit-btn"] as const);

  it("multiple Id fields resolve correctly", () => {
    const htmx = routes.list({
      target: ids.userList,
      select: extraIds.content,
      indicator: extraIds.spinner,
      include: extraIds.formFields,
    });
    assert.deepStrictEqual(
      [htmx.target, htmx.select, htmx.indicator, htmx.include],
      ["#user-list", "#content", "#spinner", "#form-fields"]
    );
  });
  it("renders all Id fields together", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(routes.list({
        target: ids.userList,
        select: extraIds.content,
        indicator: extraIds.spinner,
      }))),
      '<button hx-get="/users" hx-target="#user-list" hx-select="#content" hx-indicator="#spinner">Load</button>'
    );
  });
});

describe("Id resolution: parameterized routes", () => {
  const extraIds = defineIds(["content", "spinner", "form-fields", "submit-btn"] as const);

  it("parameterized route with Id select", () => {
    assert.deepStrictEqual(routes.detail({ id: "42" }, { select: extraIds.content }).select, "#content");
  });
  it("parameterized route renders with Id indicator", () => {
    assert.strictEqual(
      render(Button("View").setHtmx(routes.detail({ id: "1" }, { indicator: extraIds.spinner }))),
      '<button hx-get="/users/1" hx-indicator="#spinner">View</button>'
    );
  });
});

describe("Registry immutability", () => {
  it("registry is frozen", () => {
    assert.strictEqual(Object.isFrozen(routes), true);
  });
  it("prefixed registry is frozen", () => {
    assert.strictEqual(Object.isFrozen(prefixedRoutes), true);
  });
});
