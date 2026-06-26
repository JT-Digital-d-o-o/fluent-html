import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, renderToIterable, Div, Input, El, } from "../src/index.js";
// ------------------------------------
// ID, Class, Style Attributes
// ------------------------------------
describe("ID, Class, Style", () => {
    it("Div with id", () => { assert.strictEqual(render(Div().setId("my-div")), `<div id="my-div"></div>`); });
    it("Div with class", () => { assert.strictEqual(render(Div().setClass("container")), `<div class="container"></div>`); });
    it("Div with id and class", () => { assert.strictEqual(render(Div().setId("main").setClass("container fluid")), `<div id="main" class="container fluid"></div>`); });
    it("addClass on empty", () => { assert.strictEqual(render(Div().addClass("first")), `<div class="first"></div>`); });
    it("addClass appends", () => { assert.strictEqual(render(Div().setClass("one").addClass("two").addClass("three")), `<div class="one two three"></div>`); });
    it("setStyle", () => { assert.strictEqual(render(Div().setStyle("color: red; font-size: 16px")), `<div style="color: red; font-size: 16px"></div>`); });
    it("Combined id, class, style", () => {
        assert.strictEqual(render(Div("Content")
            .setId("box")
            .setClass("card shadow")
            .setStyle("padding: 10px")), `<div id="box" class="card shadow" style="padding: 10px">Content</div>`);
    });
});
// ------------------------------------
// Custom Attributes
// ------------------------------------
describe("Custom Attributes", () => {
    it("addAttribute single", () => { assert.strictEqual(render(Div().addAttribute("data-id", "123")), `<div data-id="123"></div>`); });
    it("addAttribute multiple", () => {
        assert.strictEqual(render(Div()
            .addAttribute("data-id", "123")
            .addAttribute("data-name", "test")
            .addAttribute("aria-label", "Test div")), `<div data-id="123" data-name="test" aria-label="Test div"></div>`);
    });
    it("El custom element", () => { assert.strictEqual(render(El("custom-element", "Content").setClass("my-class")), `<custom-element class="my-class">Content</custom-element>`); });
});
// ------------------------------------
// Toggles (Boolean Attributes)
// ------------------------------------
describe("Toggles (Boolean Attributes)", () => {
    it("toggle() single", () => { assert.strictEqual(render(Input().toggle("required")), `<input required>`); });
    it("toggle() multiple chained", () => { assert.strictEqual(render(Input().toggle("required").toggle("disabled")), `<input required disabled>`); });
    it("toggle() multiple chained (3)", () => { assert.strictEqual(render(Input().toggle("required").toggle("disabled").toggle("readonly")), `<input required disabled readonly>`); });
    it("toggle() conditional true", () => { assert.strictEqual(render(Input().toggle("required", true)), `<input required>`); });
    it("toggle() conditional false", () => { assert.strictEqual(render(Input().toggle("required", false)), `<input>`); });
    it("toggle() mixed conditions", () => { assert.strictEqual(render(Input().toggle("required", true).toggle("disabled", false).toggle("readonly", true)), `<input required readonly>`); });
    it("toggle() with other attributes", () => {
        assert.strictEqual(render(Input()
            .setType("email")
            .setName("email")
            .toggle("required")), `<input type="email" name="email" required>`);
    });
});
// ------------------------------------
// Duplicate-attribute emission (A-003)
// ------------------------------------
describe("Duplicate-attribute emission (A-003)", () => {
    it("dedupes a repeated toggle", () => {
        assert.strictEqual(render(Input().toggle("disabled").toggle("disabled")), `<input disabled>`);
    });
    it("dedupes a repeated conditional toggle", () => {
        assert.strictEqual(render(Input().toggle("readonly", true).toggle("readonly", true)), `<input readonly>`);
    });
    it("dedicated id setter wins over an addAttribute id", () => {
        assert.strictEqual(render(Div("x").setId("a").addAttribute("id", "b")), `<div id="a">x</div>`);
    });
    it("fluent class wins over an addAttribute class", () => {
        assert.strictEqual(render(Div("x").setClass("btn").addAttribute("class", "danger")), `<div class="btn">x</div>`);
    });
    it("dedicated style setter wins over an addAttribute style", () => {
        assert.strictEqual(render(Div("x").setStyle("color:red").addAttribute("style", "color:blue")), `<div style="color:red">x</div>`);
    });
    it("a valued attribute wins over a bare toggle of the same name", () => {
        assert.strictEqual(render(Input().toggle("required").addAttribute("required", "")), `<input required="">`);
    });
    it("addAttribute id/class/style with NO dedicated setter still emits (regression)", () => {
        assert.strictEqual(render(Div().addAttribute("id", "b")), `<div id="b"></div>`);
        assert.strictEqual(render(Div().addAttribute("class", "c")), `<div class="c"></div>`);
        assert.strictEqual(render(Div().addAttribute("style", "color:red")), `<div style="color:red"></div>`);
    });
    it("setId(undefined) leaves the bag id intact", () => {
        assert.strictEqual(render(Div().setId(undefined).addAttribute("id", "b")), `<div id="b"></div>`);
    });
    it("render ≡ renderToIterable for the reserved-key bag/collision cases", () => {
        for (const v of [
            Div().addAttribute("id", "b"),
            Div().setId("a").addAttribute("id", "b"),
            Div().setClass("btn").addAttribute("class", "danger"),
        ]) {
            assert.strictEqual([...renderToIterable(v)].join(""), render(v));
        }
    });
});
// ------------------------------------
// Global editing/keyboard attributes + microdata (Tier 3b)
// ------------------------------------
describe("Global editing/keyboard + microdata", () => {
    it("setEnterkeyhint", () => { assert.strictEqual(render(Input().setEnterkeyhint("send")), `<input enterkeyhint="send">`); });
    it("setContenteditable defaults to true; plaintext-only explicit", () => {
        assert.strictEqual(render(Div("x").setContenteditable()), `<div contenteditable="true">x</div>`);
        assert.strictEqual(render(Div("x").setContenteditable("plaintext-only")), `<div contenteditable="plaintext-only">x</div>`);
    });
    it("setSpellcheck / setAutocapitalize", () => {
        assert.strictEqual(render(Input().setSpellcheck("false").setAutocapitalize("words")), `<input spellcheck="false" autocapitalize="words">`);
    });
    it("setLang / setDir / setTranslate on any element", () => {
        assert.strictEqual(render(Div("x").setLang("fr").setDir("rtl").setTranslate("no")), `<div lang="fr" dir="rtl" translate="no">x</div>`);
    });
    it("setHidden('until-found')", () => { assert.strictEqual(render(Div("x").setHidden("until-found")), `<div hidden="until-found">x</div>`); });
    it("setForm by string id", () => { assert.strictEqual(render(Input().setName("q").setForm("search-form")), `<input name="q" form="search-form">`); });
    it("setMicrodata sets itemscope+itemtype (with id), and bare itemprop", () => {
        assert.strictEqual(render(Div().setMicrodata({ type: "https://schema.org/Product", id: "/p/1" })), `<div itemtype="https://schema.org/Product" itemid="/p/1" itemscope></div>`);
        assert.strictEqual(render(Div("Jane").setMicrodata({ prop: "author" })), `<div itemprop="author">Jane</div>`);
    });
});
//# sourceMappingURL=attributes.test.js.map