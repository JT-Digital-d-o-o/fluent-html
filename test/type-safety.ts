import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render, Raw, Div, Span,
  Input, Textarea, Button, Form, A, Area,
  isTag, isRawString, defineRoutes,
  IfThen, IfThenElse, Match, MatchValue, Empty,
} from "../src/index.js";
import { createId } from "../src/ids.js";

// A-09: the 15 type-only re-exports must stay importable as TYPES (split to
// `export type` for verbatimModuleSyntax / TS1205). This `import type` + union is a
// compile-time lock — if any stops being an exported type, the build fails.
import type {
  HTMX, HxSwap, HxSwapStyle, HxTrigger, HxEncoding, HxTarget, HxHttpMethod,
  HxSync, HxOptions, HxConfig, HxStatusConfig, HtmxGlobalConfig,
  HxResponseResult, HxLocationConfig, Id, OverlayPosition,
} from "../src/index.js";
export type _TypeOnlyExportSurface =
  | HTMX | HxSwap | HxSwapStyle | HxTrigger | HxEncoding | HxTarget | HxHttpMethod
  | HxSync | HxOptions | HxConfig | HxStatusConfig | HtmxGlobalConfig
  | HxResponseResult | HxLocationConfig | Id | OverlayPosition;

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

describe("Generic Input factory type safety", () => {
  it("Input() backward compat accepts number and string min/max", () => {
    assert.ok(render(Input().setMin(5)).includes('min="5"'));
    assert.ok(render(Input().setMin("2024-01-01")).includes('min="2024-01-01"'));
  });

  it("Input('number') accepts numeric min/max", () => {
    assert.ok(render(Input("number").setMin(0).setMax(100)).includes('min="0"'));
  });

  it("Input('date') accepts string min/max", () => {
    assert.ok(render(Input("date").setMin("2024-01-01").setMax("2024-12-31")).includes('min="2024-01-01"'));
  });

  it("Input factory sets type attribute", () => {
    assert.strictEqual(render(Input("email")), '<input type="email">');
    assert.strictEqual(render(Input("number")), '<input type="number">');
    assert.strictEqual(render(Input("date")), '<input type="date">');
  });

  it("Input factory preserves chaining with tailwind methods", () => {
    const html = render(Input("number").setMin(1).setMax(10).padding("4"));
    assert.ok(html.includes('min="1"'));
    assert.ok(html.includes('class="p-4"'));
  });

  // @ts-expect-error — numeric input rejects string min
  it("ts-expect: Input('number').setMin('bad')", () => { Input("number").setMin("bad"); });

  // @ts-expect-error — date input rejects numeric min
  it("ts-expect: Input('date').setMin(42)", () => { Input("date").setMin(42); });

  // @ts-expect-error — text input rejects min entirely
  it("ts-expect: Input('text').setMin(5)", () => { Input("text").setMin(5); });

  // @ts-expect-error — text input rejects step entirely
  it("ts-expect: Input('text').setStep(1)", () => { Input("text").setStep(1); });
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

  it("setReferrerPolicy renders typed value", () => {
    assert.ok(
      render(A("Link").setReferrerPolicy("no-referrer")).includes('referrerpolicy="no-referrer"')
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testing frozen object mutation
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

  it("rejects an unknown boolean attr (closed union)", () => {
    // The BooleanAttribute union is closed (no `(string & {})` tail) — a non-boolean
    // attribute name is a compile error. This `@ts-expect-error` IS the test: if the
    // union ever reopened, the unfired directive would fail the build (TS2578).
    // @ts-expect-error — "hx-boost" is not an HTML boolean attribute
    render(Div().toggle("hx-boost"));
    // a real boolean attribute still type-checks and renders bare
    assert.ok(render(Div().toggle("hidden")).includes("hidden"));
  });

  it("chains multiple toggles", () => {
    const html = render(Input().toggle("required").toggle("autofocus"));
    assert.ok(html.includes("required"));
    assert.ok(html.includes("autofocus"));
  });
});

// -------------------------------------------------------
// setAria — closed AriaAttributeName (A-02)
// -------------------------------------------------------

describe("setAria typed keys", () => {
  it("rejects a misspelled aria key (closed union)", () => {
    // The AriaAttributeName union is closed — a typo is a compile error. This
    // `@ts-expect-error` IS the test (an unfired directive fails the build, TS2578).
    // @ts-expect-error — "labeledby" is misspelled; the real key is "labelledby"
    render(Div().setAria({ labeledby: "x" }));
    assert.ok(render(Div().setAria({ labelledby: "x" })).includes('aria-labelledby="x"'));
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

// -------------------------------------------------------
// D-07: typed prototype writes (defineSchemaKeys / setDiscriminant)
// -------------------------------------------------------

describe("Typed prototype writes (D-07 migration)", () => {
  it("defineSchemaKeys drives _sk attribute rendering across element files", () => {
    // One element per migrated file family — proves the 51 defineSchemaKeys() calls landed.
    assert.ok(render(Input().setType("email").setName("e")).includes('type="email" name="e"')); // forms.ts
    assert.ok(render(A("x").setHref("/p")).includes('href="/p"'));                              // links.ts
    assert.ok(render(Area().setHref("/a").setAlt("a")).includes('href="/a"'));                  // links.ts (void)
  });

  it("setDiscriminant keeps the _t node discriminants correct", () => {
    assert.equal(isTag(Div()), true);          // Tag _t = 1
    assert.equal(isRawString(Raw("<b>x</b>")), true); // RawString _t = 2
    assert.equal(isTag(Raw("<b>x</b>")), false);
    assert.equal(isRawString(Div()), false);
  });
});

// -------------------------------------------------------
// defineRoutes — trailing splat / wildcard params
// -------------------------------------------------------

describe("defineRoutes wildcard/splat params", () => {
  const r = defineRoutes({
    scope: { method: "get", path: "/scope/*" },
    file:  { method: "get", path: "/files/*path" },
    user:  { method: "get", path: "/users/:id" },
    list:  { method: "get", path: "/users" },
  } as const);

  it("anonymous trailing splat resolves under the 'splat' key, preserving '/'", () => {
    assert.strictEqual(r.scope.resolve({ splat: "a/b" }), "/scope/a/b");
  });

  it("named trailing splat resolves under its name, encoding each segment but not '/'", () => {
    assert.strictEqual(r.file.resolve({ path: "x/y.png" }), "/files/x/y.png");
    assert.strictEqual(r.file.resolve({ path: "a b/c" }), "/files/a%20b/c");
  });

  it("splat routes also build HTMX objects, with query folded after the splat", () => {
    assert.strictEqual(r.scope({ splat: "a/b" }).endpoint, "/scope/a/b");
    assert.strictEqual(r.scope({ splat: "a/b" }, { query: { q: "x" } }).endpoint, "/scope/a/b?q=x");
  });

  it(":param and no-param routes are unchanged", () => {
    assert.strictEqual(r.user.resolve({ id: "1" }), "/users/1");
    assert.strictEqual(r.list.resolve(), "/users");
    assert.strictEqual(r.list({ query: { q: "x" } }).endpoint, "/users?q=x");
  });

  it("a missing splat value throws the splat error at resolve time", () => {
    // @ts-expect-error — splat is required; {} omits it (compile error) and throws at runtime
    assert.throws(() => r.scope.resolve({}), /Unresolved route splat/);
  });

  // Compile-only negatives — the thunk is never invoked, so resolve() never throws; the
  // `@ts-expect-error` on the single-line `it(...)` IS the assertion (an unfired directive fails the build).
  // @ts-expect-error — the splat param is required
  it("ts-expect: scope.resolve() needs the splat", () => { const f = () => r.scope.resolve(); void f; });
  // @ts-expect-error — "rest" is not the splat key ("splat")
  it("ts-expect: scope.resolve({ rest }) wrong key", () => { const f = () => r.scope.resolve({ rest: "a/b" }); void f; });
  // @ts-expect-error — a wildcard route takes no declared params (the splat is always string)
  it("ts-expect: params declared on a splat route", () => { const bad = defineRoutes({ s: { method: "get", path: "/x/*", params: { splat: "string" } } } as const); void bad; });
});

// -------------------------------------------------------
// Control-flow overload type honesty (control-flow-1/4, core-tag-4)
// Each `@ts-expect-error` IS the test — an unfired directive fails the build (TS2578).
// -------------------------------------------------------
describe("control-flow overload type honesty", () => {
  it("IfThen/IfThenElse accept nullable narrowing and plain booleans", () => {
    const s: string | null = "x";
    const b = true;
    assert.strictEqual(render(IfThen(s, (v) => Span(v))), "<span>x</span>");
    assert.strictEqual(render(IfThen(b, () => Span("y"))), "<span>y</span>");
    assert.strictEqual(render(IfThenElse(s, (v) => Span(v), () => Span("-"))), "<span>x</span>");
  });

  // Values arrive as function parameters so control-flow analysis cannot narrow a
  // `const … = null` down to `null` (which would defeat the @ts-expect-error).
  it("IfThen rejects a boolean|null value (must use an explicit comparison)", () => {
    const check = (flag: boolean | null) => {
      // @ts-expect-error — boolean|null resolves to a broken runtime path; compare explicitly
      IfThen(flag, (v) => Span(String(v)));
      return render(IfThen(flag === true, () => Span("on"))); // correct form compiles
    };
    assert.strictEqual(check(null), "");
  });

  it("IfThenElse rejects a boolean|null value", () => {
    const check = (flag: boolean | null) => {
      // @ts-expect-error — boolean|null must use an explicit comparison
      IfThenElse(flag, (v) => Span(String(v)), () => Span("-"));
    };
    check(true);
  });

  it("Match exhaustive form rejects a widened string (must supply a default)", () => {
    const check = (s: string) => {
      // @ts-expect-error — widened string cannot use the no-default exhaustive form
      Match(s, { a: () => Span("A") });
      return render(Match(s, { a: () => Span("A") }, () => Empty())); // partial+default compiles
    };
    assert.strictEqual(check("whatever"), "");
  });

  it("Tag.when rejects a boolean|null value but accepts plain boolean + nullable", () => {
    const check = (flag: boolean | null, name: string | null) => {
      // @ts-expect-error — boolean|null on the value overload
      Div().when(flag, (t, v) => t.setTitle(String(v)));
      Div().when(true, (t) => t.opacity("50"));
      Div().when(name, (t, v) => t.setTitle(v));
    };
    check(null, "n");
  });
});

// Regression (tailwind-fidelity-2): "only-child" is not a Tailwind variant (emits zero CSS).
// The working spellings are "only" / "only-of-type". @ts-expect-error IS the test.
describe("Tailwind variant fidelity", () => {
  it("rejects the non-existent only-child variant, accepts only / only-of-type", () => {
    render(Div().on("only", (t) => t.margin("t", "2")));
    render(Div().on("only-of-type", (t) => t.margin("t", "2")));
    // @ts-expect-error — "only-child" is not a Tailwind variant; use "only"
    render(Div().on("only-child", (t) => t.margin("t", "2")));
  });
});

// -------------------------------------------------------
// Type-honesty: no type that compiles-but-lies (Tier 1 + MatchValue)
// Each `@ts-expect-error` IS the test — an unfired directive fails the build (TS2578).
// -------------------------------------------------------
describe("type honesty — types that used to lie", () => {
  it("Tag.attributes is Readonly (a direct write would compile then throw on the frozen default)", () => {
    assert.throws(() => {
      // @ts-expect-error attributes is Readonly; go through addAttribute()
      Div().attributes["foo"] = "bar";
    }, TypeError);
    // the sanctioned path is unaffected:
    assert.strictEqual(render(Div().addAttribute("data-x", "y")), `<div data-x="y"></div>`);
  });

  it("MatchValue exhaustive form rejects a widened string (returned undefined-as-R before)", () => {
    const pick = (s: string) => {
      // @ts-expect-error widened string cannot use the no-default exhaustive form
      MatchValue(s, { a: "x" });
      return MatchValue(s, { a: "x" }, "def"); // partial + default is correct
    };
    assert.strictEqual(pick("a"), "x");
    assert.strictEqual(pick("z"), "def");
    // literal-union exhaustive still works:
    assert.strictEqual(MatchValue("a" as "a" | "b", { a: "1", b: "2" }), "1");
  });

  it("HxSwap accepts arbitrary delays + ignoreTitle, rejects typos (closed union)", () => {
    for (const s of ["innerHTML settle:250ms", "outerHTML swap:1.5s", "outerHTML ignoreTitle:true", "outerHTML scroll:top swap:500ms"] as const) {
      assert.ok(render(Div().setHtmx({ method: "get", endpoint: "/x", swap: s })).includes(`hx-swap="${s}"`));
    }
    // @ts-expect-error "innerHTM" is a typo — closed union rejects it
    Div().setHtmx({ method: "get", endpoint: "/x", swap: "innerHTM" });
  });

  it("dot-suffixed route params key on the identifier, not the whole segment", () => {
    const r = defineRoutes({ exportCsv: { method: "get", path: "/export/:id.csv" } });
    assert.strictEqual(r.exportCsv.resolve({ id: "abc" }), "/export/abc.csv");
    // @ts-expect-error the param key is "id", not "id.csv"
    r.exportCsv.resolve({ "id.csv": "abc" });
  });

  it("prefix params are declarable and typed (were rejected / silently string before)", () => {
    const u = defineRoutes("/users/:userId", {
      posts: { method: "get", path: "/posts", params: { userId: "number" } as const },
    });
    assert.strictEqual(u.posts.resolve({ userId: 42 }), "/users/42/posts");
    assert.throws(() => {
      // @ts-expect-error userId (from the prefix) is required
      u.posts.resolve({});
    });
    // @ts-expect-error userId is typed number, not string (harmless at runtime — just checks the type)
    u.posts.resolve({ userId: "42" });
  });
});

// -------------------------------------------------------
// Closed-union honesty: numeric unions no longer carry a naked (string & {}) tail,
// so a typo is a compile error again instead of a silently-dead class (type-honesty-6).
// -------------------------------------------------------
describe("numeric Tailwind unions reject typos (no (string & {}) tail)", () => {
  it("valid numeric / bracket values still compile and render", () => {
    assert.strictEqual(render(Div().duration(150)), `<div class="duration-150"></div>`);
    assert.strictEqual(render(Div().gridCols("16")), `<div class="grid-cols-16"></div>`);
    assert.strictEqual(render(Div().colSpan("13")), `<div class="col-span-13"></div>`);
    assert.strictEqual(render(Div().duration("[2s]")), `<div class="duration-[2s]"></div>`);
    assert.strictEqual(render(Div().ring("2")), `<div class="ring-2"></div>`);
    assert.strictEqual(render(Div().lineClamp(3)), `<div class="line-clamp-3"></div>`);
  });

  it("garbage strings are compile errors (each @ts-expect-error IS the test)", () => {
    // @ts-expect-error duration typo
    Div().duration("fast");
    // @ts-expect-error gridCols typo
    Div().gridCols("brnad");
    // @ts-expect-error ring typo
    Div().ring("thick");
    // @ts-expect-error scale typo
    Div().scale("huge");
    // @ts-expect-error lineClamp typo
    Div().lineClamp("many");
    // @ts-expect-error delay typo
    Div().delay("soon");
  });
});
