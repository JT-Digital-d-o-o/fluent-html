import { Div, IfThen, render, View, Text, IfThenElse, VStack, HStack, Input, ForEach1, Textarea, P, Button, Label, H1, H2, H3, H4, A, Ol, Li, Img } from "../src/builder";
import { clss, div, hx, HxSwap, HxTrigger } from "../src/htmx";

function runTest<T>(got: T, expected: T, test: string) {
  if (expected === got) {
    console.log(`✅ ${test} passed`);
  } else {
    console.log(`❌ ${test} failed: Expected "${expected}", but got "${got}"`);
  }
}

function runTestHTML(got: View, expected: string, test: string) {
  const renderedHTML = render(got);
  runTest(renderedHTML, expected, test);
}

/// Typesafe HxTrigger-s:
const trigger1: HxTrigger = 'click';
const trigger2: HxTrigger = 'click once, keyup delay:500ms';
const trigger3: HxTrigger = 'every 1s';
const trigger4: HxTrigger = 'load, click delay:1s';

// /// Typesafe Hx-Swap-s:
const swap1: HxSwap = "outerHTML";
const swap2: HxSwap = "innerHTML show:window:top";
const swap3: HxSwap = "innerHTML show:#another-div:top";
const swap4: HxSwap = "beforeend scroll:bottom";

runTest("#my-target", div("my-target"), "htmx target - div");
runTest(".my-target", clss("my-target"), "htmx target - class");

// @TODO: - there is currently some redundant whitespace rendered. fix in future!

runTestHTML(
  Div(),
  `<div   ></div>`,
  "Empty div"
);

runTestHTML(
  Div({
    id: "my-div",
  }),
  `<div id="my-div"  ></div>`,
  "Div with id"
);
runTestHTML(
  Div({
    id: "my-div",
  }),
  `<div id="my-div"  ></div>`,
  "Div with id"
);

runTestHTML(
  Div({
    id: "my-div",
    class: "my-style",
  }),
  `<div id="my-div" class="my-style"  ></div>`,
  "Div with id and class"
);

runTestHTML(
  Div({
    htmx: hx("/home"),
  }),
  `<div  hx-get="/home"      ></div>`,
  "Div with htmx [endpoint]"
);

runTestHTML(
  Div({
    htmx: hx("/home", {
      method: "post",
      swap: "innerHTML",
      target: "#my-id",
      trigger: "load delay:1s"
    }),
  }),
  `<div  hx-post="/home" hx-target="#my-id" hx-trigger="load delay:1s" hx-swap="innerHTML"   ></div>`,
  "Div with htmx"
);

runTestHTML(
  IfThen(
    true,
    () => Text("true"),
  ),
  "true",
  "IfThen true"
);

runTestHTML(
  IfThen(
    true,
    () => "true",
  ),
  "true",
  "IfThen true"
);

runTestHTML(
  IfThen(
    false,
    () => "true",
  ),
  "",
  "IfThen false"
);

runTestHTML(
  IfThenElse(
    true,
    () => "true",
    () => "false",
  ),
  "true",
  "IfThenElse true"
);

runTestHTML(
  IfThenElse(
    false,
    () => "true",
    () => "false",
  ),
  "false",
  "IfThenElse false"
);

{
  const tasks = [
    "Finish the report",
    "Call the client",
    "Prepare meeting agenda",
  ];

  function TaskView(task: string, index: number): View {
    return Div({
      child: [
        Input({ type: "checkbox", id: `task-${index + 1}` }),
        `${index + 1}. ${task}`,
      ],
    });
  }

  // Do we care about indentation, etc. ?
  runTestHTML(
    ForEach1(tasks, TaskView),
    `<div   ><input type="checkbox" id="task-1"  ></input>
1. Finish the report</div>
<div   ><input type="checkbox" id="task-2"  ></input>
2. Call the client</div>
<div   ><input type="checkbox" id="task-3"  ></input>
3. Prepare meeting agenda</div>`,
    "ForEach"
  );
}

runTestHTML(
  HStack({
    child: [Text("a"), Text("b")]
  }),
  `<div class="flex "  >a
b</div>`,
  "HStack"
);

runTestHTML(
  HStack({
    child: ["a", "b"]
  }),
  `<div class="flex "  >a
b</div>`,
  "HStack"
);

runTestHTML(
  Textarea({ id: "dodatno", name: "dodatno" }),
  `<textarea id="dodatno" name="dodatno"  ></textarea>`,
  "Textarea"
);

runTestHTML(
  Input({ toggles: ["required"] }),
  `<input  required></input>`,
  "Required",
);

runTestHTML(
  P({
    child: "Text text text"
  }),
  "<p   >Text text text</p>",
  "Paragraph"
);

runTestHTML(
  Button({
    child: "Click",
    type: "input",
    toggles: ["enabled"]
  }),
  `<button type="input" enabled>Click</button>`,
  "Button"
);

runTestHTML(
  Label({
    for: "password"
  }),
  `<label for="password"  ></label>`,
  "Label",
);

runTestHTML(
  [
    H1({ child: "h1" }),
    H2({ child: "h2" }),
    H3({ child: "h3" }),
    H4({ child: "h4" }),
  ],
  `<h1   >h1</h1>
<h2   >h2</h2>
<h3   >h3</h3>
<h4   >h4</h4>`,
  "Headings",
);

runTestHTML(
  A({
    href: "mailto:aa@aa.si",
    child: "Send email",
  }),
  `<a href="mailto:aa@aa.si"  >Send email</a>`,
  "A href",
);

runTestHTML(
  Ol({
    child: [
      Li({ child: "Item 1" }),
      Li({ child: "Item 2" }),
    ]
  }),
  `<ol   ><li   >Item 1</li>
<li   >Item 2</li></ol>`,
  "Ordered list",
);

runTestHTML(
  Img({
    src: "img.png",
    alt: "alt"
  }),
  `<img src="img.png" alt="alt"  ></img>`,
  "Img",
);

runTestHTML(
  Div({
    attributes: { "width": "1000" }
  }),
  `<div width="1000"  ></div>`,
  "Div with attributes",
);
