import { Div, Button, Span, render } from "../src/index.js";

// Before: Using setClass with Tailwind
const oldStyle = Div()
  .setClass("p-4 bg-red-500 mx-8 text-white rounded-lg shadow-md");

// After: SwiftUI-like API
const newStyle = Div()
  .padding("4")
  .background("red-500")
  .margin("x", "8")
  .textColor("white")
  .rounded("lg")
  .shadow("md");

console.log("Old style:");
console.log(render(oldStyle));
console.log("\nNew style:");
console.log(render(newStyle));

// More complex example: Card component
const card = Div([
  Div("Card Title")
    .textSize("2xl")
    .fontWeight("bold")
    .margin("bottom", "4"),

  Div("This is the card content with some description text.")
    .textColor("gray-600")
    .margin("bottom", "6"),

  Div([
    Button("Cancel")
      .padding("x", "4")
      .padding("y", "2")
      .border()
      .borderColor("gray-300")
      .rounded()
      .cursor("pointer"),

    Button("Submit")
      .padding("x", "4")
      .padding("y", "2")
      .background("blue-500")
      .textColor("white")
      .rounded()
      .cursor("pointer")
      .shadow()
  ])
    .flex()
    .gap("4")
    .justifyContent("end")
])
  .background("white")
  .padding("6")
  .rounded("xl")
  .shadow("lg")
  .border()
  .borderColor("gray-200")
  .w("full")
  .maxW("md");  // Now using the built-in maxW method!

console.log("\n\nCard component:");
console.log(render(card));

// Flexbox layout example
const flexLayout = Div([
  Div("Item 1").background("blue-100").padding("4"),
  Div("Item 2").background("green-100").padding("4"),
  Div("Item 3").background("red-100").padding("4")
])
  .flex()
  .flexDirection("row")
  .justifyContent("between")
  .alignItems("center")
  .gap("4")
  .padding("8");

console.log("\n\nFlex layout:");
console.log(render(flexLayout));

// Grid layout example
const gridLayout = Div([
  Div("1").background("purple-100").padding("4").rounded(),
  Div("2").background("purple-100").padding("4").rounded(),
  Div("3").background("purple-100").padding("4").rounded(),
  Div("4").background("purple-100").padding("4").rounded(),
  Div("5").background("purple-100").padding("4").rounded(),
  Div("6").background("purple-100").padding("4").rounded()
])
  .grid()
  .gridCols("3")
  .gap("4")
  .padding("8");

console.log("\n\nGrid layout:");
console.log(render(gridLayout));

// Method chaining with all directional helpers
const allDirections = Div("Content")
  .padding("top", "8")
  .padding("bottom", "4")
  .padding("x", "6")
  .margin("top", "2")
  .margin("bottom", "4")
  .background("indigo-500")
  .textColor("white")
  .rounded("full")
  .textAlign("center");

console.log("\n\nDirectional padding/margin:");
console.log(render(allDirections));

// Now maxW is built-in!
const withMaxWidth = Div("Centered content")
  .w("full")
  .maxW("md")  // Built-in method
  .margin("x", "auto")
  .padding("4")
  .background("gray-100")
  .textAlign("center");

console.log("\n\nWith max-width:");
console.log(render(withMaxWidth));
