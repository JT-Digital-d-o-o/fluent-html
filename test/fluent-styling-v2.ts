import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { Div, Button, Span, render, Tag } from "../src/index.js";

describe("Layout & Display", () => {
  it("display block", () => { assert.strictEqual(render(Div().display("block")), '<div class="block"></div>'); });
  it("display inline-flex", () => { assert.strictEqual(render(Div().display("inline-flex")), '<div class="inline-flex"></div>'); });
  it("hidden", () => { assert.strictEqual(render(Div().hidden()), '<div class="hidden"></div>'); });
  it("inset", () => { assert.strictEqual(render(Div().inset("0")), '<div class="inset-0"></div>'); });
  it("top", () => { assert.strictEqual(render(Div().top("4")), '<div class="top-4"></div>'); });
  it("right", () => { assert.strictEqual(render(Div().right("0")), '<div class="right-0"></div>'); });
  it("bottom", () => { assert.strictEqual(render(Div().bottom("0")), '<div class="bottom-0"></div>'); });
  it("left", () => { assert.strictEqual(render(Div().left("0")), '<div class="left-0"></div>'); });
  it("position with inset", () => { assert.strictEqual(render(Div().position("absolute").inset("0")), '<div class="absolute inset-0"></div>'); });
  it("position with top/left", () => { assert.strictEqual(render(Div().position("absolute").top("0").left("0")), '<div class="absolute top-0 left-0"></div>'); });
});

describe("Flexbox & Grid Extensions", () => {
  it("shrink default", () => { assert.strictEqual(render(Div().shrink()), '<div class="shrink"></div>'); });
  it("shrink 0", () => { assert.strictEqual(render(Div().shrink("0")), '<div class="shrink-0"></div>'); });
  it("grow default", () => { assert.strictEqual(render(Div().grow()), '<div class="grow"></div>'); });
  it("grow 0", () => { assert.strictEqual(render(Div().grow("0")), '<div class="grow-0"></div>'); });
  it("flexWrap wrap", () => { assert.strictEqual(render(Div().flexWrap("wrap")), '<div class="flex-wrap"></div>'); });
  it("flexWrap nowrap", () => { assert.strictEqual(render(Div().flexWrap("nowrap")), '<div class="flex-nowrap"></div>'); });
  it("alignSelf center", () => { assert.strictEqual(render(Div().alignSelf("center")), '<div class="self-center"></div>'); });
  it("alignSelf stretch", () => { assert.strictEqual(render(Div().alignSelf("stretch")), '<div class="self-stretch"></div>'); });
  it("colSpan 2", () => { assert.strictEqual(render(Div().colSpan("2")), '<div class="col-span-2"></div>'); });
  it("colSpan full", () => { assert.strictEqual(render(Div().colSpan("full")), '<div class="col-span-full"></div>'); });
  it("aspect video", () => { assert.strictEqual(render(Div().aspect("video")), '<div class="aspect-video"></div>'); });
  it("aspect square", () => { assert.strictEqual(render(Div().aspect("square")), '<div class="aspect-square"></div>'); });
});

describe("Spacing Between Children", () => {
  it("spaceX", () => { assert.strictEqual(render(Div().spaceX("4")), '<div class="space-x-4"></div>'); });
  it("spaceY", () => { assert.strictEqual(render(Div().spaceY("2")), '<div class="space-y-2"></div>'); });
  it("divideX default", () => { assert.strictEqual(render(Div().divideX()), '<div class="divide-x"></div>'); });
  it("divideY default", () => { assert.strictEqual(render(Div().divideY()), '<div class="divide-y"></div>'); });
  it("divideX with width", () => { assert.strictEqual(render(Div().divideX("2")), '<div class="divide-x-2"></div>'); });
  it("divideY with width", () => { assert.strictEqual(render(Div().divideY("4")), '<div class="divide-y-4"></div>'); });
});

describe("Transitions & Animation", () => {
  it("transition default", () => { assert.strictEqual(render(Div().transition()), '<div class="transition"></div>'); });
  it("transition colors", () => { assert.strictEqual(render(Div().transition("colors")), '<div class="transition-colors"></div>'); });
  it("duration", () => { assert.strictEqual(render(Div().duration("200")), '<div class="duration-200"></div>'); });
  it("transition + duration", () => { assert.strictEqual(render(Div().transition().duration("200")), '<div class="transition duration-200"></div>'); });
  it("animate spin", () => { assert.strictEqual(render(Div().animate("spin")), '<div class="animate-spin"></div>'); });
  it("animate bounce", () => { assert.strictEqual(render(Div().animate("bounce")), '<div class="animate-bounce"></div>'); });
});

