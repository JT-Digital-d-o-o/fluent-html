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
const trigger5 = 'intersect changed, click queue:none';
// /// Typesafe Hx-Swap-s:
const swap1 = "outerHTML";
const swap2 = "innerHTML show:window:top";
const swap3 = "innerHTML show:#another-div:top";
const swap4 = "beforeend scroll:bottom";
runTest("#my-target", (0, htmx_1.id)("my-target"), "htmx target - id");
runTest(".my-target", (0, htmx_1.clss)("my-target"), "htmx target - class");
// @TODO: - there is currently some redundant whitespace rendered. fix in future!
runTestHTML((0, builder_1.Empty)(), ``, "Empty()");
runTestHTML((0, builder_1.Div)(), `<div   ></div>`, "Empty div");
runTestHTML((0, builder_1.Div)()
    .setId("my-div"), `<div id="my-div"  ></div>`, "Div with id");
runTestHTML((0, builder_1.Div)()
    .setId("my-div")
    .setClass("my-style"), `<div id="my-div" class="my-style"  ></div>`, "Div with id and class");
runTestHTML((0, builder_1.Div)()
    .addClass("c1"), `<div class="c1"  ></div>`, "Add class first");
runTestHTML((0, builder_1.Div)()
    .setClass("c1")
    .addClass("c2"), `<div class="c1 c2"  ></div>`, "Add class append");
runTestHTML((0, builder_1.Div)()
    .setHtmx((0, htmx_1.hx)("/home")), `<div  hx-get="/home"      ></div>`, "Div with htmx");
runTestHTML((0, builder_1.Div)()
    .setHtmx((0, htmx_1.hx)("/home", {
    method: "post",
    swap: "innerHTML",
    target: "#my-id",
    trigger: "load delay:1s"
})), `<div  hx-post="/home" hx-target="#my-id" hx-trigger="load delay:1s" hx-swap="innerHTML"   ></div>`, "Div with htmx 2");
runTestHTML((0, builder_1.IfThen)(true, () => "true"), "true", "IfThen true");
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
        return (0, builder_1.Div)([
            (0, builder_1.Input)()
                .setType("checkbox")
                .setId(`task-${index + 1}`),
            `${index + 1}. ${task}`,
        ]);
    }
    // Do we care about indentation, etc. ?
    runTestHTML((0, builder_1.ForEach1)(tasks, TaskView), `<div   ><input type="checkbox" id="task-1"  ></input>
1. Finish the report</div>
<div   ><input type="checkbox" id="task-2"  ></input>
2. Call the client</div>
<div   ><input type="checkbox" id="task-3"  ></input>
3. Prepare meeting agenda</div>`, "ForEach");
}
runTestHTML((0, builder_1.HStack)(["a", "b"]), `<div style="flex"  >a
b</div>`, "HStack");
runTestHTML((0, builder_1.Textarea)()
    .setName("summary")
    .setId("my-id"), `<textarea name="summary" id="my-id"  ></textarea>`, "Textarea");
runTestHTML((0, builder_1.Input)()
    .setToggles(["required"]), `<input  required></input>`, "Required");
runTestHTML((0, builder_1.P)("Text text text"), "<p   >Text text text</p>", "Paragraph");
runTestHTML((0, builder_1.Button)("Click")
    .setType("input")
    .setToggles(["enabled"]), `<button type="input" enabled>Click</button>`, "Button");
runTestHTML((0, builder_1.Label)()
    .setFor("password"), `<label for="password"  ></label>`, "Label");
runTestHTML([
    (0, builder_1.H1)("h1"),
    (0, builder_1.H2)("h2"),
    (0, builder_1.H3)("h3"),
    (0, builder_1.H4)("h4"),
], `<h1   >h1</h1>
<h2   >h2</h2>
<h3   >h3</h3>
<h4   >h4</h4>`, "Headings");
runTestHTML((0, builder_1.A)("Send email")
    .setHref("mailto:aa@aa.si"), `<a href="mailto:aa@aa.si"  >Send email</a>`, "A href");
runTestHTML((0, builder_1.Ol)([
    (0, builder_1.Li)("Item 1"),
    (0, builder_1.Li)("Item 2"),
]), `<ol   ><li   >Item 1</li>
<li   >Item 2</li></ol>`, "Ordered list");
runTestHTML((0, builder_1.Img)()
    .setSrc("img.png")
    .setAlt("alt"), `<img src="img.png" alt="alt"  ></img>`, "Img");
runTestHTML((0, builder_1.Div)()
    .addAttribute("width", "1000"), `<div width="1000"  ></div>`, "Div with attributes");
runTestHTML((0, builder_1.Div)((0, builder_1.P)("Danes je lep dan")
    .setClass("text-main-cl text-center"))
    .setId("id")
    .setClass("cursor-pointer")
    .setHtmx((0, htmx_1.hx)("/get")), `<div id="id" class="cursor-pointer" hx-get="/get"      ><p class="text-main-cl text-center"  >Danes je lep dan</p></div>`, "lambda.html new syntax");
runTestHTML((0, builder_1.Input)()
    .setName("name")
    .setPlaceholder("placeholder")
    .setType("type"), `<input name="name" placeholder="placeholder" type="type"  ></input>`, "Input new syntax");
// client-side rendering
// const view = [
//   Div1([
//     Button1("Click")
//       .addClick("data.count = data.count + 1")
//       .addClick("data.toggle = !data.toggle"),
//     `Count: `,
//     Span1()
//       .setId("span1")
//       .bindTextContent("data.count % 2 === 0 ? '😄' : '😅'"),
//     Div1("Dropdown")
//       .setId("dropdown1")
//       .bindShow("data.toggle")
//   ])
//   .bindState({ count: 1, toggle: false }),
// ];
// const compileError = compile(view);
// if (compileError) {
//   console.log(compileError);
// } else {
//   console.log(render(view));
// }
//# sourceMappingURL=test.js.map