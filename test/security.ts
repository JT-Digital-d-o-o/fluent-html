import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render, renderWithNonce, Raw,
  Div, Span, Script, Style, Button, Input, P, El,
} from "../src/index.js";

// ------------------------------------
// XSS via Text Content
// ------------------------------------

describe("XSS — Text Content", () => {
  it("Escapes script tags in text", () => {
    assert.strictEqual(
      render(Div("<script>alert('xss')</script>")),
      `<div>&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</div>`
    );
  });

  it("Escapes nested injection attempts", () => {
    assert.strictEqual(
      render(Div(Span("<img src=x onerror=alert(1)>"))),
      `<div><span>&lt;img src=x onerror=alert(1)&gt;</span></div>`
    );
  });

  it("Escapes null bytes and control chars in text", () => {
    const result = render(Div("before\x00after"));
    assert.ok(!result.includes('\x00') || result === '<div>before\x00after</div>');
  });
});

// ------------------------------------
// XSS via Attribute Values
// ------------------------------------

describe("XSS — Attribute Values", () => {
  it("Escapes quotes in attribute values", () => {
    assert.strictEqual(
      render(Div().addAttribute("data-value", `" onmouseover="alert(1)`)),
      `<div data-value="&quot; onmouseover=&quot;alert(1)"></div>`
    );
  });

  it("Escapes angle brackets in attribute values", () => {
    assert.strictEqual(
      render(Div().addAttribute("data-value", `<script>alert(1)</script>`)),
      `<div data-value="&lt;script&gt;alert(1)&lt;/script&gt;"></div>`
    );
  });

  it("Escapes in class attribute", () => {
    assert.strictEqual(
      render(Div().setClass(`"><script>alert(1)</script>`)),
      `<div class="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"></div>`
    );
  });

  it("Escapes in style attribute", () => {
    assert.strictEqual(
      render(Div().setStyle(`color: red" onclick="alert(1)`)),
      `<div style="color: red&quot; onclick=&quot;alert(1)"></div>`
    );
  });

  it("Escapes in id attribute", () => {
    assert.strictEqual(
      render(Div().setId(`foo" onclick="alert(1)`)),
      `<div id="foo&quot; onclick=&quot;alert(1)"></div>`
    );
  });
});

// ------------------------------------
// XSS via Attribute Keys
// ------------------------------------

describe("XSS — Attribute Keys", () => {
  it("Blocks onclick attribute", () => {
    assert.throws(
      () => Div().addAttribute("onclick", "alert(1)"),
      /Event handler attribute "onclick" is blocked/
    );
  });

  it("Blocks onerror attribute", () => {
    assert.throws(
      () => Input().addAttribute("onerror", "alert(1)"),
      /Event handler attribute "onerror" is blocked/
    );
  });

  it("Blocks onload attribute", () => {
    assert.throws(
      () => Div().addAttribute("onload", "alert(1)"),
      /Event handler attribute "onload" is blocked/
    );
  });

  it("Blocks onmouseover attribute", () => {
    assert.throws(
      () => Div().addAttribute("onmouseover", "alert(1)"),
      /Event handler attribute "onmouseover" is blocked/
    );
  });

  it("Rejects attribute key with quote (context breakout)", () => {
    assert.throws(
      () => Div().addAttribute('" onmouseover="x', "y"),
      /Invalid attribute key/
    );
  });

  it("Rejects attribute key with angle brackets", () => {
    assert.throws(
      () => Div().addAttribute("<script>", "y"),
      /Invalid attribute key/
    );
  });

  it("Rejects attribute key with spaces", () => {
    assert.throws(
      () => Div().addAttribute("data value", "y"),
      /Invalid attribute key/
    );
  });

  it("Allows data-custom attributes", () => {
    assert.strictEqual(
      render(Div().addAttribute("data-custom", "safe")),
      `<div data-custom="safe"></div>`
    );
  });

  it("Allows hx-get attributes", () => {
    assert.strictEqual(
      render(Div().addAttribute("hx-get", "/api")),
      `<div hx-get="/api"></div>`
    );
  });

  it("Allows aria-label attributes", () => {
    assert.strictEqual(
      render(Div().addAttribute("aria-label", "Close")),
      `<div aria-label="Close"></div>`
    );
  });
});

// ------------------------------------
// Script/Style Content Injection
// ------------------------------------

