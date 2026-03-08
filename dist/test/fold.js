import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Div, P, H1, Span, A, Ul, Li, foldView, countAlgebra, textAlgebra, linksAlgebra, } from "../src/index.js";
describe("Count Algebra", () => {
    it("counts single element", () => {
        assert.deepStrictEqual(foldView(countAlgebra, Div()), 1);
    });
    it("counts nested elements", () => {
        assert.deepStrictEqual(foldView(countAlgebra, Div([P("Hello"), P("World")])), 3);
    });
    it("counts deeply nested", () => {
        assert.deepStrictEqual(foldView(countAlgebra, Div([Div([Span("Inner")])])), 3);
    });
    it("counts empty array as zero", () => {
        assert.deepStrictEqual(foldView(countAlgebra, []), 0);
    });
    it("counts plain text as zero elements", () => {
        assert.deepStrictEqual(foldView(countAlgebra, "Hello"), 0);
    });
    it("counts complex structure", () => {
        assert.deepStrictEqual(foldView(countAlgebra, Div([
            H1("Title"),
            P("Paragraph 1"),
            Ul([
                Li("Item 1"),
                Li("Item 2"),
                Li("Item 3"),
            ])
        ])), 7);
    });
});
describe("Text Algebra", () => {
    it("extracts plain text", () => {
        assert.deepStrictEqual(foldView(textAlgebra, "Hello World"), "Hello World");
    });
    it("extracts text from element", () => {
        assert.deepStrictEqual(foldView(textAlgebra, H1("Welcome")), "Welcome\n");
    });
    it("extracts text from nested elements", () => {
        assert.deepStrictEqual(foldView(textAlgebra, Div([
            H1("Title"),
            P("Content")
        ])), "Title\nContent\n\n");
    });
    it("extracts text from inline elements", () => {
        assert.deepStrictEqual(foldView(textAlgebra, Span([
            "Hello ",
            Span("World")
        ])), "Hello World");
    });
    it("handles empty elements", () => {
        assert.deepStrictEqual(foldView(textAlgebra, Div()), "\n");
    });
});
describe("Links Algebra", () => {
    it("finds single link", () => {
        assert.deepStrictEqual(foldView(linksAlgebra, A("Home").setHref("/")), [{ href: "/" }]);
    });
    it("finds multiple links", () => {
        assert.deepStrictEqual(foldView(linksAlgebra, Div([
            A("Home").setHref("/"),
            A("About").setHref("/about"),
            A("Contact").setHref("/contact"),
        ])), [{ href: "/" }, { href: "/about" }, { href: "/contact" }]);
    });
    it("finds nested links", () => {
        assert.deepStrictEqual(foldView(linksAlgebra, Div([
            P([A("Link 1").setHref("/1")]),
            P([A("Link 2").setHref("/2")]),
        ])), [{ href: "/1" }, { href: "/2" }]);
    });
    it("returns empty for no links", () => {
        assert.deepStrictEqual(foldView(linksAlgebra, Div([P("No links here")])), []);
    });
    it("includes link attributes", () => {
        assert.deepStrictEqual(foldView(linksAlgebra, A("External").setHref("https://example.com").setTarget("_blank").setRel("noopener")), [{ href: "https://example.com", target: "_blank", rel: "noopener" }]);
    });
});
describe("Custom Algebras", () => {
    const elementNamesAlgebra = {
        text: () => [],
        raw: () => [],
        tag: (el, _, childNames) => [el, ...childNames],
        list: (arrays) => arrays.flat(),
    };
    it("collects element names", () => {
        assert.deepStrictEqual(foldView(elementNamesAlgebra, Div([P("Hello"), Span("World")])), ["div", "p", "span"]);
    });
    const depthAlgebra = {
        text: () => 0,
        raw: () => 0,
        tag: (_, __, childDepth) => 1 + childDepth,
        list: (depths) => Math.max(0, ...depths),
    };
    it("calculates depth", () => {
        assert.deepStrictEqual(foldView(depthAlgebra, Div([Div([Div([P("Deep")])])])), 4);
    });
    it("handles flat structure", () => {
        assert.deepStrictEqual(foldView(depthAlgebra, Div([P("A"), P("B"), P("C")])), 2);
    });
});
describe("Edge Cases", () => {
    it("handles empty string", () => {
        assert.deepStrictEqual(foldView(countAlgebra, ""), 0);
    });
    it("handles array of strings", () => {
        assert.deepStrictEqual(foldView(textAlgebra, ["Hello", " ", "World"]), "Hello World");
    });
    it("handles mixed content", () => {
        assert.deepStrictEqual(foldView(countAlgebra, [Div(), "text", P(), "more"]), 2);
    });
});
//# sourceMappingURL=fold.js.map