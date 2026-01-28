// ------------------------------------
// Tests for Fold / Catamorphism
// ------------------------------------

import {
  Div, P, H1, H2, Span, A, Ul, Li,
  foldView, countAlgebra, textAlgebra, linksAlgebra,
  ViewAlgebra,
} from "../src/index.js";

// ------------------------------------
// Test Runner
// ------------------------------------

let passCount = 0;
let failCount = 0;

function test(name: string, got: any, expected: any) {
  const gotStr = JSON.stringify(got);
  const expectedStr = JSON.stringify(expected);
  if (gotStr === expectedStr) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Expected: ${expectedStr}`);
    console.log(`   Got:      ${gotStr}`);
    failCount++;
  }
}

function section(name: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`${name}`);
  console.log("=".repeat(50));
}

// ------------------------------------
// Count Algebra Tests
// ------------------------------------

section("Count Algebra");

test("counts single element",
  foldView(countAlgebra, Div()),
  1
);

test("counts nested elements",
  foldView(countAlgebra, Div([P("Hello"), P("World")])),
  3 // div + 2 p's
);

test("counts deeply nested",
  foldView(countAlgebra, Div([Div([Span("Inner")])])),
  3 // outer div + inner div + span
);

test("counts empty array as zero",
  foldView(countAlgebra, []),
  0
);

test("counts plain text as zero elements",
  foldView(countAlgebra, "Hello"),
  0
);

test("counts complex structure",
  foldView(countAlgebra, Div([
    H1("Title"),
    P("Paragraph 1"),
    Ul([
      Li("Item 1"),
      Li("Item 2"),
      Li("Item 3"),
    ])
  ])),
  7 // div + h1 + p + ul + 3 li's = 7
);

// ------------------------------------
// Text Algebra Tests
// ------------------------------------

section("Text Algebra");

test("extracts plain text",
  foldView(textAlgebra, "Hello World"),
  "Hello World"
);

test("extracts text from element",
  foldView(textAlgebra, H1("Welcome")),
  "Welcome\n"
);

test("extracts text from nested elements",
  foldView(textAlgebra, Div([
    H1("Title"),
    P("Content")
  ])),
  "Title\nContent\n\n" // div adds trailing newline
);

test("extracts text from inline elements",
  foldView(textAlgebra, Span([
    "Hello ",
    Span("World")
  ])),
  "Hello World"
);

test("handles empty elements",
  foldView(textAlgebra, Div()),
  "\n" // block elements add newline even when empty
);

// ------------------------------------
// Links Algebra Tests
// ------------------------------------

section("Links Algebra");

test("finds single link",
  foldView(linksAlgebra, A("Home").setHref("/")),
  [{ href: "/" }]
);

test("finds multiple links",
  foldView(linksAlgebra, Div([
    A("Home").setHref("/"),
    A("About").setHref("/about"),
    A("Contact").setHref("/contact"),
  ])),
  [{ href: "/" }, { href: "/about" }, { href: "/contact" }]
);

test("finds nested links",
  foldView(linksAlgebra, Div([
    P([A("Link 1").setHref("/1")]),
    P([A("Link 2").setHref("/2")]),
  ])),
  [{ href: "/1" }, { href: "/2" }]
);

test("returns empty for no links",
  foldView(linksAlgebra, Div([P("No links here")])),
  []
);

test("includes link attributes",
  foldView(linksAlgebra, A("External").setHref("https://example.com").setTarget("_blank").setRel("noopener")),
  [{ href: "https://example.com", target: "_blank", rel: "noopener" }]
);

// ------------------------------------
// Custom Algebra Tests
// ------------------------------------

section("Custom Algebras");

// Element names collector
const elementNamesAlgebra: ViewAlgebra<string[]> = {
  text: () => [],
  raw: () => [],
  tag: (el, _, childNames) => [el, ...childNames],
  list: (arrays) => arrays.flat(),
};

test("custom algebra collects element names",
  foldView(elementNamesAlgebra, Div([P("Hello"), Span("World")])),
  ["div", "p", "span"]
);

// Depth calculator
const depthAlgebra: ViewAlgebra<number> = {
  text: () => 0,
  raw: () => 0,
  tag: (_, __, childDepth) => 1 + childDepth,
  list: (depths) => Math.max(0, ...depths),
};

test("custom algebra calculates depth",
  foldView(depthAlgebra, Div([Div([Div([P("Deep")])])])),
  4 // div > div > div > p
);

test("custom algebra handles flat structure",
  foldView(depthAlgebra, Div([P("A"), P("B"), P("C")])),
  2 // div > p (each p is same depth)
);

// ------------------------------------
// Edge Cases
// ------------------------------------

section("Edge Cases");

test("handles empty string",
  foldView(countAlgebra, ""),
  0
);

test("handles array of strings",
  foldView(textAlgebra, ["Hello", " ", "World"]),
  "Hello World"
);

test("handles mixed content",
  foldView(countAlgebra, [Div(), "text", P(), "more"]),
  2 // only counts elements, not strings
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
