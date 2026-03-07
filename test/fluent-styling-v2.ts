import { Div, Button, Span, Img, render, Tag } from "../src/index.js";

let passed = 0;
let failed = 0;

function test(name: string, expected: string, actual: string) {
  if (expected === actual) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Got:      ${actual}`);
    failed++;
  }
}

function section(name: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(name);
  console.log("=".repeat(50));
}

// ============================================
// Part 1: New Fluent Methods
// ============================================

section("Layout & Display");

test(
  "display block",
  '<div class="block"></div>',
  render(Div().display("block"))
);

test(
  "display inline-flex",
  '<div class="inline-flex"></div>',
  render(Div().display("inline-flex"))
);

test(
  "hidden",
  '<div class="hidden"></div>',
  render(Div().hidden())
);

test(
  "inset",
  '<div class="inset-0"></div>',
  render(Div().inset("0"))
);

test(
  "top",
  '<div class="top-4"></div>',
  render(Div().top("4"))
);

test(
  "right",
  '<div class="right-0"></div>',
  render(Div().right("0"))
);

test(
  "bottom",
  '<div class="bottom-0"></div>',
  render(Div().bottom("0"))
);

test(
  "left",
  '<div class="left-0"></div>',
  render(Div().left("0"))
);

test(
  "position with inset",
  '<div class="absolute inset-0"></div>',
  render(Div().position("absolute").inset("0"))
);

test(
  "position with top/left",
  '<div class="absolute top-0 left-0"></div>',
  render(Div().position("absolute").top("0").left("0"))
);

section("Flexbox & Grid Extensions");

test(
  "shrink default",
  '<div class="shrink"></div>',
  render(Div().shrink())
);

test(
  "shrink 0",
  '<div class="shrink-0"></div>',
  render(Div().shrink("0"))
);

test(
  "grow default",
  '<div class="grow"></div>',
  render(Div().grow())
);

test(
  "grow 0",
  '<div class="grow-0"></div>',
  render(Div().grow("0"))
);

test(
  "flexWrap wrap",
  '<div class="flex-wrap"></div>',
  render(Div().flexWrap("wrap"))
);

test(
  "flexWrap nowrap",
  '<div class="flex-nowrap"></div>',
  render(Div().flexWrap("nowrap"))
);

test(
  "alignSelf center",
  '<div class="self-center"></div>',
  render(Div().alignSelf("center"))
);

test(
  "alignSelf stretch",
  '<div class="self-stretch"></div>',
  render(Div().alignSelf("stretch"))
);

test(
  "colSpan 2",
  '<div class="col-span-2"></div>',
  render(Div().colSpan("2"))
);

test(
  "colSpan full",
  '<div class="col-span-full"></div>',
  render(Div().colSpan("full"))
);

test(
  "aspect video",
  '<div class="aspect-video"></div>',
  render(Div().aspect("video"))
);

test(
  "aspect square",
  '<div class="aspect-square"></div>',
  render(Div().aspect("square"))
);

section("Spacing Between Children");

test(
  "spaceX",
  '<div class="space-x-4"></div>',
  render(Div().spaceX("4"))
);

test(
  "spaceY",
  '<div class="space-y-2"></div>',
  render(Div().spaceY("2"))
);

test(
  "divideX default",
  '<div class="divide-x"></div>',
  render(Div().divideX())
);

test(
  "divideY default",
  '<div class="divide-y"></div>',
  render(Div().divideY())
);

test(
  "divideX with width",
  '<div class="divide-x-2"></div>',
  render(Div().divideX("2"))
);

test(
  "divideY with width",
  '<div class="divide-y-4"></div>',
  render(Div().divideY("4"))
);

section("Transitions & Animation");

test(
  "transition default",
  '<div class="transition"></div>',
  render(Div().transition())
);

test(
  "transition colors",
  '<div class="transition-colors"></div>',
  render(Div().transition("colors"))
);

test(
  "duration",
  '<div class="duration-200"></div>',
  render(Div().duration("200"))
);

test(
  "transition + duration",
  '<div class="transition duration-200"></div>',
  render(Div().transition().duration("200"))
);

test(
  "animate spin",
  '<div class="animate-spin"></div>',
  render(Div().animate("spin"))
);

test(
  "animate bounce",
  '<div class="animate-bounce"></div>',
  render(Div().animate("bounce"))
);

section("Ring (Focus Rings)");

test(
  "ring default",
  '<div class="ring"></div>',
  render(Div().ring())
);

test(
  "ring 2",
  '<div class="ring-2"></div>',
  render(Div().ring("2"))
);

test(
  "ringColor",
  '<div class="ring-blue-300"></div>',
  render(Div().ringColor("blue-300"))
);

test(
  "ring + ringColor",
  '<button class="ring-2 ring-blue-300"></button>',
  render(Button().ring("2").ringColor("blue-300"))
);

section("Transforms");

test(
  "scale",
  '<div class="scale-105"></div>',
  render(Div().scale("105"))
);

test(
  "rotate",
  '<div class="rotate-45"></div>',
  render(Div().rotate("45"))
);

test(
  "translate x",
  '<div class="translate-x-4"></div>',
  render(Div().translate("x", "4"))
);

test(
  "translate y",
  '<div class="translate-y-2"></div>',
  render(Div().translate("y", "2"))
);

section("Interactivity");

test(
  "select none",
  '<button class="select-none"></button>',
  render(Button().select("none"))
);

test(
  "select text",
  '<div class="select-text"></div>',
  render(Div().select("text"))
);

test(
  "pointerEvents none",
  '<div class="pointer-events-none"></div>',
  render(Div().pointerEvents("none"))
);

test(
  "pointerEvents auto",
  '<div class="pointer-events-auto"></div>',
  render(Div().pointerEvents("auto"))
);

section("Text & Whitespace");

test(
  "whitespace nowrap",
  '<div class="whitespace-nowrap"></div>',
  render(Div().whitespace("nowrap"))
);

test(
  "whitespace pre",
  '<div class="whitespace-pre"></div>',
  render(Div().whitespace("pre"))
);

section("Accessibility");

test(
  "srOnly",
  '<span class="sr-only"></span>',
  render(Span().srOnly())
);

section("Outline");

test(
  "outline none",
  '<button class="outline-none"></button>',
  render(Button().outline("none"))
);

test(
  "outline dashed",
  '<div class="outline-dashed"></div>',
  render(Div().outline("dashed"))
);

// ============================================
// Part 2: Variant Proxy
// ============================================

section("Variant Proxy - .on()");

test(
  "on hover - single property",
  '<button class="hover:bg-blue-600"></button>',
  render(Button().on("hover", t => t.background("blue-600")))
);

test(
  "on hover - multiple properties",
  '<button class="hover:bg-blue-600 hover:scale-105"></button>',
  render(Button().on("hover", t => t.background("blue-600").scale("105")))
);

test(
  "on focus - ring + outline",
  '<button class="focus:ring-2 focus:ring-blue-300 focus:outline-none"></button>',
  render(Button().on("focus", t => t.ring("2").ringColor("blue-300").outline("none")))
);

test(
  "on disabled",
  '<button class="disabled:opacity-50 disabled:cursor-not-allowed"></button>',
  render(Button().on("disabled", t => t.opacity("50").cursor("not-allowed")))
);

test(
  "on dark",
  '<div class="dark:bg-gray-900"></div>',
  render(Div().on("dark", t => t.background("gray-900")))
);

test(
  "on group-hover",
  '<div class="group-hover:opacity-100"></div>',
  render(Div().on("group-hover", t => t.opacity("100")))
);

test(
  "empty callback is no-op",
  '<div></div>',
  render(Div().on("hover", t => t))
);

section("Variant Proxy - .at()");

test(
  "at md",
  '<div class="md:w-1/2"></div>',
  render(Div().at("md", t => t.w("1/2")))
);

test(
  "at lg",
  '<div class="lg:w-1/3"></div>',
  render(Div().at("lg", t => t.w("1/3")))
);

test(
  "responsive chain",
  '<div class="w-full md:w-1/2 lg:w-1/3"></div>',
  render(Div().w("full").at("md", t => t.w("1/2")).at("lg", t => t.w("1/3")))
);

test(
  "at with multiple properties",
  '<div class="md:px-8 md:text-lg"></div>',
  render(Div().at("md", t => t.padding("x", "8").textSize("lg")))
);

section("Variant Proxy - Nesting");

test(
  "nested dark:hover",
  '<div class="dark:hover:bg-gray-700"></div>',
  render(Div().on("dark", t => t.on("hover", t => t.background("gray-700"))))
);

test(
  "nested md:hover",
  '<div class="md:hover:shadow-lg"></div>',
  render(Div().at("md", t => t.on("hover", t => t.shadow("lg"))))
);

test(
  "complex nesting dark + hover + base",
  '<div class="bg-white dark:bg-gray-900 dark:hover:bg-gray-800"></div>',
  render(Div().background("white").on("dark", t => t
    .background("gray-900")
    .on("hover", t => t.background("gray-800"))
  ))
);

section("Variant Proxy - Integration");

test(
  "base + hover + focus + disabled",
  '<button class="bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 disabled:opacity-50"></button>',
  render(
    Button()
      .background("blue-500").textColor("white").rounded()
      .on("hover", t => t.background("blue-600"))
      .on("focus", t => t.ring("2"))
      .on("disabled", t => t.opacity("50"))
  )
);

test(
  "transition + variant proxy",
  '<button class="bg-blue-500 transition duration-200 hover:bg-blue-600 hover:scale-105"></button>',
  render(
    Button()
      .background("blue-500")
      .transition().duration("200")
      .on("hover", t => t.background("blue-600").scale("105"))
  )
);

test(
  "variant proxy with .when()",
  '<button class="hover:bg-blue-600 disabled:opacity-50"></button>',
  render(
    Button()
      .on("hover", t => t.background("blue-600"))
      .when(true, t => t.on("disabled", t => t.opacity("50")))
  )
);

test(
  "variant proxy skipped with .when(false)",
  '<button class="hover:bg-blue-600"></button>',
  render(
    Button()
      .on("hover", t => t.background("blue-600"))
      .when(false, t => t.on("disabled", t => t.opacity("50")))
  )
);

test(
  "variant proxy with .apply()",
  '<div class="transition duration-200 hover:shadow-lg hover:translate-y-1"></div>',
  render(
    Div().apply(t => t
      .transition().duration("200")
      .on("hover", t => t.shadow("lg").translate("y", "1"))
    )
  )
);

test(
  "addClass inside variant callback with multiple classes",
  '<div class="hover:foo hover:bar"></div>',
  render(Div().on("hover", t => t.addClass("foo bar")))
);

test(
  "raw addClass outside variant still works",
  '<div class="hover:bg-blue-600"></div>',
  render(Div().addClass("hover:bg-blue-600"))
);

// ============================================
// Full Before/After Example from Plan
// ============================================

section("Full Example (Plan Before/After)");

test(
  "complete button with all features",
  '<button class="px-4 py-2 bg-blue-500 text-white rounded transition duration-200 hover:bg-blue-600 hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed md:px-8 md:text-lg"></button>',
  render(
    Button()
      .padding("x", "4").padding("y", "2")
      .background("blue-500").textColor("white").rounded()
      .transition().duration("200")
      .on("hover", t => t.background("blue-600").scale("105").shadow("lg"))
      .on("focus", t => t.ring("2").ringColor("blue-300").outline("none"))
      .on("disabled", t => t.opacity("50").cursor("not-allowed"))
      .at("md", t => t.padding("x", "8").textSize("lg"))
  )
);

// ============================================
// Summary
// ============================================

section("TEST SUMMARY");
console.log("=".repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log("=".repeat(50));

if (failed > 0) {
  process.exit(1);
}
