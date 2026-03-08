// ------------------------------------
// Tests for Common Patterns
// ------------------------------------
import { render, Div, Button, Span } from "../src/index.js";
import { OOB, withOOB, Partial, HtmxConfig, hxResponse, } from "../src/patterns.js";
console.log("Running pattern tests...\n");
// ------------------------------------
// Utility Method Tests
// ------------------------------------
console.log("=== Utility Method Tests ===");
// Test setClasses
const classTest = Div("Test")
    .setClasses(["btn", false, "active", null, undefined, "primary"]);
const classHtml = render(classTest);
console.assert(classHtml.includes('class="btn active primary"'), "setClasses should filter falsy values");
console.log("✓ setClasses filters falsy values correctly");
// Test setStyles
const styleTest = Div("Test").setStyles({
    width: "100px",
    height: "50px",
    backgroundColor: "blue",
    fontSize: "16px",
});
const styleHtml = render(styleTest);
console.assert(styleHtml.includes("width: 100px"), "setStyles should include width");
console.assert(styleHtml.includes("background-color: blue"), "setStyles should convert camelCase to kebab-case");
console.log("✓ setStyles works with camelCase conversion");
// Test setDataAttrs
const dataTest = Button("Click").setDataAttrs({
    testid: "submit-btn",
    userId: "123",
    actionType: "save",
});
const dataHtml = render(dataTest);
console.assert(dataHtml.includes('data-testid="submit-btn"'), "setDataAttrs should set data-testid");
console.assert(dataHtml.includes('data-user-id="123"'), "setDataAttrs should convert camelCase to kebab-case");
console.assert(dataHtml.includes('data-action-type="save"'), "setDataAttrs should handle multiple words");
console.log("✓ setDataAttrs works with kebab-case conversion");
// Test setAria
const ariaTest = Button("Menu").setAria({
    label: "Open menu",
    expanded: false,
    controls: "menu-panel",
    hasPopup: true,
});
const ariaHtml = render(ariaTest);
console.assert(ariaHtml.includes('aria-label="Open menu"'), "setAria should set aria-label");
console.assert(ariaHtml.includes('aria-expanded="false"'), "setAria should convert boolean to string");
console.assert(ariaHtml.includes('aria-has-popup="true"'), "setAria should convert camelCase to kebab-case");
console.log("✓ setAria works correctly");
console.log();
// ------------------------------------
// HTMX Pattern Tests
// ------------------------------------
console.log("=== HTMX Pattern Tests ===");
// Test OOB
const oobElement = OOB("toast", Div("Message"));
const oobHtml = render(oobElement);
console.assert(oobHtml.includes('id="toast"'), "OOB should set id from target");
console.assert(oobHtml.includes('hx-swap-oob="true"'), "OOB should set hx-swap-oob");
console.log("✓ OOB creates out-of-band swap element");
// Test OOB with # prefix
const oobWithHash = OOB("#notification", Span("Alert"));
const oobHashHtml = render(oobWithHash);
console.assert(oobHashHtml.includes('id="notification"'), "OOB should strip # from target");
console.log("✓ OOB handles # prefix in target");
// Test OOB with swap strategy
const oobWithSwap = OOB("list", Div("New item"), "beforeend");
const oobSwapHtml = render(oobWithSwap);
console.assert(oobSwapHtml.includes('hx-swap-oob="beforeend:#list"'), "OOB should include swap strategy");
console.log("✓ OOB supports custom swap strategies");
// Test withOOB
const combined = withOOB(Div("Main").setId("main"), OOB("sidebar", Span("Updated")), OOB("footer", Span("Footer")));
console.assert(Array.isArray(combined), "withOOB should return array");
console.assert(combined.length === 3, "withOOB should include main + OOB elements");
const combinedHtml = render(combined);
console.assert(combinedHtml.includes('id="main"') &&
    combinedHtml.includes('id="sidebar"') &&
    combinedHtml.includes('id="footer"'), "withOOB should render all elements");
console.log("✓ withOOB combines main content with OOB elements");
// Test hxResponse basic
const basicResponse = hxResponse(Div("Content")).build();
console.assert(basicResponse.html.includes("<div>Content</div>"), "hxResponse should render content");
console.assert(typeof basicResponse.headers === "object", "hxResponse should return headers object");
console.log("✓ hxResponse builds response with html and headers");
// Test hxResponse with trigger
const triggerResponse = hxResponse(Div("Saved"))
    .trigger("itemSaved")
    .build();
console.assert(triggerResponse.headers["HX-Trigger"] === "itemSaved", "hxResponse.trigger should set HX-Trigger header");
console.log("✓ hxResponse.trigger sets HX-Trigger header");
// Test hxResponse with trigger and detail
const triggerDetailResponse = hxResponse(Div("Saved"))
    .trigger("showMessage", { text: "Success" })
    .build();
console.assert(triggerDetailResponse.headers["HX-Trigger"].includes("showMessage"), "hxResponse.trigger should handle detail object");
console.log("✓ hxResponse.trigger handles event detail");
// Test hxResponse with pushUrl
const pushUrlResponse = hxResponse(Div("Content"))
    .pushUrl("/items/123")
    .build();
console.assert(pushUrlResponse.headers["HX-Push-Url"] === "/items/123", "hxResponse.pushUrl should set HX-Push-Url header");
console.log("✓ hxResponse.pushUrl sets HX-Push-Url header");
// Test hxResponse with redirect
const redirectResponse = hxResponse(Div(""))
    .redirect("/login")
    .build();
