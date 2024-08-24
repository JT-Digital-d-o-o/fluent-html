"use strict";
// import { Div, View, hx, HxTrigger, IfThen, IfThenElse, Input, ForEach1, render, Text, VStack, HxSwap, HStack, Textarea, div, clss } from "../src/index.js";
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = require("../src/builder");
const htmx_1 = require("../src/htmx");
function runTest(got, expected, test) {
    if (expected === got) {
        console.log(`✅ ${test} passed`);
    }
    else {
        console.log(`❌ ${test} failed: Expected "${expected}", but got "${got}"`);
    }
}
function runTestHTML(got, expected, test) {
    const renderedHTML = (0, builder_1.render)(got);
    runTest(renderedHTML, expected, test);
}
/// Typesafe HxTrigger-s:
// const trigger1: HxTrigger = 'click';
// const trigger2: HxTrigger = 'click once, keyup delay:500ms';
// const trigger3: HxTrigger = 'every 1s';
// const trigger4: HxTrigger = 'load, click delay:1s';
// /// Typesafe Hx-Swap-s:
// const swap1: HxSwap = "outerHTML";
// const swap2: HxSwap = "innerHTML show:window:top";
// const swap3: HxSwap = "innerHTML show:#another-div:top";
// const swap4: HxSwap = "beforeend scroll:bottom";
// runTest("#my-target", div("my-target"), "htmx target - div");
// runTest(".my-target", clss("my-target"), "htmx target - class");
// // @TODO: - there is currently some redundant whitespace rendered. fix in future!
runTestHTML((0, builder_1.Div)(), `<div   ></div>`, "Empty div");
runTestHTML((0, builder_1.Div)({
    id: "my-div",
}), `<div id="my-div"  ></div>`, "Div with id");
runTestHTML((0, builder_1.Div)({
    id: "my-div",
}), `<div id="my-div"  ></div>`, "Div with id");
runTestHTML((0, builder_1.Div)({
    id: "my-div",
    class: "my-style",
}), `<div id="my-div" class="my-style"  ></div>`, "Div with id and class");
runTestHTML((0, builder_1.Div)({
    htmx: (0, htmx_1.hx)("/home"),
}), `<div  hx-get="/home"      ></div>`, "Div with htmx [endpoint]");
runTestHTML((0, builder_1.Div)({
    htmx: (0, htmx_1.hx)("/home", {
        method: "post",
        swap: "innerHTML",
        target: "#my-id",
        trigger: "load delay:1s"
    }),
}), `<div  hx-post="/home" hx-target="#my-id" hx-trigger="load delay:1s" hx-swap="innerHTML"   ></div>`, "Div with htmx");
runTestHTML((0, builder_1.IfThen)(true, () => (0, builder_1.Text)("true")), "true", "IfThen true");
runTestHTML((0, builder_1.IfThen)(true, () => "true"), "true", "IfThen true");
runTestHTML((0, builder_1.IfThen)(false, () => (0, builder_1.Text)("true")), "", "IfThen false");
runTestHTML((0, builder_1.IfThenElse)(true, () => (0, builder_1.Text)("true"), () => (0, builder_1.Text)("false")), "true", "IfThenElse true");
runTestHTML((0, builder_1.IfThenElse)(false, () => (0, builder_1.Text)("true"), () => (0, builder_1.Text)("false")), "false", "IfThenElse false");
{
    const tasks = [
        "Finish the report",
        "Call the client",
        "Prepare meeting agenda",
    ];
    function TaskView(task, index) {
        return (0, builder_1.Div)({
            child: [
                (0, builder_1.Input)({ type: "checkbox", id: `task-${index + 1}` }),
                (0, builder_1.Text)(`${index + 1}. ${task}`),
            ],
        });
    }
    // Do we care about indentation, etc. ?
    runTestHTML((0, builder_1.ForEach1)(tasks, TaskView), `<div   ><input type="checkbox" id="task-1"  ></input>
1. Finish the report</div>
<div   ><input type="checkbox" id="task-2"  ></input>
2. Call the client</div>
<div   ><input type="checkbox" id="task-3"  ></input>
3. Prepare meeting agenda</div>`, "ForEach");
}
runTestHTML((0, builder_1.HStack)({
    child: [(0, builder_1.Text)("a"), (0, builder_1.Text)("b")]
}), `<div class="flex "  >a
b</div>`, "HStack");
runTestHTML((0, builder_1.HStack)({
    child: ["a", "b"]
}), `<div class="flex "  >a
b</div>`, "HStack");
runTestHTML((0, builder_1.Textarea)({ id: "dodatno", name: "dodatno" }), `<textarea id="dodatno" name="dodatno"  ></textarea>`, "Textarea");
runTestHTML((0, builder_1.Input)({ toggles: ["required"] }), `<input  required></input>`, "Required");
runTestHTML((0, builder_1.P)({
    child: "Text text text"
}), "<p   >Text text text</p>", "Paragraph");
