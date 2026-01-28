// ------------------------------------
// Tests for Common Patterns
// ------------------------------------

import { render, Div, H1, P, Button, Span } from "../src/index.js";
import {
  VStack,
  HStack,
  Grid,
  SearchInput,
  InfiniteScroll,
  OOB,
  withOOB,
  hxResponse,
  FormField,
  KeyedList,
} from "../src/patterns.js";

console.log("Running pattern tests...\n");

// ------------------------------------
// Utility Method Tests
// ------------------------------------

console.log("=== Utility Method Tests ===");

// Test setClasses
const classTest = Div("Test")
  .setClasses(["btn", false, "active", null, undefined, "primary"]);
const classHtml = render(classTest);
console.assert(
  classHtml.includes('class="btn active primary"'),
  "setClasses should filter falsy values"
);
console.log("✓ setClasses filters falsy values correctly");

// Test setStyles
const styleTest = Div("Test").setStyles({
  width: "100px",
  height: "50px",
  backgroundColor: "blue",
  fontSize: "16px",
});
const styleHtml = render(styleTest);
console.assert(
  styleHtml.includes("width: 100px"),
  "setStyles should include width"
);
console.assert(
  styleHtml.includes("background-color: blue"),
  "setStyles should convert camelCase to kebab-case"
);
console.log("✓ setStyles works with camelCase conversion");

// Test setDataAttrs
const dataTest = Button("Click").setDataAttrs({
  testid: "submit-btn",
  userId: "123",
  actionType: "save",
});
const dataHtml = render(dataTest);
console.assert(
  dataHtml.includes('data-testid="submit-btn"'),
  "setDataAttrs should set data-testid"
);
console.assert(
  dataHtml.includes('data-user-id="123"'),
  "setDataAttrs should convert camelCase to kebab-case"
);
console.assert(
  dataHtml.includes('data-action-type="save"'),
  "setDataAttrs should handle multiple words"
);
console.log("✓ setDataAttrs works with kebab-case conversion");

// Test setAria
const ariaTest = Button("Menu").setAria({
  label: "Open menu",
  expanded: false,
  controls: "menu-panel",
  hasPopup: true,
});
const ariaHtml = render(ariaTest);
console.assert(
  ariaHtml.includes('aria-label="Open menu"'),
  "setAria should set aria-label"
);
console.assert(
  ariaHtml.includes('aria-expanded="false"'),
  "setAria should convert boolean to string"
);
console.assert(
  ariaHtml.includes('aria-has-popup="true"'),
  "setAria should convert camelCase to kebab-case"
);
console.log("✓ setAria works correctly");

console.log();

// ------------------------------------
// Layout Helper Tests
// ------------------------------------

console.log("=== Layout Helper Tests ===");

// Test VStack
const vstack = VStack([H1("Title"), P("Content")], {
  spacing: "1rem",
  align: "center",
});
const vstackHtml = render(vstack);
console.assert(
  vstackHtml.includes("display: flex"),
  "VStack should use flexbox"
);
console.assert(
  vstackHtml.includes("flex-direction: column"),
  "VStack should be column direction"
);
console.assert(vstackHtml.includes("gap: 1rem"), "VStack should set gap");
console.assert(
  vstackHtml.includes("align-items: center"),
  "VStack should set align-items"
);
console.log("✓ VStack creates vertical flex layout");

// Test HStack
const hstack = HStack([Button("Cancel"), Button("Save")], {
  spacing: "0.5rem",
  justify: "flex-end",
});
const hstackHtml = render(hstack);
console.assert(
  hstackHtml.includes("flex-direction: row"),
  "HStack should be row direction"
);
console.assert(
  hstackHtml.includes("justify-content: flex-end"),
  "HStack should set justify-content"
);
console.log("✓ HStack creates horizontal flex layout");

// Test Grid with number
const gridNum = Grid([Div("1"), Div("2"), Div("3"), Div("4")], {
  columns: 2,
  gap: "1rem",
});
const gridNumHtml = render(gridNum);
console.assert(
  gridNumHtml.includes("display: grid"),
  "Grid should use CSS grid"
);
console.assert(
  gridNumHtml.includes("grid-template-columns: repeat(2, 1fr)"),
  "Grid should convert number to repeat()"
);
console.log("✓ Grid works with column count");

// Test Grid with template
const gridTemplate = Grid([Div("1"), Div("2")], {
  columns: "1fr 2fr",
  rows: "auto 1fr",
});
const gridTemplateHtml = render(gridTemplate);
console.assert(
  gridTemplateHtml.includes("grid-template-columns: 1fr 2fr"),
  "Grid should accept custom template"
);
console.assert(
  gridTemplateHtml.includes("grid-template-rows: auto 1fr"),
  "Grid should set rows"
);
console.log("✓ Grid works with custom templates");

