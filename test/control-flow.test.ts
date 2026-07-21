import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render,
  Div, P, Span, Ul, Li,
  IfThen, IfThenElse, Match, MatchValue, ForEach, ForEachElse, ForEachKeyed, Repeat, Intersperse, Button,
} from "../src/index.js";

// ------------------------------------
// Control Flow - IfThen / IfThenElse
// ------------------------------------

describe("Control Flow - Conditionals", () => {
  it("IfThen true", () => { assert.strictEqual(render(IfThen(true, () => Span("Visible"))), `<span>Visible</span>`); });

  it("IfThen false", () => { assert.strictEqual(render(IfThen(false, () => Span("Hidden"))), ``); });

  it("IfThenElse true", () => { assert.strictEqual(render(IfThenElse(true, () => Span("Yes"), () => Span("No"))), `<span>Yes</span>`); });

  it("IfThenElse false", () => { assert.strictEqual(render(IfThenElse(false, () => Span("Yes"), () => Span("No"))), `<span>No</span>`); });

  it("Nested conditionals", () => {
    assert.strictEqual(render(IfThen(true, () =>
      Div([
        IfThenElse(false,
          () => P("A"),
          () => P("B")
        )
      ])
    )), `<div><p>B</p></div>`);
  });

  // Nullable value overloads

  it("IfThen with non-null value", () => { assert.strictEqual(render(IfThen("hello" as string | null, (val) => Span(val))), `<span>hello</span>`); });

  it("IfThen with null value", () => { assert.strictEqual(render(IfThen(null as string | null, (val) => Span(val))), ``); });

  it("IfThen with undefined value", () => { assert.strictEqual(render(IfThen(undefined as string | undefined, (val) => Span(val))), ``); });

  it("IfThenElse with non-null value", () => { assert.strictEqual(render(IfThenElse("world" as string | null, (val) => Span(val), () => Span("fallback"))), `<span>world</span>`); });

  it("IfThenElse with null value", () => { assert.strictEqual(render(IfThenElse(null as string | null, (val) => Span(val), () => Span("fallback"))), `<span>fallback</span>`); });

  it("IfThenElse with undefined value", () => { assert.strictEqual(render(IfThenElse(undefined as number | undefined, (val) => Span(String(val)), () => Span("none"))), `<span>none</span>`); });

  // Falsy non-null values — must pass through, not be swallowed

  it("IfThen with 0 passes through (not swallowed)", () => { assert.strictEqual(render(IfThen(0 as number | null, (n) => Span(`${n}`))), `<span>0</span>`); });

  it("IfThen with empty string passes through (not swallowed)", () => { assert.strictEqual(render(IfThen("" as string | null, (s) => Span(`[${s}]`))), `<span>[]</span>`); });

  it("IfThen with NaN passes through (not swallowed)", () => { assert.strictEqual(render(IfThen(NaN as number | null, (n) => Span(`${n}`))), `<span>NaN</span>`); });

  it("IfThenElse with 0 takes then-branch", () => { assert.strictEqual(render(IfThenElse(0 as number | null, (n) => Span(`${n}`), () => Span("none"))), `<span>0</span>`); });

  it("IfThenElse with empty string takes then-branch", () => { assert.strictEqual(render(IfThenElse("" as string | null, (s) => Span(`[${s}]`), () => Span("none"))), `<span>[]</span>`); });

  it("IfThenElse with NaN takes then-branch", () => { assert.strictEqual(render(IfThenElse(NaN as number | null, (n) => Span(`${n}`), () => Span("none"))), `<span>NaN</span>`); });
});

// ------------------------------------
// Control Flow - Match
// ------------------------------------

