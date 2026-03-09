import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render,
  Div, Input,
  El,
} from "../src/index.js";

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
      .setStyle("padding: 10px")),
    `<div id="box" class="card shadow" style="padding: 10px">Content</div>`);
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
      .addAttribute("aria-label", "Test div")),
    `<div data-id="123" data-name="test" aria-label="Test div"></div>`);
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
      .toggle("required")),
    `<input type="email" name="email" required>`);
  });
});
