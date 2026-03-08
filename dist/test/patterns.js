import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Div, Button, Span } from "../src/index.js";
import { OOB, withOOB, Partial, HtmxConfig, hxResponse, } from "../src/patterns.js";
describe("Utility Methods", () => {
    it("setClasses filters falsy values", () => {
        const html = render(Div("Test").setClasses(["btn", false, "active", null, undefined, "primary"]));
        assert.ok(html.includes('class="btn active primary"'));
    });
    it("setStyles works with camelCase conversion", () => {
        const html = render(Div("Test").setStyles({
            width: "100px",
            height: "50px",
            backgroundColor: "blue",
            fontSize: "16px",
        }));
        assert.ok(html.includes("width: 100px"));
        assert.ok(html.includes("background-color: blue"));
    });
    it("setDataAttrs works with kebab-case conversion", () => {
        const html = render(Button("Click").setDataAttrs({
            testid: "submit-btn",
            userId: "123",
            actionType: "save",
        }));
        assert.ok(html.includes('data-testid="submit-btn"'));
        assert.ok(html.includes('data-user-id="123"'));
        assert.ok(html.includes('data-action-type="save"'));
    });
    it("setAria works correctly", () => {
        const html = render(Button("Menu").setAria({
            label: "Open menu",
            expanded: false,
            controls: "menu-panel",
            hasPopup: true,
        }));
        assert.ok(html.includes('aria-label="Open menu"'));
        assert.ok(html.includes('aria-expanded="false"'));
        assert.ok(html.includes('aria-has-popup="true"'));
    });
});
describe("HTMX Patterns", () => {
    it("OOB creates out-of-band swap element", () => {
        const html = render(OOB("toast", Div("Message")));
        assert.ok(html.includes('id="toast"'));
        assert.ok(html.includes('hx-swap-oob="true"'));
    });
    it("OOB handles # prefix in target", () => {
        const html = render(OOB("#notification", Span("Alert")));
        assert.ok(html.includes('id="notification"'));
    });
    it("OOB supports custom swap strategies", () => {
        const html = render(OOB("list", Div("New item"), "beforeend"));
        assert.ok(html.includes('hx-swap-oob="beforeend:#list"'));
    });
    it("withOOB combines main content with OOB elements", () => {
        const combined = withOOB(Div("Main").setId("main"), OOB("sidebar", Span("Updated")), OOB("footer", Span("Footer")));
        assert.ok(Array.isArray(combined));
        assert.strictEqual(combined.length, 3);
        const html = render(combined);
        assert.ok(html.includes('id="main"'));
        assert.ok(html.includes('id="sidebar"'));
        assert.ok(html.includes('id="footer"'));
    });
    it("hxResponse builds response with html and headers", () => {
        const response = hxResponse(Div("Content")).build();
        assert.ok(response.html.includes("<div>Content</div>"));
        assert.strictEqual(typeof response.headers, "object");
    });
    it("hxResponse.trigger sets HX-Trigger header", () => {
        const response = hxResponse(Div("Saved")).trigger("itemSaved").build();
        assert.strictEqual(response.headers["HX-Trigger"], "itemSaved");
    });
    it("hxResponse.trigger handles event detail", () => {
        const response = hxResponse(Div("Saved")).trigger("showMessage", { text: "Success" }).build();
        assert.ok(response.headers["HX-Trigger"].includes("showMessage"));
    });
    it("hxResponse.pushUrl sets HX-Push-Url header", () => {
        const response = hxResponse(Div("Content")).pushUrl("/items/123").build();
        assert.strictEqual(response.headers["HX-Push-Url"], "/items/123");
    });
    it("hxResponse.redirect sets HX-Redirect header", () => {
        const response = hxResponse(Div("")).redirect("/login").build();
        assert.strictEqual(response.headers["HX-Redirect"], "/login");
    });
    it("hxResponse supports chaining multiple headers", () => {
        const response = hxResponse(Div("Done"))
            .trigger("completed")
            .pushUrl("/done")
            .retarget("#result")
            .reswap("outerHTML")
            .build();
        assert.strictEqual(response.headers["HX-Trigger"], "completed");
        assert.strictEqual(response.headers["HX-Push-Url"], "/done");
        assert.strictEqual(response.headers["HX-Retarget"], "#result");
        assert.strictEqual(response.headers["HX-Reswap"], "outerHTML");
    });
    it("hxResponse.refresh sets HX-Refresh header", () => {
        const response = hxResponse(Div("")).refresh().build();
        assert.strictEqual(response.headers["HX-Refresh"], "true");
    });
    it("hxResponse.replaceUrl sets HX-Replace-Url header", () => {
        const response = hxResponse(Div("")).replaceUrl("/new-path").build();
        assert.strictEqual(response.headers["HX-Replace-Url"], "/new-path");
    });
    it("hxResponse.location sets HX-Location header", () => {
        const response = hxResponse(Div("")).location("/dashboard").build();
        assert.strictEqual(response.headers["HX-Location"], "/dashboard");
    });
    it("hxResponse.location handles config object", () => {
        const response = hxResponse(Div("")).location({ path: "/dashboard", target: "#main" }).build();
        assert.ok(response.headers["HX-Location"].includes("dashboard"));
    });
});
describe("Partial (htmx 4)", () => {
    it("creates hx-partial element with string target", () => {
        const html = render(Partial("user-list", Div("Users")));
        assert.ok(html.includes("<hx-partial"));
        assert.ok(html.includes('hx-target="#user-list"'));
        assert.ok(html.includes('hx-swap="outerMorph"'));
    });
    it("handles # prefix in target", () => {
        const html = render(Partial("#sidebar", Span("Content")));
        assert.ok(html.includes('hx-target="#sidebar"'));
    });
    it("supports custom swap strategy", () => {
        const html = render(Partial("list", Div("Items"), "innerHTML"));
        assert.ok(html.includes('hx-swap="innerHTML"'));
    });
    it("multiple Partials render in a single response", () => {
        const html = render(Partial("content", Div("Main")), Partial("count", Span("5")));
        assert.ok(html.includes('hx-target="#content"'));
        assert.ok(html.includes('hx-target="#count"'));
    });
});
describe("HtmxConfig (htmx 4)", () => {
    it("creates meta tag with config", () => {
        const html = render(HtmxConfig({ extensions: "sse" }));
        assert.ok(html.includes('<meta'));
        assert.ok(html.includes('name="htmx-config"'));
        assert.ok(html.includes('content='));
        assert.ok(html.includes('extensions'));
    });
    it("supports multiple options", () => {
        const html = render(HtmxConfig({
            extensions: "sse, preload",
            transitions: true,
            defaultSwap: "outerMorph",
            implicitInheritance: true,
        }));
        assert.ok(html.includes('transitions'));
        assert.ok(html.includes('defaultSwap'));
        assert.ok(html.includes('outerMorph'));
    });
});
//# sourceMappingURL=patterns.js.map