console.log();

// ------------------------------------
// HTMX Pattern Tests
// ------------------------------------

console.log("=== HTMX Pattern Tests ===");

// Test SearchInput
const searchInput = SearchInput({
  endpoint: "/api/search",
  target: "#results",
  delay: 500,
  placeholder: "Search items...",
});
const searchHtml = render(searchInput);
console.assert(
  searchHtml.includes('type="search"'),
  "SearchInput should be search type"
);
console.assert(
  searchHtml.includes('placeholder="Search items..."'),
  "SearchInput should set placeholder"
);
console.assert(
  searchHtml.includes('hx-get="/api/search"'),
  "SearchInput should set endpoint"
);
console.assert(
  searchHtml.includes("delay:500ms"),
  "SearchInput should set delay"
);
console.assert(
  searchHtml.includes('hx-target="#results"'),
  "SearchInput should set target"
);
console.log("✓ SearchInput creates debounced search");

// Test InfiniteScroll
const infiniteScroll = InfiniteScroll({
  endpoint: "/api/items?page=2",
  loadingText: "Loading more...",
  threshold: "100px",
});
const infiniteHtml = render(infiniteScroll);
console.assert(
  infiniteHtml.includes("Loading more..."),
  "InfiniteScroll should set loading text"
);
console.assert(
  infiniteHtml.includes('hx-get="/api/items?page=2"'),
  "InfiniteScroll should set endpoint"
);
console.assert(
  infiniteHtml.includes("hx-trigger=\"revealed threshold:100px\""),
  "InfiniteScroll should set threshold"
);
console.log("✓ InfiniteScroll creates reveal trigger");

// Test OOB
const oobElement = OOB("toast", Div("Message"));
const oobHtml = render(oobElement);
console.assert(
  oobHtml.includes('id="toast"'),
  "OOB should set id from target"
);
console.assert(
  oobHtml.includes('hx-swap-oob="true"'),
  "OOB should set hx-swap-oob"
);
console.log("✓ OOB creates out-of-band swap element");

// Test OOB with # prefix
const oobWithHash = OOB("#notification", Span("Alert"));
const oobHashHtml = render(oobWithHash);
console.assert(
  oobHashHtml.includes('id="notification"'),
  "OOB should strip # from target"
);
console.log("✓ OOB handles # prefix in target");

// Test OOB with swap strategy
const oobWithSwap = OOB("list", Div("New item"), "beforeend");
const oobSwapHtml = render(oobWithSwap);
console.assert(
  oobSwapHtml.includes('hx-swap-oob="beforeend:#list"'),
  "OOB should include swap strategy"
);
console.log("✓ OOB supports custom swap strategies");

// Test withOOB
const combined = withOOB(
  Div("Main").setId("main"),
  OOB("sidebar", Span("Updated")),
  OOB("footer", Span("Footer"))
);
console.assert(Array.isArray(combined), "withOOB should return array");
console.assert(combined.length === 3, "withOOB should include main + OOB elements");
const combinedHtml = render(combined);
console.assert(
  combinedHtml.includes('id="main"') &&
  combinedHtml.includes('id="sidebar"') &&
  combinedHtml.includes('id="footer"'),
  "withOOB should render all elements"
);
console.log("✓ withOOB combines main content with OOB elements");

// Test hxResponse basic
const basicResponse = hxResponse(Div("Content")).build();
console.assert(
  basicResponse.html.includes("<div>Content</div>"),
  "hxResponse should render content"
);
console.assert(
  typeof basicResponse.headers === "object",
  "hxResponse should return headers object"
);
console.log("✓ hxResponse builds response with html and headers");

// Test hxResponse with trigger
const triggerResponse = hxResponse(Div("Saved"))
  .trigger("itemSaved")
  .build();
console.assert(
  triggerResponse.headers["HX-Trigger"] === "itemSaved",
  "hxResponse.trigger should set HX-Trigger header"
);
console.log("✓ hxResponse.trigger sets HX-Trigger header");

// Test hxResponse with trigger and detail
const triggerDetailResponse = hxResponse(Div("Saved"))
  .trigger("showMessage", { text: "Success" })
  .build();
console.assert(
  triggerDetailResponse.headers["HX-Trigger"].includes("showMessage"),
  "hxResponse.trigger should handle detail object"
);
console.log("✓ hxResponse.trigger handles event detail");

// Test hxResponse with pushUrl
const pushUrlResponse = hxResponse(Div("Content"))
  .pushUrl("/items/123")
  .build();
