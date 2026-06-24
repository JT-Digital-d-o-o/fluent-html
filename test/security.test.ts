import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render,
  Div, P, Span, Script, Style, Button,
} from "../src/index.js";
import { defineIds } from "../src/ids.js";
import { hx } from "../src/htmx.js";
import { escapeJs } from "../src/render/escape.js";

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

// ------------------------------------
// Behavior JS injection (D-05)
// ------------------------------------

describe("escapeJs", () => {
  it("escapes backslash and single quote", () => {
    assert.strictEqual(escapeJs("it's a \\ test"), "it\\'s a \\\\ test");
  });
  it("escapes line terminators that break JS string literals", () => {
    assert.strictEqual(escapeJs("a\nb\rc"), "a\\nb\\rc");
  });
});

describe("Behavior JS injection prevention", () => {
  const ids = defineIds(["panel"] as const);

  it("escapes a single quote in a toggleClass class (no JS break-out)", () => {
    const html = render(Button("x").behavior("toggleClass", { target: ids.panel, class: "it's-active" }));
    // escapeJs turns ' into \' ; the renderer then HTML-escapes ' to &#39;, so the
    // safe form carries the backslash: it\&#39;s . Without the fix it would be it&#39;s .
    assert.ok(html.includes("it\\&#39;s-active"), html);
  });

  it("neutralizes a class crafted to inject JS", () => {
    const evil = "x'); alert(document.cookie); ('";
    const html = render(Button("x").behavior("toggleClass", { target: ids.panel, class: evil }));
    // Every user ' is backslash-escaped (\&#39;), so the unescaped break-out form
    // x&#39;); — which would close the JS string and inject — never appears.
    assert.ok(!html.includes("x&#39;);"), html);
    assert.ok(html.includes("x\\&#39;);"), html);
  });

  it("escapes the interpolated target id too", () => {
    const html = render(Button("x").behavior("toggle", { target: "a'b" as unknown as typeof ids.panel }));
    assert.ok(html.includes("getElementById(&#39;a\\&#39;b&#39;)"), html);
  });
});

// ------------------------------------
// hx-status key injection (D-05)
// ------------------------------------

describe("hx-status key injection prevention", () => {
  it("renders a valid numeric status key", () => {
    assert.ok(render(Div().setHtmx(hx("/x", { status: { 404: "swap:none" } }))).includes('hx-status:404="swap:none"'));
  });

  it("renders a valid Nxx wildcard key", () => {
    assert.ok(render(Div().setHtmx(hx("/x", { status: { "5xx": "swap:none" } }))).includes('hx-status:5xx="swap:none"'));
  });

  it("throws at render on a malformed status key (attribute-name injection)", () => {
    const evilOpts = { status: { "404 onload=alert(1)": "swap:none" } } as unknown as Parameters<typeof hx>[1];
    assert.throws(() => render(Div().setHtmx(hx("/x", evilOpts))), /Invalid hx-status key/);
  });
});

// ------------------------------------
// toggle() boolean-attribute name injection (A-01)
// ------------------------------------

describe("toggle() name injection prevention", () => {
  it("renders a valid boolean attribute bare (never `=\"true\"`)", () => {
    const html = render(Div().toggle("hidden"));
    assert.ok(html.includes(" hidden>"));
    assert.ok(!html.includes('hidden="'));
  });

  it("throws at render on a toggle name that would break out of the tag", () => {
    // The closed BooleanAttribute union blocks this at compile time; the `as never`
    // mimics an untyped (JS / `as any`) caller, which the emitter guard must reject.
    const evil = 'x" onmouseover="alert(1)' as never;
    assert.throws(() => render(Div().toggle(evil)), /Invalid boolean attribute name/);
  });

  it("throws on a toggle name with whitespace (smuggled second attribute)", () => {
    assert.throws(() => render(Div().toggle('checked autofocus' as never)), /Invalid boolean attribute name/);
  });
});
