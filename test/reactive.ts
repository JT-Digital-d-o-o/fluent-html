// ------------------------------------
// Reactive System Tests
// ------------------------------------

import {
  Button,
  Div,
  Form,
  H1,
  Input,
  render,
  Span,
  Ul
} from "../src/builder";

import {
  compile,
  generateScript,
  renderWithScript,
  resetIdCounter
} from "../src/reactive";

const view = Div([
  Input().onInput("text = this.value"),
  Div(
    Span().bindClass("highlight", "flag")
  )
    .bindState({ flag: false }),
]).bindState({ text: "" });

console.log(compile(view));

console.log(render(view));
console.log(renderWithScript(view));

// ------------------------------------
// Test Runner
// ------------------------------------

let passCount = 0;
let failCount = 0;

function test(name: string, fn: () => void) {
  try {
    resetIdCounter();
    fn();
    console.log(`✅ ${name}`);
    passCount++;
  } catch (e: any) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failCount++;
  }
}

function assertEqual(got: any, expected: any, message?: string) {
  const gotStr = typeof got === "string" ? got : JSON.stringify(got);
  const expectedStr = typeof expected === "string" ? expected : JSON.stringify(expected);
  if (gotStr !== expectedStr) {
    throw new Error(
      `${message ? message + ": " : ""}Expected:\n${expectedStr}\nGot:\n${gotStr}`
    );
  }
}

function assertNull(value: any, message?: string) {
  if (value !== null) {
    throw new Error(`${message ? message + ": " : ""}Expected null, got: ${value}`);
  }
}

function assertNotNull(value: any, message?: string) {
  if (value === null) {
    throw new Error(`${message ? message + ": " : ""}Expected non-null value`);
  }
}

function assertContains(haystack: string, needle: string, message?: string) {
  if (!haystack.includes(needle)) {
    throw new Error(
      `${message ? message + ": " : ""}Expected to contain "${needle}" in:\n${haystack}`
    );
  }
}

function section(name: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(name);
  console.log("=".repeat(50));
}

// ------------------------------------
// Compile Tests
// ------------------------------------

section("Compile - Success Cases");