console.assert(
  pushUrlResponse.headers["HX-Push-Url"] === "/items/123",
  "hxResponse.pushUrl should set HX-Push-Url header"
);
console.log("✓ hxResponse.pushUrl sets HX-Push-Url header");

// Test hxResponse with redirect
const redirectResponse = hxResponse(Div(""))
  .redirect("/login")
  .build();
console.assert(
  redirectResponse.headers["HX-Redirect"] === "/login",
  "hxResponse.redirect should set HX-Redirect header"
);
console.log("✓ hxResponse.redirect sets HX-Redirect header");

// Test hxResponse with multiple headers
const multiHeaderResponse = hxResponse(Div("Done"))
  .trigger("completed")
  .pushUrl("/done")
  .retarget("#result")
  .reswap("outerHTML")
  .build();
console.assert(
  multiHeaderResponse.headers["HX-Trigger"] === "completed",
  "Multi-header response should have trigger"
);
console.assert(
  multiHeaderResponse.headers["HX-Push-Url"] === "/done",
  "Multi-header response should have push-url"
);
console.assert(
  multiHeaderResponse.headers["HX-Retarget"] === "#result",
  "Multi-header response should have retarget"
);
console.assert(
  multiHeaderResponse.headers["HX-Reswap"] === "outerHTML",
  "Multi-header response should have reswap"
);
console.log("✓ hxResponse supports chaining multiple headers");

// Test hxResponse.refresh
const refreshResponse = hxResponse(Div("")).refresh().build();
console.assert(
  refreshResponse.headers["HX-Refresh"] === "true",
  "hxResponse.refresh should set HX-Refresh header"
);
console.log("✓ hxResponse.refresh sets HX-Refresh header");

// Test hxResponse.replaceUrl
const replaceUrlResponse = hxResponse(Div(""))
  .replaceUrl("/new-path")
  .build();
console.assert(
  replaceUrlResponse.headers["HX-Replace-Url"] === "/new-path",
  "hxResponse.replaceUrl should set HX-Replace-Url header"
);
console.log("✓ hxResponse.replaceUrl sets HX-Replace-Url header");

// Test hxResponse.location with string
const locationResponse = hxResponse(Div(""))
  .location("/dashboard")
  .build();
console.assert(
  locationResponse.headers["HX-Location"] === "/dashboard",
  "hxResponse.location should set HX-Location header"
);
console.log("✓ hxResponse.location sets HX-Location header");

// Test hxResponse.location with object
const locationObjResponse = hxResponse(Div(""))
  .location({ path: "/dashboard", target: "#main" })
  .build();
console.assert(
  locationObjResponse.headers["HX-Location"].includes("dashboard"),
  "hxResponse.location should handle config object"
);
console.log("✓ hxResponse.location handles config object");

console.log();

// ------------------------------------
// Form Pattern Tests
// ------------------------------------

console.log("=== Form Pattern Tests ===");

// Test FormField without error
const formField = FormField({
  label: "Email",
  name: "email",
  type: "email",
  required: true,
  placeholder: "you@example.com",
});
const formFieldHtml = render(formField);
console.assert(
  formFieldHtml.includes("<label"),
  "FormField should include label"
);
console.assert(formFieldHtml.includes("Email"), "FormField should show label");
console.assert(
  formFieldHtml.includes('type="email"'),
  "FormField should set input type"
);
console.assert(
  formFieldHtml.includes("required"),
  "FormField should set required"
);
console.log("✓ FormField creates label + input");

// Test FormField with error
const formFieldError = FormField({
  label: "Password",
  name: "password",
  type: "password",
  error: "Password is required",
});
const formFieldErrorHtml = render(formFieldError);
console.assert(
  formFieldErrorHtml.includes("Password is required"),
  "FormField should show error when provided"
);
console.log("✓ FormField shows error message");

console.log();

// ------------------------------------
// List Pattern Tests
// ------------------------------------

console.log("=== List Pattern Tests ===");

interface User {
  id: string;
  name: string;
}

const users: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const keyedList = KeyedList(
  users,
  (user) => user.id,
  (user) => Span(user.name)
);
const keyedListHtml = render(keyedList);
console.assert(keyedListHtml.includes("<ul"), "KeyedList should create ul");
console.assert(
  keyedListHtml.includes('data-key="1"'),
  "KeyedList should set data-key"
);
console.assert(
  keyedListHtml.includes('data-key="2"'),
  "KeyedList should set data-key for all items"
);
console.assert(keyedListHtml.includes("Alice"), "KeyedList should render item");
console.assert(keyedListHtml.includes("Bob"), "KeyedList should render all items");
console.log("✓ KeyedList creates list with keys");

console.log();

// ------------------------------------
// Summary
// ------------------------------------

console.log("=== All Pattern Tests Passed! ===");