describe("Ring (Focus Rings)", () => {
  it("ring default", () => { assert.strictEqual(render(Div().ring()), '<div class="ring"></div>'); });
  it("ring 2", () => { assert.strictEqual(render(Div().ring("2")), '<div class="ring-2"></div>'); });
  it("ringColor", () => { assert.strictEqual(render(Div().ringColor("blue-300")), '<div class="ring-blue-300"></div>'); });
  it("ring + ringColor", () => { assert.strictEqual(render(Button().ring("2").ringColor("blue-300")), '<button class="ring-2 ring-blue-300"></button>'); });
});

describe("Transforms", () => {
  it("scale", () => { assert.strictEqual(render(Div().scale("105")), '<div class="scale-105"></div>'); });
  it("rotate", () => { assert.strictEqual(render(Div().rotate("45")), '<div class="rotate-45"></div>'); });
  it("translate x", () => { assert.strictEqual(render(Div().translate("x", "4")), '<div class="translate-x-4"></div>'); });
  it("translate y", () => { assert.strictEqual(render(Div().translate("y", "2")), '<div class="translate-y-2"></div>'); });
});

describe("Interactivity", () => {
  it("select none", () => { assert.strictEqual(render(Button().select("none")), '<button class="select-none"></button>'); });
  it("select text", () => { assert.strictEqual(render(Div().select("text")), '<div class="select-text"></div>'); });
  it("pointerEvents none", () => { assert.strictEqual(render(Div().pointerEvents("none")), '<div class="pointer-events-none"></div>'); });
  it("pointerEvents auto", () => { assert.strictEqual(render(Div().pointerEvents("auto")), '<div class="pointer-events-auto"></div>'); });
});

describe("Text & Whitespace", () => {
  it("whitespace nowrap", () => { assert.strictEqual(render(Div().whitespace("nowrap")), '<div class="whitespace-nowrap"></div>'); });
  it("whitespace pre", () => { assert.strictEqual(render(Div().whitespace("pre")), '<div class="whitespace-pre"></div>'); });
});

describe("Accessibility", () => {
  it("srOnly", () => { assert.strictEqual(render(Span().srOnly()), '<span class="sr-only"></span>'); });
});

describe("Text Decoration", () => {
  it("noUnderline", () => { assert.strictEqual(render(new Tag("a").noUnderline()), '<a class="no-underline"></a>'); });
  it("underline + noUnderline on hover", () => {
    assert.strictEqual(
      render(new Tag("a").underline().on("hover", t => t.noUnderline())),
      '<a class="underline hover:no-underline"></a>'
    );
  });
});

describe("Outline", () => {
  it("outline none", () => { assert.strictEqual(render(Button().outline("none")), '<button class="outline-none"></button>'); });
  it("outline dashed", () => { assert.strictEqual(render(Div().outline("dashed")), '<div class="outline-dashed"></div>'); });
});

describe("Variant Proxy - .on()", () => {
  it("on hover - single property", () => {
    assert.strictEqual(render(Button().on("hover", t => t.background("blue-600"))), '<button class="hover:bg-blue-600"></button>');
  });
  it("on hover - multiple properties", () => {
    assert.strictEqual(render(Button().on("hover", t => t.background("blue-600").scale("105"))), '<button class="hover:bg-blue-600 hover:scale-105"></button>');
  });
  it("on focus - ring + outline", () => {
    assert.strictEqual(render(Button().on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))), '<button class="focus:ring-2 focus:ring-blue-300 focus:outline-none"></button>');
  });
  it("on disabled", () => {
    assert.strictEqual(render(Button().on("disabled", t => t.opacity("50").cursor("not-allowed"))), '<button class="disabled:opacity-50 disabled:cursor-not-allowed"></button>');
  });
  it("on dark", () => {
    assert.strictEqual(render(Div().on("dark", t => t.background("gray-900"))), '<div class="dark:bg-gray-900"></div>');
  });
  it("on group-hover", () => {
    assert.strictEqual(render(Div().on("group-hover", t => t.opacity("100"))), '<div class="group-hover:opacity-100"></div>');
  });
  it("empty callback is no-op", () => {
    assert.strictEqual(render(Div().on("hover", t => t)), '<div></div>');
  });
});

