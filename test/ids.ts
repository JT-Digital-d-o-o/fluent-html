import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Div, Button, Span, Partial } from "../src/index.js";
import { hx } from "../src/htmx.js";
import { createId, defineIds, isId, extractId, extractSelector } from "../src/ids.js";
import { assetUrl } from "../src/htmx.js";

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

  // Regression (ids-camel-2): runtime camelization must mirror the type-level KebabToCamel
  // for digits and uppercase after a hyphen (the old /-([a-z])/ regex left these undefined).
  it("camelizes hyphen-before-digit and hyphen-before-uppercase to match the types", () => {
    const r = defineIds(["col-2", "user-List", "step-3-panel", "tab-1"] as const);
    assert.strictEqual(r.col2.id, "col-2");
    assert.strictEqual(r.userList.id, "user-List");
    assert.strictEqual(r.step3Panel.id, "step-3-panel");
    assert.strictEqual(r.tab1.id, "tab-1");
  });

  // Regression (ids-uniqueness-6): two names collapsing to one key must throw, not silently
  // last-write-win (which would retarget every existing reference).
  it("throws when two names map to the same camelCase key", () => {
    assert.throws(() => defineIds(["user-list", "userList"]), /duplicate key/);
    assert.throws(() => defineIds(["a", "a"]), /duplicate key/);
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

  // Regression (type-honesty-7): a structural {id, selector} object (e.g. a DB row) must NOT
  // launder itself into a branded Id — only createId/defineIds produce real Ids.
  it("returns false for a structural look-alike (no runtime brand)", () => {
    assert.strictEqual(isId({ id: "test", selector: "#test" }), false);
    assert.strictEqual(isId({ id: "x", selector: "#x", toString() { return "#x"; } }), false);
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
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { target: ids.userList }))),
      '<button hx-get="/api/users" hx-target="#user-list">Load</button>'
    );
  });

  it("target accepts Id.selector", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { target: ids.userList.selector }))),
      '<button hx-get="/api/users" hx-target="#user-list">Load</button>'
    );
  });

  it("target still accepts string", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { target: "#other" }))),
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
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { select: ids.userList }))),
      '<button hx-get="/api/users" hx-select="#user-list">Load</button>'
    );
  });

  it("select still accepts string", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { select: "#other" }))),
      '<button hx-get="/api/users" hx-select="#other">Load</button>'
    );
  });

  it("indicator accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { indicator: ids.userList }))),
      '<button hx-get="/api/users" hx-indicator="#user-list">Load</button>'
    );
  });

  it("disable accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { disable: ids.userCount }))),
      '<button hx-get="/api/users" hx-disable="#user-count">Load</button>'
    );
  });

  it("include accepts Id object", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), { include: ids.notificationArea }))),
      '<button hx-get="/api/users" hx-include="#notification-area">Load</button>'
    );
  });

  it("multiple Id fields together", () => {
    assert.strictEqual(
      render(Button("Load").setHtmx(hx(assetUrl("/api/users"), {
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
      render(Button("Load").hxGet(assetUrl("/api"), { select: ids.userList })),
      '<button hx-get="/api" hx-select="#user-list">Load</button>'
    );
  });

  it("hxPost with Id indicator", () => {
    assert.strictEqual(
      render(Button("Save").hxPost(assetUrl("/api"), { indicator: ids.notificationArea })),
      '<button hx-post="/api" hx-indicator="#notification-area">Save</button>'
    );
  });

  it("hxGet with Id include", () => {
    assert.strictEqual(
      render(Button("Load").hxGet(assetUrl("/api"), { include: ids.userCount })),
      '<button hx-get="/api" hx-include="#user-count">Load</button>'
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
      Button("Refresh").setHtmx(hx(assetUrl("/api/refresh"), {
        target: PageIds.mainContent,
        swap: "innerHTML"
      })),
    ]);
  }

  function ControllerResponse() {
    return [
      Div("Updated content"),
      Partial(PageIds.notificationCount, Span("5")),
    ];
  }

  it("Page layout uses typed IDs", () => {
    assert.strictEqual(render(PageLayout()).includes('id="main-content"'), true);
  });

  it("Page layout button targets typed ID", () => {
    assert.strictEqual(render(PageLayout()).includes('hx-target="#main-content"'), true);
  });

  it("Controller Partial targets the same typed ID", () => {
    assert.strictEqual(render(ControllerResponse()).includes('hx-target="#notification-count"'), true);
  });
});
