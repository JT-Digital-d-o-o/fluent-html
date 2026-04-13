import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { ParaAlgebra, ViewCoalgebra, TocEntry } from "../src/index.js";
import {
  Div, P, Span, A, Nav, Img, Raw,
  render,
  paraView, unfoldView, hyloView,
  foldView, renderAlgebra, countAlgebra, textAlgebra,
  ariaDescribeAlgebra,
  linkedTocCoalgebra,
} from "../src/index.js";

// ─── Paramorphism ────────────────────────────────────────────────

describe("paraView", () => {
  it("passes original subtree to tag handler", () => {
    const view = Div(P("Hello").setClass("intro"));

    // Collect original tag classes while folding
    const classCollector: ParaAlgebra<string[]> = {
      text: () => [],
      raw: () => [],
      tag: (_el, attrs, children, _original) => {
        const classes = attrs.class ? [attrs.class] : [];
        return [...classes, ...children];
      },
      list: (items) => items.flat(),
    };

    const result = paraView(classCollector, view);
    assert.deepStrictEqual(result, ["intro"]);
  });

  it("works like foldView when original is ignored", () => {
    const view = Div(P("Hello"), Span("World"));

    const countPara: ParaAlgebra<number> = {
      text: () => 0,
      raw: () => 0,
      tag: (_, __, childCount) => 1 + childCount,
      list: (counts) => counts.reduce((a, b) => a + b, 0),
    };

    assert.equal(paraView(countPara, view), foldView(countAlgebra, view));
  });

  it("handles raw strings", () => {
    const para: ParaAlgebra<string> = {
      text: (s) => s,
      raw: (html) => html,
      tag: (_, __, children) => children,
      list: (items) => items.join(""),
    };

    assert.equal(paraView(para, Raw("<b>bold</b>")), "<b>bold</b>");
  });

  it("handles arrays", () => {
    const para: ParaAlgebra<number> = {
      text: () => 0,
      raw: () => 0,
      tag: (_, __, c) => 1 + c,
      list: (items) => items.reduce((a, b) => a + b, 0),
    };

    assert.equal(paraView(para, [Div(), P(), Span()]), 3);
  });

  it("handles plain text", () => {
    const para: ParaAlgebra<string> = {
      text: (s) => s,
      raw: (html) => html,
      tag: (_, __, c) => c,
      list: (items) => items.join(""),
    };

    assert.equal(paraView(para, "Hello"), "Hello");
  });

  it("can use original subtree to wrap elements", () => {
    const view = Div(A("Click me").setHref("/page"));

    // Wrap links in a span with the href as title
    const wrapLinks: ParaAlgebra<string> = {
      text: (s) => s,
      raw: (html) => html,
      tag: (el, attrs, children, _original) => {
        if (el === "a" && attrs.href) {
          return `<span title="${attrs.href}">${children}</span>`;
        }
        return `<${el}>${children}</${el}>`;
      },
      list: (items) => items.join(""),
    };

    const result = paraView(wrapLinks, view);
    assert.equal(result, '<div><span title="/page">Click me</span></div>');
  });
});

describe("ariaDescribeAlgebra", () => {
  it("describes a link", () => {
    const desc = paraView(ariaDescribeAlgebra, A("Home").setHref("/"));
    assert.equal(desc, "link 'Home' (href: /)");
  });

  it("describes nested structure", () => {
    const desc = paraView(ariaDescribeAlgebra, Nav(
      A("Home").setHref("/"),
      A("About").setHref("/about"),
    ));
    assert.equal(desc, "nav containing: link 'Home' (href: /), link 'About' (href: /about)");
  });

  it("describes image with alt", () => {
    const desc = paraView(ariaDescribeAlgebra, Img().addAttribute("alt", "Logo"));
    assert.equal(desc, "image 'Logo'");
  });

  it("describes image without alt", () => {
    const desc = paraView(ariaDescribeAlgebra, Img());
    assert.equal(desc, "image (no alt)");
  });

  it("includes id in description", () => {
    const desc = paraView(ariaDescribeAlgebra, Div("Content").setId("main"));
    assert.equal(desc, "div#main containing: Content");
  });
});

// ─── Anamorphism ─────────────────────────────────────────────────

describe("unfoldView", () => {
  it("unfolds a simple text seed", () => {
    const textCoalg: ViewCoalgebra<string> = (s) => ({ type: "text", value: s });
    const view = unfoldView(textCoalg, "Hello");
    assert.equal(view, "Hello");
  });

  it("unfolds a raw HTML seed", () => {
    const rawCoalg: ViewCoalgebra<string> = (s) => ({ type: "raw", html: s });
    const view = unfoldView(rawCoalg, "<b>bold</b>");
    assert.equal(render(view), "<b>bold</b>");
  });

  it("unfolds a single tag with text children", () => {
    type Seed = { type: "tag" } | { type: "text"; value: string };
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed.type === "text") return { type: "text", value: seed.value };
      return {
        type: "tag",
        element: "div",
        children: [{ type: "text" as const, value: "Hello" }],
      };
    };
    const view = unfoldView(coalg, { type: "tag" });
    assert.equal(render(view), "<div>Hello</div>");
  });

  it("unfolds nested structure", () => {
    type Seed = { depth: number };
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed.depth === 0) return { type: "text", value: "leaf" };
      return {
        type: "tag",
        element: "div",
        children: [{ depth: seed.depth - 1 }],
      };
    };
    const view = unfoldView(coalg, { depth: 3 });
    assert.equal(render(view), "<div><div><div>leaf</div></div></div>");
  });

  it("unfolds a list", () => {
    type Seed = { type: "list"; items: string[] } | { type: "item"; text: string };
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed.type === "item") {
        return { type: "tag", element: "li", children: [{ type: "list" as const, items: [] } as Seed] };
      }
      if (seed.items.length === 0) return { type: "text", value: "" };
      return {
        type: "list",
        items: seed.items.map(text => ({ type: "item" as const, text })),
      };
    };
    const view = unfoldView(coalg, { type: "list", items: ["a", "b"] });
    assert.ok(Array.isArray(view));
  });

  it("applies attrs to unfolded tags", () => {
    type Seed = "root" | "text";
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed === "text") return { type: "text", value: "Content" };
      return {
        type: "tag",
        element: "div",
        attrs: { id: "main", class: "container" },
        children: ["text" as Seed],
      };
    };
    const view = unfoldView(coalg, "root");
    const html = render(view);
    assert.ok(html.includes('id="main"'));
    assert.ok(html.includes('class="container"'));
    assert.ok(html.includes("Content"));
  });
});

