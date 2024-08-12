import { Div, HTML, hx, HxTrigger, render } from "../src/index.js";

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