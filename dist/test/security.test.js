import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Div, P, Span, Script, Style, } from "../src/index.js";
// ------------------------------------
// XSS Prevention
// ------------------------------------
describe("XSS Prevention", () => {
    it("Escapes < and >", () => { assert.strictEqual(render(Div("<script>alert('xss')</script>")), `<div>&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</div>`); });
    it("Escapes quotes", () => { assert.strictEqual(render(Div(`He said "hello" and 'goodbye'`)), `<div>He said &quot;hello&quot; and &#39;goodbye&#39;</div>`); });
    it("Escapes ampersand", () => { assert.strictEqual(render(Div("Tom & Jerry")), `<div>Tom &amp; Jerry</div>`); });
    it("Escapes in attributes", () => { assert.strictEqual(render(Div().addAttribute("data-value", `<script>"xss"</script>`)), `<div data-value="&lt;script&gt;&quot;xss&quot;&lt;/script&gt;"></div>`); });
    it("Escapes in class", () => { assert.strictEqual(render(Div().setClass(`"><script>alert(1)</script>`)), `<div class="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"></div>`); });
    it("Escapes in style", () => { assert.strictEqual(render(Div().setStyle(`color: red" onclick="alert(1)`)), `<div style="color: red&quot; onclick=&quot;alert(1)"></div>`); });
    it("Nested content escaped", () => { assert.strictEqual(render(Div([P("<b>bold</b>"), Span("&amp;")])), `<div><p>&lt;b&gt;bold&lt;/b&gt;</p>\n<span>&amp;amp;</span></div>`); });
    it("Script content NOT escaped", () => { assert.strictEqual(render(Script("if (x < 10 && y > 5) { return '<tag>'; }")), "<script>if (x < 10 && y > 5) { return '<tag>'; }</script>"); });
    it("Style content NOT escaped", () => { assert.strictEqual(render(Style(`.class > .child { content: "a & b"; }`)), `<style>.class > .child { content: "a & b"; }</style>`); });
});
//# sourceMappingURL=security.test.js.map