test("Simple state binding compiles", () => {
  const view = Div([
    Span().bindText("count"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNull(error);
});

test("Multiple bindings compile", () => {
  const view = Div([
    Span().bindText("message"),
    Button("Click").onClick("count++"),
    Div("Hidden").bindShow("visible"),
  ]).bindState({ message: "Hello", count: 0, visible: true });

  const error = compile(view);
  assertNull(error);
});

test("Nested state compiles", () => {
  const view = Div([
    Span().bindText("outer"),
    Div([
      Span().bindText("inner"),
    ]).bindState({ inner: "nested" }),
  ]).bindState({ outer: "parent" });

  const error = compile(view);
  assertNull(error);
});

test("Complex expression compiles", () => {
  const view = Div([
    Span().bindText("count > 0 ? 'positive' : 'zero'"),
    Span().bindText("'Total: ' + items.length"),
  ]).bindState({ count: 1, items: [] });

  const error = compile(view);
  assertNull(error);
});

test("All binding types compile", () => {
  const view = Div([
    Span().bindText("text"),
    Div().bindHtml("html"),
    Div().bindShow("visible"),
    Div().bindHide("hidden"),
    Div().bindClass("active", "isActive"),
    Div().bindAttr("title", "title"),
    Div().bindStyle("color", "color"),
    Input().bindValue("value"),
  ]).bindState({
    text: "",
    html: "",
    visible: true,
    hidden: false,
    isActive: false,
    title: "",
    color: "red",
    value: "",
  });

  const error = compile(view);
  assertNull(error);
});

test("All event handlers compile", () => {
  const view = Div([
    Button("Click").onClick("count++"),
    Input().onInput("text = this.value"),
    Input().onChange("selected = this.value"),
    Form().onSubmit("submitted = true"),
    Input().onKeydown("key = event.key"),
    Input().onFocus("focused = true"),
    Input().onBlur("focused = false"),
  ]).bindState({
    count: 0,
    text: "",
    selected: "",
    submitted: false,
    key: "",
    focused: false,
  });

  const error = compile(view);
  assertNull(error);
});

// ------------------------------------
// Compile Tests - Error Cases
// ------------------------------------

section("Compile - Error Cases");

test("Unbound variable in bindText", () => {
  const view = Div([
    Span().bindText("unknown"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "unknown");
  assertContains(error!.message, "not bound");
});

test("Unbound variable in onClick", () => {
  const view = Div([
    Button("Click").onClick("missing++"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "missing");
});

test("Unbound variable in bindShow", () => {
  const view = Div([
    Div("Test").bindShow("notDefined"),
  ]).bindState({ visible: true });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "notDefined");
});

test("Variable shadowing error", () => {
  const view = Div([
    Div([
      Span().bindText("count"),
    ]).bindState({ count: 0 }),  // shadows parent
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "count");
  assertContains(error!.message, "shadows");
});

test("No state ancestor error", () => {
  const view = Div([
    Span().bindText("orphan"),
  ]);  // No bindState!

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "orphan");
  assertContains(error!.message, "not bound");
});

// ------------------------------------
// ID Assignment Tests
// ------------------------------------

section("ID Assignment");

test("Reactive IDs are assigned after compile", () => {
  const span = Span().bindText("text");
  const view = Div([span]).bindState({ text: "hello" });

  compile(view);

  assertNotNull(span.reactive?.id);
  assertEqual(span.reactive?.id, "r0");
});

test("Multiple elements get unique IDs", () => {
  const span1 = Span().bindText("a");
  const span2 = Span().bindText("b");
  const btn = Button("Click").onClick("a++");

  const view = Div([span1, span2, btn]).bindState({ a: 0, b: 0 });
  compile(view);

  assertEqual(span1.reactive?.id, "r0");
  assertEqual(span2.reactive?.id, "r1");
  assertEqual(btn.reactive?.id, "r2");
});

// ------------------------------------
// Render Tests
// ------------------------------------

section("Render");

test("Reactive ID appears in rendered HTML", () => {
  const view = Div([
    Span().bindText("count"),
  ]).bindState({ count: 0 });

  compile(view);
  const html = render(view);

  assertContains(html, 'id="r0"');
});

test("Non-reactive elements have no ID", () => {
  const view = Div([
    Span("Static"),
    Span().bindText("count"),
  ]).bindState({ count: 0 });

  compile(view);
  const html = render(view);

  // Should only have one id attribute
  const idCount = (html.match(/id="/g) || []).length;
  assertEqual(idCount, 1);
});

// ------------------------------------
// Script Generation Tests
// ------------------------------------

section("Script Generation");

test("Basic script structure", () => {
  const view = Div([
    Span().bindText("count"),
  ]).bindState({ count: 0 });

  compile(view);
  const script = generateScript(view);

  assertContains(script, "(function()");
  assertContains(script, "let count =");
  assertContains(script, "function update()");
  assertContains(script, "update();");
  assertContains(script, "})();");
});

test("Script includes textContent binding", () => {
  const view = Div([
    Span().bindText("message"),
  ]).bindState({ message: "hello" });

  compile(view);
  const script = generateScript(view);

  assertContains(script, "textContent = message");
});

test("Script includes show binding", () => {
  const view = Div([
    Div("Test").bindShow("visible"),
  ]).bindState({ visible: true });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'style.display = (visible) ? "" : "none"');
});

test("Script includes hide binding", () => {
  const view = Div([
    Div("Test").bindHide("hidden"),
  ]).bindState({ hidden: false });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'style.display = (hidden) ? "none" : ""');
});

test("Script includes class binding", () => {
  const view = Div([
    Button("Test").bindClass("active", "isActive"),
  ]).bindState({ isActive: false });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'classList.toggle("active"');
});

test("Script includes click handler", () => {
  const view = Div([
    Button("Click").onClick("count++"),
  ]).bindState({ count: 0 });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'addEventListener("click"');
  assertContains(script, "count++");
  assertContains(script, "update();");  // Must call update after handler
});

test("Script includes input handler", () => {
  const view = Div([
    Input().onInput("text = this.value"),
  ]).bindState({ text: "" });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'addEventListener("input"');
  assertContains(script, "text = this.value");
});

test("Submit handler includes preventDefault", () => {
  const view = Form([
    Button("Submit"),
  ]).onSubmit("done = true").bindState({ done: false });

  compile(view);
  const script = generateScript(view);

  assertContains(script, "event.preventDefault()");
});

test("renderWithScript combines HTML and script", () => {
  const view = Div([
    Span().bindText("msg"),
  ]).bindState({ msg: "hi" });

  compile(view);
  const output = renderWithScript(view, render);

  assertContains(output, "<div");
  assertContains(output, "<script>");
  assertContains(output, "let msg =");
  assertContains(output, "</script>");
});

// ------------------------------------
// Integration Tests
// ------------------------------------

section("Integration");

test("Counter example", () => {
  const view = Div([
    Span().bindText("'Count: ' + count"),
    Button("Increment").onClick("count++"),
    Button("Decrement").onClick("count--"),
    Button("Reset").onClick("count = 0"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "count++");
  assertContains(script, "count--");
  assertContains(script, "count = 0");
});

test("Todo list example", () => {
  const view = Div([
    H1("Todos"),
    Input()
      .bindValue("newTodo")
      .onInput("newTodo = this.value")
      .onKeydown("if (event.key === 'Enter') { todos.push(newTodo); newTodo = '' }"),
    Div().bindShow("todos.length === 0").bindText("'No todos yet'"),
    Ul().bindHtml("todos.map(t => '<li>' + t + '</li>').join('')"),
  ]).bindState({ todos: [], newTodo: "" });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "keydown");
  assertContains(script, "newTodo = this.value");
});

test("Form with validation", () => {
  const view = Form([
    Input()
      .bindValue("email")
      .onInput("email = this.value")
      .bindClass("error", "touched && !email.includes('@')"),
    Span()
      .bindText("'Invalid email'")
      .bindShow("touched && !email.includes('@')"),
    Button("Submit")
      .bindAttr("disabled", "submitting ? 'disabled' : null"),
  ])
    .onSubmit("submitting = true")
    .onBlur("touched = true")
    .bindState({ email: "", touched: false, submitting: false });

  const error = compile(view);
  assertNull(error);
});

test("Tabs component", () => {
  const view = Div([
    Div([
      Button("Tab 1").onClick("activeTab = 0").bindClass("active", "activeTab === 0"),
      Button("Tab 2").onClick("activeTab = 1").bindClass("active", "activeTab === 1"),
      Button("Tab 3").onClick("activeTab = 2").bindClass("active", "activeTab === 2"),
    ]),
    Div("Content 1").bindShow("activeTab === 0"),
    Div("Content 2").bindShow("activeTab === 1"),
    Div("Content 3").bindShow("activeTab === 2"),
  ]).bindState({ activeTab: 0 });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  const classToggles = (script.match(/classList\.toggle/g) || []).length;
  assertEqual(classToggles, 3);  // 3 tab buttons
});

// ------------------------------------
// Edge Cases
// ------------------------------------

section("Edge Cases");

test("Empty state compiles", () => {
  const view = Div().bindState({});
  const error = compile(view);
  assertNull(error);
});

test("No reactive elements produces no script", () => {
  const view = Div([Span("Static content")]);
  const script = generateScript(view);
  assertEqual(script, "");
});

test("Multiple handlers on same element", () => {
  const view = Div([
    Button("Multi")
      .onClick("a++")
      .onClick("b++")
      .onClick("c = a + b"),
  ]).bindState({ a: 0, b: 0, c: 0 });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "a++");
  assertContains(script, "b++");
  assertContains(script, "c = a + b");
});

test("Deeply nested bindings", () => {
  const view = Div([
    Div([
      Div([
        Div([
          Span().bindText("deep"),
        ]),
      ]),
    ]),
  ]).bindState({ deep: "value" });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "deep");
});

// ------------------------------------
// API Usability (LLM-friendliness) Tests
// ------------------------------------

section("API Usability");

test("Chaining works naturally", () => {
  const input = Input()
    .setType("text")
    .setClass("input")
    .bindValue("text")
    .onInput("text = this.value")
    .onBlur("touched = true")
    .bindClass("error", "touched && !text");

  // Should not throw
  assertNotNull(input.reactive);
});

test("Mixed static and reactive attributes", () => {
  const view = Div([
    Button("Submit")
      .setClass("btn btn-primary")
      .setType("submit")
      .bindClass("loading", "isLoading")
      .bindAttr("disabled", "isLoading")
      .onClick("isLoading = true"),
  ]).bindState({ isLoading: false });

  const error = compile(view);
  assertNull(error);

  const html = render(view);
  assertContains(html, 'class="btn btn-primary"');
  assertContains(html, 'type="submit"');
});

// ------------------------------------
// Summary
// ------------------------------------

console.log(`\n${"=".repeat(50)}`);
console.log("TEST SUMMARY");
console.log("=".repeat(50));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Total: ${passCount + failCount}`);
console.log("=".repeat(50));

if (failCount > 0) {
  process.exit(1);
}