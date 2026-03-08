import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { isTag, isRawString, Div, Span, Input, Raw, Tag } from "../src/index.js";

describe("isTag", () => {
  it("returns true for Tag instances", () => {
    assert.equal(isTag(Div()), true);
    assert.equal(isTag(Span("text")), true);
    assert.equal(isTag(Input()), true);
  });

  it("returns true for Tag with new Tag()", () => {
    assert.equal(isTag(new Tag("custom")), true);
  });

  it("returns false for strings", () => {
    assert.equal(isTag("hello"), false);
    assert.equal(isTag(""), false);
  });

  it("returns false for RawString", () => {
    assert.equal(isTag(Raw("<b>bold</b>")), false);
  });

  it("returns false for arrays", () => {
    assert.equal(isTag([Div()]), false);
    assert.equal(isTag([]), false);
  });

  it("returns false for null and undefined", () => {
    assert.equal(isTag(null), false);
    assert.equal(isTag(undefined), false);
  });

  it("returns false for plain objects without _t", () => {
    assert.equal(isTag({}), false);
    assert.equal(isTag({ name: "test" }), false);
  });

  it("returns true for duck-typed objects with _t: 1", () => {
    // isTag uses duck-typing — any object with _t === 1 matches
    assert.equal(isTag({ _t: 1 }), true);
  });

  it("returns false for numbers and booleans", () => {
    assert.equal(isTag(42), false);
    assert.equal(isTag(true), false);
  });
});

describe("isRawString", () => {
  it("returns true for RawString instances", () => {
    assert.equal(isRawString(Raw("<b>bold</b>")), true);
    assert.equal(isRawString(Raw("")), true);
  });

  it("returns false for Tag instances", () => {
    assert.equal(isRawString(Div()), false);
  });

  it("returns false for strings", () => {
    assert.equal(isRawString("hello"), false);
  });

  it("returns false for null and undefined", () => {
    assert.equal(isRawString(null), false);
    assert.equal(isRawString(undefined), false);
  });

  it("returns false for arrays", () => {
    assert.equal(isRawString([]), false);
  });
});
