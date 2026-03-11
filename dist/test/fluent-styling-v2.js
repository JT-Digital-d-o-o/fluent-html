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
        assert.strictEqual(render(new Tag("a").underline().on("hover", t => t.noUnderline())), '<a class="underline hover:no-underline"></a>');
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
        assert.strictEqual(render(Div().w("full").at("md", t => t.w("1/2")).at("lg", t => t.w("1/3"))), '<div class="w-full md:w-1/2 lg:w-1/3"></div>');
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
        assert.strictEqual(render(Div().background("white").on("dark", t => t
            .background("gray-900")
            .on("hover", t => t.background("gray-800")))), '<div class="bg-white dark:bg-gray-900 dark:hover:bg-gray-800"></div>');
    });
});
describe("Variant Proxy - Integration", () => {
    it("base + hover + focus + disabled", () => {
        assert.strictEqual(render(Button()
            .background("blue-500").textColor("white").rounded()
            .on("hover", t => t.background("blue-600"))
            .on("focus", t => t.ring("2"))
            .on("disabled", t => t.opacity("50"))), '<button class="bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 disabled:opacity-50"></button>');
    });
    it("transition + variant proxy", () => {
        assert.strictEqual(render(Button()
            .background("blue-500")
            .transition().duration("200")
            .on("hover", t => t.background("blue-600").scale("105"))), '<button class="bg-blue-500 transition duration-200 hover:bg-blue-600 hover:scale-105"></button>');
    });
    it("variant proxy with .when()", () => {
        assert.strictEqual(render(Button()
            .on("hover", t => t.background("blue-600"))
            .when(true, t => t.on("disabled", t => t.opacity("50")))), '<button class="hover:bg-blue-600 disabled:opacity-50"></button>');
    });
    it("variant proxy skipped with .when(false)", () => {
        assert.strictEqual(render(Button()
            .on("hover", t => t.background("blue-600"))
            .when(false, t => t.on("disabled", t => t.opacity("50")))), '<button class="hover:bg-blue-600"></button>');
    });
    it("variant proxy with .apply()", () => {
        assert.strictEqual(render(Div().apply(t => t
            .transition().duration("200")
            .on("hover", t => t.shadow("lg").translate("y", "1")))), '<div class="transition duration-200 hover:shadow-lg hover:translate-y-1"></div>');
    });
    it("addClass inside variant callback with multiple classes", () => {
        assert.strictEqual(render(Div().on("hover", t => t.addClass("foo bar"))), '<div class="hover:foo hover:bar"></div>');
    });
    it("raw addClass outside variant still works", () => {
        assert.strictEqual(render(Div().addClass("hover:bg-blue-600")), '<div class="hover:bg-blue-600"></div>');
    });
});
describe("Custom theme values via escape hatch", () => {
    it("custom color in background()", () => {
        assert.strictEqual(render(Div().background("accent")), '<div class="bg-accent"></div>');
    });
    it("custom color with shade in background()", () => {
        assert.strictEqual(render(Div().background("brand-500")), '<div class="bg-brand-500"></div>');
    });
    it("custom color in textColor()", () => {
        assert.strictEqual(render(Span().textColor("accent-dark")), '<span class="text-accent-dark"></span>');
    });
    it("custom color in borderColor()", () => {
        assert.strictEqual(render(Div().borderColor("accent-light")), '<div class="border-accent-light"></div>');
    });
    it("custom color in ringColor()", () => {
        assert.strictEqual(render(Button().ring("2").ringColor("accent")), '<button class="ring-2 ring-accent"></button>');
    });
    it("custom color in variant proxy", () => {
        assert.strictEqual(render(Div().on("hover", t => t.background("accent"))), '<div class="hover:bg-accent"></div>');
    });
    it("custom spacing in padding()", () => {
        assert.strictEqual(render(Div().padding("18")), '<div class="p-18"></div>');
    });
    it("custom spacing in gap()", () => {
        assert.strictEqual(render(Div().gap("18")), '<div class="gap-18"></div>');
    });
});
describe("Directional rounded()", () => {
    it("rounded top", () => { assert.strictEqual(render(Div().rounded("t", "sm")), '<div class="rounded-t-sm"></div>'); });
    it("rounded bottom lg", () => { assert.strictEqual(render(Div().rounded("b", "lg")), '<div class="rounded-b-lg"></div>'); });
    it("rounded top-left", () => { assert.strictEqual(render(Div().rounded("tl", "md")), '<div class="rounded-tl-md"></div>'); });
    it("rounded top-right", () => { assert.strictEqual(render(Div().rounded("tr", "lg")), '<div class="rounded-tr-lg"></div>'); });
    it("rounded bottom-left", () => { assert.strictEqual(render(Div().rounded("bl", "sm")), '<div class="rounded-bl-sm"></div>'); });
    it("rounded bottom-right full", () => { assert.strictEqual(render(Div().rounded("br", "full")), '<div class="rounded-br-full"></div>'); });
    it("rounded corner default (no size)", () => { assert.strictEqual(render(Div().rounded("t")), '<div class="rounded-t"></div>'); });
    it("rounded start/end", () => { assert.strictEqual(render(Div().rounded("s", "lg")), '<div class="rounded-s-lg"></div>'); });
    it("size-only still works", () => { assert.strictEqual(render(Div().rounded("lg")), '<div class="rounded-lg"></div>'); });
    it("no-arg still works", () => { assert.strictEqual(render(Div().rounded()), '<div class="rounded"></div>'); });
    it("rounded none still works", () => { assert.strictEqual(render(Div().rounded("none")), '<div class="rounded-none"></div>'); });
});
describe("Arbitrary value overloads (unit, amount)", () => {
    // Sizing
    it("w with px", () => { assert.strictEqual(render(Div().w("px", 200)), '<div class="w-[200px]"></div>'); });
    it("w with rem", () => { assert.strictEqual(render(Div().w("rem", 12)), '<div class="w-[12rem]"></div>'); });
    it("h with vh", () => { assert.strictEqual(render(Div().h("vh", 100)), '<div class="h-[100vh]"></div>'); });
    it("h with em", () => { assert.strictEqual(render(Div().h("em", 2.5)), '<div class="h-[2.5em]"></div>'); });
    it("minW with px", () => { assert.strictEqual(render(Div().minW("px", 300)), '<div class="min-w-[300px]"></div>'); });
    it("maxW with rem", () => { assert.strictEqual(render(Div().maxW("rem", 64)), '<div class="max-w-[64rem]"></div>'); });
    it("minH with px", () => { assert.strictEqual(render(Div().minH("px", 180)), '<div class="min-h-[180px]"></div>'); });
    it("maxH with dvh", () => { assert.strictEqual(render(Div().maxH("dvh", 80)), '<div class="max-h-[80dvh]"></div>'); });
    // Spacing
    it("padding with px", () => { assert.strictEqual(render(Div().padding("px", 16)), '<div class="p-[16px]"></div>'); });
    it("padding with rem", () => { assert.strictEqual(render(Div().padding("rem", 1.5)), '<div class="p-[1.5rem]"></div>'); });
    it("margin with em", () => { assert.strictEqual(render(Div().margin("em", 2)), '<div class="m-[2em]"></div>'); });
    it("margin with %", () => { assert.strictEqual(render(Div().margin("%", 50)), '<div class="m-[50%]"></div>'); });
    // Gap
    it("gap with px", () => { assert.strictEqual(render(Div().gap("px", 8)), '<div class="gap-[8px]"></div>'); });
    it("gap with rem", () => { assert.strictEqual(render(Div().gap("rem", 1)), '<div class="gap-[1rem]"></div>'); });
    // Position (top/right/bottom/left/inset)
    it("top with px", () => { assert.strictEqual(render(Div().top("px", 10)), '<div class="top-[10px]"></div>'); });
    it("right with rem", () => { assert.strictEqual(render(Div().right("rem", 2)), '<div class="right-[2rem]"></div>'); });
    it("bottom with %", () => { assert.strictEqual(render(Div().bottom("%", 100)), '<div class="bottom-[100%]"></div>'); });
    it("left with vw", () => { assert.strictEqual(render(Div().left("vw", 50)), '<div class="left-[50vw]"></div>'); });
    it("inset with px", () => { assert.strictEqual(render(Div().inset("px", 0)), '<div class="inset-[0px]"></div>'); });
    // Existing overloads still work
    it("w with named value still works", () => { assert.strictEqual(render(Div().w("full")), '<div class="w-full"></div>'); });
    it("padding with direction still works", () => { assert.strictEqual(render(Div().padding("x", "4")), '<div class="px-4"></div>'); });
    it("gap with direction still works", () => { assert.strictEqual(render(Div().gap("x", "2")), '<div class="gap-x-2"></div>'); });
    it("margin auto still works", () => { assert.strictEqual(render(Div().margin("auto")), '<div class="m-auto"></div>'); });
    // Works with variant proxy
    it("unit overload inside .on()", () => {
        assert.strictEqual(render(Div().on("hover", t => t.w("px", 300))), '<div class="hover:w-[300px]"></div>');
    });
    it("unit overload inside .at()", () => {
        assert.strictEqual(render(Div().w("full").at("md", t => t.w("px", 640))), '<div class="w-full md:w-[640px]"></div>');
    });
    // Decimal values
    it("fractional rem", () => { assert.strictEqual(render(Div().padding("rem", 0.75)), '<div class="p-[0.75rem]"></div>'); });
    // All unit types
    it("svh unit", () => { assert.strictEqual(render(Div().h("svh", 100)), '<div class="h-[100svh]"></div>'); });
    it("lvh unit", () => { assert.strictEqual(render(Div().h("lvh", 100)), '<div class="h-[100lvh]"></div>'); });
    it("vw unit", () => { assert.strictEqual(render(Div().w("vw", 100)), '<div class="w-[100vw]"></div>'); });
});
describe("Escape hatch for newly opened types", () => {
    it("custom textSize", () => { assert.strictEqual(render(Div().textSize("[13px]")), '<div class="text-[13px]"></div>'); });
    it("custom fontWeight", () => { assert.strictEqual(render(Div().fontWeight("[450]")), '<div class="font-[450]"></div>'); });
    it("custom leading", () => { assert.strictEqual(render(Div().leading("[1.35]")), '<div class="leading-[1.35]"></div>'); });
    it("custom tracking", () => { assert.strictEqual(render(Div().tracking("[0.02em]")), '<div class="tracking-[0.02em]"></div>'); });
    it("custom rounded", () => { assert.strictEqual(render(Div().rounded("[3px]")), '<div class="rounded-[3px]"></div>'); });
    it("custom shadow", () => { assert.strictEqual(render(Div().shadow("[0_2px_4px_rgba(0,0,0,0.1)]")), '<div class="shadow-[0_2px_4px_rgba(0,0,0,0.1)]"></div>'); });
    it("custom border width", () => { assert.strictEqual(render(Div().border("[1.5px]")), '<div class="border-[1.5px]"></div>'); });
    it("custom opacity", () => { assert.strictEqual(render(Div().opacity("[0.33]")), '<div class="opacity-[0.33]"></div>'); });
    it("custom zIndex", () => { assert.strictEqual(render(Div().zIndex("[999]")), '<div class="z-[999]"></div>'); });
    it("custom gridCols", () => { assert.strictEqual(render(Div().gridCols("13")), '<div class="grid-cols-13"></div>'); });
    it("custom gridRows", () => { assert.strictEqual(render(Div().gridRows("13")), '<div class="grid-rows-13"></div>'); });
    it("custom duration", () => { assert.strictEqual(render(Div().duration("250")), '<div class="duration-250"></div>'); });
    it("custom ringWidth", () => { assert.strictEqual(render(Div().ring("[1.5px]")), '<div class="ring-[1.5px]"></div>'); });
    it("custom scale", () => { assert.strictEqual(render(Div().scale("[1.15]")), '<div class="scale-[1.15]"></div>'); });
    it("custom rotate", () => { assert.strictEqual(render(Div().rotate("[15deg]")), '<div class="rotate-[15deg]"></div>'); });
    it("custom colSpan", () => { assert.strictEqual(render(Div().colSpan("13")), '<div class="col-span-13"></div>'); });
});
describe("List Style", () => {
    it("listStyleType disc", () => { assert.strictEqual(render(Div().listStyleType("disc")), '<div class="list-disc"></div>'); });
    it("listStyleType decimal", () => { assert.strictEqual(render(Div().listStyleType("decimal")), '<div class="list-decimal"></div>'); });
    it("listStyleType none", () => { assert.strictEqual(render(Div().listStyleType("none")), '<div class="list-none"></div>'); });
    it("listStylePosition inside", () => { assert.strictEqual(render(Div().listStylePosition("inside")), '<div class="list-inside"></div>'); });
    it("listStylePosition outside", () => { assert.strictEqual(render(Div().listStylePosition("outside")), '<div class="list-outside"></div>'); });
    it("chained list styles", () => { assert.strictEqual(render(Div().listStyleType("disc").listStylePosition("inside")), '<div class="list-disc list-inside"></div>'); });
    it("custom listStyleType via escape hatch", () => { assert.strictEqual(render(Div().listStyleType("[square]")), '<div class="list-[square]"></div>'); });
});
describe("Full Example (Plan Before/After)", () => {
    it("complete button with all features", () => {
        assert.strictEqual(render(Button()
            .padding("x", "4").padding("y", "2")
            .background("blue-500").textColor("white").rounded()
            .transition().duration("200")
            .on("hover", t => t.background("blue-600").scale("105").shadow("lg"))
            .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
            .on("disabled", t => t.opacity("50").cursor("not-allowed"))
            .at("md", t => t.padding("x", "8").textSize("lg"))), '<button class="px-4 py-2 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed md:px-8 md:text-lg"></button>');
    });
});
//# sourceMappingURL=fluent-styling-v2.js.map