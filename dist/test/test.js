"use strict";
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
const trigger1 = 'click';
const trigger2 = 'click once, keyup delay:500ms';
const trigger3 = 'every 1s';
const trigger4 = 'load, click delay:1s';
// /// Typesafe Hx-Swap-s:
const swap1 = "outerHTML";
const swap2 = "innerHTML show:window:top";
const swap3 = "innerHTML show:#another-div:top";
const swap4 = "beforeend scroll:bottom";
runTest("#my-target", (0, htmx_1.div)("my-target"), "htmx target - div");
runTest(".my-target", (0, htmx_1.clss)("my-target"), "htmx target - class");
// @TODO: - there is currently some redundant whitespace rendered. fix in future!
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
runTestHTML((0, builder_1.IfThen)(false, () => "true"), "", "IfThen false");
runTestHTML((0, builder_1.IfThenElse)(true, () => "true", () => "false"), "true", "IfThenElse true");
runTestHTML((0, builder_1.IfThenElse)(false, () => "true", () => "false"), "false", "IfThenElse false");
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
                `${index + 1}. ${task}`,
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
runTestHTML((0, builder_1.Button)({
    child: "Click",
    type: "input",
    toggles: ["enabled"]
}), `<button type="input" enabled>Click</button>`, "Button");
runTestHTML((0, builder_1.Label)({
    for: "password"
}), `<label for="password"  ></label>`, "Label");
runTestHTML([
    (0, builder_1.H1)({ child: "h1" }),
    (0, builder_1.H2)({ child: "h2" }),
    (0, builder_1.H3)({ child: "h3" }),
    (0, builder_1.H4)({ child: "h4" }),
], `<h1   >h1</h1>
<h2   >h2</h2>
<h3   >h3</h3>
<h4   >h4</h4>`, "Headings");
runTestHTML((0, builder_1.A)({
    href: "mailto:aa@aa.si",
    child: "Send email",
}), `<a href="mailto:aa@aa.si"  >Send email</a>`, "A href");
runTestHTML((0, builder_1.Ol)({
    child: [
        (0, builder_1.Li)({ child: "Item 1" }),
        (0, builder_1.Li)({ child: "Item 2" }),
    ]
}), `<ol   ><li   >Item 1</li>
<li   >Item 2</li></ol>`, "Ordered list");
runTestHTML((0, builder_1.Img)({
    src: "img.png",
    alt: "alt"
}), `<img src="img.png" alt="alt"  ></img>`, "Img");
runTestHTML((0, builder_1.Div)({
    attributes: { "width": "1000" }
}), `<div width="1000"  ></div>`, "Div with attributes");
