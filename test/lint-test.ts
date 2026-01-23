import { Div } from "../src/index.js";

// This should trigger linter warnings
const bad1 = Div().setClass("bg-red-500");
const bad2 = Div().setClass("p-4 m-2");
const bad3 = Div().setClass("flex justify-center items-center");

// This should be fine
const good1 = Div().background("red-500");
const good2 = Div().padding("4").margin("2");
const good3 = Div().flex().justifyContent("center").alignItems("center");
const good4 = Div().addClass("hover:bg-blue-600 custom-class");
