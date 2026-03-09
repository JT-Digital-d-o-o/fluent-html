import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Div, P, Span, Ul, Li, IfThen, IfThenElse, Match, ForEach, Repeat, } from "../src/index.js";
// ------------------------------------
// Control Flow - IfThen / IfThenElse
// ------------------------------------
describe("Control Flow - Conditionals", () => {
    it("IfThen true", () => { assert.strictEqual(render(IfThen(true, () => Span("Visible"))), `<span>Visible</span>`); });
    it("IfThen false", () => { assert.strictEqual(render(IfThen(false, () => Span("Hidden"))), ``); });
    it("IfThenElse true", () => { assert.strictEqual(render(IfThenElse(true, () => Span("Yes"), () => Span("No"))), `<span>Yes</span>`); });
    it("IfThenElse false", () => { assert.strictEqual(render(IfThenElse(false, () => Span("Yes"), () => Span("No"))), `<span>No</span>`); });
    it("Nested conditionals", () => {
        assert.strictEqual(render(IfThen(true, () => Div([
            IfThenElse(false, () => P("A"), () => P("B"))
        ]))), `<div><p>B</p></div>`);
    });
    // Nullable value overloads
    it("IfThen with non-null value", () => { assert.strictEqual(render(IfThen("hello", (val) => Span(val))), `<span>hello</span>`); });
    it("IfThen with null value", () => { assert.strictEqual(render(IfThen(null, (val) => Span(val))), ``); });
    it("IfThen with undefined value", () => { assert.strictEqual(render(IfThen(undefined, (val) => Span(val))), ``); });
    it("IfThenElse with non-null value", () => { assert.strictEqual(render(IfThenElse("world", (val) => Span(val), () => Span("fallback"))), `<span>world</span>`); });
    it("IfThenElse with null value", () => { assert.strictEqual(render(IfThenElse(null, (val) => Span(val), () => Span("fallback"))), `<span>fallback</span>`); });
    it("IfThenElse with undefined value", () => { assert.strictEqual(render(IfThenElse(undefined, (val) => Span(String(val)), () => Span("none"))), `<span>none</span>`); });
});
// ------------------------------------
// Control Flow - Match
// ------------------------------------
describe("Control Flow - Match", () => {
    it("Match first case", () => {
        assert.strictEqual(render(Match("a", {
            a: () => Span("Alpha"),
            b: () => Span("Beta"),
            c: () => Span("Gamma"),
        })), `<span>Alpha</span>`);
    });
    it("Match last case", () => {
        assert.strictEqual(render(Match("c", {
            a: () => Span("Alpha"),
            b: () => Span("Beta"),
            c: () => Span("Gamma"),
        })), `<span>Gamma</span>`);
    });
    it("Match partial with default (hit)", () => {
        assert.strictEqual(render(Match("x", {
            x: () => Span("Found"),
        }, () => Span("Default"))), `<span>Found</span>`);
    });
    it("Match partial with default (miss)", () => {
        assert.strictEqual(render(Match("z", {
            x: () => Span("Found"),
        }, () => Span("Default"))), `<span>Default</span>`);
    });
    // Discriminated union overload
    it("Match discriminated union — exhaustive", () => {
        const state = { status: "error", message: "Not found" };
        assert.strictEqual(render(Match(state, "status", {
            loading: () => Span("Loading..."),
            error: (s) => Span(s.message),
            success: (s) => Span(`Count: ${s.count}`),
        })), `<span>Not found</span>`);
    });
    it("Match discriminated union — narrowing provides correct type", () => {
        const result = { kind: "ok", value: 42 };
        assert.strictEqual(render(Match(result, "kind", {
            ok: (r) => Span(`Value: ${r.value}`),
            err: (r) => Span(`Error: ${r.reason}`),
        })), `<span>Value: 42</span>`);
    });
    it("Match discriminated union — partial with default (hit)", () => {
        const state = { status: "error", message: "Oops" };
        assert.strictEqual(render(Match(state, "status", {
            error: (s) => Span(s.message),
        }, () => Span("Fallback"))), `<span>Oops</span>`);
    });
    it("Match discriminated union — partial with default (miss)", () => {
        const state = { status: "loading" };
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
});
//# sourceMappingURL=control-flow.test.js.map