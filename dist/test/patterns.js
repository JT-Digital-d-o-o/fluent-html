"use strict";
// ------------------------------------
// Tests for Common Patterns
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const builder_js_1 = require("../src/builder.js");
const patterns_js_1 = require("../src/patterns.js");
const builder_js_2 = require("../src/builder.js");
const reactive_js_1 = require("../src/reactive.js");
console.log("Running pattern tests...\n");
// ------------------------------------
// Utility Method Tests
// ------------------------------------
console.log("=== Utility Method Tests ===");
// Test setClasses
const classTest = (0, builder_js_2.Div)("Test")
    .setClasses(["btn", false, "active", null, undefined, "primary"]);
const classHtml = (0, builder_js_1.render)(classTest);
console.assert(classHtml.includes('class="btn active primary"'), "setClasses should filter falsy values");
console.log("✓ setClasses filters falsy values correctly");
// Test setStyles
const styleTest = (0, builder_js_2.Div)("Test").setStyles({
    width: "100px",
    height: "50px",
    backgroundColor: "blue",
    fontSize: "16px",
});
const styleHtml = (0, builder_js_1.render)(styleTest);
console.assert(styleHtml.includes("width: 100px"), "setStyles should include width");
console.assert(styleHtml.includes("background-color: blue"), "setStyles should convert camelCase to kebab-case");
console.log("✓ setStyles works with camelCase conversion");
// Test setDataAttrs
const dataTest = (0, builder_js_2.Button)("Click").setDataAttrs({
    testid: "submit-btn",
    userId: "123",
    actionType: "save",
});
const dataHtml = (0, builder_js_1.render)(dataTest);
console.assert(dataHtml.includes('data-testid="submit-btn"'), "setDataAttrs should set data-testid");
console.assert(dataHtml.includes('data-user-id="123"'), "setDataAttrs should convert camelCase to kebab-case");
console.assert(dataHtml.includes('data-action-type="save"'), "setDataAttrs should handle multiple words");
console.log("✓ setDataAttrs works with kebab-case conversion");
// Test setAria
const ariaTest = (0, builder_js_2.Button)("Menu").setAria({
    label: "Open menu",
    expanded: false,
    controls: "menu-panel",
    hasPopup: true,
});
const ariaHtml = (0, builder_js_1.render)(ariaTest);
console.assert(ariaHtml.includes('aria-label="Open menu"'), "setAria should set aria-label");
console.assert(ariaHtml.includes('aria-expanded="false"'), "setAria should convert boolean to string");
console.assert(ariaHtml.includes('aria-has-popup="true"'), "setAria should convert camelCase to kebab-case");
console.log("✓ setAria works correctly");
console.log();
// ------------------------------------
// Layout Helper Tests
// ------------------------------------
console.log("=== Layout Helper Tests ===");
// Test VStack
const vstack = (0, patterns_js_1.VStack)([(0, builder_js_2.H1)("Title"), (0, builder_js_2.P)("Content")], {
    spacing: "1rem",
    align: "center",
});
const vstackHtml = (0, builder_js_1.render)(vstack);
console.assert(vstackHtml.includes("display: flex"), "VStack should use flexbox");
console.assert(vstackHtml.includes("flex-direction: column"), "VStack should be column direction");
console.assert(vstackHtml.includes("gap: 1rem"), "VStack should set gap");
console.assert(vstackHtml.includes("align-items: center"), "VStack should set align-items");
console.log("✓ VStack creates vertical flex layout");
// Test HStack
const hstack = (0, patterns_js_1.HStack)([(0, builder_js_2.Button)("Cancel"), (0, builder_js_2.Button)("Save")], {
    spacing: "0.5rem",
    justify: "flex-end",
});
const hstackHtml = (0, builder_js_1.render)(hstack);
console.assert(hstackHtml.includes("flex-direction: row"), "HStack should be row direction");
console.assert(hstackHtml.includes("justify-content: flex-end"), "HStack should set justify-content");
console.log("✓ HStack creates horizontal flex layout");
// Test Grid with number
const gridNum = (0, patterns_js_1.Grid)([(0, builder_js_2.Div)("1"), (0, builder_js_2.Div)("2"), (0, builder_js_2.Div)("3"), (0, builder_js_2.Div)("4")], {
    columns: 2,
    gap: "1rem",
});
const gridNumHtml = (0, builder_js_1.render)(gridNum);
console.assert(gridNumHtml.includes("display: grid"), "Grid should use CSS grid");
console.assert(gridNumHtml.includes("grid-template-columns: repeat(2, 1fr)"), "Grid should convert number to repeat()");
console.log("✓ Grid works with column count");
// Test Grid with template
const gridTemplate = (0, patterns_js_1.Grid)([(0, builder_js_2.Div)("1"), (0, builder_js_2.Div)("2")], {
    columns: "1fr 2fr",
    rows: "auto 1fr",
});
const gridTemplateHtml = (0, builder_js_1.render)(gridTemplate);
console.assert(gridTemplateHtml.includes("grid-template-columns: 1fr 2fr"), "Grid should accept custom template");
console.assert(gridTemplateHtml.includes("grid-template-rows: auto 1fr"), "Grid should set rows");
console.log("✓ Grid works with custom templates");
console.log();
// ------------------------------------
// HTMX Pattern Tests
// ------------------------------------
console.log("=== HTMX Pattern Tests ===");
// Test SearchInput
const searchInput = (0, patterns_js_1.SearchInput)({
    endpoint: "/api/search",
    target: "#results",
    delay: 500,
    placeholder: "Search items...",
});
const searchHtml = (0, builder_js_1.render)(searchInput);
console.assert(searchHtml.includes('type="search"'), "SearchInput should be search type");
console.assert(searchHtml.includes('placeholder="Search items..."'), "SearchInput should set placeholder");
console.assert(searchHtml.includes('hx-get="/api/search"'), "SearchInput should set endpoint");
console.assert(searchHtml.includes("delay:500ms"), "SearchInput should set delay");
console.assert(searchHtml.includes('hx-target="#results"'), "SearchInput should set target");
console.log("✓ SearchInput creates debounced search");
// Test InfiniteScroll
const infiniteScroll = (0, patterns_js_1.InfiniteScroll)({
    endpoint: "/api/items?page=2",
    loadingText: "Loading more...",
    threshold: "100px",
});
const infiniteHtml = (0, builder_js_1.render)(infiniteScroll);
console.assert(infiniteHtml.includes("Loading more..."), "InfiniteScroll should set loading text");
console.assert(infiniteHtml.includes('hx-get="/api/items?page=2"'), "InfiniteScroll should set endpoint");
console.assert(infiniteHtml.includes("hx-trigger=\"revealed threshold:100px\""), "InfiniteScroll should set threshold");
console.log("✓ InfiniteScroll creates reveal trigger");
console.log();
// ------------------------------------
// Form Pattern Tests
// ------------------------------------
console.log("=== Form Pattern Tests ===");
// Test FormField without error
const formField = (0, patterns_js_1.FormField)({
    label: "Email",
    name: "email",
    type: "email",
    required: true,
    placeholder: "you@example.com",
});
const formFieldHtml = (0, builder_js_1.render)(formField);
console.assert(formFieldHtml.includes("<label"), "FormField should include label");
console.assert(formFieldHtml.includes("Email"), "FormField should show label");
console.assert(formFieldHtml.includes('type="email"'), "FormField should set input type");
console.assert(formFieldHtml.includes("required"), "FormField should set required");
console.log("✓ FormField creates label + input");
// Test FormField with error
const formFieldError = (0, patterns_js_1.FormField)({
    label: "Password",
    name: "password",
    type: "password",
    error: "Password is required",
});
const formFieldErrorHtml = (0, builder_js_1.render)(formFieldError);
console.assert(formFieldErrorHtml.includes("Password is required"), "FormField should show error when provided");
console.log("✓ FormField shows error message");
console.log();
// ------------------------------------
// Interactive Component Tests
// ------------------------------------
console.log("=== Interactive Component Tests ===");
// Test Toggle
const toggle = (0, patterns_js_1.Toggle)({
    label: "Show Details",
    content: (0, builder_js_2.Div)("Hidden content"),
    defaultOpen: false,
});
const toggleError = (0, reactive_js_1.compile)(toggle);
console.assert(!toggleError, "Toggle should compile without errors");
const toggleHtml = (0, reactive_js_1.renderWithScript)(toggle);
console.assert(toggleHtml.includes("Show Details"), "Toggle should show button label");
console.assert(toggleHtml.includes("Hidden content"), "Toggle should include content");
console.assert(toggleHtml.includes('aria-expanded="'), "Toggle should have aria-expanded");
console.assert(toggleHtml.includes("isOpen = !isOpen"), "Toggle should toggle state");
console.log("✓ Toggle creates disclosure component");
// Test Tabs
const tabs = (0, patterns_js_1.Tabs)([
    { label: "Tab 1", content: (0, builder_js_2.Div)("Content 1") },
    { label: "Tab 2", content: (0, builder_js_2.Div)("Content 2") },
    { label: "Tab 3", content: (0, builder_js_2.Div)("Content 3") },
]);
const tabsError = (0, reactive_js_1.compile)(tabs);
console.assert(!tabsError, "Tabs should compile without errors");
const tabsHtml = (0, reactive_js_1.renderWithScript)(tabs);
console.assert(tabsHtml.includes("Tab 1"), "Tabs should show first tab");
console.assert(tabsHtml.includes("Tab 2"), "Tabs should show second tab");
console.assert(tabsHtml.includes("Content 1"), "Tabs should include content");
console.assert(tabsHtml.includes("activeTab"), "Tabs should track active tab");
console.log("✓ Tabs creates tabbed interface");
// Test Accordion
const accordion = (0, patterns_js_1.Accordion)([
    { title: "Section 1", content: (0, builder_js_2.Div)("Content 1") },
    { title: "Section 2", content: (0, builder_js_2.Div)("Content 2") },
], { defaultOpen: [0] });
const accordionError = (0, reactive_js_1.compile)(accordion);
console.assert(!accordionError, "Accordion should compile without errors");
const accordionHtml = (0, reactive_js_1.renderWithScript)(accordion);
console.assert(accordionHtml.includes("Section 1"), "Accordion should show section titles");
console.assert(accordionHtml.includes("Content 1"), "Accordion should include content");
console.assert(accordionHtml.includes("open_0"), "Accordion should track section state");
console.log("✓ Accordion creates collapsible sections");
console.log();
// ------------------------------------
// List Pattern Tests
// ------------------------------------
console.log("=== List Pattern Tests ===");
const users = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
];
const keyedList = (0, patterns_js_1.KeyedList)(users, (user) => user.id, (user) => (0, builder_js_2.Span)(user.name));
const keyedListHtml = (0, builder_js_1.render)(keyedList);
console.assert(keyedListHtml.includes("<ul"), "KeyedList should create ul");
console.assert(keyedListHtml.includes('data-key="1"'), "KeyedList should set data-key");
console.assert(keyedListHtml.includes('data-key="2"'), "KeyedList should set data-key for all items");
console.assert(keyedListHtml.includes("Alice"), "KeyedList should render item");
console.assert(keyedListHtml.includes("Bob"), "KeyedList should render all items");
console.log("✓ KeyedList creates list with keys");
console.log();
// ------------------------------------
// Summary
// ------------------------------------
console.log("=== All Pattern Tests Passed! ===");
//# sourceMappingURL=patterns.js.map