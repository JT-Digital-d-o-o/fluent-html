import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Button, Input } from "../src/index.js";
import { defineIds } from "../src/ids.js";
// Single quotes become &#39; in rendered attribute values (standard HTML escaping).
// Browsers decode this before executing hx-on:* handlers, so it works correctly.
const q = "&#39;";
describe("behavior()", () => {
    const ids = defineIds(["panel", "banner", "search", "section"]);
    it("toggle — emits hx-on:click with classList.toggle", () => {
        const html = render(Button("Toggle").behavior("toggle", { target: ids.panel }));
        assert.ok(html.includes(`hx-on:click="document.getElementById(${q}panel${q}).classList.toggle(${q}hidden${q})"`));
    });
    it("toggleClass — emits hx-on:click with classList.toggle(className)", () => {
        const html = render(Button("Fade").behavior("toggleClass", { target: ids.panel, class: "opacity-50" }));
        assert.ok(html.includes(`hx-on:click="document.getElementById(${q}panel${q}).classList.toggle(${q}opacity-50${q})"`));
    });
    it("remove — emits hx-on:click with .remove()", () => {
        const html = render(Button("Dismiss").behavior("remove", { target: ids.banner }));
        assert.ok(html.includes(`hx-on:click="document.getElementById(${q}banner${q}).remove()"`));
    });
    it("clipboard — emits hx-on:click with navigator.clipboard.writeText", () => {
        const html = render(Button("Copy").behavior("clipboard", { value: "sk-abc123" }));
        assert.ok(html.includes(`hx-on:click="navigator.clipboard.writeText(${q}sk-abc123${q})"`));
    });
    it("disable — emits hx-on:click with this.disabled=true", () => {
        const html = render(Button("Submit").behavior("disable"));
        assert.ok(html.includes(`hx-on:click="this.disabled=true"`));
    });
    it("focus — emits hx-on:click with .focus()", () => {
        const html = render(Button("Go").behavior("focus", { target: ids.search }));
        assert.ok(html.includes(`hx-on:click="document.getElementById(${q}search${q}).focus()"`));
    });
    it("scrollTo — emits hx-on:click with scrollIntoView", () => {
        const html = render(Button("Top").behavior("scrollTo", { target: ids.section }));
        assert.ok(html.includes(`hx-on:click="document.getElementById(${q}section${q}).scrollIntoView({behavior:${q}smooth${q}})"`));
    });
    it("selectAll — emits hx-on:focus with this.select()", () => {
        const html = render(Input().behavior("selectAll"));
        assert.ok(html.includes(`hx-on:focus="this.select()"`));
    });
    it("multiple behaviors on same event — appends with semicolon", () => {
        const html = render(Button("Delete")
            .behavior("disable")
            .behavior("remove", { target: ids.banner }));
        assert.ok(html.includes(`hx-on:click="this.disabled=true;document.getElementById(${q}banner${q}).remove()"`));
    });
    it("multiple behaviors on different events — separate attributes", () => {
        const html = render(Input()
            .behavior("selectAll")
            .behavior("disable"));
        assert.ok(html.includes(`hx-on:focus="this.select()"`));
        assert.ok(html.includes(`hx-on:click="this.disabled=true"`));
    });
});
//# sourceMappingURL=behavior.test.js.map