import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Div, Button, Span, Empty } from "../src/index.js";
import { clss, closest, find } from "../src/htmx.js";
import { defineIds } from "../src/ids.js";
import { Partial, HtmxConfig, hxResponse, } from "../src/patterns.js";
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
            haspopup: true,
        }));
        assert.ok(html.includes('aria-label="Open menu"'));
        assert.ok(html.includes('aria-expanded="false"'));
        // single-token name stays correct — NOT the kebab-mangled aria-has-popup
        assert.ok(html.includes('aria-haspopup="true"'));
    });
    it("setRole / setTabindex / setTitle render correctly", () => {
        const html = render(Div("Alert").setRole("alert").setTabindex(0).setTitle("Heads up"));
        assert.ok(html.includes('role="alert"'));
        assert.ok(html.includes('tabindex="0"'));
        assert.ok(html.includes('title="Heads up"'));
    });
    it("setAria accepts the tristate 'mixed' and a number value", () => {
        const html = render(Div().setAria({ checked: "mixed", level: 3 }));
        assert.ok(html.includes('aria-checked="mixed"'));
        assert.ok(html.includes('aria-level="3"'));
    });
    it("setAria escape arm passes a full aria-* key verbatim", () => {
        const html = render(Div().setAria({ "aria-rowcount": "5" }));
        assert.ok(html.includes('aria-rowcount="5"'));
    });
});
describe("HTMX Patterns", () => {
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
    // Regression (htmx-emission-4): non-Latin1 JSON must be \uXXXX-escaped so Node's
    // setHeader (Latin-1 only) does not throw ERR_INVALID_CHAR, while htmx's JSON.parse round-trips it.
    it("hxResponse.trigger ASCII-escapes non-Latin1 detail for header safety", () => {
        const value = "Uspešno shranjeno 🎉";
        const header = hxResponse(Empty()).trigger("toast", { msg: value }).build().headers["HX-Trigger"];
        assert.ok(/^[\x00-\xff]*$/.test(header), "header must be Latin-1 safe");
        assert.doesNotThrow(() => { const h = {}; h["HX-Trigger"] = header; });
        assert.strictEqual(JSON.parse(header).toast.msg, value);
    });
    it("hxResponse.location ASCII-escapes non-Latin1 config", () => {
        const header = hxResponse(Empty()).location({ path: "/x", values: { name: "Žiga" } }).build().headers["HX-Location"];
        assert.ok(/^[\x00-\xff]*$/.test(header));
        assert.strictEqual(JSON.parse(header).values.name, "Žiga");
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
    it("hxResponse accumulates multiple bare triggers as a comma list (A-007)", () => {
        const response = hxResponse(Div("")).trigger("123").trigger("itemSaved").build();
        assert.strictEqual(response.headers["HX-Trigger"], "123, itemSaved");
    });
    it("hxResponse serializes a detailed trigger as the JSON object form (A-007)", () => {
        const response = hxResponse(Div("")).trigger("saved", { id: 7 }).trigger("toast").build();
        assert.strictEqual(response.headers["HX-Trigger"], `{"saved":{"id":7},"toast":{}}`);
    });
});
describe("Partial (htmx 4)", () => {
    // htmx 4 processes `root.querySelectorAll("template[hx]")` and dispatches on `type`.
    // These pin the whole emitted element: a shape htmx never scans for is inert in the
    // browser while staying tsc-, lint- and test-clean (the 8.0.0 `<hx-partial>` defect).
    it("emits template[hx] with type=partial for a bare-token target", () => {
        assert.strictEqual(render(Partial("user-list", Div("Users"))), '<template type="partial" hx-target="#user-list" hx-swap="outerMorph" hx><div>Users</div></template>');
    });
    it("emits template[hx] for an Id-resolved target", () => {
        const ids = defineIds(["member-list"]);
        assert.strictEqual(render(Partial(ids.memberList, Div("Members"))), '<template type="partial" hx-target="#member-list" hx-swap="outerMorph" hx><div>Members</div></template>');
    });
    it("emits template[hx] for an explicit selector target", () => {
        assert.strictEqual(render(Partial(".items", Span("X"))), '<template type="partial" hx-target=".items" hx-swap="outerMorph" hx><span>X</span></template>');
    });
    it("emits template[hx] with a custom swap", () => {
        assert.strictEqual(render(Partial("list", Div("Items"), "innerHTML")), '<template type="partial" hx-target="#list" hx-swap="innerHTML" hx><div>Items</div></template>');
    });
    it("carries the bare hx marker htmx's template[hx] scan selects on", () => {
        const html = render(Partial("user-list", "X"));
        assert.ok(/<template[^>]*\shx(?=[\s>])/.test(html), "expected a valueless hx attribute");
        assert.ok(!html.includes("hx-partial"), "the pre-htmx-4 element name must not come back");
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
        assert.strictEqual(html.match(/<template type="partial"/g)?.length, 2);
        assert.ok(html.includes('hx-target="#content"'));
        assert.ok(html.includes('hx-target="#count"'));
    });
    // Regression (htmx-emission-2): non-id selectors must pass through verbatim, not get `#`-prefixed
    it("passes class / closest / find selectors through verbatim", () => {
        assert.ok(render(Partial(clss("items"), "X")).includes('hx-target=".items"'));
        assert.ok(render(Partial(closest("tr"), "X")).includes('hx-target="closest tr"'));
        assert.ok(render(Partial(find(".row"), "X")).includes('hx-target="find .row"'));
    });
    it("prefixes # only for a bare id token, never a raw selector string", () => {
        assert.ok(render(Partial("user-list", "X")).includes('hx-target="#user-list"'));
        assert.ok(render(Partial(".items", "X")).includes('hx-target=".items"'));
        assert.ok(render(Partial("#main", "X")).includes('hx-target="#main"'));
        // `>` is attribute-escaped (the selector is preserved; the browser un-escapes it).
        assert.ok(render(Partial("div > p", "X")).includes('hx-target="div &gt; p"'));
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