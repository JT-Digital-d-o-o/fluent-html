import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render, Tag, RawString, Raw, Div, Span, P,
  Input, Textarea, Button, Form, A, Area,
  isTag, isRawString,
} from "../src/index.js";
import { createId } from "../src/ids.js";

// -------------------------------------------------------
// Phase 1: String literal unions render correctly
// -------------------------------------------------------

describe("InputTag typed setters", () => {
  it("setType renders typed value", () => {
    assert.strictEqual(
      render(Input().setType("email")),
      '<input type="email">'
    );
  });

  it("setType accepts all standard types", () => {
    for (const t of ["text", "password", "checkbox", "radio", "file", "hidden", "submit", "date", "color", "range"] as const) {
      assert.ok(render(Input().setType(t)).includes(`type="${t}"`), `type="${t}" should render`);
    }
  });

  it("setAutocomplete renders typed value", () => {
    assert.strictEqual(
      render(Input().setAutocomplete("email")),
      '<input autocomplete="email">'
    );
  });

  it("setAutocomplete accepts custom value via escape hatch", () => {
    assert.strictEqual(
      render(Input().setAutocomplete("section-billing street-address")),
      '<input autocomplete="section-billing street-address">'
    );
  });
});

describe("TextareaTag typed setters", () => {
  it("setAutocomplete renders typed value", () => {
    assert.strictEqual(
      render(Textarea().setAutocomplete("name")),
      '<textarea autocomplete="name"></textarea>'
    );
  });
});

describe("ButtonTag typed setters", () => {
  it("setFormmethod renders get", () => {
    assert.strictEqual(
      render(Button("Go").setFormmethod("get")),
      '<button formmethod="get">Go</button>'
    );
  });

  it("setFormmethod renders post", () => {
    assert.strictEqual(
      render(Button("Go").setFormmethod("post")),
      '<button formmethod="post">Go</button>'
    );
  });
});

describe("FormTag typed setters", () => {
  it("setMethod renders typed value", () => {
    assert.strictEqual(
      render(Form().setMethod("post").setAction("/submit")),
      '<form action="/submit" method="post"></form>'
    );
  });

  it("setMethod accepts dialog", () => {
    assert.ok(render(Form().setMethod("dialog")).includes('method="dialog"'));
  });

  it("setTarget renders typed value", () => {
    assert.strictEqual(
      render(Form().setTarget("_blank")),
      '<form target="_blank"></form>'
    );
  });

  it("setTarget accepts custom value via escape hatch", () => {
    assert.ok(render(Form().setTarget("my-frame")).includes('target="my-frame"'));
  });
});

describe("AnchorTag typed setters", () => {
  it("setTarget renders typed value", () => {
    assert.ok(render(A("Link").setTarget("_blank")).includes('target="_blank"'));
  });

  it("setRel renders typed value", () => {
    assert.ok(render(A("Link").setRel("noopener")).includes('rel="noopener"'));
  });

  it("setRel accepts space-separated combo via escape hatch", () => {
    assert.ok(
      render(A("Link").setRel("noopener noreferrer")).includes('rel="noopener noreferrer"')
    );
  });

  it("setReferrerpolicy renders typed value", () => {
    assert.ok(
      render(A("Link").setReferrerpolicy("no-referrer")).includes('referrerpolicy="no-referrer"')
    );
  });
});

describe("AreaTag typed setters", () => {
  it("setTarget renders typed value", () => {
    assert.ok(render(Area().setTarget("_parent")).includes('target="_parent"'));
  });

  it("setRel renders typed value", () => {
    assert.ok(render(Area().setRel("noreferrer")).includes('rel="noreferrer"'));
  });
});

// -------------------------------------------------------
// Phase 2: Branded Id
// -------------------------------------------------------

describe("Branded Id", () => {
  it("createId produces valid Id", () => {
    const id = createId("test");
    assert.strictEqual(id.id, "test");
    assert.strictEqual(id.selector, "#test");
  });

  it("Id is frozen", () => {
    const id = createId("test");
    assert.throws(() => { (id as any).id = "hacked"; }, TypeError);
  });

  it("renders correctly via setId", () => {
    const id = createId("my-el");
    assert.strictEqual(render(Div().setId(id)), '<div id="my-el"></div>');
  });
});

// -------------------------------------------------------
// Phase 3: Type guards
// -------------------------------------------------------

