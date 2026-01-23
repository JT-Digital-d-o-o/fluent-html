import { Div, Button, Span, P, render } from "../src/index.js";

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

section("Spacing - Padding");

test(
  "padding all sides",
  '<div class="p-4"></div>',
  render(Div().padding("4"))
);

test(
  "padding x-axis",
  '<div class="px-4"></div>',
  render(Div().padding("x", "4"))
);

test(
  "padding y-axis",
  '<div class="py-4"></div>',
  render(Div().padding("y", "4"))
);

test(
  "padding top (full word)",
  '<div class="pt-4"></div>',
  render(Div().padding("top", "4"))
);

test(
  "padding bottom (full word)",
  '<div class="pb-4"></div>',
  render(Div().padding("bottom", "4"))
);

test(
  "padding left (full word)",
  '<div class="pl-4"></div>',
  render(Div().padding("left", "4"))
);

test(
  "padding right (full word)",
  '<div class="pr-4"></div>',
  render(Div().padding("right", "4"))
);

test(
  "padding top (short)",
  '<div class="pt-4"></div>',
  render(Div().padding("t", "4"))
);

test(
  "padding bottom (short)",
  '<div class="pb-4"></div>',
  render(Div().padding("b", "4"))
);

test(
  "padding left (short)",
  '<div class="pl-4"></div>',
  render(Div().padding("l", "4"))
);

test(
  "padding right (short)",
  '<div class="pr-4"></div>',
  render(Div().padding("r", "4"))
);

test(
  "multiple padding calls chain",
  '<div class="pt-8 px-4"></div>',
  render(Div().padding("top", "8").padding("x", "4"))
);

section("Spacing - Margin");

test(
  "margin all sides",
  '<div class="m-4"></div>',
  render(Div().margin("4"))
);

test(
  "margin x-axis",
  '<div class="mx-4"></div>',
  render(Div().margin("x", "4"))
);

test(
  "margin y-axis",
  '<div class="my-4"></div>',
  render(Div().margin("y", "4"))
);

test(
  "margin top",
  '<div class="mt-8"></div>',
  render(Div().margin("top", "8"))
);

test(
  "margin bottom",
  '<div class="mb-4"></div>',
  render(Div().margin("bottom", "4"))
);

test(
  "margin left",
  '<div class="ml-2"></div>',
  render(Div().margin("left", "2"))
);

test(
  "margin right",
  '<div class="mr-2"></div>',
  render(Div().margin("right", "2"))
);

test(
  "margin auto",
  '<div class="mx-auto"></div>',
  render(Div().margin("x", "auto"))
);

test(
  "margin negative value",
  '<div class="mt--4"></div>',
  render(Div().margin("top", "-4"))
);

section("Colors");

test(
  "background color",
  '<div class="bg-red-500"></div>',
  render(Div().background("red-500"))
);

test(
  "background with arbitrary value",
  '<div class="bg-[#1da1f2]"></div>',
  render(Div().background("[#1da1f2]"))
);

test(
  "text color",
  '<span class="text-gray-700"></span>',
  render(Span().textColor("gray-700"))
);

test(
  "text color white",
  '<span class="text-white"></span>',
  render(Span().textColor("white"))
);

test(
  "border color",
  '<div class="border-gray-300"></div>',
  render(Div().borderColor("gray-300"))
);

test(
  "combined colors",
  '<div class="bg-blue-500 text-white border-blue-700"></div>',
  render(Div().background("blue-500").textColor("white").borderColor("blue-700"))
);

section("Typography");

test(
  "text size",
  '<span class="text-xl"></span>',
  render(Span().textSize("xl"))
);

test(
  "text size small",
  '<span class="text-sm"></span>',
  render(Span().textSize("sm"))
);

test(
  "text align center",
  '<p class="text-center"></p>',
  render(P().textAlign("center"))
);

test(
  "text align right",
  '<p class="text-right"></p>',
  render(P().textAlign("right"))
);

test(
  "text align left",
  '<p class="text-left"></p>',
  render(P().textAlign("left"))
);

test(
  "text align justify",
  '<p class="text-justify"></p>',
  render(P().textAlign("justify"))
);

test(
  "font weight bold",
  '<span class="font-bold"></span>',
  render(Span().fontWeight("bold"))
);

test(
  "font weight semibold",
  '<span class="font-semibold"></span>',
  render(Span().fontWeight("semibold"))
);

test(
  "combined typography",
  '<span class="text-2xl font-bold text-center"></span>',
  render(Span().textSize("2xl").fontWeight("bold").textAlign("center"))
);

section("Sizing");

test(
  "width full",
  '<div class="w-full"></div>',
  render(Div().w("full"))
);

test(
  "width fraction",
  '<div class="w-1/2"></div>',
  render(Div().w("1/2"))
);

