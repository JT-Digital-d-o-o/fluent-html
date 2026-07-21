import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render,
  Div, P, Span, Script, Style, Button,
  A, Img, Form, ObjectEl, Video, Blockquote,
  sanitizeUrl,
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

describe("Behavior injection prevention (v4: attributes-only, no JS emission)", () => {
  const ids = defineIds(["panel"] as const);

  it("emits zero inline JS — values ride plain data attributes with HTML escaping only", () => {
    const evil = "x'); alert(document.cookie); ('";
    const html = render(Button("x").behavior("clipboard", { value: evil }));
    assert.ok(!html.includes("hx-on"), html);
    assert.ok(html.includes(`data-behavior-clipboard-value="x&#39;); alert(document.cookie); (&#39;"`), html);
  });

  it("class options reject non-token payloads at render (injection can't even ride the wire)", () => {
    assert.throws(
      () => render(Button("x").behavior("toggleClass", { target: ids.panel, class: "x'); alert(1); ('" })),
      /single CSS class token/,
    );
  });

  it("rejects a raw string smuggled where an Id is required", () => {
    assert.throws(
      () => render(Button("x").behavior("toggle", { target: "a'b" as unknown as typeof ids.panel })),
      /expects an Id/,
    );
  });

  it("blocks hand-written data-behavior-unknown-adjacent quoting from breaking the attribute", () => {
    const html = render(Button("x").behavior("clipboard", { value: `"><script>alert(1)</script>` }));
    assert.ok(!html.includes("<script>alert(1)"), html);
    assert.ok(html.includes("&quot;&gt;&lt;script&gt;"), html);
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

// ------------------------------------
// setAria escape-arm key injection (A-02)
// ------------------------------------

describe("setAria key injection prevention", () => {
  it("rejects a malicious aria-* escape key at set time", () => {
    // The `aria-${string}` escape arm types this as valid, but validateAttributeKey
    // (run inside setAria) rejects the smuggled attribute/handler.
    assert.throws(
      () => Div().setAria({ 'aria-x" onmouseover="alert(1)': "y" } as never),
      /Invalid attribute key/,
    );
  });
});

// ------------------------------------
// A-006 — escape/injection holes (6.0.1)
// ------------------------------------

describe("hx-preload string injection prevention (A-006)", () => {
  it("escapes a preload string crafted to break out of the attribute", () => {
    const html = render(Div().setHtmx(hx("/p", { preload: 'mouseover" onload="alert(1)' as never })));
    assert.ok(!html.includes('" onload="'), html);
    assert.ok(html.includes(`hx-preload="mouseover&quot; onload=&quot;alert(1)"`), html);
  });

  it("leaves a typed preload value byte-identical", () => {
    assert.strictEqual(render(Div().setHtmx(hx("/p", { preload: "mouseover" }))), `<div hx-get="/p" hx-preload="mouseover"></div>`);
  });
});

describe("setDataAttrs key injection prevention (A-006)", () => {
  it("throws on a data-* key that would break out of the tag", () => {
    assert.throws(() => render(Div().setDataAttrs({ ['x" onmouseover="alert(1)']: "v" } as never)), /Invalid attribute key/);
  });

  it("emits a well-formed key unchanged", () => {
    assert.strictEqual(render(Div().setDataAttrs({ userId: "123" })), `<div data-user-id="123"></div>`);
  });
});

describe("script break-out prevention (A-006)", () => {
  it("neutralizes a bare </script closer", () => {
    assert.ok(!render(Script("x='</script>'")).includes("</script>'"));
  });

  it("leaves benign script byte-identical", () => {
    assert.strictEqual(render(Script("if (x < 10 && y > 5) return;")), "<script>if (x < 10 && y > 5) return;</script>");
  });

  it("does NOT mangle benign JS containing <script / <!-- / <scripts (closer-only sanitizer)", () => {
    // These contain the double-escaped-state openers but are legal JS; a `\` before them would
    // corrupt the regex / be a syntax error (the reverted F-A-900 footgun). Must be byte-identical.
    assert.strictEqual(render(Script("const re = /<script/;")), "<script>const re = /<script/;</script>");
    assert.strictEqual(render(Script("x = 1 <!-- legacy\n;")), "<script>x = 1 <!-- legacy\n;</script>");
    assert.strictEqual(render(Script("if (count<scripts) go();")), "<script>if (count<scripts) go();</script>");
  });
});

describe("URL scheme sanitization on typed setters (XSS-1)", () => {
  it("neutralizes javascript: on href/src/action to about:blank", () => {
    assert.strictEqual(render(A("x").setHref("javascript:alert(1)")), `<a href="about:blank">x</a>`);
    assert.strictEqual(render(Img().setSrc("javascript:alert(1)")), `<img src="about:blank">`);
    assert.strictEqual(render(Form().setAction("javascript:alert(1)")), `<form action="about:blank"></form>`);
  });

  it("blocks obfuscated schemes (case, embedded tab, leading whitespace, vbscript)", () => {
    assert.ok(render(A("x").setHref("JaVaScript:alert(1)")).includes(`href="about:blank"`));
    assert.ok(render(A("x").setHref("java\tscript:alert(1)")).includes(`href="about:blank"`));
    assert.ok(render(A("x").setHref("   javascript:alert(1)")).includes(`href="about:blank"`));
    assert.ok(render(A("x").setHref("vbscript:msgbox(1)")).includes(`href="about:blank"`));
  });

  it("blocks scriptable data: URLs (text/html, image/svg+xml) but allows raster/media", () => {
    assert.ok(render(A("x").setHref("data:text/html,<script>alert(1)</script>")).includes(`href="about:blank"`));
    assert.ok(render(Img().setSrc("data:image/svg+xml,<svg onload=alert(1)>")).includes(`src="about:blank"`));
    assert.strictEqual(render(Img().setSrc("data:image/png;base64,iVBOR")), `<img src="data:image/png;base64,iVBOR">`);
  });

  it("covers data / poster / cite as well", () => {
    assert.ok(render(ObjectEl().setData("javascript:alert(1)")).includes(`data="about:blank"`));
    assert.ok(render(Video().setPoster("javascript:alert(1)")).includes(`poster="about:blank"`));
    assert.ok(render(Blockquote("q").setCite("javascript:alert(1)")).includes(`cite="about:blank"`));
  });

  it("leaves safe URLs byte-identical (relative, https, mailto, tel, fragment, protocol-relative)", () => {
    assert.strictEqual(render(A("x").setHref("/dashboard")), `<a href="/dashboard">x</a>`);
    assert.strictEqual(render(A("x").setHref("https://example.com/a?b=c:d")), `<a href="https://example.com/a?b=c:d">x</a>`);
    assert.strictEqual(render(A("x").setHref("mailto:a@b.com")), `<a href="mailto:a@b.com">x</a>`);
    assert.strictEqual(render(A("x").setHref("tel:+123")), `<a href="tel:+123">x</a>`);
    assert.strictEqual(render(A("x").setHref("#section")), `<a href="#section">x</a>`);
    assert.strictEqual(render(A("x").setHref("//cdn.example.com/a.js")), `<a href="//cdn.example.com/a.js">x</a>`);
  });

  it("does NOT sanitize the untyped addAttribute escape hatch (explicit opt-out)", () => {
    assert.strictEqual(render(A("x").addAttribute("href", "javascript:alert(1)")), `<a href="javascript:alert(1)">x</a>`);
  });

  it("still escapes attribute breakout inside an allowed value", () => {
    assert.strictEqual(
      render(A("x").setHref('/a"><img src=x onerror=alert(1)>')),
      `<a href="/a&quot;&gt;&lt;img src=x onerror=alert(1)&gt;">x</a>`,
    );
  });

  it("sanitizeUrl is exported and usable standalone", () => {
    assert.strictEqual(sanitizeUrl("javascript:alert(1)"), "about:blank");
    assert.strictEqual(sanitizeUrl("/relative/ok"), "/relative/ok");
    assert.strictEqual(sanitizeUrl("https://ok.example"), "https://ok.example");
  });
});
