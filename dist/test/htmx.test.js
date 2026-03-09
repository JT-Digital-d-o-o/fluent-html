import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Div, Button, Input, Form, Ul, A, } from "../src/index.js";
import { hx, id, clss } from "../src/htmx.js";
// ------------------------------------
// HTMX - Basic
// ------------------------------------
describe("HTMX - Basic", () => {
    it("hx-get", () => { assert.strictEqual(render(Div().setHtmx(hx("/api/data"))), `<div hx-get="/api/data"></div>`); });
    it("hx-post", () => { assert.strictEqual(render(Button("Submit").setHtmx(hx("/api/submit", { method: "post" }))), `<button hx-post="/api/submit">Submit</button>`); });
    it("hx-put", () => { assert.strictEqual(render(Button("Update").setHtmx(hx("/api/update", { method: "put" }))), `<button hx-put="/api/update">Update</button>`); });
    it("hx-delete", () => { assert.strictEqual(render(Button("Delete").setHtmx(hx("/api/delete", { method: "delete" }))), `<button hx-delete="/api/delete">Delete</button>`); });
});
// ------------------------------------
// HTMX - Target and Swap
// ------------------------------------
describe("HTMX - Target and Swap", () => {
    it("hx-target with id", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/content", { target: "#result" }))), `<button hx-get="/content" hx-target="#result">Load</button>`); });
    it("hx-target with class", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/content", { target: ".container" }))), `<button hx-get="/content" hx-target=".container">Load</button>`); });
    it("hx-swap innerHTML", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "innerHTML" }))), `<div hx-get="/data" hx-swap="innerHTML"></div>`); });
    it("hx-swap outerHTML", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "outerHTML" }))), `<div hx-get="/data" hx-swap="outerHTML"></div>`); });
    it("hx-swap beforeend", () => { assert.strictEqual(render(Ul().setHtmx(hx("/items", { swap: "beforeend" }))), `<ul hx-get="/items" hx-swap="beforeend"></ul>`); });
    it("Combined target and swap", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/api", { target: "#main", swap: "innerHTML" }))), `<button hx-get="/api" hx-target="#main" hx-swap="innerHTML">Load</button>`); });
});
// ------------------------------------
// HTMX - Triggers
// ------------------------------------
describe("HTMX - Triggers", () => {
    it("hx-trigger click", () => { assert.strictEqual(render(Div().setHtmx(hx("/click", { trigger: "click" }))), `<div hx-get="/click" hx-trigger="click"></div>`); });
    it("hx-trigger load", () => { assert.strictEqual(render(Div().setHtmx(hx("/load", { trigger: "load" }))), `<div hx-get="/load" hx-trigger="load"></div>`); });
    it("hx-trigger revealed", () => { assert.strictEqual(render(Div().setHtmx(hx("/lazy", { trigger: "revealed" }))), `<div hx-get="/lazy" hx-trigger="revealed"></div>`); });
    it("hx-trigger with delay", () => { assert.strictEqual(render(Input().setHtmx(hx("/search", { trigger: "keyup delay:500ms" }))), `<input hx-get="/search" hx-trigger="keyup delay:500ms">`); });
    it("hx-trigger polling", () => { assert.strictEqual(render(Div().setHtmx(hx("/poll", { trigger: "every 5s" }))), `<div hx-get="/poll" hx-trigger="every 5s"></div>`); });
});
// ------------------------------------
// HTMX - URL Manipulation
// ------------------------------------
describe("HTMX - URL Manipulation", () => {
    it("hx-push-url", () => { assert.strictEqual(render(A("Page").setHtmx(hx("/page", { pushUrl: true }))), `<a hx-get="/page" hx-push-url="true">Page</a>`); });
    it("hx-replace-url", () => { assert.strictEqual(render(Button("Replace").setHtmx(hx("/new", { replaceUrl: true }))), `<button hx-get="/new" hx-replace-url="true">Replace</button>`); });
});
// ------------------------------------
// HTMX - Form Handling
// ------------------------------------
describe("HTMX - Form Handling", () => {
    it("hx-encoding multipart", () => { assert.strictEqual(render(Form().setHtmx(hx("/upload", { method: "post", encoding: "multipart/form-data" }))), `<form hx-post="/upload" hx-encoding="multipart/form-data"></form>`); });
    it("hx-validate", () => { assert.strictEqual(render(Form().setHtmx(hx("/submit", { method: "post", validate: true }))), `<form hx-post="/submit" hx-validate="true"></form>`); });
    it("hx-vals object", () => { assert.strictEqual(render(Button("Send").setHtmx(hx("/api", { vals: { key: "value", num: 42 } }))), `<button hx-get="/api" hx-vals="{&quot;key&quot;:&quot;value&quot;,&quot;num&quot;:42}">Send</button>`); });
    it("hx-include", () => { assert.strictEqual(render(Button("Submit").setHtmx(hx("/api", { method: "post", include: "#extra-field" }))), `<button hx-post="/api" hx-include="#extra-field">Submit</button>`); });
});
// ------------------------------------
// HTMX - Misc Attributes
// ------------------------------------
describe("HTMX - Misc Attributes", () => {
    it("hx-confirm", () => { assert.strictEqual(render(Button("Delete").setHtmx(hx("/delete", { method: "delete", confirm: "Are you sure?" }))), `<button hx-delete="/delete" hx-confirm="Are you sure?">Delete</button>`); });
    it("hx-indicator", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/slow", { indicator: "#spinner" }))), `<button hx-get="/slow" hx-indicator="#spinner">Load</button>`); });
    it("hx-headers", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Custom": "value" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Custom&quot;:&quot;value&quot;}"></div>`); });
    it("hx-select", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { select: "#content" }))), `<div hx-get="/page" hx-select="#content"></div>`); });
    it("hx-sync", () => { assert.strictEqual(render(Button("Click").setHtmx(hx("/api", { sync: "closest form:abort" }))), `<button hx-get="/api" hx-sync="closest form:abort">Click</button>`); });
});
// ------------------------------------
// HTMX - Morph & Short Swap Styles
// ------------------------------------
describe("HTMX - Morph & Short Swap Styles", () => {
    it("hx-swap outerMorph", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "outerMorph" }))), `<div hx-get="/data" hx-swap="outerMorph"></div>`); });
    it("hx-swap innerMorph", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "innerMorph" }))), `<div hx-get="/data" hx-swap="innerMorph"></div>`); });
    it("hx-swap before (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "before" }))), `<div hx-get="/data" hx-swap="before"></div>`); });
    it("hx-swap after (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "after" }))), `<div hx-get="/data" hx-swap="after"></div>`); });
    it("hx-swap prepend (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "prepend" }))), `<div hx-get="/data" hx-swap="prepend"></div>`); });
    it("hx-swap append (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "append" }))), `<div hx-get="/data" hx-swap="append"></div>`); });
    it("hx-swap outerMorph with modifier", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "outerMorph transition:true" }))), `<div hx-get="/data" hx-swap="outerMorph transition:true"></div>`); });
});
// ------------------------------------
// HTMX - Config
// ------------------------------------
describe("HTMX - Config", () => {
    it("hx-config with object", () => { assert.strictEqual(render(Button("Upload").setHtmx(hx("/upload", { method: "post", config: { timeout: 0 } }))), `<button hx-post="/upload" hx-config="{&quot;timeout&quot;:0}">Upload</button>`); });
    it("hx-config with string", () => { assert.strictEqual(render(Button("Fetch").setHtmx(hx("/api", { config: '{"mode":"cors"}' }))), `<button hx-get="/api" hx-config="{&quot;mode&quot;:&quot;cors&quot;}">Fetch</button>`); });
    it("hx-config with full options", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { config: { timeout: 120000, credentials: true, mode: "cors" } }))), `<div hx-get="/api" hx-config="{&quot;timeout&quot;:120000,&quot;credentials&quot;:true,&quot;mode&quot;:&quot;cors&quot;}"></div>`); });
});
// ------------------------------------
// HTMX - Attribute Escaping (Security)
// ------------------------------------
describe("HTMX - Attribute Escaping", () => {
    it("hx-headers escapes double quotes in JSON", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Token": 'a"b' } }))), `<div hx-get="/api" hx-headers="{&quot;X-Token&quot;:&quot;a\\&quot;b&quot;}"></div>`); });
    it("hx-headers escapes single quotes", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Name": "O'Brien" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Name&quot;:&quot;O&#39;Brien&quot;}"></div>`); });
    it("hx-headers escapes angle brackets", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Data": "<script>alert(1)</script>" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Data&quot;:&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;}"></div>`); });
    it("hx-headers escapes ampersand", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Q": "a&b" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Q&quot;:&quot;a&amp;b&quot;}"></div>`); });
    it("hx-vals object escapes special chars", () => { assert.strictEqual(render(Button("Send").setHtmx(hx("/api", { vals: { name: "O'Brien & <Co>" } }))), `<button hx-get="/api" hx-vals="{&quot;name&quot;:&quot;O&#39;Brien &amp; &lt;Co&gt;&quot;}">Send</button>`); });
    it("hx-config object escapes special chars", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { config: { mode: "no-cors" } }))), `<div hx-get="/api" hx-config="{&quot;mode&quot;:&quot;no-cors&quot;}"></div>`); });
});
// ------------------------------------
// HTMX - Optimistic & Preload
// ------------------------------------
describe("HTMX - Optimistic & Preload", () => {
    it("hx-optimistic", () => { assert.strictEqual(render(Button("Like").setHtmx(hx("/like", { method: "post", optimistic: true }))), `<button hx-post="/like" hx-optimistic>Like</button>`); });
    it("hx-preload boolean", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { preload: true }))), `<div hx-get="/page" hx-preload></div>`); });
    it("hx-preload mouseover", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { preload: "mouseover" }))), `<div hx-get="/page" hx-preload="mouseover"></div>`); });
    it("hx-preload mousedown", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { preload: "mousedown" }))), `<div hx-get="/page" hx-preload="mousedown"></div>`); });
});
// ------------------------------------
// HTMX - Status Code Handling
// ------------------------------------
describe("HTMX - Status Code Handling", () => {
    it("hx-status with string config", () => { assert.strictEqual(render(Form().setHtmx(hx("/users", { method: "post", status: { "5xx": "swap:none" } }))), `<form hx-post="/users" hx-status:5xx="swap:none"></form>`); });
    it("hx-status with object config", () => {
        assert.strictEqual(render(Form().setHtmx(hx("/users", { method: "post", status: {
                422: { swap: "innerHTML", target: "#errors" },
            } }))), `<form hx-post="/users" hx-status:422="swap:innerHTML target:#errors"></form>`);
    });
    it("hx-status multiple codes", () => {
        assert.strictEqual(render(Form().setHtmx(hx("/users", { method: "post", status: {
                422: { swap: "innerHTML", target: "#errors" },
                "5xx": { swap: "none" },
            } }))), `<form hx-post="/users" hx-status:422="swap:innerHTML target:#errors" hx-status:5xx="swap:none"></form>`);
    });
    it("hx-status with transition", () => {
        assert.strictEqual(render(Div().setHtmx(hx("/page", { status: {
                200: { swap: "outerMorph", transition: true },
            } }))), `<div hx-get="/page" hx-status:200="swap:outerMorph transition:true"></div>`);
    });
});
// ------------------------------------
// HTMX - Complex Examples
// ------------------------------------
describe("HTMX - Complex Examples", () => {
    it("Full HTMX form", () => {
        assert.strictEqual(render(Form([
            Input().setType("text").setName("search").setPlaceholder("Search..."),
            Button("Search").setType("submit"),
        ]).setHtmx(hx("/search", {
            method: "post",
            target: "#results",
            swap: "innerHTML",
            trigger: "click",
            indicator: "#loading",
        }))), `<form hx-post="/search" hx-target="#results" hx-swap="innerHTML" hx-trigger="click" hx-indicator="#loading"><input type="text" name="search" placeholder="Search...">\n<button type="submit">Search</button></form>`);
    });
    it("Infinite scroll", () => {
        assert.strictEqual(render(Div()
            .setId("feed")
            .setHtmx(hx("/feed?page=2", {
            trigger: "revealed",
            swap: "beforeend",
        }))), `<div id="feed" hx-get="/feed?page=2" hx-swap="beforeend" hx-trigger="revealed"></div>`);
    });
    it("Live search", () => {
        assert.strictEqual(render(Input()
            .setType("search")
            .setName("q")
            .setPlaceholder("Search...")
            .setHtmx(hx("/search", {
            trigger: "keyup delay:300ms",
            target: "#results",
        }))), `<input type="search" name="q" placeholder="Search..." hx-get="/search" hx-target="#results" hx-trigger="keyup delay:300ms">`);
    });
});
// ------------------------------------
// HTMX Helper Functions
// ------------------------------------
describe("HTMX Helpers", () => {
    it("id() helper", () => { assert.strictEqual(id("my-id"), "#my-id"); });
    it("clss() helper", () => { assert.strictEqual(clss("my-class"), ".my-class"); });
});
// ------------------------------------
// setHtmx Overloads
// ------------------------------------
describe("setHtmx Overloads", () => {
    it("setHtmx with endpoint string", () => { assert.strictEqual(render(Div().setHtmx("/api/data")), `<div hx-get="/api/data"></div>`); });
    it("setHtmx with endpoint and options", () => { assert.strictEqual(render(Button("Go").setHtmx("/api/submit", { method: "post", target: "#result" })), `<button hx-post="/api/submit" hx-target="#result">Go</button>`); });
    it("setHtmx with endpoint and swap", () => { assert.strictEqual(render(Div().setHtmx("/api/data", { swap: "outerHTML" })), `<div hx-get="/api/data" hx-swap="outerHTML"></div>`); });
    it("setHtmx with pre-built HTMX object", () => { assert.strictEqual(render(Div().setHtmx(hx("/api/data", { method: "post" }))), `<div hx-post="/api/data"></div>`); });
});
// ------------------------------------
// hx Shorthand Methods
// ------------------------------------
describe("hx Shorthand Methods", () => {
    it("hxGet basic", () => { assert.strictEqual(render(Button("Load").hxGet("/api/items")), `<button hx-get="/api/items">Load</button>`); });
    it("hxGet with options", () => { assert.strictEqual(render(Button("Load").hxGet("/api/items", { target: "#list", swap: "innerHTML" })), `<button hx-get="/api/items" hx-target="#list" hx-swap="innerHTML">Load</button>`); });
    it("hxPost", () => { assert.strictEqual(render(Button("Save").hxPost("/api/save")), `<button hx-post="/api/save">Save</button>`); });
    it("hxPost with options", () => { assert.strictEqual(render(Button("Save").hxPost("/api/save", { target: "#result", trigger: "click" })), `<button hx-post="/api/save" hx-target="#result" hx-trigger="click">Save</button>`); });
    it("hxPut", () => { assert.strictEqual(render(Button("Update").hxPut("/api/update")), `<button hx-put="/api/update">Update</button>`); });
    it("hxPatch", () => { assert.strictEqual(render(Button("Patch").hxPatch("/api/patch")), `<button hx-patch="/api/patch">Patch</button>`); });
    it("hxDelete", () => { assert.strictEqual(render(Button("Remove").hxDelete("/api/item/1")), `<button hx-delete="/api/item/1">Remove</button>`); });
    it("hxDelete with confirm", () => { assert.strictEqual(render(Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" })), `<button hx-delete="/api/item/1" hx-confirm="Sure?">Remove</button>`); });
    it("hxGet chained with other methods", () => { assert.strictEqual(render(Div("Content").setId("box").hxGet("/api/refresh", { swap: "outerHTML" })), `<div id="box" hx-get="/api/refresh" hx-swap="outerHTML">Content</div>`); });
});
//# sourceMappingURL=htmx.test.js.map