describe("isTag()", () => {
  it("returns true for Tag instances", () => {
    assert.strictEqual(isTag(Div()), true);
  });

  it("returns true for subclass Tag instances", () => {
    assert.strictEqual(isTag(Input()), true);
    assert.strictEqual(isTag(A("link")), true);
    assert.strictEqual(isTag(Button("click")), true);
  });

  it("returns false for strings", () => {
    assert.strictEqual(isTag("hello"), false);
  });

  it("returns false for null", () => {
    assert.strictEqual(isTag(null), false);
  });

  it("returns false for undefined", () => {
    assert.strictEqual(isTag(undefined), false);
  });

  it("returns false for plain objects without _t", () => {
    assert.strictEqual(isTag({}), false);
    assert.strictEqual(isTag({ el: "div" }), false);
  });

  it("returns false for arrays", () => {
    assert.strictEqual(isTag([Div()]), false);
  });

  it("returns false for RawString", () => {
    assert.strictEqual(isTag(Raw("<b>hi</b>")), false);
  });
});

describe("isRawString()", () => {
  it("returns true for RawString instances", () => {
    assert.strictEqual(isRawString(Raw("<b>hi</b>")), true);
  });

  it("returns false for strings", () => {
    assert.strictEqual(isRawString("hello"), false);
  });

  it("returns false for Tag instances", () => {
    assert.strictEqual(isRawString(Div()), false);
  });

  it("returns false for null", () => {
    assert.strictEqual(isRawString(null), false);
  });

  it("returns false for plain objects without _t", () => {
    assert.strictEqual(isRawString({}), false);
    assert.strictEqual(isRawString({ html: "hi" }), false);
  });
});

// -------------------------------------------------------
// Phase 4: _sk typed access
// -------------------------------------------------------

describe("Tag._sk property", () => {
  it("base Tag has no _sk", () => {
    const tag = Div();
    assert.strictEqual(tag._sk, undefined);
  });

  it("InputTag has _sk with element-specific keys", () => {
    const tag = Input();
    assert.ok(tag._sk !== undefined);
    assert.ok(tag._sk!.includes("type"));
    assert.ok(tag._sk!.includes("placeholder"));
    assert.ok(tag._sk!.includes("name"));
  });

  it("AnchorTag has _sk with element-specific keys", () => {
    const tag = A("link");
    assert.ok(tag._sk !== undefined);
    assert.ok(tag._sk!.includes("href"));
    assert.ok(tag._sk!.includes("target"));
    assert.ok(tag._sk!.includes("rel"));
  });

  it("_sk drives attribute rendering", () => {
    const html = render(Input().setType("email").setName("e").setPlaceholder("Enter"));
    assert.ok(html.includes('type="email"'));
    assert.ok(html.includes('name="e"'));
    assert.ok(html.includes('placeholder="Enter"'));
  });
});

// -------------------------------------------------------
// Phase 5: Constrained toggle()
// -------------------------------------------------------

describe("toggle() with BooleanAttribute", () => {
  it("renders standard boolean attrs", () => {
    assert.ok(render(Input().toggle("required")).includes("required"));
    assert.ok(render(Input().toggle("disabled")).includes("disabled"));
    assert.ok(render(Input().toggle("readonly")).includes("readonly"));
  });

  it("conditional toggle true", () => {
    assert.ok(render(Input().toggle("checked", true)).includes("checked"));
  });

  it("conditional toggle false", () => {
    assert.ok(!render(Input().toggle("checked", false)).includes("checked"));
  });

  it("accepts custom boolean attr via escape hatch", () => {
    assert.ok(render(Div().toggle("hx-boost")).includes("hx-boost"));
  });

  it("chains multiple toggles", () => {
    const html = render(Input().toggle("required").toggle("autofocus"));
    assert.ok(html.includes("required"));
    assert.ok(html.includes("autofocus"));
  });
});

// -------------------------------------------------------
// Integration: type guards in render pipeline
// -------------------------------------------------------

describe("Render pipeline with type guards", () => {
  it("renders Tag via isTag path", () => {
    assert.strictEqual(render(Div("hello")), "<div>hello</div>");
  });

  it("renders RawString via isRawString path", () => {
    assert.strictEqual(render(Raw("<b>bold</b>")), "<b>bold</b>");
  });

  it("renders string with escaping", () => {
    assert.strictEqual(render("<script>"), "&lt;script&gt;");
  });

  it("renders mixed content", () => {
    const html = render(Div(Span("safe"), Raw("<b>raw</b>")));
    assert.ok(html.includes("<span>safe</span>"));
    assert.ok(html.includes("<b>raw</b>"));
  });

  it("renders nested subclassed Tags", () => {
    const html = render(Form(Input().setType("text").setName("q"), Button("Go").setType("submit")));
    assert.ok(html.includes('<input type="text" name="q">'));
    assert.ok(html.includes('<button type="submit">Go</button>'));
  });
});
