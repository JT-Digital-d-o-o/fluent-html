import { Div, IfThen, render, View, Text, IfThenElse, VStack, Input, ForEach1, Textarea, P, Button, Label, H1, H2, H3, H4, A, Ol, Li, Img, Empty, HStack } from "../src/builder";
import { clss, id, hx, HxSwap, HxTrigger } from "../src/htmx";

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
const trigger5: HxTrigger = 'intersect changed, click queue:none';

// /// Typesafe Hx-Swap-s:
const swap1: HxSwap = "outerHTML";
const swap2: HxSwap = "innerHTML show:window:top";
const swap3: HxSwap = "innerHTML show:#another-div:top";
const swap4: HxSwap = "beforeend scroll:bottom";

runTest("#my-target", id("my-target"), "htmx target - id");
runTest(".my-target", clss("my-target"), "htmx target - class");

// @TODO: - there is currently some redundant whitespace rendered. fix in future!

runTestHTML(
  Empty(),
  ``,
  "Empty()"
);

runTestHTML(
  Div(),
  `<div   ></div>`,
  "Empty div"
);

runTestHTML(
  Div()
    .setId("my-div"),
  `<div id="my-div"  ></div>`,
  "Div with id"
);

runTestHTML(
  Div()
    .setId("my-div")
    .setClass("my-style"),
  `<div id="my-div" class="my-style"  ></div>`,
  "Div with id and class"
);

runTestHTML(
  Div()
    .addClass("c1"),
  `<div class="c1"  ></div>`,
  "Add class first"
);

runTestHTML(
  Div()
    .setClass("c1")
    .addClass("c2"),
  `<div class="c1 c2"  ></div>`,
  "Add class append"
);

runTestHTML(
  Div()
    .setHtmx(hx("/home")),
  `<div  hx-get="/home"      ></div>`,
  "Div with htmx"
);

runTestHTML(
  Div()
    .setHtmx(hx("/home", {
      method: "post",
      swap: "innerHTML",
      target: "#my-id",
      trigger: "load delay:1s"
    })),
  `<div  hx-post="/home" hx-target="#my-id" hx-trigger="load delay:1s" hx-swap="innerHTML"   ></div>`,
  "Div with htmx 2"
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
    return Div([
      Input()
        .setType("checkbox")
        .setId(`task-${index + 1}`),
      `${index + 1}. ${task}`,
    ]);
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
  HStack(["a", "b"]),
  `<div style="flex"  >a
b</div>`,
  "HStack"
);

runTestHTML(
  Textarea()
    .setName("summary")
    .setId("my-id"),
  `<textarea name="summary" id="my-id"  ></textarea>`,
  "Textarea"
);

runTestHTML(
  Input()
    .setToggles(["required"]),
  `<input  required></input>`,
  "Required",
);

runTestHTML(
  P("Text text text"),
  "<p   >Text text text</p>",
  "Paragraph"
);

runTestHTML(
  Button("Click")
    .setType("input")
    .setToggles(["enabled"]),
  `<button type="input" enabled>Click</button>`,
  "Button"
);

runTestHTML(
  Label()
    .setFor("password"),
  `<label for="password"  ></label>`,
  "Label",
);

runTestHTML(
  [
    H1("h1"),
    H2("h2"),
    H3("h3"),
    H4("h4"),
  ],
  `<h1   >h1</h1>
<h2   >h2</h2>
<h3   >h3</h3>
<h4   >h4</h4>`,
  "Headings",
);

runTestHTML(
  A("Send email")
    .setHref("mailto:aa@aa.si"),
  `<a href="mailto:aa@aa.si"  >Send email</a>`,
  "A href",
);

runTestHTML(
  Ol([
    Li("Item 1"),
    Li("Item 2"),
  ]),
  `<ol   ><li   >Item 1</li>
<li   >Item 2</li></ol>`,
  "Ordered list",
);

runTestHTML(
  Img()
    .setSrc("img.png")
    .setAlt("alt"),
  `<img src="img.png" alt="alt"  ></img>`,
  "Img",
);

runTestHTML(
  Div()
    .addAttribute("width", "1000"),
  `<div width="1000"  ></div>`,
  "Div with attributes",
);

runTestHTML(
  Div(
    P(
      "Danes je lep dan"
    )
    .setClass("text-main-cl text-center")
  )
  .setId("id")
  .setClass("cursor-pointer")
  .setHtmx(hx("/get")),
  `<div id="id" class="cursor-pointer" hx-get="/get"        ><p class="text-main-cl text-center"  >Danes je lep dan</p></div>`,
  "lambda.html new syntax",
)

runTestHTML(
  Input()
    .setName("name")
    .setPlaceholder("placeholder")
    .setType("type"),
  `<input name="name" placeholder="placeholder" type="type"  ></input>`,
  "Input new syntax",
)

runTestHTML(
  Div()
    .setHtmx(hx("/endpoint", {
      vals: { abc: 10 }
    })),
  `<div  hx-get="/endpoint"        hx-vals='{"abc":10}' ></div>`,
  "hx-val",
)

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
