"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../src/index.js");
function runTest(got, expected, test) {
    if (expected === got) {
        console.log(`✅ ${test} passed`);
    }
    else {
        console.log(`❌ ${test} failed: Expected "${expected}", but got "${got}"`);
    }
}
function runTestHTML(got, expected, test) {
    const renderedHTML = (0, index_js_1.render)(got);
    runTest(renderedHTML, expected, test);
}
/// Typesafe HxTrigger-s:
const trigger1 = 'click';
const trigger2 = 'click once, keyup delay:500ms';
const trigger3 = 'every 1s';
const trigger4 = 'load, click delay:1s';
// @TODO: - there is currently some redundant whitespace rendered. fix in future!
runTestHTML((0, index_js_1.Div)(), `<div   ></div>`, "Empty div");
runTestHTML((0, index_js_1.Div)({
    id: "my-div",
}), `<div id="my-div"  ></div>`, "Div with id");
runTestHTML((0, index_js_1.Div)({
    id: "my-div",
    class: "my-style",
}), `<div id="my-div" class="my-style"  ></div>`, "Div with id and class");
runTestHTML((0, index_js_1.Div)({
    htmx: (0, index_js_1.hx)("/home"),
}), `<div  hx-get="/home"      ></div>`, "Div with htmx [endpoint]");
runTestHTML((0, index_js_1.Div)({
    htmx: (0, index_js_1.hx)("/home", {
        method: "post",
        swap: "innerHTML",
        target: "#my-id",
        trigger: "load delay:1s"
    }),
}), `<div  hx-post="/home" hx-target="#my-id" hx-trigger="load delay:1s" hx-swap="innerHTML"   ></div>`, "Div with htmx");