test(
  "width fixed",
  '<div class="w-64"></div>',
  render(Div().w("64"))
);

test(
  "height screen",
  '<div class="h-screen"></div>',
  render(Div().h("screen"))
);

test(
  "height fixed",
  '<div class="h-64"></div>',
  render(Div().h("64"))
);

test(
  "max width",
  '<div class="max-w-md"></div>',
  render(Div().maxW("md"))
);

test(
  "max width prose",
  '<div class="max-w-prose"></div>',
  render(Div().maxW("prose"))
);

test(
  "min width",
  '<div class="min-w-0"></div>',
  render(Div().minW("0"))
);

test(
  "min width full",
  '<div class="min-w-full"></div>',
  render(Div().minW("full"))
);

test(
  "max height",
  '<div class="max-h-screen"></div>',
  render(Div().maxH("screen"))
);

test(
  "min height",
  '<div class="min-h-0"></div>',
  render(Div().minH("0"))
);

test(
  "combined sizing",
  '<div class="w-full max-w-md h-screen"></div>',
  render(Div().w("full").maxW("md").h("screen"))
);

section("Flexbox");

test(
  "flex display",
  '<div class="flex"></div>',
  render(Div().flex())
);

test(
  "flex with value",
  '<div class="flex-1"></div>',
  render(Div().flex("1"))
);

test(
  "flex direction col",
  '<div class="flex-col"></div>',
  render(Div().flexDirection("col"))
);

test(
  "flex direction row",
  '<div class="flex-row"></div>',
  render(Div().flexDirection("row"))
);

test(
  "flex direction row-reverse",
  '<div class="flex-row-reverse"></div>',
  render(Div().flexDirection("row-reverse"))
);

test(
  "flex direction col-reverse",
  '<div class="flex-col-reverse"></div>',
  render(Div().flexDirection("col-reverse"))
);

test(
  "justify content center",
  '<div class="justify-center"></div>',
  render(Div().justifyContent("center"))
);

test(
  "justify content between",
  '<div class="justify-between"></div>',
  render(Div().justifyContent("between"))
);

test(
  "justify content around",
  '<div class="justify-around"></div>',
  render(Div().justifyContent("around"))
);

test(
  "justify content evenly",
  '<div class="justify-evenly"></div>',
  render(Div().justifyContent("evenly"))
);

test(
  "align items center",
  '<div class="items-center"></div>',
  render(Div().alignItems("center"))
);

test(
  "align items start",
  '<div class="items-start"></div>',
  render(Div().alignItems("start"))
);

test(
  "align items end",
  '<div class="items-end"></div>',
  render(Div().alignItems("end"))
);

test(
  "align items baseline",
  '<div class="items-baseline"></div>',
  render(Div().alignItems("baseline"))
);

test(
  "align items stretch",
  '<div class="items-stretch"></div>',
  render(Div().alignItems("stretch"))
);

test(
  "gap",
  '<div class="gap-4"></div>',
  render(Div().gap("4"))
);

test(
  "gap x",
  '<div class="gap-x-2"></div>',
  render(Div().gap("x", "2"))
);

test(
  "gap y",
  '<div class="gap-y-4"></div>',
  render(Div().gap("y", "4"))
);

test(
  "complete flex layout",
  '<div class="flex flex-row justify-between items-center gap-4"></div>',
  render(Div().flex().flexDirection("row").justifyContent("between").alignItems("center").gap("4"))
);

section("Grid");

test(
  "grid display",
  '<div class="grid"></div>',
  render(Div().grid())
);

test(
  "grid columns",
  '<div class="grid-cols-3"></div>',
  render(Div().gridCols("3"))
);

test(
  "grid rows",
  '<div class="grid-rows-2"></div>',
  render(Div().gridRows("2"))
);

test(
  "complete grid layout",
  '<div class="grid grid-cols-3 gap-4"></div>',
  render(Div().grid().gridCols("3").gap("4"))
);

section("Borders & Effects");

test(
  "border default",
  '<div class="border"></div>',
  render(Div().border())
);

test(
  "border with width",
  '<div class="border-2"></div>',
  render(Div().border("2"))
);

test(
  "border color",
  '<div class="border-gray-300"></div>',
  render(Div().borderColor("gray-300"))
);

test(
  "border complete",
  '<div class="border border-gray-300"></div>',
  render(Div().border().borderColor("gray-300"))
);

test(
  "rounded default",
  '<div class="rounded"></div>',
  render(Div().rounded())
);

test(
  "rounded full",
  '<div class="rounded-full"></div>',
  render(Div().rounded("full"))
);

test(
  "rounded lg",
  '<div class="rounded-lg"></div>',
  render(Div().rounded("lg"))
);

test(
  "shadow default",
  '<div class="shadow"></div>',
  render(Div().shadow())
);