describe("Control Flow - Match", () => {
  it("Match first case", () => {
    assert.strictEqual(render(Match("a" as "a" | "b" | "c", {
      a: () => Span("Alpha"),
      b: () => Span("Beta"),
      c: () => Span("Gamma"),
    })), `<span>Alpha</span>`);
  });

  it("Match last case", () => {
    assert.strictEqual(render(Match("c" as "a" | "b" | "c", {
      a: () => Span("Alpha"),
      b: () => Span("Beta"),
      c: () => Span("Gamma"),
    })), `<span>Gamma</span>`);
  });

  it("Match partial with default (hit)", () => {
    assert.strictEqual(render(Match("x" as "x" | "y" | "z", {
      x: () => Span("Found"),
    }, () => Span("Default"))), `<span>Found</span>`);
  });

  it("Match partial with default (miss)", () => {
    assert.strictEqual(render(Match("z" as "x" | "y" | "z", {
      x: () => Span("Found"),
    }, () => Span("Default"))), `<span>Default</span>`);
  });

  // Discriminated union overload
  it("Match discriminated union — exhaustive", () => {
    type State =
      | { status: "loading" }
      | { status: "error"; message: string }
      | { status: "success"; count: number };

    const state = { status: "error", message: "Not found" } as State;

    assert.strictEqual(render(Match(state, "status", {
      loading: () => Span("Loading..."),
      error:   (s) => Span(s.message),
      success: (s) => Span(`Count: ${s.count}`),
    })), `<span>Not found</span>`);
  });

  it("Match discriminated union — narrowing provides correct type", () => {
    type Result =
      | { kind: "ok"; value: number }
      | { kind: "err"; reason: string };

    const result = { kind: "ok", value: 42 } as Result;

    assert.strictEqual(render(Match(result, "kind", {
      ok:  (r) => Span(`Value: ${r.value}`),
      err: (r) => Span(`Error: ${r.reason}`),
    })), `<span>Value: 42</span>`);
  });

  it("Match discriminated union — partial with default (hit)", () => {
    type State =
      | { status: "loading" }
      | { status: "error"; message: string }
      | { status: "success"; count: number };

    const state = { status: "error", message: "Oops" } as State;

    assert.strictEqual(render(Match(state, "status", {
      error: (s) => Span(s.message),
    }, () => Span("Fallback"))), `<span>Oops</span>`);
  });

  it("Match discriminated union — partial with default (miss)", () => {
    type State =
      | { status: "loading" }
      | { status: "error"; message: string }
      | { status: "success"; count: number };

    const state = { status: "loading" } as State;

    assert.strictEqual(render(Match(state, "status", {
      error: (s) => Span(s.message),
    }, () => Span("Fallback"))), `<span>Fallback</span>`);
  });
});

// ------------------------------------
// Control Flow - ForEach
// ------------------------------------

describe("Control Flow - ForEach", () => {
  it("ForEach array", () => { assert.strictEqual(render(Ul(ForEach(["A", "B", "C"], item => Li(item)))), `<ul><li>A</li>\n<li>B</li>\n<li>C</li></ul>`); });

  it("ForEach empty", () => { assert.strictEqual(render(Ul(ForEach([], item => Li(item)))), `<ul></ul>`); });

  it("ForEach with index", () => { assert.strictEqual(render(Ul(ForEach(["A", "B", "C"], (item, idx) => Li(`${idx + 1}. ${item}`)))), `<ul><li>1. A</li>\n<li>2. B</li>\n<li>3. C</li></ul>`); });

  it("ForEach range", () => { assert.strictEqual(render(Ul(ForEach(3, idx => Li(`Item ${idx}`)))), `<ul><li>Item 0</li>\n<li>Item 1</li>\n<li>Item 2</li></ul>`); });

  it("ForEach range with start", () => { assert.strictEqual(render(Ul(ForEach(5, 8, idx => Li(`Item ${idx}`)))), `<ul><li>Item 5</li>\n<li>Item 6</li>\n<li>Item 7</li></ul>`); });

  it("Repeat", () => { assert.strictEqual(render(Div(Repeat(3, () => Span("*")))), `<div><span>*</span>\n<span>*</span>\n<span>*</span></div>`); });

  it("ForEachKeyed stamps a stable id from the key (for idiomorph)", () => {
    const users = [{ id: 42, name: "A" }, { id: 7, name: "B" }];
    assert.strictEqual(
      render(Ul(ForEachKeyed(users, (u) => u.id, (u) => Li(u.name)))),
      `<ul><li id="42">A</li>\n<li id="7">B</li></ul>`,
    );
  });

  it("ForEachKeyed accepts a string key and passes the index", () => {
    assert.strictEqual(
      render(Ul(ForEachKeyed(["x", "y"], (s) => `row-${s}`, (s, i) => Li(`${i}:${s}`)))),
      `<ul><li id="row-x">0:x</li>\n<li id="row-y">1:y</li></ul>`,
    );
  });

  it("ForEachElse non-empty renders items", () => {
    assert.strictEqual(render(Ul(ForEachElse(["A", "B"], item => Li(item), () => Li("None")))), `<ul><li>A</li>\n<li>B</li></ul>`);
  });

  it("ForEachElse empty renders the fallback (thunk)", () => {
    assert.strictEqual(render(Ul(ForEachElse([], item => Li(item as string), () => Li("None")))), `<ul><li>None</li></ul>`);
  });

  it("ForEachElse empty renders the fallback (plain view)", () => {
    assert.strictEqual(render(Ul(ForEachElse([], item => Li(item as string), Li("Empty")))), `<ul><li>Empty</li></ul>`);
  });

  it("ForEach large array (>8 items) renders correctly with newlines", () => {
    const result = render(Ul(ForEach(20, idx => Li(`Item ${idx}`))));
    const items = Array.from({ length: 20 }, (_, i) => `<li>Item ${i}</li>`).join('\n');
    assert.strictEqual(result, `<ul>${items}</ul>`);
  });

  it("ForEach very large array (1000 items) renders all items", () => {
    const result = render(Div(ForEach(1000, idx => Span(`${idx}`))));
    assert.ok(result.startsWith('<div><span>0</span>'));
    assert.ok(result.endsWith('<span>999</span></div>'));
    assert.strictEqual((result.match(/<span>/g) ?? []).length, 1000);
  });

  it("ForEach single item array has no newlines", () => {
    assert.strictEqual(render(Ul(ForEach(["only"], item => Li(item)))), `<ul><li>only</li></ul>`);
  });
});

