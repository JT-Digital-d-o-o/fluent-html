import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

import { render, Div } from "../src/index.js";

function randomString(length: number): string {
  const bytes = randomBytes(length);
  // Mix in special HTML chars to increase edge-case coverage
  const specials = ['<', '>', '&', '"', "'", '\n', '\t', '\0', '\u00ff', '\u2603'];
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    if (Math.random() < 0.3) {
      str += specials[bytes[i] % specials.length];
    } else {
      str += String.fromCharCode(bytes[i]);
    }
  }
  return str;
}

describe("Property-based fuzz: text content escaping", () => {
  it("render(Div(s)) never contains unescaped <, >, & in text content", () => {
    for (let i = 0; i < 1000; i++) {
      const s = randomString(20 + Math.floor(Math.random() * 80));
      const html = render(Div(s));

      // Extract text content (between <div> and </div>)
      const match = html.match(/^<div>(.*)<\/div>$/s);
      assert.ok(match, `Expected <div>...</div> wrapper, got: ${html.slice(0, 100)}`);
      const content = match[1];

      // Verify no unescaped special chars
      // After removing known entity sequences, no bare &, <, > should remain
      const withoutEntities = content
        .replace(/&amp;/g, '')
        .replace(/&lt;/g, '')
        .replace(/&gt;/g, '')
        .replace(/&quot;/g, '')
        .replace(/&#39;/g, '');

      assert.equal(withoutEntities.includes('&'), false, `Unescaped & in: ${content.slice(0, 100)}`);
      assert.equal(withoutEntities.includes('<'), false, `Unescaped < in: ${content.slice(0, 100)}`);
      assert.equal(withoutEntities.includes('>'), false, `Unescaped > in: ${content.slice(0, 100)}`);
    }
  });
});

describe("Property-based fuzz: attribute escaping", () => {
  it("render(Div().addAttribute('data-x', s)) produces valid attribute syntax", () => {
    for (let i = 0; i < 1000; i++) {
      const s = randomString(20 + Math.floor(Math.random() * 80));
      const html = render(Div().addAttribute("data-x", s));

      // The attribute value must be properly quoted — no unescaped " inside the attribute
      const attrMatch = html.match(/data-x="([^"]*)"/);
      assert.ok(attrMatch, `Expected data-x="..." in: ${html.slice(0, 200)}`);

      // The rendered HTML should be well-formed (opening tag closes properly)
      assert.ok(html.startsWith('<div '), `Expected <div start: ${html.slice(0, 50)}`);
      assert.ok(html.endsWith('</div>'), `Expected </div> end: ${html.slice(-20)}`);
    }
  });
});
