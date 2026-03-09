import { Div } from "../src/index.js";

// This should trigger linter warnings
export const bad1 = Div().setClass("bg-red-500");
export const bad2 = Div().setClass("p-4 m-2");
export const bad3 = Div().setClass("flex justify-center items-center");

// This should be fine
export const good1 = Div().background("red-500");
export const good2 = Div().padding("4").margin("2");
export const good3 = Div().flex().justifyContent("center").alignItems("center");
export const good4 = Div().addClass("hover:bg-blue-600 custom-class");
