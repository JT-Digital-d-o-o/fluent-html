// ------------------------------------
// Tests for Type-Safe IDs
// ------------------------------------

import { render, Div, Button, Span } from "../src/index.js";
import { hx } from "../src/htmx.js";
import { OOB, withOOB } from "../src/patterns.js";
import { Id, createId, defineIds, isId, extractId, extractSelector } from "../src/ids.js";

// ------------------------------------
// Test Runner
// ------------------------------------

let passCount = 0;
let failCount = 0;

function test(name: string, got: any, expected: any) {
  const gotStr = JSON.stringify(got);
  const expectedStr = JSON.stringify(expected);
  if (gotStr === expectedStr) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
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
// createId() Tests
// ------------------------------------

section("createId()");

test("createId returns correct id",
  createId("user-list").id,
  "user-list");

test("createId returns correct selector",
  createId("user-list").selector,
  "#user-list");

test("createId toString returns selector",
  createId("user-list").toString(),
  "#user-list");

// ------------------------------------
// defineIds() Tests
// ------------------------------------

section("defineIds()");

const ids = defineIds([
  "user-list",
  "user-count",
  "notification-area",
  "modal",
] as const);

test("defineIds creates camelCase keys from kebab-case",
  ids.userList.id,
  "user-list");

test("defineIds preserves simple names",
  ids.modal.id,
  "modal");

test("defineIds converts multi-part kebab-case",
  ids.notificationArea.id,
  "notification-area");

test("defineIds selector is correct",
  ids.userCount.selector,
  "#user-count");

// ------------------------------------
// isId() Tests
// ------------------------------------

section("isId()");

test("isId returns true for Id objects",
  isId(createId("test")),
  true);

test("isId returns false for strings",
  isId("test"),
  false);

test("isId returns false for null",
  isId(null),
  false);

test("isId returns false for objects without id property",
  isId({ selector: "#test" }),
  false);

// ------------------------------------
// extractId() Tests
// ------------------------------------

section("extractId()");

test("extractId from Id object",
  extractId(createId("test")),
  "test");

test("extractId from string",
  extractId("test"),
  "test");

// ------------------------------------
// extractSelector() Tests
// ------------------------------------

section("extractSelector()");

test("extractSelector from Id object",
  extractSelector(createId("test")),
  "#test");

test("extractSelector from string without #",
  extractSelector("test"),
  "#test");

test("extractSelector from string with #",
  extractSelector("#test"),
  "#test");

test("extractSelector from class selector",
  extractSelector(".test"),
  ".test");

// ------------------------------------
// Integration: setId() with Id
// ------------------------------------

section("setId() with Id objects");

test("setId accepts Id object",
  render(Div().setId(ids.userList)),
  '<div id="user-list"></div>');

test("setId still accepts string",
  render(Div().setId("plain-id")),
  '<div id="plain-id"></div>');

// ------------------------------------
// Integration: hx() with Id target
// ------------------------------------

section("hx() with Id target");

test("hx target accepts Id object",
  render(Button("Load").setHtmx(hx("/api/users", { target: ids.userList }))),
  '<button hx-get="/api/users" hx-target="#user-list">Load</button>');

test("hx target accepts Id.selector",
  render(Button("Load").setHtmx(hx("/api/users", { target: ids.userList.selector }))),
  '<button hx-get="/api/users" hx-target="#user-list">Load</button>');

test("hx target still accepts string",
  render(Button("Load").setHtmx(hx("/api/users", { target: "#other" }))),
  '<button hx-get="/api/users" hx-target="#other">Load</button>');

// ------------------------------------
// Integration: OOB() with Id
// ------------------------------------

section("OOB() with Id objects");

test("OOB accepts Id object",
  render(OOB(ids.userCount, Span("42"))),
  '<span id="user-count" hx-swap-oob="true">42</span>');

test("OOB still accepts string",
  render(OOB("user-count", Span("42"))),
  '<span id="user-count" hx-swap-oob="true">42</span>');

test("OOB with Id and swap strategy",
  render(OOB(ids.notificationArea, Div("New!"), "beforeend")),
  '<div id="notification-area" hx-swap-oob="beforeend:#notification-area">New!</div>');

// ------------------------------------
// Full Integration: Page + Controller
// ------------------------------------

section("Full Integration: Type-safe page and controller");

// Simulate a page layout
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
    // Button that references the same ID
    Button("Refresh").setHtmx(hx("/api/refresh", {
      target: PageIds.mainContent,
      swap: "innerHTML"
    })),
  ]);
}

function ControllerResponse() {
  // Controller returns content + OOB updates using same typed IDs
  return withOOB(
    Div("Updated content"),
    OOB(PageIds.notificationCount, Span("5"))
  );
}

test("Page layout uses typed IDs",
  render(PageLayout()).includes('id="main-content"'),
  true);

test("Page layout button targets typed ID",
  render(PageLayout()).includes('hx-target="#main-content"'),
  true);

test("Controller OOB uses same typed ID",
  render(ControllerResponse()).includes('id="notification-count"'),
  true);

// ------------------------------------
// Summary
// ------------------------------------

console.log(`\n${"=".repeat(50)}`);
console.log(`Test Results: ${passCount} passed, ${failCount} failed`);
console.log("=".repeat(50));

if (failCount > 0) {
  process.exit(1);
}
