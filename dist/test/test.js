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
/// Typesafe Hx-Swap-s:
const swap1 = "outerHTML";
const swap2 = "innerHTML show:window:top";
const swap3 = "innerHTML show:#another-div:top";
const swap4 = "beforeend scroll:bottom";
runTest("#my-target", (0, index_js_1.div)("my-target"), "htmx target - div");
runTest(".my-target", (0, index_js_1.clss)("my-target"), "htmx target - class");
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
runTestHTML((0, index_js_1.IfThen)(true, () => (0, index_js_1.Text)("true")), "true", "IfThen true");
runTestHTML((0, index_js_1.IfThen)(false, () => (0, index_js_1.Text)("true")), "", "IfThen false");
runTestHTML((0, index_js_1.IfThenElse)(true, () => (0, index_js_1.Text)("true"), () => (0, index_js_1.Text)("false")), "true", "IfThenElse true");
runTestHTML((0, index_js_1.IfThenElse)(false, () => (0, index_js_1.Text)("true"), () => (0, index_js_1.Text)("false")), "false", "IfThenElse false");
{
    const tasks = [
        "Finish the report",
        "Call the client",
        "Prepare meeting agenda",
    ];
    function TaskView(task, index) {
        return (0, index_js_1.Div)({
            child: (0, index_js_1.VStack)([
                (0, index_js_1.Input)({ type: "checkbox", id: `task-${index + 1}` }),
                (0, index_js_1.Text)(`${index + 1}. ${task}`),
            ]),
        });
    }
    // Do we care about indentation, etc. ?
    runTestHTML((0, index_js_1.ForEach1)(tasks, TaskView), `<div   ><input id="task-1" type="checkbox"  ></input>
1. Finish the report</div>
<div   ><input id="task-2" type="checkbox"  ></input>
2. Call the client</div>
<div   ><input id="task-3" type="checkbox"  ></input>
3. Prepare meeting agenda</div>`, "ForEach");
}
runTestHTML((0, index_js_1.HStack)({
    children: [(0, index_js_1.Text)("a"), (0, index_js_1.Text)("b")]
}), `<div class="flex "  >a
b</div>`, "HStack");
runTestHTML((0, index_js_1.Textarea)({ id: "dodatno", name: "dodatno" }), `<textarea id="dodatno" name="dodatno"  ></textarea>`, "Textarea");
runTestHTML((0, index_js_1.Input)({ toggles: ["required"] }), `<input  required></input>`, "Required");
