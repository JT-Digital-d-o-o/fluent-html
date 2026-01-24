"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../src/index.js");
// This should trigger linter warnings
const bad1 = (0, index_js_1.Div)().setClass("bg-red-500");
const bad2 = (0, index_js_1.Div)().setClass("p-4 m-2");
const bad3 = (0, index_js_1.Div)().setClass("flex justify-center items-center");
// This should be fine
const good1 = (0, index_js_1.Div)().background("red-500");
const good2 = (0, index_js_1.Div)().padding("4").margin("2");
const good3 = (0, index_js_1.Div)().flex().justifyContent("center").alignItems("center");
const good4 = (0, index_js_1.Div)().addClass("hover:bg-blue-600 custom-class");
//# sourceMappingURL=lint-test.js.map