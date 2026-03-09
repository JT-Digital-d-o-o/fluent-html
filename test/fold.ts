import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type {
  ViewAlgebra} from "../src/index.js";
import {
  Div, P, H1, Span, A, Ul, Li, Raw,
  render,
  foldView, countAlgebra, textAlgebra, linksAlgebra, renderAlgebra,
  createTransformAlgebra, addClassToMatching
} from "../src/index.js";

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
    assert.deepStrictEqual(
      foldView(linksAlgebra, A("External").setHref("https://example.com").setTarget("_blank").setRel("noopener")),
      [{ href: "https://example.com", target: "_blank", rel: "noopener" }]
    );
  });
});

describe("Custom Algebras", () => {
  const elementNamesAlgebra: ViewAlgebra<string[]> = {
    text: () => [],
    raw: () => [],
    tag: (el, _, childNames) => [el, ...childNames],
    list: (arrays) => arrays.flat(),
  };

  it("collects element names", () => {
    assert.deepStrictEqual(
      foldView(elementNamesAlgebra, Div([P("Hello"), Span("World")])),
      ["div", "p", "span"]
    );
  });

  const depthAlgebra: ViewAlgebra<number> = {
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

describe("Render Algebra", () => {
  it("renders simple element", () => {
    const html = foldView(renderAlgebra, Div("Hello"));
    assert.ok(html.includes("<div>"));
    assert.ok(html.includes("Hello"));
    assert.ok(html.includes("</div>"));
  });

  it("renders nested elements", () => {
    const html = foldView(renderAlgebra, Div(P("Inner")));
    assert.ok(html.includes("<p>"));
    assert.ok(html.includes("Inner"));
  });

  it("escapes text content", () => {
    const html = foldView(renderAlgebra, Span("<script>"));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!html.includes("<script>"));
  });

  it("passes through raw HTML", () => {
    const html = foldView(renderAlgebra, Raw("<b>bold</b>"));
    assert.equal(html, "<b>bold</b>");
  });

  it("renders element with id and class", () => {
    const html = foldView(renderAlgebra, Div().setId("main").setClass("container"));
    assert.ok(html.includes('id="main"'));
    assert.ok(html.includes('class="container"'));
  });
});

describe("Transform Algebra", () => {
  it("transforms matching elements", () => {
    const uppercaseDivs = createTransformAlgebra((el, attrs) => {
      if (el === "div") {
        return { element: "section", attrs };
      }
      return null;
    });

    const result = foldView(uppercaseDivs, Div(P("Hello")));
    const html = render(result);
    assert.ok(html.includes("<section>"));
    assert.ok(html.includes("<p>Hello</p>"));
  });

  it("leaves non-matching elements unchanged", () => {
    const onlyDivs = createTransformAlgebra((el) => {
      if (el === "div") return { element: "section", attrs: {} };
      return null;
    });

    const result = foldView(onlyDivs, P("Hello"));
    const html = render(result);
    assert.ok(html.includes("<p>"));
  });

  it("handles raw strings in transform", () => {
    const noop = createTransformAlgebra(() => null);
    const result = foldView(noop, Raw("<b>raw</b>"));
    const html = render(result);
    assert.equal(html, "<b>raw</b>");
  });

  it("handles plain text in transform", () => {
    const noop = createTransformAlgebra(() => null);
    const result = foldView(noop, "plain text");
    assert.equal(result, "plain text");
  });
});

describe("addClassToMatching", () => {
  it("adds class to matching elements", () => {
    const highlightP = addClassToMatching((el) => el === "p", "highlight");
    const result = foldView(highlightP, Div(P("Hello")));
    const html = render(result);
    assert.ok(html.includes('class="highlight"'));
  });

  it("does not add class to non-matching elements", () => {
    const highlightP = addClassToMatching((el) => el === "p", "highlight");
    const result = foldView(highlightP, Div(Span("Hello")));
    const html = render(result);
    assert.ok(!html.includes("highlight"));
  });

  it("appends to existing class", () => {
    const highlightP = addClassToMatching((el) => el === "p", "highlight");
    const result = foldView(highlightP, Div(P("Hello").setClass("existing")));
    const html = render(result);
    assert.ok(html.includes('class="existing highlight"'));
  });
});

describe("Render round-trip (Phase 4)", () => {
  const views = [
    Div("Hello World"),
    Div(P("Paragraph"), Span("Inline")),
    H1("Title"),
    Div(Ul(Li("A"), Li("B"), Li("C"))),
    Div().setId("test").setClass("cls"),
    A("Link").setHref("/path"),
    Div(Raw("<b>raw</b>")),
  ];

  for (const view of views) {
    it(`foldView(renderAlgebra) agrees with render() for ${view.el}`, () => {
      const foldResult = foldView(renderAlgebra, view);
      const renderResult = render(view);
      // The renderAlgebra joins lists with \n like render does
      // They should produce equivalent output for simple structures
      assert.equal(foldResult, renderResult);
    });
  }
});
