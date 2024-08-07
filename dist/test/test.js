import { Div, hx, render } from "../src/index.js";
function runTest(got, expected, test) {
    if (expected === got) {
        console.log(`✅ ${test} passed`);
    }
    else {
        console.log(`❌ ${test} failed: Expected "${expected}", but got "${got}"`);
    }
}
function runTestHTML(got, expected, test) {
    const renderedHTML = render(got);
    runTest(renderedHTML, expected, test);
}
// @TODO: - there is currently some redundant whitespace rendered. fix in future!
runTestHTML(Div(), `<div   ></div>`, "Empty div");
runTestHTML(Div({
    id: "my-div",
}), `<div id="my-div"  ></div>`, "Div with id");
runTestHTML(Div({
    id: "my-div",
    class: "my-style",
}), `<div id="my-div" class="my-style"  ></div>`, "Div with id and class");
runTestHTML(Div({
    htmx: hx("/home"),
}), `<div  hx-get="/home"      ></div>`, "Div with htmx [endpoint]");
runTestHTML(Div({
    htmx: hx("/home", {
        method: "post",
        swap: "innerHTML",
        target: "#my-id",
        trigger: "load delay:1s"
    }),
}), `<div  hx-post="/home" hx-target="#my-id" hx-trigger="load delay:1s" hx-swap="innerHTML"   ></div>`, "Div with htmx");
