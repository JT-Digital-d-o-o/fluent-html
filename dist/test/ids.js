"use strict";
// ------------------------------------
// Tests for Type-Safe IDs
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = require("../src/builder");
const htmx_1 = require("../src/htmx");
const patterns_1 = require("../src/patterns");
const ids_1 = require("../src/ids");
// ------------------------------------
// Test Runner
// ------------------------------------
let passCount = 0;
let failCount = 0;
function test(name, got, expected) {
    const gotStr = JSON.stringify(got);
    const expectedStr = JSON.stringify(expected);
    if (gotStr === expectedStr) {
        console.log(`✅ ${name}`);
        passCount++;
    }
    else {
        console.log(`❌ ${name}`);
        console.log(`   Expected: ${expectedStr}`);
        console.log(`   Got:      ${gotStr}`);
        failCount++;
    }
}
function section(name) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`${name}`);
    console.log("=".repeat(50));
}
// ------------------------------------
// createId() Tests
// ------------------------------------
section("createId()");
test("createId returns correct id", (0, ids_1.createId)("user-list").id, "user-list");
test("createId returns correct selector", (0, ids_1.createId)("user-list").selector, "#user-list");
test("createId toString returns selector", (0, ids_1.createId)("user-list").toString(), "#user-list");
// ------------------------------------
// defineIds() Tests
// ------------------------------------
section("defineIds()");
const ids = (0, ids_1.defineIds)([
    "user-list",
    "user-count",
    "notification-area",
    "modal",
]);
test("defineIds creates camelCase keys from kebab-case", ids.userList.id, "user-list");
test("defineIds preserves simple names", ids.modal.id, "modal");
test("defineIds converts multi-part kebab-case", ids.notificationArea.id, "notification-area");
test("defineIds selector is correct", ids.userCount.selector, "#user-count");
// ------------------------------------
// isId() Tests
// ------------------------------------
section("isId()");
test("isId returns true for Id objects", (0, ids_1.isId)((0, ids_1.createId)("test")), true);
test("isId returns false for strings", (0, ids_1.isId)("test"), false);
test("isId returns false for null", (0, ids_1.isId)(null), false);
test("isId returns false for objects without id property", (0, ids_1.isId)({ selector: "#test" }), false);
// ------------------------------------
// extractId() Tests
// ------------------------------------
section("extractId()");
test("extractId from Id object", (0, ids_1.extractId)((0, ids_1.createId)("test")), "test");
test("extractId from string", (0, ids_1.extractId)("test"), "test");
// ------------------------------------
// extractSelector() Tests
// ------------------------------------
section("extractSelector()");
test("extractSelector from Id object", (0, ids_1.extractSelector)((0, ids_1.createId)("test")), "#test");
test("extractSelector from string without #", (0, ids_1.extractSelector)("test"), "#test");
test("extractSelector from string with #", (0, ids_1.extractSelector)("#test"), "#test");
test("extractSelector from class selector", (0, ids_1.extractSelector)(".test"), ".test");
// ------------------------------------
// Integration: setId() with Id
// ------------------------------------
section("setId() with Id objects");
test("setId accepts Id object", (0, builder_1.render)((0, builder_1.Div)().setId(ids.userList)), '<div id="user-list"></div>');
test("setId still accepts string", (0, builder_1.render)((0, builder_1.Div)().setId("plain-id")), '<div id="plain-id"></div>');
// ------------------------------------
// Integration: hx() with Id target
// ------------------------------------
section("hx() with Id target");
test("hx target accepts Id object", (0, builder_1.render)((0, builder_1.Button)("Load").setHtmx((0, htmx_1.hx)("/api/users", { target: ids.userList }))), '<button hx-get="/api/users" hx-target="#user-list">Load</button>');
test("hx target accepts Id.selector", (0, builder_1.render)((0, builder_1.Button)("Load").setHtmx((0, htmx_1.hx)("/api/users", { target: ids.userList.selector }))), '<button hx-get="/api/users" hx-target="#user-list">Load</button>');
test("hx target still accepts string", (0, builder_1.render)((0, builder_1.Button)("Load").setHtmx((0, htmx_1.hx)("/api/users", { target: "#other" }))), '<button hx-get="/api/users" hx-target="#other">Load</button>');
// ------------------------------------
// Integration: OOB() with Id
// ------------------------------------
section("OOB() with Id objects");
test("OOB accepts Id object", (0, builder_1.render)((0, patterns_1.OOB)(ids.userCount, (0, builder_1.Span)("42"))), '<span id="user-count" hx-swap-oob="true">42</span>');
test("OOB still accepts string", (0, builder_1.render)((0, patterns_1.OOB)("user-count", (0, builder_1.Span)("42"))), '<span id="user-count" hx-swap-oob="true">42</span>');
test("OOB with Id and swap strategy", (0, builder_1.render)((0, patterns_1.OOB)(ids.notificationArea, (0, builder_1.Div)("New!"), "beforeend")), '<div id="notification-area" hx-swap-oob="beforeend:#notification-area">New!</div>');
// ------------------------------------
// Full Integration: Page + Controller
// ------------------------------------
section("Full Integration: Type-safe page and controller");
// Simulate a page layout
const PageIds = (0, ids_1.defineIds)([
    "main-content",
    "sidebar",
    "notification-count",
]);
function PageLayout() {
    return (0, builder_1.Div)([
        (0, builder_1.Div)("Main content").setId(PageIds.mainContent),
        (0, builder_1.Div)("Sidebar").setId(PageIds.sidebar),
        (0, builder_1.Span)("0").setId(PageIds.notificationCount),
        // Button that references the same ID
        (0, builder_1.Button)("Refresh").setHtmx((0, htmx_1.hx)("/api/refresh", {
            target: PageIds.mainContent,
            swap: "innerHTML"
        })),
    ]);
}
function ControllerResponse() {
    // Controller returns content + OOB updates using same typed IDs
    return (0, patterns_1.withOOB)((0, builder_1.Div)("Updated content"), (0, patterns_1.OOB)(PageIds.notificationCount, (0, builder_1.Span)("5")));
}
test("Page layout uses typed IDs", (0, builder_1.render)(PageLayout()).includes('id="main-content"'), true);
test("Page layout button targets typed ID", (0, builder_1.render)(PageLayout()).includes('hx-target="#main-content"'), true);
test("Controller OOB uses same typed ID", (0, builder_1.render)(ControllerResponse()).includes('id="notification-count"'), true);
// ------------------------------------
// Summary
// ------------------------------------
console.log(`\n${"=".repeat(50)}`);
console.log(`Test Results: ${passCount} passed, ${failCount} failed`);
console.log("=".repeat(50));
if (failCount > 0) {
    process.exit(1);
}
//# sourceMappingURL=ids.js.map