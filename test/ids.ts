import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Div, Button, Span } from "../src/index.js";
import { hx } from "../src/htmx.js";
import { OOB, withOOB } from "../src/patterns.js";
import { Id, createId, defineIds, isId, extractId, extractSelector } from "../src/ids.js";

describe("createId()", () => {
  it("returns correct id", () => {
    assert.strictEqual(createId("user-list").id, "user-list");
  });

  it("returns correct selector", () => {
    assert.strictEqual(createId("user-list").selector, "#user-list");
  });

  it("toString returns selector", () => {
    assert.strictEqual(createId("user-list").toString(), "#user-list");
  });
});

describe("defineIds()", () => {
  const ids = defineIds([
    "user-list",
    "user-count",
    "notification-area",
    "modal",
  ] as const);

  it("creates camelCase keys from kebab-case", () => {
    assert.strictEqual(ids.userList.id, "user-list");
  });

  it("preserves simple names", () => {
    assert.strictEqual(ids.modal.id, "modal");
  });

  it("converts multi-part kebab-case", () => {
    assert.strictEqual(ids.notificationArea.id, "notification-area");
  });

  it("selector is correct", () => {
    assert.strictEqual(ids.userCount.selector, "#user-count");
  });
});

describe("isId()", () => {
  it("returns true for Id objects", () => {
    assert.strictEqual(isId(createId("test")), true);
  });

  it("returns false for strings", () => {
    assert.strictEqual(isId("test"), false);
  });

  it("returns false for null", () => {
    assert.strictEqual(isId(null), false);
  });

  it("returns false for objects without id property", () => {
    assert.strictEqual(isId({ selector: "#test" }), false);
  });
});

describe("extractId()", () => {
  it("extracts from Id object", () => {
    assert.strictEqual(extractId(createId("test")), "test");
  });

  it("extracts from string", () => {
    assert.strictEqual(extractId("test"), "test");
  });
});

describe("extractSelector()", () => {
  it("extracts from Id object", () => {
    assert.strictEqual(extractSelector(createId("test")), "#test");
  });

  it("extracts from string without #", () => {
    assert.strictEqual(extractSelector("test"), "#test");
  });

  it("extracts from string with #", () => {
    assert.strictEqual(extractSelector("#test"), "#test");
  });

  it("extracts from class selector", () => {
    assert.strictEqual(extractSelector(".test"), ".test");
  });
});

describe("setId() with Id objects", () => {
  const ids = defineIds([
    "user-list",
    "user-count",
    "notification-area",
    "modal",
  ] as const);

  it("accepts Id object", () => {
    assert.strictEqual(render(Div().setId(ids.userList)), '<div id="user-list"></div>');
  });

  it("still accepts string", () => {
    assert.strictEqual(render(Div().setId("plain-id")), '<div id="plain-id"></div>');
  });
});

describe("hx() with Id target", () => {
  const ids = defineIds([
    "user-list",
    "user-count",
    "notification-area",
    "modal",
  ] as const);

  it("target accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { target: ids.userList }))),
      '<button hx-get="/api/users" hx-target="#user-list">Load</button>'
    );
  });

  it("target accepts Id.selector", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { target: ids.userList.selector }))),
      '<button hx-get="/api/users" hx-target="#user-list">Load</button>'
    );
  });

  it("target still accepts string", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { target: "#other" }))),
      '<button hx-get="/api/users" hx-target="#other">Load</button>'
    );
  });
});

describe("hx() with Id for select, indicator, disable, include", () => {
  const ids = defineIds([
    "user-list",
    "user-count",
    "notification-area",
    "modal",
  ] as const);

  it("select accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { select: ids.userList }))),
      '<button hx-get="/api/users" hx-select="#user-list">Load</button>'
    );
  });

  it("select still accepts string", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { select: "#other" }))),
      '<button hx-get="/api/users" hx-select="#other">Load</button>'
    );
  });

  it("indicator accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { indicator: ids.userList }))),
      '<button hx-get="/api/users" hx-indicator="#user-list">Load</button>'
    );
  });

  it("disable accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { disable: ids.userCount }))),
      '<button hx-get="/api/users" hx-disable="#user-count">Load</button>'
    );
  });

  it("include accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", { include: ids.notificationArea }))),
      '<button hx-get="/api/users" hx-include="#notification-area">Load</button>'
    );
  });

  it("multiple Id fields together", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx("/api/users", {
        target: ids.userList,
        select: ids.userCount,
        indicator: ids.notificationArea,
      }))),
      '<button hx-get="/api/users" hx-target="#user-list" hx-select="#user-count" hx-indicator="#notification-area">Load</button>'
    );
  });
});

describe("hxGet/hxPost shorthands with Id fields", () => {
  const ids = defineIds([
    "user-list",
    "user-count",
    "notification-area",
    "modal",
  ] as const);

  it("hxGet with Id select", () => {
    assert.strictEqual(
      render(Button("Load").hxGet("/api", { select: ids.userList })),
      '<button hx-get="/api" hx-select="#user-list">Load</button>'
    );
  });

  it("hxPost with Id indicator", () => {
    assert.strictEqual(
      render(Button("Save").hxPost("/api", { indicator: ids.notificationArea })),
      '<button hx-post="/api" hx-indicator="#notification-area">Save</button>'
    );
  });

  it("hxGet with Id include", () => {
    assert.strictEqual(
      render(Button("Load").hxGet("/api", { include: ids.userCount })),
      '<button hx-get="/api" hx-include="#user-count">Load</button>'
    );
  });
});

describe("OOB() with Id objects", () => {
  const ids = defineIds([
    "user-list",
    "user-count",
    "notification-area",
    "modal",
  ] as const);

  it("accepts Id object", () => {
    assert.strictEqual(
      render(OOB(ids.userCount, Span("42"))),
      '<span id="user-count" hx-swap-oob="true">42</span>'
    );
  });

  it("still accepts string", () => {
    assert.strictEqual(
      render(OOB("user-count", Span("42"))),
      '<span id="user-count" hx-swap-oob="true">42</span>'
    );
  });

  it("with Id and swap strategy", () => {
    assert.strictEqual(
      render(OOB(ids.notificationArea, Div("New!"), "beforeend")),
      '<div id="notification-area" hx-swap-oob="beforeend:#notification-area">New!</div>'
    );
  });
});

describe("Full Integration: Type-safe page and controller", () => {
  const PageIds = defineIds([
    "main-content",
    "sidebar",
    "notification-count",
  ] as const);

  function PageLayout() {
    return Div([
      Div("Main content").setId(PageIds.mainContent),
      Div("Sidebar").setId(PageIds.sidebar),
      Span("0").setId(PageIds.notificationCount),
      Button("Refresh").setHtmx(hx("/api/refresh", {
        target: PageIds.mainContent,
        swap: "innerHTML"
      })),
    ]);
  }

  function ControllerResponse() {
    return withOOB(
      Div("Updated content"),
      OOB(PageIds.notificationCount, Span("5"))
    );
  }

  it("Page layout uses typed IDs", () => {
    assert.strictEqual(render(PageLayout()).includes('id="main-content"'), true);
  });

  it("Page layout button targets typed ID", () => {
    assert.strictEqual(render(PageLayout()).includes('hx-target="#main-content"'), true);
  });

  it("Controller OOB uses same typed ID", () => {
    assert.strictEqual(render(ControllerResponse()).includes('id="notification-count"'), true);
  });
});
