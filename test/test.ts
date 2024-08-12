import { Div, HTML, hx, HxTrigger, IfThen, IfThenElse, Input, ForEach1, render, Text, VStack, HxSwap, HStack } from "../src/index.js";

function runTest<T>(got: T, expected: T, test: string) {
  if (expected === got) {
    console.log(`✅ ${test} passed`);
  } else {
    console.log(`❌ ${test} failed: Expected "${expected}", but got "${got}"`);
  }
}

function runTestHTML(got: HTML, expected: string, test: string) {
  const renderedHTML = render(got);
  runTest(renderedHTML, expected, test);
}

/// Typesafe HxTrigger-s:
const trigger1: HxTrigger = 'click';
const trigger2: HxTrigger = 'click once, keyup delay:500ms';
const trigger3: HxTrigger = 'every 1s';
const trigger4: HxTrigger = 'load, click delay:1s';

/// Typesafe Hx-Swap-s:
const swap1: HxSwap = "outerHTML";
const swap2: HxSwap = "innerHTML show:window:top";
const swap3: HxSwap = "innerHTML show:#another-div:top";
const swap4: HxSwap = "beforeend scroll:bottom";

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
    false,
    () => Text("true"),
  ),
  "",
  "IfThen false"
);

runTestHTML(
  IfThenElse(
    true,
    () => Text("true"),
    () => Text("false"),
  ),
  "true",
  "IfThenElse true"
);

runTestHTML(
  IfThenElse(
    false,
    () => Text("true"),
    () => Text("false"),
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

  function TaskView(task: string, index: number): HTML {
    return Div({
      child: VStack([
        Input({ type: "checkbox", id: `task-${index + 1}` }),
        Text(`${index + 1}. ${task}`),
      ]),
    });
  }

  // Do we care about indentation, etc. ?
  runTestHTML(
    ForEach1(tasks, TaskView),
    `<div   ><input id="task-1" type="checkbox"  ></input>
1. Finish the report</div>
<div   ><input id="task-2" type="checkbox"  ></input>
2. Call the client</div>
<div   ><input id="task-3" type="checkbox"  ></input>
3. Prepare meeting agenda</div>`,
    "ForEach"
  );
}

runTestHTML(
  HStack({
    children: [Text("a"), Text("b")]
  }),
  `<div class="flex "  >a
b</div>`,
  "HStack"
);
