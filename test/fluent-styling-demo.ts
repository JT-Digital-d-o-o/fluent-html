import { Div, Button, render } from "../src/index.js";

// Before: Using setClass with Tailwind
const oldStyle = Div()
  .setClass("p-4 bg-red-500 mx-8 text-white rounded-lg shadow-md");

// After: SwiftUI-like API
const newStyle = Div()
  .p("4")
  .bg("red-500")
  .m("x", "8")
  .text("white")
  .rounded("lg")
  .shadow("md");

console.log("Old style:");
console.log(render(oldStyle));
console.log("\nNew style:");
console.log(render(newStyle));

// More complex example: Card component
const card = Div([
  Div("Card Title")
    .text("2xl")
    .font("bold")
    .m("bottom", "4"),

  Div("This is the card content with some description text.")
    .text("gray-600")
    .m("bottom", "6"),

  Div([
    Button("Cancel")
      .p("x", "4")
      .p("y", "2")
      .border()
      .border("gray-300")
      .rounded()
      .cursor("pointer"),

    Button("Submit")
      .p("x", "4")
      .p("y", "2")
      .bg("blue-500")
      .text("white")
      .rounded()
      .cursor("pointer")
      .shadow()
  ])
    .flex()
    .gap("4")
    .justify("end")
])
  .bg("white")
  .p("6")
  .rounded("xl")
  .shadow("lg")
  .border()
  .border("gray-200")
  .w("full")
  .maxW("md");  // Now using the built-in maxW method!

console.log("\n\nCard component:");
console.log(render(card));

// Flexbox layout example
const flexLayout = Div([
  Div("Item 1").bg("blue-100").p("4"),
  Div("Item 2").bg("green-100").p("4"),
  Div("Item 3").bg("red-100").p("4")
])
  .flex()
  .flex("row")
  .justify("between")
  .items("center")
  .gap("4")
  .p("8");

console.log("\n\nFlex layout:");
console.log(render(flexLayout));

// Grid layout example
const gridLayout = Div([
  Div("1").bg("purple-100").p("4").rounded(),
  Div("2").bg("purple-100").p("4").rounded(),
  Div("3").bg("purple-100").p("4").rounded(),
  Div("4").bg("purple-100").p("4").rounded(),
  Div("5").bg("purple-100").p("4").rounded(),
  Div("6").bg("purple-100").p("4").rounded()
])
  .grid()
  .gridCols(3)
  .gap("4")
  .p("8");

console.log("\n\nGrid layout:");
console.log(render(gridLayout));

// Method chaining with all directional helpers
const allDirections = Div("Content")
  .p("top", "8")
  .p("bottom", "4")
  .p("x", "6")
  .m("top", "2")
  .m("bottom", "4")
  .bg("indigo-500")
  .text("white")
  .rounded("full")
  .text("center");

console.log("\n\nDirectional padding/margin:");
console.log(render(allDirections));

// Now maxW is built-in!
const withMaxWidth = Div("Centered content")
  .w("full")
  .maxW("md")  // Built-in method
  .m("x", "auto")
  .p("4")
  .bg("gray-100")
  .text("center");

console.log("\n\nWith max-width:");
console.log(render(withMaxWidth));