describe("ForEach: non-array iterables (D-06 single-pass)", () => {
  it("maps a Map.values() iterator", () => {
    const m = new Map([["a", 1], ["b", 2], ["c", 3]]);
    assert.strictEqual(render(Ul(ForEach(m.values(), (v) => Li(String(v))))), `<ul><li>1</li>\n<li>2</li>\n<li>3</li></ul>`);
  });

  it("maps a generator with correct indices", () => {
    function* gen() { yield "x"; yield "y"; }
    assert.strictEqual(render(Ul(ForEach(gen(), (v, i) => Li(`${i}:${v}`)))), `<ul><li>0:x</li>\n<li>1:y</li></ul>`);
  });

  it("maps a Set", () => {
    assert.strictEqual(render(Ul(ForEach(new Set(["p", "q"]), (v) => Li(v)))), `<ul><li>p</li>\n<li>q</li></ul>`);
  });
});

// ------------------------------------
// Tag.whenElse
// ------------------------------------

describe("Tag.whenElse", () => {
  it("boolean true takes thenFn", () => {
    assert.strictEqual(render(Button("X").whenElse(true, t => t.toggle("disabled"), t => t.background("blue-500"))), `<button disabled>X</button>`);
  });

  it("boolean false takes elseFn", () => {
    assert.strictEqual(render(Button("X").whenElse(false, t => t.toggle("disabled"), t => t.addClass("idle"))), `<button class="idle">X</button>`);
  });

  it("nullable value narrows the non-null value into thenFn", () => {
    const name: string | null = "Ada";
    assert.strictEqual(render(Span().whenElse(name, (t, n) => t.setClass(n), t => t.setClass("anon"))), `<span class="Ada"></span>`);
  });

  it("null takes elseFn", () => {
    const name: string | null = null;
    assert.strictEqual(render(Span().whenElse(name, (t, n) => t.setClass(n), t => t.setClass("anon"))), `<span class="anon"></span>`);
  });

  it("a present-but-falsy value ('') takes thenFn (not truthiness)", () => {
    const v: string | null = "";
    assert.strictEqual(render(Span().whenElse(v, (t) => t.addClass("present"), t => t.addClass("absent"))), `<span class="present"></span>`);
  });
});

// ------------------------------------
// Tag.whenMatch
// ------------------------------------

describe("Tag.whenMatch", () => {
  it("exhaustive form applies the matched case's modifier", () => {
    const width = "2xl" as "lg" | "2xl";
    assert.strictEqual(render(Div().whenMatch(width, { lg: t => t.maxW("lg"), "2xl": t => t.maxW("2xl") })), `<div class="max-w-2xl"></div>`);
  });

  it("partial form falls back to defaultFn on a miss", () => {
    const tone = "info" as "danger" | "info";
    assert.strictEqual(render(Span().whenMatch(tone, { danger: t => t.setClass("red") }, t => t.setClass("gray"))), `<span class="gray"></span>`);
  });

  it("partial form still applies a present case over defaultFn", () => {
    const tone = "danger" as "danger" | "info";
    assert.strictEqual(render(Span().whenMatch(tone, { danger: t => t.setClass("red") }, t => t.setClass("gray"))), `<span class="red"></span>`);
  });

  it("numeric discriminants work", () => {
    const i = 6;
    assert.strictEqual(render(Div().whenMatch(i % 5, { 0: t => t.w("full"), 1: t => t.w("3/4") }, t => t.w("1/2"))), `<div class="w-3/4"></div>`);
  });

  it("returns this — the chain continues after the match", () => {
    const s = "a" as "a" | "b";
    assert.strictEqual(render(Div().whenMatch(s, { a: t => t.addClass("x"), b: t => t.addClass("y") }).addClass("z")), `<div class="x z"></div>`);
  });
});

