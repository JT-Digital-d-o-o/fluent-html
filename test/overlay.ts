import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Span, Img, Div } from "../src/index.js";

describe("Tag.prototype.overlay()", () => {
  it("wraps in relative + absolute with default center position", () => {
    const html = render(Span("Content").overlay(Span("Badge")));
    assert.ok(html.startsWith('<div class="relative">'));
    assert.ok(html.includes("<span>Content</span>"));
    assert.ok(html.includes('class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"'));
    assert.ok(html.includes("<span>Badge</span>"));
  });

  it("treats a known position word as the position", () => {
    const html = render(Div("C").overlay("top", Span("O")));
    assert.ok(html.includes('class="absolute top-0 left-1/2 -translate-x-1/2 z-10"'));
    assert.ok(html.includes("<span>O</span>"));
  });

  it("emits the right utilities per position", () => {
    const cases: Array<[string, string]> = [
      ["bottom", "absolute bottom-0 left-1/2 -translate-x-1/2 z-10"],
      ["left", "absolute top-1/2 left-0 -translate-y-1/2 z-10"],
      ["right", "absolute top-1/2 right-0 -translate-y-1/2 z-10"],
      ["top-left", "absolute top-0 left-0 z-10"],
      ["top-right", "absolute top-0 right-0 z-10"],
      ["bottom-left", "absolute bottom-0 left-0 z-10"],
      ["bottom-right", "absolute bottom-0 right-0 z-10"],
    ];
    for (const [pos, expected] of cases) {
      const html = render(Div("C").overlay(pos as "bottom", Span("O")));
      assert.ok(html.includes(`class="${expected}"`), `${pos} → ${expected}`);
    }
  });

  it("works on a void element (Img)", () => {
    const html = render(Img().setSrc("/a.png").overlay(Span("Badge")));
    assert.ok(html.startsWith('<div class="relative">'));
    assert.ok(html.includes('<img src="/a.png">'));
    assert.ok(html.includes("<span>Badge</span>"));
  });

  it("a non-position first arg is content (center)", () => {
    const html = render(Div("C").overlay(Span("A"), Span("B")));
    assert.ok(html.includes("-translate-x-1/2 -translate-y-1/2"));
    assert.ok(html.includes("<span>A</span>"));
    assert.ok(html.includes("<span>B</span>"));
  });

  it("preserves base styling applied before overlay()", () => {
    const html = render(Img().setSrc("/a.png").rounded("full").overlay(Span("X")));
    assert.ok(html.includes('class="rounded-full"'));
  });
});
