"use strict";
// ------------------------------------
// Tests for Fold / Catamorphism
// ------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../src/index.js");
// ------------------------------------
// Test Runner
// ------------------------------------
let passCount = 0;
let failCount = 0;
function test(name, got, expected) {
    const gotStr = JSON.stringify(got);
    const expectedStr = JSON.stringify(expected);
    if (gotStr === expectedStr) {
        console.log(`✅ ${name}`);
        passCount++;
    }
    else {
        console.log(`❌ ${name}`);
        console.log(`   Expected: ${expectedStr}`);
        console.log(`   Got:      ${gotStr}`);
        failCount++;
    }
}
function section(name) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`${name}`);
    console.log("=".repeat(50));
}
// ------------------------------------
// Count Algebra Tests
// ------------------------------------
section("Count Algebra");
test("counts single element", (0, index_js_1.foldView)(index_js_1.countAlgebra, (0, index_js_1.Div)()), 1);
test("counts nested elements", (0, index_js_1.foldView)(index_js_1.countAlgebra, (0, index_js_1.Div)([(0, index_js_1.P)("Hello"), (0, index_js_1.P)("World")])), 3 // div + 2 p's
);
test("counts deeply nested", (0, index_js_1.foldView)(index_js_1.countAlgebra, (0, index_js_1.Div)([(0, index_js_1.Div)([(0, index_js_1.Span)("Inner")])])), 3 // outer div + inner div + span
);
test("counts empty array as zero", (0, index_js_1.foldView)(index_js_1.countAlgebra, []), 0);
test("counts plain text as zero elements", (0, index_js_1.foldView)(index_js_1.countAlgebra, "Hello"), 0);
test("counts complex structure", (0, index_js_1.foldView)(index_js_1.countAlgebra, (0, index_js_1.Div)([
    (0, index_js_1.H1)("Title"),
    (0, index_js_1.P)("Paragraph 1"),
    (0, index_js_1.Ul)([
        (0, index_js_1.Li)("Item 1"),
        (0, index_js_1.Li)("Item 2"),
        (0, index_js_1.Li)("Item 3"),
    ])
])), 7 // div + h1 + p + ul + 3 li's = 7
);
// ------------------------------------
// Text Algebra Tests
// ------------------------------------
section("Text Algebra");
test("extracts plain text", (0, index_js_1.foldView)(index_js_1.textAlgebra, "Hello World"), "Hello World");
test("extracts text from element", (0, index_js_1.foldView)(index_js_1.textAlgebra, (0, index_js_1.H1)("Welcome")), "Welcome\n");
test("extracts text from nested elements", (0, index_js_1.foldView)(index_js_1.textAlgebra, (0, index_js_1.Div)([
    (0, index_js_1.H1)("Title"),
    (0, index_js_1.P)("Content")
])), "Title\nContent\n\n" // div adds trailing newline
);
test("extracts text from inline elements", (0, index_js_1.foldView)(index_js_1.textAlgebra, (0, index_js_1.Span)([
    "Hello ",
    (0, index_js_1.Span)("World")
])), "Hello World");
test("handles empty elements", (0, index_js_1.foldView)(index_js_1.textAlgebra, (0, index_js_1.Div)()), "\n" // block elements add newline even when empty
);
// ------------------------------------
// Links Algebra Tests
// ------------------------------------
section("Links Algebra");
test("finds single link", (0, index_js_1.foldView)(index_js_1.linksAlgebra, (0, index_js_1.A)("Home").setHref("/")), [{ href: "/" }]);
test("finds multiple links", (0, index_js_1.foldView)(index_js_1.linksAlgebra, (0, index_js_1.Div)([
    (0, index_js_1.A)("Home").setHref("/"),
    (0, index_js_1.A)("About").setHref("/about"),
    (0, index_js_1.A)("Contact").setHref("/contact"),
])), [{ href: "/" }, { href: "/about" }, { href: "/contact" }]);
test("finds nested links", (0, index_js_1.foldView)(index_js_1.linksAlgebra, (0, index_js_1.Div)([
    (0, index_js_1.P)([(0, index_js_1.A)("Link 1").setHref("/1")]),
    (0, index_js_1.P)([(0, index_js_1.A)("Link 2").setHref("/2")]),
])), [{ href: "/1" }, { href: "/2" }]);
test("returns empty for no links", (0, index_js_1.foldView)(index_js_1.linksAlgebra, (0, index_js_1.Div)([(0, index_js_1.P)("No links here")])), []);
test("includes link attributes", (0, index_js_1.foldView)(index_js_1.linksAlgebra, (0, index_js_1.A)("External").setHref("https://example.com").setTarget("_blank").setRel("noopener")), [{ href: "https://example.com", target: "_blank", rel: "noopener" }]);
// ------------------------------------
// Custom Algebra Tests
// ------------------------------------
section("Custom Algebras");
// Element names collector
const elementNamesAlgebra = {
    text: () => [],
    raw: () => [],
    tag: (el, _, childNames) => [el, ...childNames],
    list: (arrays) => arrays.flat(),
};
test("custom algebra collects element names", (0, index_js_1.foldView)(elementNamesAlgebra, (0, index_js_1.Div)([(0, index_js_1.P)("Hello"), (0, index_js_1.Span)("World")])), ["div", "p", "span"]);
// Depth calculator
const depthAlgebra = {
    text: () => 0,
    raw: () => 0,
    tag: (_, __, childDepth) => 1 + childDepth,
    list: (depths) => Math.max(0, ...depths),
};
test("custom algebra calculates depth", (0, index_js_1.foldView)(depthAlgebra, (0, index_js_1.Div)([(0, index_js_1.Div)([(0, index_js_1.Div)([(0, index_js_1.P)("Deep")])])])), 4 // div > div > div > p
);
test("custom algebra handles flat structure", (0, index_js_1.foldView)(depthAlgebra, (0, index_js_1.Div)([(0, index_js_1.P)("A"), (0, index_js_1.P)("B"), (0, index_js_1.P)("C")])), 2 // div > p (each p is same depth)
);
// ------------------------------------
// Edge Cases
// ------------------------------------
section("Edge Cases");
test("handles empty string", (0, index_js_1.foldView)(index_js_1.countAlgebra, ""), 0);
test("handles array of strings", (0, index_js_1.foldView)(index_js_1.textAlgebra, ["Hello", " ", "World"]), "Hello World");
test("handles mixed content", (0, index_js_1.foldView)(index_js_1.countAlgebra, [(0, index_js_1.Div)(), "text", (0, index_js_1.P)(), "more"]), 2 // only counts elements, not strings
);
// ------------------------------------
// Summary
// ------------------------------------
console.log(`\n${"=".repeat(50)}`);
console.log("TEST SUMMARY");
console.log("=".repeat(50));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Total: ${passCount + failCount}`);
console.log("=".repeat(50));
if (failCount > 0) {
    process.exit(1);
}
//# sourceMappingURL=fold.js.map