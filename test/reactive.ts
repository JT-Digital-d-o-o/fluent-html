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
  Input().onInput("data.text = this.value"),
  Div(
    Span().bindClass("highlight", "data.flag")
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
    Span().bindText("data.count"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNull(error);
});

test("Multiple bindings compile", () => {
  const view = Div([
    Span().bindText("data.message"),
    Button("Click").onClick("data.count++"),
    Div("Hidden").bindShow("data.visible"),
  ]).bindState({ message: "Hello", count: 0, visible: true });

  const error = compile(view);
  assertNull(error);
});

test("Nested state compiles", () => {
  const view = Div([
    Span().bindText("data.outer"),
    Div([
      Span().bindText("data.inner"),
    ]).bindState({ inner: "nested" }),
  ]).bindState({ outer: "parent" });

  const error = compile(view);
  assertNull(error);
});

test("Complex expression compiles", () => {
  const view = Div([
    Span().bindText("data.count > 0 ? 'positive' : 'zero'"),
    Span().bindText("'Total: ' + data.items.length"),
  ]).bindState({ count: 1, items: [] });

  const error = compile(view);
  assertNull(error);
});

test("All binding types compile", () => {
  const view = Div([
    Span().bindText("data.text"),
    Div().bindHtml("data.html"),
    Div().bindShow("data.visible"),
    Div().bindHide("data.hidden"),
    Div().bindClass("active", "data.isActive"),
    Div().bindAttr("title", "data.title"),
    Div().bindStyle("color", "data.color"),
    Input().bindValue("data.value"),
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
    Button("Click").onClick("data.count++"),
    Input().onInput("data.text = this.value"),
    Input().onChange("data.selected = this.value"),
    Form().onSubmit("data.submitted = true"),
    Input().onKeydown("data.key = event.key"),
    Input().onFocus("data.focused = true"),
    Input().onBlur("data.focused = false"),
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
    Span().bindText("data.unknown"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "unknown");
  assertContains(error!.message, "not bound");
});

test("Unbound variable in onClick", () => {
  const view = Div([
    Button("Click").onClick("data.missing++"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "missing");
});

test("Unbound variable in bindShow", () => {
  const view = Div([
    Div("Test").bindShow("data.notDefined"),
  ]).bindState({ visible: true });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "notDefined");
});

test("Variable shadowing error", () => {
  const view = Div([
    Div([
      Span().bindText("data.count"),
    ]).bindState({ count: 0 }),  // shadows parent
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNotNull(error);
  assertContains(error!.message, "count");
  assertContains(error!.message, "shadows");
});

test("No state ancestor error", () => {
  const view = Div([
    Span().bindText("data.orphan"),
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
  const span = Span().bindText("data.text");
  const view = Div([span]).bindState({ text: "hello" });

  compile(view);

  assertNotNull(span.reactive?.id);
  assertEqual(span.reactive?.id, "r0");
});

test("Multiple elements get unique IDs", () => {
  const span1 = Span().bindText("data.a");
  const span2 = Span().bindText("data.b");
  const btn = Button("Click").onClick("data.a++");

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
    Span().bindText("data.count"),
  ]).bindState({ count: 0 });

  compile(view);
  const html = render(view);

  assertContains(html, 'id="r0"');
});

test("Non-reactive elements have no ID", () => {
  const view = Div([
    Span("Static"),
    Span().bindText("data.count"),
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
    Span().bindText("data.count"),
  ]).bindState({ count: 0 });

  compile(view);
  const script = generateScript(view);

  assertContains(script, "(function()");
  assertContains(script, "const data =");
  assertContains(script, '{"count":0}');
  assertContains(script, "function update()");
  assertContains(script, "update();");
  assertContains(script, "})();");
});

test("Script includes textContent binding", () => {
  const view = Div([
    Span().bindText("data.message"),
  ]).bindState({ message: "hello" });

  compile(view);
  const script = generateScript(view);

  assertContains(script, "textContent = data.message");
});

test("Script includes show binding", () => {
  const view = Div([
    Div("Test").bindShow("data.visible"),
  ]).bindState({ visible: true });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'style.display = (data.visible) ? "" : "none"');
});

test("Script includes hide binding", () => {
  const view = Div([
    Div("Test").bindHide("data.hidden"),
  ]).bindState({ hidden: false });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'style.display = (data.hidden) ? "none" : ""');
});

test("Script includes class binding", () => {
  const view = Div([
    Button("Test").bindClass("active", "data.isActive"),
  ]).bindState({ isActive: false });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'classList.toggle("active"');
});

test("Script includes click handler", () => {
  const view = Div([
    Button("Click").onClick("data.count++"),
  ]).bindState({ count: 0 });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'addEventListener("click"');
  assertContains(script, "data.count++");
  assertContains(script, "update();");  // Must call update after handler
});

test("Script includes input handler", () => {
  const view = Div([
    Input().onInput("data.text = this.value"),
  ]).bindState({ text: "" });

  compile(view);
  const script = generateScript(view);

  assertContains(script, 'addEventListener("input"');
  assertContains(script, "data.text = this.value");
});

test("Submit handler includes preventDefault", () => {
  const view = Form([
    Button("Submit"),
  ]).onSubmit("data.done = true").bindState({ done: false });

  compile(view);
  const script = generateScript(view);

  assertContains(script, "event.preventDefault()");
});

test("renderWithScript combines HTML and script", () => {
  const view = Div([
    Span().bindText("data.msg"),
  ]).bindState({ msg: "hi" });

  compile(view);
  const output = renderWithScript(view, render);

  assertContains(output, "<div");
  assertContains(output, "<script>");
  assertContains(output, "const data =");
  assertContains(output, "</script>");
});

// ------------------------------------
// Integration Tests
// ------------------------------------

section("Integration");

test("Counter example", () => {
  const view = Div([
    Span().bindText("'Count: ' + data.count"),
    Button("Increment").onClick("data.count++"),
    Button("Decrement").onClick("data.count--"),
    Button("Reset").onClick("data.count = 0"),
  ]).bindState({ count: 0 });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "data.count++");
  assertContains(script, "data.count--");
  assertContains(script, "data.count = 0");
});

