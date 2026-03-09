import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Div, Main, Header, Footer, Section, Article, Nav, P, H1, H2, Span, Strong, Ul, Li, Table, Thead, Tbody, Tr, Th, Td, Form, Input, Button, Label, Select, Option, Details, Summary, A, Img, El, Empty, Overlay, } from "../src/index.js";
// ------------------------------------
// render() variadic
// ------------------------------------
describe("render() variadic", () => {
    it("render single view", () => { assert.strictEqual(render(P("Hello")), `<p>Hello</p>`); });
    it("render two views", () => { assert.strictEqual(render(P("One"), P("Two")), `<p>One</p>\n<p>Two</p>`); });
    it("render three views", () => { assert.strictEqual(render(H1("Title"), P("Body"), Footer("End")), `<h1>Title</h1>\n<p>Body</p>\n<footer>End</footer>`); });
    it("render zero views", () => { assert.strictEqual(render(), ``); });
});
// ------------------------------------
// Nested Structures
// ------------------------------------
describe("Nested Structures", () => {
    it("Deeply nested", () => {
        assert.strictEqual(render(Div(Section(Article(Header(H1("Title")))))), `<div><section><article><header><h1>Title</h1></header></article></section></div>`);
    });
    it("Complex page structure", () => {
        assert.strictEqual(render(Div([
            Header([
                Nav([
                    A("Home").setHref("/"),
                    A("About").setHref("/about"),
                ])
            ]).setClass("header"),
            Main([
                Article([
                    H1("Article Title"),
                    P("First paragraph"),
                    P("Second paragraph"),
                ])
            ]).setClass("content"),
            Footer(P("Copyright 2024")).setClass("footer"),
        ]).setClass("container")), `<div class="container"><header class="header"><nav><a href="/">Home</a>\n<a href="/about">About</a></nav></header>\n<main class="content"><article><h1>Article Title</h1>\n<p>First paragraph</p>\n<p>Second paragraph</p></article></main>\n<footer class="footer"><p>Copyright 2024</p></footer></div>`);
    });
});
// ------------------------------------
// Overlay Utility
// ------------------------------------
describe("Overlay Utility", () => {
    it("Overlay center", () => {
        assert.strictEqual(render(Overlay(Img().setSrc("bg.jpg").setAlt("Background"), Span("Centered text"))), `<div style="position: relative"><img src="bg.jpg" alt="Background">\n<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10"><span>Centered text</span></div></div>`);
    });
    it("Overlay top-right", () => {
        assert.strictEqual(render(Overlay(Div("Card"), Span("Badge"), "top-right")), `<div style="position: relative"><div>Card</div>\n<div style="position: absolute; top: 0; right: 0; z-index: 10"><span>Badge</span></div></div>`);
    });
});
// ------------------------------------
// Mixed Content
// ------------------------------------
describe("Mixed Content", () => {
    it("Array as child", () => {
        assert.strictEqual(render(Div([
            "Text before",
            P("Paragraph"),
            "Text after",
        ])), `<div>Text before\n<p>Paragraph</p>\nText after</div>`);
    });
    it("Nested arrays", () => {
        assert.strictEqual(render(Div([
            [Span("A"), Span("B")],
            [Span("C"), Span("D")],
        ])), `<div><span>A</span>\n<span>B</span>\n<span>C</span>\n<span>D</span></div>`);
    });
    it("Empty in array", () => {
        assert.strictEqual(render(Div([
            P("Before"),
            Empty(),
            P("After"),
        ])), `<div><p>Before</p>\n\n<p>After</p></div>`);
    });
});
// ------------------------------------
// Variadic Children
// ------------------------------------
describe("Variadic Children", () => {
    it("Div with variadic children", () => {
        assert.strictEqual(render(Div(H1("Title"), P("First paragraph"), P("Second paragraph"))), `<div><h1>Title</h1>\n<p>First paragraph</p>\n<p>Second paragraph</p></div>`);
    });
    it("Variadic matches array form", () => {
        assert.strictEqual(render(render(Div(H1("A"), P("B"))) === render(Div([H1("A"), P("B")])) ? Span("match") : Span("mismatch")), `<span>match</span>`);
    });
    it("Variadic single child same as positional", () => { assert.strictEqual(render(Div(P("Only child"))), `<div><p>Only child</p></div>`); });
    it("Variadic no children", () => { assert.strictEqual(render(Div()), `<div></div>`); });
    it("Variadic with strings", () => { assert.strictEqual(render(P("Hello, ", Strong("world"), "!")), `<p>Hello, \n<strong>world</strong>\n!</p>`); });
    it("Variadic Ul with Li children", () => {
        assert.strictEqual(render(Ul(Li("Item 1"), Li("Item 2"), Li("Item 3"))), `<ul><li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li></ul>`);
    });
    it("Variadic Table structure", () => {
        assert.strictEqual(render(Table(Thead(Tr(Th("Name"), Th("Age"))), Tbody(Tr(Td("Alice"), Td("30"))))), `<table><thead><tr><th>Name</th>\n<th>Age</th></tr></thead>\n<tbody><tr><td>Alice</td>\n<td>30</td></tr></tbody></table>`);
    });
    it("Variadic Form with fields", () => {
        assert.strictEqual(render(Form(Label("Name"), Input().setType("text").setName("name"), Button("Submit").setType("submit"))), `<form><label>Name</label>\n<input type="text" name="name">\n<button type="submit">Submit</button></form>`);
    });
    it("Variadic Nav with links", () => {
        assert.strictEqual(render(Nav(A("Home").setHref("/"), A("About").setHref("/about"), A("Contact").setHref("/contact"))), `<nav><a href="/">Home</a>\n<a href="/about">About</a>\n<a href="/contact">Contact</a></nav>`);
    });
    it("Variadic Section with mixed content", () => {
        assert.strictEqual(render(Section(H2("Section Title"), P("Description"), Div(Button("Action 1"), Button("Action 2")))), `<section><h2>Section Title</h2>\n<p>Description</p>\n<div><button>Action 1</button>\n<button>Action 2</button></div></section>`);
    });
    it("Variadic Select with options", () => {
        assert.strictEqual(render(Select(Option("Red").setValue("red"), Option("Green").setValue("green"), Option("Blue").setValue("blue"))), `<select><option value="red">Red</option>\n<option value="green">Green</option>\n<option value="blue">Blue</option></select>`);
    });
    it("Variadic Details/Summary", () => {
        assert.strictEqual(render(Details(Summary("Click to expand"), P("Hidden content here"))), `<details><summary>Click to expand</summary>\n<p>Hidden content here</p></details>`);
    });
    it("Variadic with method chaining", () => {
        assert.strictEqual(render(Div(H1("Styled"), P("Content")).setId("main").setClass("container")), `<div id="main" class="container"><h1>Styled</h1>\n<p>Content</p></div>`);
    });
    it("Array child still works with variadic", () => { assert.strictEqual(render(Div([H1("A"), P("B")])), `<div><h1>A</h1>\n<p>B</p></div>`); });
    it("Variadic El custom element", () => { assert.strictEqual(render(El("custom-el", Span("A"), Span("B"))), `<custom-el><span>A</span>\n<span>B</span></custom-el>`); });
    it("Variadic deeply nested", () => {
        assert.strictEqual(render(Div(Header(Nav(A("Link").setHref("#"))), Main(Article(H1("Title"), P("Body"))), Footer(P("Footer")))), `<div><header><nav><a href="#">Link</a></nav></header>\n<main><article><h1>Title</h1>\n<p>Body</p></article></main>\n<footer><p>Footer</p></footer></div>`);
    });
});
// ------------------------------------
// when() and apply()
// ------------------------------------
describe("when() and apply()", () => {
    // when -- true condition
    it("when() true applies modifier", () => { assert.strictEqual(render(Button("Save").when(true, t => t.addClass("bg-blue-500"))), `<button class="bg-blue-500">Save</button>`); });
    // when -- false condition
    it("when() false skips modifier", () => { assert.strictEqual(render(Button("Save").when(false, t => t.addClass("bg-blue-500"))), `<button>Save</button>`); });
    // when -- chained
    it("when() chained multiple", () => {
        assert.strictEqual(render(Div("Content")
            .setClass("base")
            .when(true, t => t.addClass("active"))
            .when(false, t => t.addClass("hidden"))), `<div class="base active">Content</div>`);
    });
    // when -- complex modifier
    it("when() complex modifier", () => {
        assert.strictEqual(render(Button("Submit")
            .when(true, t => t.toggle("disabled").addClass("opacity-50"))), `<button class="opacity-50" disabled>Submit</button>`);
    });
    // apply -- single modifier
    it("apply() single modifier", () => { assert.strictEqual(render(Div("Card").apply(t => t.setClass("rounded shadow p-4"))), `<div class="rounded shadow p-4">Card</div>`); });
    // apply -- multiple modifiers
    it("apply() multiple modifiers", () => {
        assert.strictEqual(render(Div("Alert")
            .apply(t => t.setClass("rounded p-4"), t => t.addClass("border-red-500"))), `<div class="rounded p-4 border-red-500">Alert</div>`);
    });
    // apply -- reusable modifier functions
    const card = (t) => t.setClass("rounded shadow p-4");
    const danger = (t) => t.addClass("border-red-500 text-red-700");
    it("apply() reusable modifiers", () => { assert.strictEqual(render(Div("Warning").apply(card, danger)), `<div class="rounded shadow p-4 border-red-500 text-red-700">Warning</div>`); });
    // when + apply combined
    it("when() with apply()", () => {
        assert.strictEqual(render(Div("Alert")
            .apply(card)
            .when(true, t => t.apply(danger))), `<div class="rounded shadow p-4 border-red-500 text-red-700">Alert</div>`);
    });
    // apply -- no modifiers (identity)
    it("apply() no modifiers", () => { assert.strictEqual(render(Div("Unchanged").apply()), `<div>Unchanged</div>`); });
});
//# sourceMappingURL=composition.test.js.map