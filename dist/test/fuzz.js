import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { render, Div, Span } from "../src/index.js";
function randomString(length) {
    const bytes = randomBytes(length);
    // Mix in special HTML chars to increase edge-case coverage
    const specials = ['<', '>', '&', '"', "'", '\n', '\t', '\0', '\u00ff', '\u2603'];
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
        if (Math.random() < 0.3) {
            str += specials[bytes[i] % specials.length];
        }
        else {
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
describe("De-recursed renderer: deep trees do not overflow the stack", () => {
    // The v5 recursive renderer threw RangeError (call stack) around depth ~3500.
    // The work-stack emitter has no recursion limit beyond available heap.
    const DEPTH = 20000;
    it(`renders a ${DEPTH}-deep nested tree without throwing`, () => {
        let tree = Span("leaf");
        for (let i = 0; i < DEPTH; i++)
            tree = Div(tree);
        let html = "";
        assert.doesNotThrow(() => { html = render(tree); });
        assert.equal((html.match(/<div>/g) || []).length, DEPTH, "all nesting levels rendered");
        assert.equal((html.match(/<\/div>/g) || []).length, DEPTH, "all closing tags rendered");
        assert.ok(html.includes("<span>leaf</span>"), "innermost leaf present");
    });
    it(`renders ${DEPTH} flat siblings (array separators) without throwing`, () => {
        const items = Array.from({ length: DEPTH }, (_, i) => Span(String(i)));
        let html = "";
        assert.doesNotThrow(() => { html = render(Div(...items)); });
        assert.ok(html.startsWith("<div><span>0</span>\n<span>1</span>"), "leading siblings + separators");
        assert.ok(html.endsWith(`<span>${DEPTH - 1}</span></div>`), "trailing sibling");
    });
});
//# sourceMappingURL=fuzz.js.map