describe("linkedTocCoalgebra", () => {
  it("builds a TOC from flat headings", () => {
    const headings: TocEntry[] = [
      { text: "Introduction", id: "intro" },
      { text: "Getting Started", id: "start" },
    ];
    const view = unfoldView(linkedTocCoalgebra, { type: "list" as const, entries: headings });
    const html = render(view);
    assert.ok(html.includes("<ul>"));
    assert.ok(html.includes("<li>"));
    assert.ok(html.includes('href="#intro"'));
    assert.ok(html.includes("Introduction"));
    assert.ok(html.includes('href="#start"'));
    assert.ok(html.includes("Getting Started"));
  });

  it("handles entries without id", () => {
    const headings: TocEntry[] = [
      { text: "No Link" },
    ];
    const view = unfoldView(linkedTocCoalgebra, { type: "list" as const, entries: headings });
    const html = render(view);
    assert.ok(html.includes("<li>"));
    assert.ok(html.includes("No Link"));
    assert.ok(!html.includes("href"));
  });

  it("builds empty list", () => {
    const view = unfoldView(linkedTocCoalgebra, { type: "list" as const, entries: [] });
    const html = render(view);
    assert.ok(html.includes("<ul>"));
    assert.ok(html.includes("</ul>"));
  });
});

// ─── Hylomorphism ────────────────────────────────────────────────

describe("hyloView", () => {
  it("fuses unfold and fold in one pass", () => {
    type Seed = { depth: number };
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed.depth === 0) return { type: "text", value: "leaf" };
      return {
        type: "tag",
        element: "div",
        children: [{ depth: seed.depth - 1 }],
      };
    };

    const html = hyloView(coalg, renderAlgebra, { depth: 3 });
    assert.equal(html, "<div><div><div>leaf</div></div></div>");
  });

  it("produces same result as unfold-then-fold", () => {
    type Seed = { depth: number };
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed.depth === 0) return { type: "text", value: "leaf" };
      return {
        type: "tag",
        element: "div",
        children: [{ depth: seed.depth - 1 }],
      };
    };

    const unfoldThenFold = foldView(renderAlgebra, unfoldView(coalg, { depth: 4 }));
    const hyloResult = hyloView(coalg, renderAlgebra, { depth: 4 });
    assert.equal(hyloResult, unfoldThenFold);
  });

  it("works with count algebra", () => {
    type Seed = { depth: number };
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed.depth === 0) return { type: "text", value: "leaf" };
      return {
        type: "tag",
        element: "div",
        children: [{ depth: seed.depth - 1 }],
      };
    };

    assert.equal(hyloView(coalg, countAlgebra, { depth: 3 }), 3);
  });

  it("works with text algebra", () => {
    type Seed = "root" | "text";
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed === "text") return { type: "text", value: "Hello" };
      return { type: "tag", element: "p", children: ["text" as Seed] };
    };

    assert.equal(hyloView(coalg, textAlgebra, "root"), "Hello\n");
  });

  it("handles raw in hylo", () => {
    type Seed = "raw";
    const coalg: ViewCoalgebra<Seed> = () => ({ type: "raw", html: "<b>bold</b>" });
    assert.equal(hyloView(coalg, renderAlgebra, "raw"), "<b>bold</b>");
  });

  it("handles list seeds", () => {
    type Seed = { type: "list"; n: number } | { type: "item"; i: number };
    const coalg: ViewCoalgebra<Seed> = (seed) => {
      if (seed.type === "item") {
        return { type: "tag", element: "li", children: [] };
      }
      return {
        type: "list",
        items: Array.from({ length: seed.n }, (_, i) => ({ type: "item" as const, i })),
      };
    };

    const count = hyloView(coalg, countAlgebra, { type: "list", n: 5 });
    assert.equal(count, 5);
  });

  it("hylo with TOC coalgebra matches unfold-then-fold", () => {
    const headings: TocEntry[] = [
      { text: "Intro", id: "intro" },
      { text: "Setup", id: "setup" },
      { text: "API", id: "api" },
    ];

    const seed = { type: "list" as const, entries: headings };
    const unfoldThenFold = foldView(renderAlgebra, unfoldView(linkedTocCoalgebra, seed));
    const hyloResult = hyloView(linkedTocCoalgebra, renderAlgebra, seed);
    assert.equal(hyloResult, unfoldThenFold);
  });
});