console.assert(redirectResponse.headers["HX-Redirect"] === "/login", "hxResponse.redirect should set HX-Redirect header");
console.log("✓ hxResponse.redirect sets HX-Redirect header");
// Test hxResponse with multiple headers
const multiHeaderResponse = hxResponse(Div("Done"))
    .trigger("completed")
    .pushUrl("/done")
    .retarget("#result")
    .reswap("outerHTML")
    .build();
console.assert(multiHeaderResponse.headers["HX-Trigger"] === "completed", "Multi-header response should have trigger");
console.assert(multiHeaderResponse.headers["HX-Push-Url"] === "/done", "Multi-header response should have push-url");
console.assert(multiHeaderResponse.headers["HX-Retarget"] === "#result", "Multi-header response should have retarget");
console.assert(multiHeaderResponse.headers["HX-Reswap"] === "outerHTML", "Multi-header response should have reswap");
console.log("✓ hxResponse supports chaining multiple headers");
// Test hxResponse.refresh
const refreshResponse = hxResponse(Div("")).refresh().build();
console.assert(refreshResponse.headers["HX-Refresh"] === "true", "hxResponse.refresh should set HX-Refresh header");
console.log("✓ hxResponse.refresh sets HX-Refresh header");
// Test hxResponse.replaceUrl
const replaceUrlResponse = hxResponse(Div(""))
    .replaceUrl("/new-path")
    .build();
console.assert(replaceUrlResponse.headers["HX-Replace-Url"] === "/new-path", "hxResponse.replaceUrl should set HX-Replace-Url header");
console.log("✓ hxResponse.replaceUrl sets HX-Replace-Url header");
// Test hxResponse.location with string
const locationResponse = hxResponse(Div(""))
    .location("/dashboard")
    .build();
console.assert(locationResponse.headers["HX-Location"] === "/dashboard", "hxResponse.location should set HX-Location header");
console.log("✓ hxResponse.location sets HX-Location header");
// Test hxResponse.location with object
const locationObjResponse = hxResponse(Div(""))
    .location({ path: "/dashboard", target: "#main" })
    .build();
console.assert(locationObjResponse.headers["HX-Location"].includes("dashboard"), "hxResponse.location should handle config object");
console.log("✓ hxResponse.location handles config object");
console.log();
// ------------------------------------
// Partial Tests (htmx 4)
// ------------------------------------
console.log("=== Partial Tests ===");
// Test Partial with string target
const partialStr = Partial("user-list", Div("Users"));
const partialStrHtml = render(partialStr);
console.assert(partialStrHtml.includes("<hx-partial"), "Partial should create hx-partial element");
console.assert(partialStrHtml.includes('hx-target="#user-list"'), "Partial should set hx-target with # prefix");
console.assert(partialStrHtml.includes('hx-swap="outerMorph"'), "Partial should default to outerMorph swap");
console.log("✓ Partial creates hx-partial element with string target");
// Test Partial with # prefix
const partialHash = Partial("#sidebar", Span("Content"));
const partialHashHtml = render(partialHash);
console.assert(partialHashHtml.includes('hx-target="#sidebar"'), "Partial should preserve existing # prefix");
console.log("✓ Partial handles # prefix in target");
// Test Partial with custom swap
const partialSwap = Partial("list", Div("Items"), "innerHTML");
const partialSwapHtml = render(partialSwap);
console.assert(partialSwapHtml.includes('hx-swap="innerHTML"'), "Partial should accept custom swap strategy");
console.log("✓ Partial supports custom swap strategy");
// Test multiple Partials rendered together
const multiPartialHtml = render(Partial("content", Div("Main")), Partial("count", Span("5")));
console.assert(multiPartialHtml.includes('hx-target="#content"') &&
    multiPartialHtml.includes('hx-target="#count"'), "Multiple Partials should render independently");
console.log("✓ Multiple Partials render in a single response");
console.log();
// ------------------------------------
// HtmxConfig Tests (htmx 4)
// ------------------------------------
console.log("=== HtmxConfig Tests ===");
// Test basic config
const configBasic = HtmxConfig({ extensions: "sse" });
const configBasicHtml = render(configBasic);
console.assert(configBasicHtml.includes('<meta'), "HtmxConfig should create meta element");
console.assert(configBasicHtml.includes('name="htmx-config"'), "HtmxConfig should set name attribute");
console.assert(configBasicHtml.includes('content='), "HtmxConfig should set content attribute");
console.assert(configBasicHtml.includes('extensions'), "HtmxConfig should serialize extensions");
console.log("✓ HtmxConfig creates meta tag with config");
// Test config with multiple options
const configFull = HtmxConfig({
    extensions: "sse, preload",
    transitions: true,
    defaultSwap: "outerMorph",
    implicitInheritance: true,
});
const configFullHtml = render(configFull);
console.assert(configFullHtml.includes('transitions'), "HtmxConfig should include transitions");
console.assert(configFullHtml.includes('defaultSwap'), "HtmxConfig should include defaultSwap");
console.assert(configFullHtml.includes('outerMorph'), "HtmxConfig should include outerMorph value");
console.log("✓ HtmxConfig supports multiple options");
console.log();
// ------------------------------------
// Summary
// ------------------------------------
console.log("=== All Pattern Tests Passed! ===");
//# sourceMappingURL=patterns.js.map