// ------------------------------------
// MatchValue / Intersperse (C-005)
// ------------------------------------

describe("MatchValue", () => {
  it("exhaustive form returns the matched value", () => {
    assert.strictEqual(MatchValue("up" as "up" | "down", { up: "↑", down: "↓" }), "↑");
  });

  it("partial form falls back to the default", () => {
    assert.strictEqual(MatchValue("sideways" as "up" | "down" | "sideways", { up: "↑", down: "↓" }, "→"), "→");
  });

  it("numeric keys work", () => {
    assert.strictEqual(MatchValue(2 as 1 | 2 | 3, { 1: "a", 2: "b", 3: "c" }), "b");
  });

  it("the value flows straight into a fluent method", () => {
    const bg = MatchValue("err" as "ok" | "err", { ok: "green-100", err: "red-100" } as const);
    assert.strictEqual(render(Div().background(bg)), `<div class="bg-red-100"></div>`);
  });

  it("a present key whose value is falsy is returned (not the default)", () => {
    assert.strictEqual(MatchValue("z" as "z", { z: "" }, "fallback"), "");
  });
});

describe("Intersperse", () => {
  it("places the separator between items, never after the last", () => {
    assert.strictEqual(
      render(Div(Intersperse(["a", "b", "c"], (c) => Span(c), () => Span("/")))),
      `<div><span>a</span>\n<span>/</span>\n<span>b</span>\n<span>/</span>\n<span>c</span></div>`,
    );
  });

  it("a single item emits no separator", () => {
    assert.strictEqual(render(Div(Intersperse(["only"], (c) => Span(c), () => Span("/")))), `<div><span>only</span></div>`);
  });

  it("an empty iterable emits nothing", () => {
    assert.strictEqual(render(Div(Intersperse([] as string[], (c) => Span(c), () => Span("/")))), `<div></div>`);
  });

  it("accepts a plain View separator", () => {
    assert.strictEqual(
      render(Div(Intersperse(["a", "b"], (c) => Span(c), Span("·")))),
      `<div><span>a</span>\n<span>·</span>\n<span>b</span></div>`,
    );
  });

  it("calls the thunk separator once per gap", () => {
    let calls = 0;
    render(Div(Intersperse(["a", "b", "c"], (c) => Span(c), () => { calls++; return Span("/"); })));
    assert.strictEqual(calls, 2);
  });
});

// Regression: Match must not resolve handlers via the prototype chain (control-flow-2)
describe("Control Flow - Match prototype-chain hardening", () => {
  it("value form falls back to default for Object.prototype keys", () => {
    for (const k of ["toString", "constructor", "valueOf", "hasOwnProperty", "__proto__"]) {
      assert.strictEqual(
        render(Match(k, { a: () => Span("A") }, () => Span("DEFAULT"))),
        "<span>DEFAULT</span>",
        `value key ${k}`,
      );
    }
  });

  it("DU form falls back to default for Object.prototype discriminants", () => {
    for (const k of ["toString", "constructor", "valueOf"]) {
      assert.strictEqual(
        render(Match({ status: k } as { status: string }, "status", { a: () => Span("A") }, () => Span("DEFAULT"))),
        "<span>DEFAULT</span>",
        `DU discriminant ${k}`,
      );
    }
  });

  it("real own-property cases still resolve", () => {
    assert.strictEqual(render(Match("a", { a: () => Span("A") }, () => Span("D"))), "<span>A</span>");
  });
});

// Regression: numeric ForEach lengths must never throw RangeError (control-flow-3)
describe("Control Flow - ForEach numeric length clamping", () => {
  it("renders nothing for negative / inverted / NaN counts instead of throwing", () => {
    assert.strictEqual(render(ForEach(-2, (i) => Span(String(i)))), "");
    assert.strictEqual(render(ForEach(5, 3, (i) => Span(String(i)))), "");
    assert.strictEqual(render(ForEach(NaN, (i) => Span(String(i)))), "");
    assert.strictEqual(render(ForEach(Infinity, (i) => Span(String(i)))), "");
  });

  it("floors fractional counts", () => {
    assert.strictEqual(render(ForEach(2.9, (i) => Span(String(i)))), "<span>0</span>\n<span>1</span>");
  });

  it("valid counts and ranges are unaffected", () => {
    assert.strictEqual(render(ForEach(3, (i) => Span(String(i)))), "<span>0</span>\n<span>1</span>\n<span>2</span>");
    assert.strictEqual(render(ForEach(5, 7, (i) => Span(String(i)))), "<span>5</span>\n<span>6</span>");
  });
});