describe("Variant Proxy - .at()", () => {
  it("at md", () => { assert.strictEqual(render(Div().at("md", t => t.w("1/2"))), '<div class="md:w-1/2"></div>'); });
  it("at lg", () => { assert.strictEqual(render(Div().at("lg", t => t.w("1/3"))), '<div class="lg:w-1/3"></div>'); });
  it("responsive chain", () => {
    assert.strictEqual(
      render(Div().w("full").at("md", t => t.w("1/2")).at("lg", t => t.w("1/3"))),
      '<div class="w-full md:w-1/2 lg:w-1/3"></div>'
    );
  });
  it("at with multiple properties", () => {
    assert.strictEqual(render(Div().at("md", t => t.padding("x", "8").textSize("lg"))), '<div class="md:px-8 md:text-lg"></div>');
  });
});

describe("Variant Proxy - Nesting", () => {
  it("nested dark:hover", () => {
    assert.strictEqual(render(Div().on("dark", t => t.on("hover", t => t.background("gray-700")))), '<div class="dark:hover:bg-gray-700"></div>');
  });
  it("nested md:hover", () => {
    assert.strictEqual(render(Div().at("md", t => t.on("hover", t => t.shadow("lg")))), '<div class="md:hover:shadow-lg"></div>');
  });
  it("complex nesting dark + hover + base", () => {
    assert.strictEqual(
      render(Div().background("white").on("dark", t => t
        .background("gray-900")
        .on("hover", t => t.background("gray-800"))
      )),
      '<div class="bg-white dark:bg-gray-900 dark:hover:bg-gray-800"></div>'
    );
  });
});

describe("Variant Proxy - Integration", () => {
  it("base + hover + focus + disabled", () => {
    assert.strictEqual(
      render(
        Button()
          .background("blue-500").textColor("white").rounded()
          .on("hover", t => t.background("blue-600"))
          .on("focus", t => t.ring("2"))
          .on("disabled", t => t.opacity("50"))
      ),
      '<button class="bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 disabled:opacity-50"></button>'
    );
  });
  it("transition + variant proxy", () => {
    assert.strictEqual(
      render(
        Button()
          .background("blue-500")
          .transition().duration("200")
          .on("hover", t => t.background("blue-600").scale("105"))
      ),
      '<button class="bg-blue-500 transition duration-200 hover:bg-blue-600 hover:scale-105"></button>'
    );
  });
  it("variant proxy with .when()", () => {
    assert.strictEqual(
      render(
        Button()
          .on("hover", t => t.background("blue-600"))
          .when(true, t => t.on("disabled", t => t.opacity("50")))
      ),
      '<button class="hover:bg-blue-600 disabled:opacity-50"></button>'
    );
  });
  it("variant proxy skipped with .when(false)", () => {
    assert.strictEqual(
      render(
        Button()
          .on("hover", t => t.background("blue-600"))
          .when(false, t => t.on("disabled", t => t.opacity("50")))
      ),
      '<button class="hover:bg-blue-600"></button>'
    );
  });
  it("variant proxy with .apply()", () => {
    assert.strictEqual(
      render(
        Div().apply(t => t
          .transition().duration("200")
          .on("hover", t => t.shadow("lg").translate("y", "1"))
        )
      ),
      '<div class="transition duration-200 hover:shadow-lg hover:translate-y-1"></div>'
    );
  });
  it("addClass inside variant callback with multiple classes", () => {
    assert.strictEqual(render(Div().on("hover", t => t.addClass("foo bar"))), '<div class="hover:foo hover:bar"></div>');
  });
  it("raw addClass outside variant still works", () => {
    assert.strictEqual(render(Div().addClass("hover:bg-blue-600")), '<div class="hover:bg-blue-600"></div>');
  });
});

describe("Full Example (Plan Before/After)", () => {
  it("complete button with all features", () => {
    assert.strictEqual(
      render(
        Button()
          .padding("x", "4").padding("y", "2")
          .background("blue-500").textColor("white").rounded()
          .transition().duration("200")
          .on("hover", t => t.background("blue-600").scale("105").shadow("lg"))
          .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
          .on("disabled", t => t.opacity("50").cursor("not-allowed"))
          .at("md", t => t.padding("x", "8").textSize("lg"))
      ),
      '<button class="px-4 py-2 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed md:px-8 md:text-lg"></button>'
    );
  });
});