describe("Script/Style Injection", () => {
  it("Escapes </script> inside Script() text content", () => {
    const result = render(Script("var x = '</script><script>alert(1)</script>'"));
    assert.ok(!result.includes('</script><script>'), "Should not contain raw </script> injection");
    assert.ok(result.startsWith('<script>'));
    assert.ok(result.endsWith('</script>'));
  });

  it("Escapes </script> case-insensitively", () => {
    const result = render(Script("var x = '</SCRIPT><script>alert(1)</script>'"));
    assert.ok(!result.includes('</SCRIPT>'), "Should escape case-insensitive </SCRIPT>");
  });

  it("Escapes </style> inside Style() text content", () => {
    const result = render(Style(".x { content: '</style><script>alert(1)</script>' }"));
    assert.ok(!result.includes('</style><script>'), "Should not contain raw </style> injection");
    assert.ok(result.startsWith('<style>'));
    assert.ok(result.endsWith('</style>'));
  });

  it("Escapes </style> case-insensitively", () => {
    const result = render(Style(".x { content: '</STYLE>' }"));
    assert.ok(!result.includes('</STYLE>'), "Should escape case-insensitive </STYLE>");
  });

  it("Escapes </script> inside Raw() within a script element", () => {
    const result = render(El("script", Raw("</script><script>alert(1)</script>")));
    assert.ok(!result.includes('</script><script>'), "Raw inside script should still sanitize closing tags");
  });

  it("Escapes </style> inside Raw() within a style element", () => {
    const result = render(El("style", Raw("</style><script>alert(1)</script>")));
    assert.ok(!result.includes('</style><script>'), "Raw inside style should still sanitize closing tags");
  });

  it("Preserves valid script content", () => {
    assert.strictEqual(
      render(Script("if (x < 10 && y > 5) { return '<tag>'; }")),
      "<script>if (x < 10 && y > 5) { return '<tag>'; }</script>"
    );
  });

  it("Preserves valid style content", () => {
    assert.strictEqual(
      render(Style(`.class > .child { content: "a & b"; }`)),
      `<style>.class > .child { content: "a & b"; }</style>`
    );
  });
});

// ------------------------------------
// Prototype Pollution
// ------------------------------------

describe("Prototype Pollution", () => {
  it("Blocks __proto__ as attribute key", () => {
    assert.throws(
      () => Div().addAttribute("__proto__", "{}"),
      /prototype pollution/
    );
  });

  it("Blocks constructor as attribute key", () => {
    assert.throws(
      () => Div().addAttribute("constructor", "{}"),
      /prototype pollution/
    );
  });

  it("Blocks prototype as attribute key", () => {
    assert.throws(
      () => Div().addAttribute("prototype", "{}"),
      /prototype pollution/
    );
  });
});

// ------------------------------------
// HTMX Attribute Escaping
// ------------------------------------

describe("HTMX Attribute Escaping", () => {
  it("Escapes special chars in hx-get endpoint", () => {
    const result = render(Div().addAttribute("hx-get", '/api?q="><script>alert(1)</script>'));
    assert.ok(result.includes('&quot;&gt;&lt;script&gt;'));
  });
});

// ------------------------------------
// CSP Nonce Support
// ------------------------------------

describe("CSP Nonce", () => {
  it("setNonce adds nonce attribute to Script", () => {
    assert.strictEqual(
      render(Script("console.log('hi')").setNonce("abc123")),
      `<script nonce="abc123">console.log('hi')</script>`
    );
  });

  it("setNonce adds nonce attribute to Style", () => {
    assert.strictEqual(
      render(Style(".x { color: red }").setNonce("abc123")),
      `<style nonce="abc123">.x { color: red }</style>`
    );
  });

  it("renderWithNonce applies nonce to all script/style tags", () => {
    const result = renderWithNonce(
      "nonce123",
      Div(
        Script("console.log('a')"),
        Style(".b { color: blue }"),
        P("text")
      )
    );
    assert.ok(result.includes('nonce="nonce123"'));
    assert.strictEqual((result.match(/nonce="nonce123"/g) || []).length, 2);
    assert.ok(result.includes('<p>text</p>'));
  });

  it("renderWithNonce escapes nonce value", () => {
    const result = renderWithNonce(
      '"><script>alert(1)</script>',
      Script("safe")
    );
    assert.ok(!result.includes('"><script>'));
    assert.ok(result.includes('&quot;&gt;&lt;script&gt;'));
  });
});

// ------------------------------------
// Unicode Edge Cases
// ------------------------------------

describe("Unicode Edge Cases", () => {
  it("Handles null byte in text content", () => {
    const result = render(Div("hello\x00world"));
    assert.ok(result.includes("hello"));
    assert.ok(result.includes("world"));
  });

  it("Handles RTL override character in text", () => {
    const result = render(Div("hello\u202Eworld"));
    assert.ok(result.includes("hello"));
  });

  it("Handles zero-width characters in attribute values", () => {
    const result = render(Div().addAttribute("data-val", "hello\u200Bworld"));
    assert.ok(result.includes('data-val="hello\u200Bworld"'));
  });

  it("Handles zero-width joiner in text", () => {
    const result = render(Span("a\u200Db"));
    assert.ok(result.includes("a\u200Db"));
  });
});