test("Todo list example", () => {
  const view = Div([
    H1("Todos"),
    Input()
      .bindValue("data.newTodo")
      .onInput("data.newTodo = this.value")
      .onKeydown("if (event.key === 'Enter') { data.todos.push(data.newTodo); data.newTodo = '' }"),
    Div().bindShow("data.todos.length === 0").bindText("'No todos yet'"),
    Ul().bindHtml("data.todos.map(t => '<li>' + t + '</li>').join('')"),
  ]).bindState({ todos: [], newTodo: "" });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "keydown");
  assertContains(script, "data.newTodo = this.value");
});

test("Form with validation", () => {
  const view = Form([
    Input()
      .bindValue("data.email")
      .onInput("data.email = this.value")
      .bindClass("error", "data.touched && !data.email.includes('@')"),
    Span()
      .bindText("'Invalid email'")
      .bindShow("data.touched && !data.email.includes('@')"),
    Button("Submit")
      .bindAttr("disabled", "data.submitting ? 'disabled' : null"),
  ])
    .onSubmit("data.submitting = true")
    .onBlur("data.touched = true")
    .bindState({ email: "", touched: false, submitting: false });

  const error = compile(view);
  assertNull(error);
});

test("Tabs component", () => {
  const view = Div([
    Div([
      Button("Tab 1").onClick("data.activeTab = 0").bindClass("active", "data.activeTab === 0"),
      Button("Tab 2").onClick("data.activeTab = 1").bindClass("active", "data.activeTab === 1"),
      Button("Tab 3").onClick("data.activeTab = 2").bindClass("active", "data.activeTab === 2"),
    ]),
    Div("Content 1").bindShow("data.activeTab === 0"),
    Div("Content 2").bindShow("data.activeTab === 1"),
    Div("Content 3").bindShow("data.activeTab === 2"),
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
      .onClick("data.a++")
      .onClick("data.b++")
      .onClick("data.c = data.a + data.b"),
  ]).bindState({ a: 0, b: 0, c: 0 });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "data.a++");
  assertContains(script, "data.b++");
  assertContains(script, "data.c = data.a + data.b");
});

test("Deeply nested bindings", () => {
  const view = Div([
    Div([
      Div([
        Div([
          Span().bindText("data.deep"),
        ]),
      ]),
    ]),
  ]).bindState({ deep: "value" });

  const error = compile(view);
  assertNull(error);

  const script = generateScript(view);
  assertContains(script, "data.deep");
});

// ------------------------------------
// API Usability (LLM-friendliness) Tests
// ------------------------------------

section("API Usability");

test("Chaining works naturally", () => {
  const input = Input()
    .setType("text")
    .setClass("input")
    .bindValue("data.text")
    .onInput("data.text = this.value")
    .onBlur("data.touched = true")
    .bindClass("error", "data.touched && !data.text");

  // Should not throw
  assertNotNull(input.reactive);
});

test("Mixed static and reactive attributes", () => {
  const view = Div([
    Button("Submit")
      .setClass("btn btn-primary")
      .setType("submit")
      .bindClass("loading", "data.isLoading")
      .bindAttr("disabled", "data.isLoading")
      .onClick("data.isLoading = true"),
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