test(
  "shadow lg",
  '<div class="shadow-lg"></div>',
  render(Div().shadow("lg"))
);

test(
  "shadow md",
  '<div class="shadow-md"></div>',
  render(Div().shadow("md"))
);

section("Position & Layout");

test(
  "position relative",
  '<div class="relative"></div>',
  render(Div().position("relative"))
);

test(
  "position absolute",
  '<div class="absolute"></div>',
  render(Div().position("absolute"))
);

test(
  "position fixed",
  '<div class="fixed"></div>',
  render(Div().position("fixed"))
);

test(
  "position sticky",
  '<div class="sticky"></div>',
  render(Div().position("sticky"))
);

test(
  "z-index",
  '<div class="z-10"></div>',
  render(Div().zIndex("10"))
);

test(
  "z-index 50",
  '<div class="z-50"></div>',
  render(Div().zIndex("50"))
);

test(
  "opacity",
  '<div class="opacity-50"></div>',
  render(Div().opacity("50"))
);

test(
  "cursor pointer",
  '<button class="cursor-pointer"></button>',
  render(Button().cursor("pointer"))
);

test(
  "overflow hidden",
  '<div class="overflow-hidden"></div>',
  render(Div().overflow("hidden"))
);

test(
  "overflow x auto",
  '<div class="overflow-x-auto"></div>',
  render(Div().overflow("x", "auto"))
);

test(
  "overflow y scroll",
  '<div class="overflow-y-scroll"></div>',
  render(Div().overflow("y", "scroll"))
);

section("Method Chaining & Integration");

test(
  "chain all spacing",
  '<div class="p-4 m-2"></div>',
  render(Div().padding("4").margin("2"))
);

test(
  "chain with setId",
  '<div id="test" class="p-4"></div>',
  render(Div().setId("test").padding("4"))
);

test(
  "chain with addClass",
  '<div class="p-4 hover:bg-blue-600"></div>',
  render(Div().padding("4").addClass("hover:bg-blue-600"))
);

test(
  "chain with setClass preserves new methods",
  '<div class="custom p-4"></div>',
  render(Div().setClass("custom").padding("4"))
);

test(
  "complex card component",
  '<div class="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-md"></div>',
  render(
    Div()
      .background("white")
      .padding("6")
      .rounded("xl")
      .shadow("lg")
      .border()
      .borderColor("gray-200")
      .w("full")
      .maxW("md")
  )
);

test(
  "button with full styling",
  '<button class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer shadow"></button>',
  render(
    Button()
      .padding("x", "4")
      .padding("y", "2")
      .background("blue-500")
      .textColor("white")
      .rounded()
      .cursor("pointer")
      .shadow()
  )
);

test(
  "flex container with children",
  '<div class="flex justify-between items-center gap-4"><div>Left</div>\n<div>Right</div></div>',
  render(
    Div([Div("Left"), Div("Right")])
      .flex()
      .justifyContent("between")
      .alignItems("center")
      .gap("4")
  )
);

section("Edge Cases");

test(
  "zero values work",
  '<div class="p-0"></div>',
  render(Div().padding("0"))
);

test(
  "arbitrary values work",
  '<div class="p-[10px]"></div>',
  render(Div().padding("[10px]"))
);

test(
  "fractional values work",
  '<div class="w-1/3"></div>',
  render(Div().w("1/3"))
);

test(
  "multiple same method calls append",
  '<div class="pt-4 pb-2"></div>',
  render(Div().padding("top", "4").padding("bottom", "2"))
);

test(
  "works with existing Button methods",
  '<button type="submit" class="px-4 py-2 bg-blue-500"></button>',
  render(Button().setType("submit").padding("x", "4").padding("y", "2").background("blue-500"))
);

section("Real-World Patterns");

test(
  "centered container",
  '<div class="w-full max-w-md mx-auto p-4"></div>',
  render(Div().w("full").maxW("md").margin("x", "auto").padding("4"))
);

test(
  "full screen section",
  '<div class="w-full h-screen flex justify-center items-center"></div>',
  render(Div().w("full").h("screen").flex().justifyContent("center").alignItems("center"))
);

test(
  "card with shadow hover",
  '<div class="bg-white rounded-lg shadow p-6 hover:shadow-xl"></div>',
  render(Div().background("white").rounded("lg").shadow().padding("6").addClass("hover:shadow-xl"))
);

test(
  "sticky header",
  '<div class="sticky z-50 bg-white shadow"></div>',
  render(Div().position("sticky").zIndex("50").background("white").shadow())
);

test(
  "responsive grid",
  '<div class="grid grid-cols-3 gap-4 p-8"></div>',
  render(Div().grid().gridCols("3").gap("4").padding("8"))
);

section("TEST SUMMARY");
console.log("=".repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log("=".repeat(50));

if (failed > 0) {
  process.exit(1);
}
