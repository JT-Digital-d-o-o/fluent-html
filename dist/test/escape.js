import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, escapeAttr, htmlEscapes } from "../src/render/escape.js";
describe("escapeHtml", () => {
    it("escapes ampersand", () => {
        assert.equal(escapeHtml("a&b"), "a&amp;b");
    });
    it("escapes less-than", () => {
        assert.equal(escapeHtml("<div>"), "&lt;div&gt;");
    });
    it("escapes greater-than", () => {
        assert.equal(escapeHtml("a>b"), "a&gt;b");
    });
    it("escapes double quotes", () => {
        assert.equal(escapeHtml('say "hello"'), "say &quot;hello&quot;");
    });
    it("escapes single quotes", () => {
        assert.equal(escapeHtml("it's"), "it&#39;s");
    });
    it("returns empty string unchanged", () => {
        assert.equal(escapeHtml(""), "");
    });
    it("returns safe string unchanged (fast path)", () => {
        const safe = "Hello World 123";
        assert.equal(escapeHtml(safe), safe);
        // Fast path: same reference returned
        assert.equal(escapeHtml(safe) === safe, true);
    });
    it("escapes all 5 chars in mixed content", () => {
        assert.equal(escapeHtml(`<div class="x" data-name='y'>&`), `&lt;div class=&quot;x&quot; data-name=&#39;y&#39;&gt;&amp;`);
    });
    it("handles unicode content without escaping", () => {
        const unicode = "日本語 🎉 café";
        assert.equal(escapeHtml(unicode), unicode);
    });
    it("handles special chars at start", () => {
        assert.equal(escapeHtml("&start"), "&amp;start");
    });
    it("handles special chars at end", () => {
        assert.equal(escapeHtml("end&"), "end&amp;");
    });
    it("handles consecutive special chars", () => {
        assert.equal(escapeHtml("<<>>"), "&lt;&lt;&gt;&gt;");
    });
    it("handles only special chars", () => {
        assert.equal(escapeHtml("&<>\"'"), "&amp;&lt;&gt;&quot;&#39;");
    });
    it("handles long string with one escape at the end", () => {
        const long = "a".repeat(1000) + "&";
        assert.equal(escapeHtml(long), "a".repeat(1000) + "&amp;");
    });
});
describe("escapeAttr", () => {
    it("delegates to escapeHtml", () => {
        assert.equal(escapeAttr('<"test">'), "&lt;&quot;test&quot;&gt;");
    });
});
describe("htmlEscapes map", () => {
    it("contains all 5 escape mappings", () => {
        assert.equal(Object.keys(htmlEscapes).length, 5);
        assert.equal(htmlEscapes["&"], "&amp;");
        assert.equal(htmlEscapes["<"], "&lt;");
        assert.equal(htmlEscapes[">"], "&gt;");
        assert.equal(htmlEscapes['"'], "&quot;");
        assert.equal(htmlEscapes["'"], "&#39;");
    });
});
//# sourceMappingURL=escape.js.map