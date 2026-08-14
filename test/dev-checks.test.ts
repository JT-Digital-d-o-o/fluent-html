import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  render,
  renderToIterable,
  setDevChecks,
  Div, Span, Ul, Li, Input, Button,
  ForEach,
} from "../src/index.js";
import { assetUrl } from "../src/htmx.js";

// The guards are on by default outside NODE_ENV=production; a test that turns
// them off restores them here so ordering can't leak.
afterEach(() => setDevChecks(true));

const throws = (fn: () => unknown, match: RegExp): void => assert.throws(fn, match);

// ------------------------------------
// Mutate after render
// ------------------------------------

describe("dev-checks — mutate after render", () => {
  it("a tag reused across renders throws on the second mutation", () => {
    const shared = Div("x").p("4");
    render(shared.bg("red-500"));
    throws(() => shared.bg("blue-500"), /already been rendered/);
  });

  it("names the element and the method that mutated", () => {
    const t = Span("x");
    render(t);
    throws(() => t.p("4"), /<span>\.addClass\(\)/);
  });

  it("fires for a nested tag, not just the root", () => {
    const child = Span("hi");
    render(Div(child));
    throws(() => child.text("lg"), /already been rendered/);
  });

  it("fires on the streaming path too", () => {
    const t = Div("x");
    for (const _ of renderToIterable(t)) { /* drain */ }
    throws(() => t.p("4"), /already been rendered/);
  });

  it("covers attribute, style, toggle and child mutations", () => {
    const each = <T extends { el: string }>(mutate: (t: T) => unknown, make: () => T): void => {
      const t = make();
      render(t as never);
      throws(() => mutate(t), /already been rendered/);
    };
    each((t) => t.addAttribute("data-x", "1"), () => Div("x"));
    each((t) => t.setStyle("color: red"), () => Div("x"));
    each((t) => t.addStyle("color: red"), () => Div("x"));
    each((t) => t.setStyles({ color: "red" }), () => Div("x"));
    each((t) => t.setDataAttrs({ x: "1" }), () => Div("x"));
    each((t) => t.setAria({ label: "x" }), () => Div("x"));
    each((t) => t.setId("x"), () => Div("x"));
    each((t) => t.setClass("x"), () => Div("x"));
    each((t) => t.setClasses(["x"]), () => Div("x"));
    each((t) => t.addChild(Span("y")), () => Div("x"));
    each((t) => t.toggle("disabled"), () => Button("x"));
  });

  it("re-rendering an unmutated tree stays legal (cached fragment)", () => {
    const frag = Div("cached").p("4");
    assert.strictEqual(render(frag), render(frag));
  });

  it("a fresh tag per render is unaffected", () => {
    const view = (): ReturnType<typeof Div> => Div("x").p("4").bg("red-500");
    assert.strictEqual(render(view()), `<div class="p-4 bg-red-500">x</div>`);
    assert.strictEqual(render(view()), `<div class="p-4 bg-red-500">x</div>`);
  });
});

// ------------------------------------
// Aliased children
// ------------------------------------

describe("dev-checks — aliased children", () => {
  it("mutating a tag held by two parents throws", () => {
    const child = Span("hi");
    Div(child);
    Div(child);
    throws(() => child.text("lg"), /child of 2 parents/);
  });

  it("detects aliasing through an array child (ForEach output)", () => {
    const shared = Li("row");
    Ul(ForEach([1], () => shared));
    Ul(ForEach([1], () => shared));
    throws(() => shared.p("2"), /child of 2 parents/);
  });

  it("detects aliasing added via addChild", () => {
    const shared = Span("s");
    Div(shared);
    Div().addChild(shared);
    throws(() => shared.p("2"), /child of 2 parents/);
  });

  it("a single parent is fine", () => {
    const child = Span("hi");
    Div(child);
    assert.strictEqual(render(Div(child.text("lg"))), `<div><span class="text-lg">hi</span></div>`);
  });

  it("a shared but unmutated child stays legal (non-thunk separator form)", () => {
    const sep = Span("/");
    assert.strictEqual(
      render(Div(sep, Span("a"), sep)),
      `<div><span>/</span>\n<span>a</span>\n<span>/</span></div>`,
    );
  });
});

// ------------------------------------
// Opt-out
// ------------------------------------

describe("dev-checks — setDevChecks", () => {
  it("false restores the unguarded accumulating behavior", () => {
    setDevChecks(false);
    const shared = Div("x").p("4");
    render(shared.bg("red-500"));
    assert.strictEqual(render(shared.bg("blue-500")), `<div class="p-4 bg-red-500 bg-blue-500">x</div>`);
  });

  it("true re-arms the guards", () => {
    setDevChecks(false);
    const a = Div("x");
    render(a);
    a.p("4");
    setDevChecks(true);
    const b = Div("x");
    render(b);
    throws(() => b.p("4"), /already been rendered/);
  });

  it("no parent counting happens while off, so a later mutation is not misreported", () => {
    setDevChecks(false);
    const shared = Span("s");
    Div(shared);
    Div(shared);
    setDevChecks(true);
    assert.doesNotThrow(() => shared.p("2"));
  });
});

// ------------------------------------
// Element setters are gated
// ------------------------------------

describe("dev-checks — element-specific setters", () => {
  // The 7.0.1 boundary ("~200 element setters are ungated") is closed: element
  // storage fields are protected `_`-prefixed storage and every setter that
  // writes one runs the same assertMutable gate as the Tag primitives.
  it("element-specific setters are gated (7.0.1 gap closed)", () => {
    const input = Input().setType("text");
    render(input);
    throws(() => input.setType("email"), /already been rendered/);
  });

  it("htmx mixin setters are gated too", () => {
    const div = Div("x").setHtmx(assetUrl("/x"));
    render(div);
    throws(() => div.setHtmx(assetUrl("/y")), /already been rendered/);
  });

  it("the generic attribute path on the same tag is gated", () => {
    const input = Input();
    render(input);
    throws(() => input.setTitle("x"), /already been rendered/);
  });
});
