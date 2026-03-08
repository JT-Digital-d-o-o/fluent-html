import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { 
// Core
render, 
// Structural
Div, Main, Header, Footer, Section, Article, Nav, Aside, Figure, Figcaption, Address, Hgroup, Search, 
// Text content
P, H1, H2, H3, H4, H5, H6, Span, Blockquote, Pre, Code, Hr, Br, Wbr, 
// Inline text
Strong, Em, B, I, U, S, Mark, Small, Sub, Sup, Abbr, Cite, Q, Dfn, Kbd, Samp, 
// Lists
Ul, Ol, Li, Dl, Dt, Dd, Menu, 
// Tables
Table, Thead, Tbody, Tfoot, Tr, Th, Td, Caption, Colgroup, Col, 
// Forms
Form, Input, Textarea, Button, Label, Select, Option, Optgroup, Datalist, Fieldset, Legend, Output, 
// Interactive
Details, Summary, Dialog, 
// Media
Img, Picture, Source, Video, Audio, Track, Canvas, Svg, Path, Circle, Rect, Line, G, 
// Embedded
Iframe, Embed, 
// Links
A, 
// Document
HTML, Head, Body, Title, Meta, Link, Style, Script, Base, Noscript, Template, 
// Data/Time
Time, Data, Progress, Meter, 
// Web Components
Slot, 
// Utilities
El, Empty, Overlay, 
// Control flow
IfThen, IfThenElse, SwitchCase, Match, ForEach, Repeat, } from "../src/index.js";
import { hx, id, clss } from "../src/htmx.js";
// ------------------------------------
// Basic Elements
// ------------------------------------
describe("Basic Elements", () => {
    it("Empty()", () => { assert.strictEqual(render(Empty()), ``); });
    it("Empty Div", () => { assert.strictEqual(render(Div()), `<div></div>`); });
    it("Div with text", () => { assert.strictEqual(render(Div("Hello")), `<div>Hello</div>`); });
    it("P with text", () => { assert.strictEqual(render(P("Paragraph text")), `<p>Paragraph text</p>`); });
    it("Span with text", () => { assert.strictEqual(render(Span("inline")), `<span>inline</span>`); });
    it("All heading levels", () => { assert.strictEqual(render([H1("One"), H2("Two"), H3("Three"), H4("Four"), H5("Five"), H6("Six")]), `<h1>One</h1>\n<h2>Two</h2>\n<h3>Three</h3>\n<h4>Four</h4>\n<h5>Five</h5>\n<h6>Six</h6>`); });
    it("Br element", () => { assert.strictEqual(render(Br()), `<br>`); });
    it("Hr element", () => { assert.strictEqual(render(Hr()), `<hr>`); });
    it("Wbr element", () => { assert.strictEqual(render(Wbr()), `<wbr>`); });
});
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
// Semantic Elements
// ------------------------------------
describe("Semantic Elements", () => {
    it("Header", () => { assert.strictEqual(render(Header("Site header")), `<header>Site header</header>`); });
    it("Footer", () => { assert.strictEqual(render(Footer("Site footer")), `<footer>Site footer</footer>`); });
    it("Main", () => { assert.strictEqual(render(Main("Main content")), `<main>Main content</main>`); });
    it("Nav", () => { assert.strictEqual(render(Nav("Navigation")), `<nav>Navigation</nav>`); });
    it("Aside", () => { assert.strictEqual(render(Aside("Sidebar")), `<aside>Sidebar</aside>`); });
    it("Section", () => { assert.strictEqual(render(Section("A section")), `<section>A section</section>`); });
    it("Article", () => { assert.strictEqual(render(Article("An article")), `<article>An article</article>`); });
    it("Figure with Figcaption", () => {
        assert.strictEqual(render(Figure([
            Img().setSrc("photo.jpg").setAlt("A photo"),
            Figcaption("Photo caption")
        ])), `<figure><img src="photo.jpg" alt="A photo">\n<figcaption>Photo caption</figcaption></figure>`);
    });
    it("Address", () => { assert.strictEqual(render(Address("123 Main St")), `<address>123 Main St</address>`); });
    it("Hgroup", () => { assert.strictEqual(render(Hgroup([H1("Title"), P("Subtitle")])), `<hgroup><h1>Title</h1>\n<p>Subtitle</p></hgroup>`); });
    it("Search", () => { assert.strictEqual(render(Search(Input().setType("search"))), `<search><input type="search"></search>`); });
});
// ------------------------------------
// Text Formatting Elements
// ------------------------------------
describe("Text Formatting", () => {
    it("Strong", () => { assert.strictEqual(render(Strong("bold")), `<strong>bold</strong>`); });
    it("Em", () => { assert.strictEqual(render(Em("italic")), `<em>italic</em>`); });
    it("B, I, U, S", () => { assert.strictEqual(render([B("bold"), I("italic"), U("underline"), S("strikethrough")]), `<b>bold</b>\n<i>italic</i>\n<u>underline</u>\n<s>strikethrough</s>`); });
    it("Mark", () => { assert.strictEqual(render(Mark("highlighted")), `<mark>highlighted</mark>`); });
    it("Small", () => { assert.strictEqual(render(Small("fine print")), `<small>fine print</small>`); });
    it("Sub and Sup", () => { assert.strictEqual(render(P(["H", Sub("2"), "O and x", Sup("2")])), `<p>H\n<sub>2</sub>\nO and x\n<sup>2</sup></p>`); });
    it("Abbr", () => { assert.strictEqual(render(Abbr("HTML").addAttribute("title", "HyperText Markup Language")), `<abbr title="HyperText Markup Language">HTML</abbr>`); });
    it("Cite", () => { assert.strictEqual(render(Cite("The Great Gatsby")), `<cite>The Great Gatsby</cite>`); });
    it("Q", () => { assert.strictEqual(render(Q("To be or not to be")), `<q>To be or not to be</q>`); });
    it("Dfn", () => { assert.strictEqual(render(Dfn("term")), `<dfn>term</dfn>`); });
    it("Kbd", () => { assert.strictEqual(render(Kbd("Ctrl+C")), `<kbd>Ctrl+C</kbd>`); });
    it("Samp", () => { assert.strictEqual(render(Samp("output")), `<samp>output</samp>`); });
    it("Blockquote", () => { assert.strictEqual(render(Blockquote("A famous quote")), `<blockquote>A famous quote</blockquote>`); });
    it("Pre and Code", () => { assert.strictEqual(render(Pre(Code("const x = 1;"))), `<pre><code>const x = 1;</code></pre>`); });
});
// ------------------------------------
// ID, Class, Style Attributes
// ------------------------------------
describe("ID, Class, Style", () => {
    it("Div with id", () => { assert.strictEqual(render(Div().setId("my-div")), `<div id="my-div"></div>`); });
    it("Div with class", () => { assert.strictEqual(render(Div().setClass("container")), `<div class="container"></div>`); });
    it("Div with id and class", () => { assert.strictEqual(render(Div().setId("main").setClass("container fluid")), `<div id="main" class="container fluid"></div>`); });
    it("addClass on empty", () => { assert.strictEqual(render(Div().addClass("first")), `<div class="first"></div>`); });
    it("addClass appends", () => { assert.strictEqual(render(Div().setClass("one").addClass("two").addClass("three")), `<div class="one two three"></div>`); });
    it("setStyle", () => { assert.strictEqual(render(Div().setStyle("color: red; font-size: 16px")), `<div style="color: red; font-size: 16px"></div>`); });
    it("Combined id, class, style", () => {
        assert.strictEqual(render(Div("Content")
            .setId("box")
            .setClass("card shadow")
            .setStyle("padding: 10px")), `<div id="box" class="card shadow" style="padding: 10px">Content</div>`);
    });
});
// ------------------------------------
// Custom Attributes
// ------------------------------------
describe("Custom Attributes", () => {
    it("addAttribute single", () => { assert.strictEqual(render(Div().addAttribute("data-id", "123")), `<div data-id="123"></div>`); });
    it("addAttribute multiple", () => {
        assert.strictEqual(render(Div()
            .addAttribute("data-id", "123")
            .addAttribute("data-name", "test")
            .addAttribute("aria-label", "Test div")), `<div data-id="123" data-name="test" aria-label="Test div"></div>`);
    });
    it("El custom element", () => { assert.strictEqual(render(El("custom-element", "Content").setClass("my-class")), `<custom-element class="my-class">Content</custom-element>`); });
});
// ------------------------------------
// Toggles (Boolean Attributes)
// ------------------------------------
describe("Toggles (Boolean Attributes)", () => {
    it("Single toggle", () => { assert.strictEqual(render(Input().setToggles(["required"])), `<input required>`); });
    it("Multiple toggles", () => { assert.strictEqual(render(Input().setToggles(["required", "disabled", "readonly"])), `<input required disabled readonly>`); });
    it("Toggle with other attributes", () => {
        assert.strictEqual(render(Input()
            .setType("text")
            .setName("email")
            .setToggles(["required"])), `<input type="text" name="email" required>`);
    });
    it("toggle() single", () => { assert.strictEqual(render(Input().toggle("required")), `<input required>`); });
    it("toggle() multiple chained", () => { assert.strictEqual(render(Input().toggle("required").toggle("disabled")), `<input required disabled>`); });
    it("toggle() conditional true", () => { assert.strictEqual(render(Input().toggle("required", true)), `<input required>`); });
    it("toggle() conditional false", () => { assert.strictEqual(render(Input().toggle("required", false)), `<input>`); });
    it("toggle() mixed conditions", () => { assert.strictEqual(render(Input().toggle("required", true).toggle("disabled", false).toggle("readonly", true)), `<input required readonly>`); });
    it("toggle() with other attributes", () => {
        assert.strictEqual(render(Input()
            .setType("email")
            .setName("email")
            .toggle("required")), `<input type="email" name="email" required>`);
    });
    it("toggle() combined with setToggles", () => { assert.strictEqual(render(Input().setToggles(["hidden"]).toggle("disabled")), `<input hidden disabled>`); });
});
// ------------------------------------
// Lists
// ------------------------------------
describe("Lists", () => {
    it("Unordered list", () => {
        assert.strictEqual(render(Ul([
            Li("Item 1"),
            Li("Item 2"),
            Li("Item 3"),
        ])), `<ul><li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li></ul>`);
    });
    it("Ordered list", () => {
        assert.strictEqual(render(Ol([
            Li("First"),
            Li("Second"),
        ])), `<ol><li>First</li>\n<li>Second</li></ol>`);
    });
    it("Nested list", () => {
        assert.strictEqual(render(Ul([
            Li("Item 1"),
            Li([
                "Item 2",
                Ul([
                    Li("Sub 1"),
                    Li("Sub 2"),
                ])
            ]),
        ])), `<ul><li>Item 1</li>\n<li>Item 2\n<ul><li>Sub 1</li>\n<li>Sub 2</li></ul></li></ul>`);
    });
    it("Definition list", () => {
        assert.strictEqual(render(Dl([
            Dt("Term 1"),
            Dd("Definition 1"),
            Dt("Term 2"),
            Dd("Definition 2"),
        ])), `<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dt>Term 2</dt>\n<dd>Definition 2</dd></dl>`);
    });
    it("Menu", () => {
        assert.strictEqual(render(Menu([
            Li("Action 1"),
            Li("Action 2"),
        ])), `<menu><li>Action 1</li>\n<li>Action 2</li></menu>`);
    });
});
// ------------------------------------
// Tables
// ------------------------------------
describe("Tables", () => {
    it("Simple table", () => {
        assert.strictEqual(render(Table([
            Thead(Tr([Th("Name"), Th("Age")])),
            Tbody([
                Tr([Td("Alice"), Td("30")]),
                Tr([Td("Bob"), Td("25")]),
            ])
        ])), `<table><thead><tr><th>Name</th>\n<th>Age</th></tr></thead>\n<tbody><tr><td>Alice</td>\n<td>30</td></tr>\n<tr><td>Bob</td>\n<td>25</td></tr></tbody></table>`);
    });
    it("Table with Tfoot", () => {
        assert.strictEqual(render(Table([
            Thead(Tr([Th("Item"), Th("Price")])),
            Tbody(Tr([Td("Widget"), Td("$10")])),
            Tfoot(Tr([Td("Total"), Td("$10")])),
        ])), `<table><thead><tr><th>Item</th>\n<th>Price</th></tr></thead>\n<tbody><tr><td>Widget</td>\n<td>$10</td></tr></tbody>\n<tfoot><tr><td>Total</td>\n<td>$10</td></tr></tfoot></table>`);
    });
    it("Table with Caption", () => {
        assert.strictEqual(render(Table([
            Caption("Sales Data"),
            Tr([Th("Q1"), Th("Q2")]),
        ])), `<table><caption>Sales Data</caption>\n<tr><th>Q1</th>\n<th>Q2</th></tr></table>`);
    });
    it("Th with colspan", () => { assert.strictEqual(render(Th("Header").setColspan(2)), `<th colspan="2">Header</th>`); });
    it("Td with rowspan", () => { assert.strictEqual(render(Td("Cell").setRowspan(3)), `<td rowspan="3">Cell</td>`); });
    it("Th with scope", () => { assert.strictEqual(render(Th("Column").setScope("col")), `<th scope="col">Column</th>`); });
    it("Colgroup and Col", () => {
        assert.strictEqual(render(Table([
            Colgroup([
                Col().setSpan(2).setClass("highlight"),
                Col(),
            ]),
            Tr([Td("A"), Td("B"), Td("C")]),
        ])), `<table><colgroup><col class="highlight" span="2">\n<col></colgroup>\n<tr><td>A</td>\n<td>B</td>\n<td>C</td></tr></table>`);
    });
});
// ------------------------------------
// Forms - Input
// ------------------------------------
describe("Forms - Input", () => {
    it("Text input", () => { assert.strictEqual(render(Input().setType("text").setName("username").setPlaceholder("Enter username")), `<input type="text" name="username" placeholder="Enter username">`); });
    it("Email input with validation", () => {
        assert.strictEqual(render(Input()
            .setAutocomplete("email")
            .setType("email")
            .setName("email")
            .setToggles(["required"])), `<input type="email" name="email" autocomplete="email" required>`);
    });
    it("Number input with min/max/step", () => {
        assert.strictEqual(render(Input()
            .setType("number")
            .setName("quantity")
            .setMin(1)
            .setMax(100)
            .setStep(5)), `<input type="number" name="quantity" min="1" max="100" step="5">`);
    });
    it("Password input", () => {
        assert.strictEqual(render(Input()
            .setType("password")
            .setName("password")
            .setMinlength(8)
            .setMaxlength(64)), `<input type="password" name="password" minlength="8" maxlength="64">`);
    });
    it("Input with pattern", () => {
        assert.strictEqual(render(Input()
            .setType("text")
            .setName("zipcode")
            .setPattern("[0-9]{5}")), `<input type="text" name="zipcode" pattern="[0-9]{5}">`);
    });
    it("Checkbox input", () => {
        assert.strictEqual(render(Input()
            .setType("checkbox")
            .setName("agree")
            .setValue("yes")
            .setChecked()), `<input type="checkbox" name="agree" value="yes" checked="true">`);
    });
    it("Radio input", () => {
        assert.strictEqual(render(Input()
            .setType("radio")
            .setName("color")
            .setValue("red")), `<input type="radio" name="color" value="red">`);
    });
    it("File input", () => {
        assert.strictEqual(render(Input()
            .setType("file")
            .setName("document")
            .setAccept(".pdf,.doc")
            .setMultiple()), `<input type="file" name="document" accept=".pdf,.doc" multiple="true">`);
    });
    it("Disabled input", () => {
        assert.strictEqual(render(Input()
            .setType("text")
            .setName("locked")
            .setValue("Cannot edit")
            .setDisabled()), `<input type="text" name="locked" value="Cannot edit" disabled="true">`);
    });
    it("Readonly input", () => {
        assert.strictEqual(render(Input()
            .setType("text")
            .setName("readonly")
            .setValue("Read only")
            .setReadonly()), `<input type="text" name="readonly" value="Read only" readonly="true">`);
    });
    it("Input with datalist", () => {
        assert.strictEqual(render([
            Input().setType("text").setName("browser").setList("browsers"),
            Datalist([
                Option("Chrome").setValue("chrome"),
                Option("Firefox").setValue("firefox"),
            ]).setId("browsers"),
        ]), `<input type="text" name="browser" list="browsers">\n<datalist id="browsers"><option value="chrome">Chrome</option>\n<option value="firefox">Firefox</option></datalist>`);
    });
});
// ------------------------------------
// Forms - Textarea
// ------------------------------------
describe("Forms - Textarea", () => {
    it("Basic textarea", () => { assert.strictEqual(render(Textarea().setName("message").setPlaceholder("Enter message")), `<textarea name="message" placeholder="Enter message"></textarea>`); });
    it("Textarea with rows/cols", () => {
        assert.strictEqual(render(Textarea()
            .setName("bio")
            .setRows(5)
            .setCols(40)), `<textarea name="bio" rows="5" cols="40"></textarea>`);
    });
    it("Textarea with content", () => { assert.strictEqual(render(Textarea("Default text").setName("notes")), `<textarea name="notes">Default text</textarea>`); });
    it("Textarea with validation", () => {
        assert.strictEqual(render(Textarea()
            .setName("essay")
            .setMinlength(100)
            .setMaxlength(5000)
            .setWrap("soft")), `<textarea name="essay" minlength="100" maxlength="5000" wrap="soft"></textarea>`);
    });
});
// ------------------------------------
// Forms - Button
// ------------------------------------
describe("Forms - Button", () => {
    it("Submit button", () => { assert.strictEqual(render(Button("Submit").setType("submit")), `<button type="submit">Submit</button>`); });
    it("Reset button", () => { assert.strictEqual(render(Button("Reset").setType("reset")), `<button type="reset">Reset</button>`); });
    it("Button with name/value", () => {
        assert.strictEqual(render(Button("Save")
            .setType("submit")
            .setName("action")
            .setValue("save")), `<button type="submit" name="action" value="save">Save</button>`);
    });
    it("Disabled button", () => { assert.strictEqual(render(Button("Disabled").setDisabled()), `<button disabled="true">Disabled</button>`); });
    it("Button with formaction", () => {
        assert.strictEqual(render(Button("Delete")
            .setType("submit")
            .setFormaction("/delete")
            .setFormmethod("post")), `<button type="submit" formaction="/delete" formmethod="post">Delete</button>`);
    });
});
// ------------------------------------
// Forms - Select
// ------------------------------------
describe("Forms - Select", () => {
    it("Basic select", () => {
        assert.strictEqual(render(Select([
            Option("Choose...").setValue(""),
            Option("Option 1").setValue("1"),
            Option("Option 2").setValue("2"),
        ]).setName("choice")), `<select name="choice"><option value="">Choose...</option>\n<option value="1">Option 1</option>\n<option value="2">Option 2</option></select>`);
    });
    it("Select with selected option", () => {
        assert.strictEqual(render(Select([
            Option("A").setValue("a"),
            Option("B").setValue("b").setSelected(),
            Option("C").setValue("c"),
        ]).setName("letter")), `<select name="letter"><option value="a">A</option>\n<option value="b" selected="true">B</option>\n<option value="c">C</option></select>`);
    });
    it("Select with optgroup", () => {
        assert.strictEqual(render(Select([
            Optgroup([
                Option("Volvo").setValue("volvo"),
                Option("Saab").setValue("saab"),
            ]).setLabel("Swedish Cars"),
            Optgroup([
                Option("Mercedes").setValue("mercedes"),
                Option("Audi").setValue("audi"),
            ]).setLabel("German Cars"),
        ]).setName("car")), `<select name="car"><optgroup label="Swedish Cars"><option value="volvo">Volvo</option>\n<option value="saab">Saab</option></optgroup>\n<optgroup label="German Cars"><option value="mercedes">Mercedes</option>\n<option value="audi">Audi</option></optgroup></select>`);
    });
    it("Multiple select", () => {
        assert.strictEqual(render(Select([
            Option("Red").setValue("red"),
            Option("Green").setValue("green"),
            Option("Blue").setValue("blue"),
        ]).setName("colors").setMultiple().setSize(3)), `<select name="colors" multiple="true" size="3"><option value="red">Red</option>\n<option value="green">Green</option>\n<option value="blue">Blue</option></select>`);
    });
});
// ------------------------------------
// Forms - Label, Fieldset, Form
// ------------------------------------
describe("Forms - Label, Fieldset, Form", () => {
    it("Label with for", () => { assert.strictEqual(render(Label("Username").setFor("username")), `<label for="username">Username</label>`); });
    it("Fieldset with Legend", () => {
        assert.strictEqual(render(Fieldset([
            Legend("Personal Info"),
            Label("Name").setFor("name"),
            Input().setType("text").setName("name").setId("name"),
        ]).setName("personal")), `<fieldset name="personal"><legend>Personal Info</legend>\n<label for="name">Name</label>\n<input id="name" type="text" name="name"></fieldset>`);
    });
    it("Disabled fieldset", () => {
        assert.strictEqual(render(Fieldset([
            Legend("Disabled Section"),
            Input().setType("text"),
        ]).setDisabled()), `<fieldset disabled="true"><legend>Disabled Section</legend>\n<input type="text"></fieldset>`);
    });
    it("Form with method and action", () => {
        assert.strictEqual(render(Form([
            Input().setType("text").setName("q"),
            Button("Search").setType("submit"),
        ]).setAction("/search").setMethod("get")), `<form action="/search" method="get"><input type="text" name="q">\n<button type="submit">Search</button></form>`);
    });
    it("Form with enctype", () => {
        assert.strictEqual(render(Form([
            Input().setType("file").setName("upload"),
        ]).setAction("/upload").setMethod("post").setEnctype("multipart/form-data")), `<form action="/upload" method="post" enctype="multipart/form-data"><input type="file" name="upload"></form>`);
    });
    it("Form with novalidate", () => {
        assert.strictEqual(render(Form([
            Input().setType("email").setName("email"),
        ]).setNovalidate()), `<form novalidate="true"><input type="email" name="email"></form>`);
    });
    it("Output element", () => { assert.strictEqual(render(Output("100").setFor("a b").setName("result")), `<output for="a b" name="result">100</output>`); });
});
// ------------------------------------
// Interactive Elements
// ------------------------------------
describe("Interactive Elements", () => {
    it("Details/Summary closed", () => {
        assert.strictEqual(render(Details([
            Summary("Click to expand"),
            P("Hidden content"),
        ])), `<details><summary>Click to expand</summary>\n<p>Hidden content</p></details>`);
    });
    it("Details open", () => {
        assert.strictEqual(render(Details([
            Summary("Expanded"),
            P("Visible content"),
        ]).setOpen()), `<details open="true"><summary>Expanded</summary>\n<p>Visible content</p></details>`);
    });
    it("Details with name (accordion)", () => {
        assert.strictEqual(render(Details([
            Summary("Section 1"),
            P("Content 1"),
        ]).setName("accordion")), `<details name="accordion"><summary>Section 1</summary>\n<p>Content 1</p></details>`);
    });
    it("Dialog closed", () => {
        assert.strictEqual(render(Dialog([
            H2("Dialog Title"),
            P("Dialog content"),
            Button("Close"),
        ])), `<dialog><h2>Dialog Title</h2>\n<p>Dialog content</p>\n<button>Close</button></dialog>`);
    });
    it("Dialog open", () => { assert.strictEqual(render(Dialog("Open dialog").setOpen()), `<dialog open="true">Open dialog</dialog>`); });
});
// ------------------------------------
// Links
// ------------------------------------
describe("Links", () => {
    it("Basic anchor", () => { assert.strictEqual(render(A("Click here").setHref("https://example.com")), `<a href="https://example.com">Click here</a>`); });
    it("Anchor with target", () => { assert.strictEqual(render(A("External").setHref("https://example.com").setTarget("_blank")), `<a href="https://example.com" target="_blank">External</a>`); });
    it("Anchor with rel", () => { assert.strictEqual(render(A("Nofollow").setHref("/page").setRel("nofollow noopener")), `<a href="/page" rel="nofollow noopener">Nofollow</a>`); });
    it("Download link", () => { assert.strictEqual(render(A("Download PDF").setHref("/file.pdf").setDownload("document.pdf")), `<a href="/file.pdf" download="document.pdf">Download PDF</a>`); });
    it("Email link", () => { assert.strictEqual(render(A("Contact us").setHref("mailto:info@example.com")), `<a href="mailto:info@example.com">Contact us</a>`); });
});
// ------------------------------------
// Media Elements
// ------------------------------------
describe("Media Elements", () => {
    it("Basic image", () => { assert.strictEqual(render(Img().setSrc("photo.jpg").setAlt("A photo")), `<img src="photo.jpg" alt="A photo">`); });
    it("Image with dimensions", () => { assert.strictEqual(render(Img().setSrc("photo.jpg").setAlt("Photo").setWidth("640").setHeight("480")), `<img src="photo.jpg" alt="Photo" width="640" height="480">`); });
    it("Lazy loaded image", () => { assert.strictEqual(render(Img().setSrc("photo.jpg").setAlt("Lazy").setLoading("lazy")), `<img src="photo.jpg" alt="Lazy" loading="lazy">`); });
    it("Image with srcset", () => {
        assert.strictEqual(render(Img()
            .setSrc("small.jpg")
            .setAlt("Responsive")
            .setSrcset("small.jpg 480w, medium.jpg 800w, large.jpg 1200w")
            .setSizes("(max-width: 600px) 480px, 800px")), `<img src="small.jpg" alt="Responsive" srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 480px, 800px">`);
    });
    it("Picture element", () => {
        assert.strictEqual(render(Picture([
            Source().setSrcset("large.webp").setMedia("(min-width: 800px)").setType("image/webp"),
            Source().setSrcset("small.webp").setType("image/webp"),
            Img().setSrc("fallback.jpg").setAlt("Picture"),
        ])), `<picture><source srcset="large.webp" media="(min-width: 800px)" type="image/webp">\n<source srcset="small.webp" type="image/webp">\n<img src="fallback.jpg" alt="Picture"></picture>`);
    });
    it("Video with controls", () => { assert.strictEqual(render(Video().setSrc("video.mp4").setControls().setWidth(640).setHeight(360)), `<video src="video.mp4" controls="true" width="640" height="360"></video>`); });
    it("Video with multiple sources", () => {
        assert.strictEqual(render(Video([
            Source().setSrc("video.webm").setType("video/webm"),
            Source().setSrc("video.mp4").setType("video/mp4"),
            "Your browser does not support video.",
        ]).setControls()), `<video controls="true"><source src="video.webm" type="video/webm">\n<source src="video.mp4" type="video/mp4">\nYour browser does not support video.</video>`);
    });
    it("Video with all options", () => {
        assert.strictEqual(render(Video()
            .setSrc("video.mp4")
            .setControls()
            .setAutoplay()
            .setLoop()
            .setMuted()
            .setPoster("poster.jpg")
            .setPreload("metadata")
            .setPlaysinline()), `<video src="video.mp4" controls="true" autoplay="true" loop="true" muted="true" poster="poster.jpg" preload="metadata" playsinline="true"></video>`);
    });
    it("Audio", () => { assert.strictEqual(render(Audio().setSrc("audio.mp3").setControls()), `<audio src="audio.mp3" controls="true"></audio>`); });
    it("Audio with preload", () => {
        assert.strictEqual(render(Audio()
            .setSrc("audio.mp3")
            .setControls()
            .setPreload("none")), `<audio src="audio.mp3" controls="true" preload="none"></audio>`);
    });
    it("Video with Track", () => {
        assert.strictEqual(render(Video([
            Source().setSrc("video.mp4").setType("video/mp4"),
            Track()
                .setSrc("captions.vtt")
                .setKind("subtitles")
                .setSrclang("en")
                .setLabel("English")
                .setDefault(),
        ]).setControls()), `<video controls="true"><source src="video.mp4" type="video/mp4">\n<track src="captions.vtt" kind="subtitles" srclang="en" label="English" default="true"></video>`);
    });
    it("Canvas", () => { assert.strictEqual(render(Canvas().setWidth(800).setHeight(600).setId("myCanvas")), `<canvas id="myCanvas" width="800" height="600"></canvas>`); });
});
// ------------------------------------
// SVG
// ------------------------------------
describe("SVG", () => {
    it("Basic SVG", () => {
        assert.strictEqual(render(Svg([
            Circle().addAttribute("cx", "50").addAttribute("cy", "50").addAttribute("r", "40").addAttribute("fill", "red"),
        ]).setWidth("100").setHeight("100").setViewBox("0 0 100 100")), `<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"></circle></svg>`);
    });
    it("SVG with path", () => {
        assert.strictEqual(render(Svg([
            Path().addAttribute("d", "M10 10 H 90 V 90 H 10 Z").addAttribute("fill", "none").addAttribute("stroke", "black"),
        ]).setViewBox("0 0 100 100")), `<svg viewBox="0 0 100 100"><path d="M10 10 H 90 V 90 H 10 Z" fill="none" stroke="black"></path></svg>`);
    });
    it("SVG with group", () => {
        assert.strictEqual(render(Svg([
            G([
                Rect().addAttribute("width", "50").addAttribute("height", "50"),
                Line().addAttribute("x1", "0").addAttribute("y1", "0").addAttribute("x2", "50").addAttribute("y2", "50"),
            ]).addAttribute("transform", "translate(10, 10)"),
        ]).setViewBox("0 0 100 100")), `<svg viewBox="0 0 100 100"><g transform="translate(10, 10)"><rect width="50" height="50"></rect>\n<line x1="0" y1="0" x2="50" y2="50"></line></g></svg>`);
    });
});
// ------------------------------------
// Embedded Content
// ------------------------------------
describe("Embedded Content", () => {
    it("Iframe basic", () => { assert.strictEqual(render(Iframe().setSrc("https://example.com").setWidth("600").setHeight("400")), `<iframe src="https://example.com" width="600" height="400"></iframe>`); });
    it("Iframe with sandbox", () => {
        assert.strictEqual(render(Iframe()
            .setSrc("https://example.com")
            .setSandbox("allow-scripts allow-same-origin")
            .setLoading("lazy")), `<iframe src="https://example.com" sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>`);
    });
    it("Iframe with allow", () => {
        assert.strictEqual(render(Iframe()
            .setSrc("https://youtube.com/embed/xyz")
            .setAllow("accelerometer; autoplay; clipboard-write")
            .setAllowfullscreen()), `<iframe src="https://youtube.com/embed/xyz" allow="accelerometer; autoplay; clipboard-write" allowfullscreen="true"></iframe>`);
    });
    it("Embed", () => { assert.strictEqual(render(Embed().setSrc("game.swf").setType("application/x-shockwave-flash").setWidth("400").setHeight("300")), `<embed src="game.swf" type="application/x-shockwave-flash" width="400" height="300">`); });
});
// ------------------------------------
// Document Structure
// ------------------------------------
describe("Document Structure", () => {
    it("HTML element", () => {
        assert.strictEqual(render(HTML([
            Head(Title("Page Title")),
            Body(P("Content")),
        ])), `<html><head><title>Page Title</title></head>\n<body><p>Content</p></body></html>`);
    });
    it("HTML with lang", () => { assert.strictEqual(render(HTML(Head(), Body()).setLang("en")), `<html lang="en"><head></head>\n<body></body></html>`); });
    it("HTML with lang and dir", () => { assert.strictEqual(render(HTML(Head(), Body()).setLang("ar").setDir("rtl")), `<html lang="ar" dir="rtl"><head></head>\n<body></body></html>`); });
    it("Meta charset", () => { assert.strictEqual(render(Meta().setCharset("UTF-8")), `<meta charset="UTF-8">`); });
    it("Meta viewport", () => { assert.strictEqual(render(Meta().setName("viewport").setContent("width=device-width, initial-scale=1")), `<meta name="viewport" content="width=device-width, initial-scale=1">`); });
    it("Meta og:title", () => { assert.strictEqual(render(Meta().setProperty("og:title").setContent("My Page")), `<meta property="og:title" content="My Page">`); });
    it("Link stylesheet", () => { assert.strictEqual(render(Link().setRel("stylesheet").setHref("styles.css")), `<link rel="stylesheet" href="styles.css">`); });
    it("Link favicon", () => { assert.strictEqual(render(Link().setRel("icon").setHref("favicon.ico").setType("image/x-icon")), `<link rel="icon" href="favicon.ico" type="image/x-icon">`); });
    it("Link preload", () => { assert.strictEqual(render(Link().setRel("preload").setHref("font.woff2").setAs("font").setCrossorigin("anonymous")), `<link rel="preload" href="font.woff2" as="font" crossorigin="anonymous">`); });
    it("Base", () => { assert.strictEqual(render(Base().setHref("https://example.com/").setTarget("_blank")), `<base href="https://example.com/" target="_blank">`); });
    it("Noscript", () => { assert.strictEqual(render(Noscript(P("JavaScript is required"))), `<noscript><p>JavaScript is required</p></noscript>`); });
    it("Template", () => { assert.strictEqual(render(Template(Div("Template content"))), `<template><div>Template content</div></template>`); });
});
// ------------------------------------
// Script and Style (Raw Content)
// ------------------------------------
describe("Script and Style (Raw Content)", () => {
    it("Script inline", () => { assert.strictEqual(render(Script(`console.log("Hello");`)), `<script>console.log("Hello");</script>`); });
    it("Script with special chars (not escaped)", () => { assert.strictEqual(render(Script("if (a < b && c > d) { alert('<test>'); }")), "<script>if (a < b && c > d) { alert('<test>'); }</script>"); });
    it("Script external", () => { assert.strictEqual(render(Script().setSrc("app.js").setDefer()), `<script src="app.js" defer="true"></script>`); });
    it("Script module", () => { assert.strictEqual(render(Script().setSrc("module.js").setType("module")), `<script src="module.js" type="module"></script>`); });
    it("Script with integrity", () => {
        assert.strictEqual(render(Script()
            .setSrc("https://cdn.example.com/lib.js")
            .setIntegrity("sha384-abc123")
            .setCrossorigin("anonymous")), `<script src="https://cdn.example.com/lib.js" integrity="sha384-abc123" crossorigin="anonymous"></script>`);
    });
    it("Style inline", () => { assert.strictEqual(render(Style(`.red { color: red; }`)), `<style>.red { color: red; }</style>`); });
    it("Style with special chars (not escaped)", () => { assert.strictEqual(render(Style(`body > div { content: '<test>'; }`)), `<style>body > div { content: '<test>'; }</style>`); });
});
// ------------------------------------
// Data and Time Elements
// ------------------------------------
describe("Data and Time Elements", () => {
    it("Time with datetime", () => { assert.strictEqual(render(Time("December 25, 2024").setDatetime("2024-12-25")), `<time datetime="2024-12-25">December 25, 2024</time>`); });
    it("Data with value", () => { assert.strictEqual(render(Data("Large").setValue("999")), `<data value="999">Large</data>`); });
    it("Progress", () => { assert.strictEqual(render(Progress().setValue(70).setMax(100)), `<progress value="70" max="100"></progress>`); });
    it("Meter", () => {
        assert.strictEqual(render(Meter()
            .setValue(6)
            .setMin(0)
            .setMax(10)
            .setLow(3)
            .setHigh(7)
            .setOptimum(5)), `<meter value="6" min="0" max="10" low="3" high="7" optimum="5"></meter>`);
    });
});
// ------------------------------------
// Web Components
// ------------------------------------
describe("Web Components", () => {
    it("Slot default", () => { assert.strictEqual(render(Slot("Default content")), `<slot>Default content</slot>`); });
    it("Named slot", () => { assert.strictEqual(render(Slot().setName("header")), `<slot name="header"></slot>`); });
});
// ------------------------------------
// XSS Prevention
// ------------------------------------
describe("XSS Prevention", () => {
    it("Escapes < and >", () => { assert.strictEqual(render(Div("<script>alert('xss')</script>")), `<div>&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</div>`); });
    it("Escapes quotes", () => { assert.strictEqual(render(Div(`He said "hello" and 'goodbye'`)), `<div>He said &quot;hello&quot; and &#39;goodbye&#39;</div>`); });
    it("Escapes ampersand", () => { assert.strictEqual(render(Div("Tom & Jerry")), `<div>Tom &amp; Jerry</div>`); });
    it("Escapes in attributes", () => { assert.strictEqual(render(Div().addAttribute("data-value", `<script>"xss"</script>`)), `<div data-value="&lt;script&gt;&quot;xss&quot;&lt;/script&gt;"></div>`); });
    it("Escapes in class", () => { assert.strictEqual(render(Div().setClass(`"><script>alert(1)</script>`)), `<div class="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"></div>`); });
    it("Escapes in style", () => { assert.strictEqual(render(Div().setStyle(`color: red" onclick="alert(1)`)), `<div style="color: red&quot; onclick=&quot;alert(1)"></div>`); });
    it("Nested content escaped", () => { assert.strictEqual(render(Div([P("<b>bold</b>"), Span("&amp;")])), `<div><p>&lt;b&gt;bold&lt;/b&gt;</p>\n<span>&amp;amp;</span></div>`); });
    it("Script content NOT escaped", () => { assert.strictEqual(render(Script("if (x < 10 && y > 5) { return '<tag>'; }")), "<script>if (x < 10 && y > 5) { return '<tag>'; }</script>"); });
    it("Style content NOT escaped", () => { assert.strictEqual(render(Style(`.class > .child { content: "a & b"; }`)), `<style>.class > .child { content: "a & b"; }</style>`); });
});
// ------------------------------------
// HTMX - Basic
// ------------------------------------
describe("HTMX - Basic", () => {
    it("hx-get", () => { assert.strictEqual(render(Div().setHtmx(hx("/api/data"))), `<div hx-get="/api/data"></div>`); });
    it("hx-post", () => { assert.strictEqual(render(Button("Submit").setHtmx(hx("/api/submit", { method: "post" }))), `<button hx-post="/api/submit">Submit</button>`); });
    it("hx-put", () => { assert.strictEqual(render(Button("Update").setHtmx(hx("/api/update", { method: "put" }))), `<button hx-put="/api/update">Update</button>`); });
    it("hx-delete", () => { assert.strictEqual(render(Button("Delete").setHtmx(hx("/api/delete", { method: "delete" }))), `<button hx-delete="/api/delete">Delete</button>`); });
});
// ------------------------------------
// HTMX - Target and Swap
// ------------------------------------
describe("HTMX - Target and Swap", () => {
    it("hx-target with id", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/content", { target: "#result" }))), `<button hx-get="/content" hx-target="#result">Load</button>`); });
    it("hx-target with class", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/content", { target: ".container" }))), `<button hx-get="/content" hx-target=".container">Load</button>`); });
    it("hx-swap innerHTML", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "innerHTML" }))), `<div hx-get="/data" hx-swap="innerHTML"></div>`); });
    it("hx-swap outerHTML", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "outerHTML" }))), `<div hx-get="/data" hx-swap="outerHTML"></div>`); });
    it("hx-swap beforeend", () => { assert.strictEqual(render(Ul().setHtmx(hx("/items", { swap: "beforeend" }))), `<ul hx-get="/items" hx-swap="beforeend"></ul>`); });
    it("Combined target and swap", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/api", { target: "#main", swap: "innerHTML" }))), `<button hx-get="/api" hx-target="#main" hx-swap="innerHTML">Load</button>`); });
});
// ------------------------------------
// HTMX - Triggers
// ------------------------------------
describe("HTMX - Triggers", () => {
    it("hx-trigger click", () => { assert.strictEqual(render(Div().setHtmx(hx("/click", { trigger: "click" }))), `<div hx-get="/click" hx-trigger="click"></div>`); });
    it("hx-trigger load", () => { assert.strictEqual(render(Div().setHtmx(hx("/load", { trigger: "load" }))), `<div hx-get="/load" hx-trigger="load"></div>`); });
    it("hx-trigger revealed", () => { assert.strictEqual(render(Div().setHtmx(hx("/lazy", { trigger: "revealed" }))), `<div hx-get="/lazy" hx-trigger="revealed"></div>`); });
    it("hx-trigger with delay", () => { assert.strictEqual(render(Input().setHtmx(hx("/search", { trigger: "keyup delay:500ms" }))), `<input hx-get="/search" hx-trigger="keyup delay:500ms">`); });
    // it("hx-trigger with throttle", () => { assert.strictEqual(render(Div().setHtmx(hx("/scroll", { trigger: "scroll throttle:1s" }))), `<div hx-get="/scroll" hx-trigger="scroll throttle:1s"></div>`); });
    it("hx-trigger polling", () => { assert.strictEqual(render(Div().setHtmx(hx("/poll", { trigger: "every 5s" }))), `<div hx-get="/poll" hx-trigger="every 5s"></div>`); });
});
// ------------------------------------
// HTMX - URL Manipulation
// ------------------------------------
describe("HTMX - URL Manipulation", () => {
    it("hx-push-url", () => { assert.strictEqual(render(A("Page").setHtmx(hx("/page", { pushUrl: true }))), `<a hx-get="/page" hx-push-url="true">Page</a>`); });
    it("hx-replace-url", () => { assert.strictEqual(render(Button("Replace").setHtmx(hx("/new", { replaceUrl: true }))), `<button hx-get="/new" hx-replace-url="true">Replace</button>`); });
});
// ------------------------------------
// HTMX - Form Handling
// ------------------------------------
describe("HTMX - Form Handling", () => {
    it("hx-encoding multipart", () => { assert.strictEqual(render(Form().setHtmx(hx("/upload", { method: "post", encoding: "multipart/form-data" }))), `<form hx-post="/upload" hx-encoding="multipart/form-data"></form>`); });
    it("hx-validate", () => { assert.strictEqual(render(Form().setHtmx(hx("/submit", { method: "post", validate: true }))), `<form hx-post="/submit" hx-validate="true"></form>`); });
    it("hx-vals object", () => { assert.strictEqual(render(Button("Send").setHtmx(hx("/api", { vals: { key: "value", num: 42 } }))), `<button hx-get="/api" hx-vals="{&quot;key&quot;:&quot;value&quot;,&quot;num&quot;:42}">Send</button>`); });
    it("hx-include", () => { assert.strictEqual(render(Button("Submit").setHtmx(hx("/api", { method: "post", include: "#extra-field" }))), `<button hx-post="/api" hx-include="#extra-field">Submit</button>`); });
});
// ------------------------------------
// HTMX - Misc Attributes
// ------------------------------------
describe("HTMX - Misc Attributes", () => {
    it("hx-confirm", () => { assert.strictEqual(render(Button("Delete").setHtmx(hx("/delete", { method: "delete", confirm: "Are you sure?" }))), `<button hx-delete="/delete" hx-confirm="Are you sure?">Delete</button>`); });
    it("hx-indicator", () => { assert.strictEqual(render(Button("Load").setHtmx(hx("/slow", { indicator: "#spinner" }))), `<button hx-get="/slow" hx-indicator="#spinner">Load</button>`); });
    it("hx-headers", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Custom": "value" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Custom&quot;:&quot;value&quot;}"></div>`); });
    it("hx-select", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { select: "#content" }))), `<div hx-get="/page" hx-select="#content"></div>`); });
    it("hx-sync", () => { assert.strictEqual(render(Button("Click").setHtmx(hx("/api", { sync: "closest form:abort" }))), `<button hx-get="/api" hx-sync="closest form:abort">Click</button>`); });
});
// ------------------------------------
// HTMX - Morph & Short Swap Styles
// ------------------------------------
describe("HTMX - Morph & Short Swap Styles", () => {
    it("hx-swap outerMorph", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "outerMorph" }))), `<div hx-get="/data" hx-swap="outerMorph"></div>`); });
    it("hx-swap innerMorph", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "innerMorph" }))), `<div hx-get="/data" hx-swap="innerMorph"></div>`); });
    it("hx-swap before (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "before" }))), `<div hx-get="/data" hx-swap="before"></div>`); });
    it("hx-swap after (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "after" }))), `<div hx-get="/data" hx-swap="after"></div>`); });
    it("hx-swap prepend (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "prepend" }))), `<div hx-get="/data" hx-swap="prepend"></div>`); });
    it("hx-swap append (short)", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "append" }))), `<div hx-get="/data" hx-swap="append"></div>`); });
    it("hx-swap outerMorph with modifier", () => { assert.strictEqual(render(Div().setHtmx(hx("/data", { swap: "outerMorph transition:true" }))), `<div hx-get="/data" hx-swap="outerMorph transition:true"></div>`); });
});
// ------------------------------------
// HTMX - Config
// ------------------------------------
describe("HTMX - Config", () => {
    it("hx-config with object", () => { assert.strictEqual(render(Button("Upload").setHtmx(hx("/upload", { method: "post", config: { timeout: 0 } }))), `<button hx-post="/upload" hx-config="{&quot;timeout&quot;:0}">Upload</button>`); });
    it("hx-config with string", () => { assert.strictEqual(render(Button("Fetch").setHtmx(hx("/api", { config: '{"mode":"cors"}' }))), `<button hx-get="/api" hx-config="{&quot;mode&quot;:&quot;cors&quot;}">Fetch</button>`); });
    it("hx-config with full options", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { config: { timeout: 120000, credentials: true, mode: "cors" } }))), `<div hx-get="/api" hx-config="{&quot;timeout&quot;:120000,&quot;credentials&quot;:true,&quot;mode&quot;:&quot;cors&quot;}"></div>`); });
});
// ------------------------------------
// HTMX - Attribute Escaping (Security)
// ------------------------------------
describe("HTMX - Attribute Escaping", () => {
    it("hx-headers escapes double quotes in JSON", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Token": 'a"b' } }))), `<div hx-get="/api" hx-headers="{&quot;X-Token&quot;:&quot;a\\&quot;b&quot;}"></div>`); });
    it("hx-headers escapes single quotes", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Name": "O'Brien" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Name&quot;:&quot;O&#39;Brien&quot;}"></div>`); });
    it("hx-headers escapes angle brackets", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Data": "<script>alert(1)</script>" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Data&quot;:&quot;&lt;script&gt;alert(1)&lt;/script&gt;&quot;}"></div>`); });
    it("hx-headers escapes ampersand", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { headers: { "X-Q": "a&b" } }))), `<div hx-get="/api" hx-headers="{&quot;X-Q&quot;:&quot;a&amp;b&quot;}"></div>`); });
    it("hx-vals object escapes special chars", () => { assert.strictEqual(render(Button("Send").setHtmx(hx("/api", { vals: { name: "O'Brien & <Co>" } }))), `<button hx-get="/api" hx-vals="{&quot;name&quot;:&quot;O&#39;Brien &amp; &lt;Co&gt;&quot;}">Send</button>`); });
    it("hx-config object escapes special chars", () => { assert.strictEqual(render(Div().setHtmx(hx("/api", { config: { mode: "no-cors" } }))), `<div hx-get="/api" hx-config="{&quot;mode&quot;:&quot;no-cors&quot;}"></div>`); });
});
// ------------------------------------
// HTMX - Optimistic & Preload
// ------------------------------------
describe("HTMX - Optimistic & Preload", () => {
    it("hx-optimistic", () => { assert.strictEqual(render(Button("Like").setHtmx(hx("/like", { method: "post", optimistic: true }))), `<button hx-post="/like" hx-optimistic>Like</button>`); });
    it("hx-preload boolean", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { preload: true }))), `<div hx-get="/page" hx-preload></div>`); });
    it("hx-preload mouseover", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { preload: "mouseover" }))), `<div hx-get="/page" hx-preload="mouseover"></div>`); });
    it("hx-preload mousedown", () => { assert.strictEqual(render(Div().setHtmx(hx("/page", { preload: "mousedown" }))), `<div hx-get="/page" hx-preload="mousedown"></div>`); });
});
// ------------------------------------
// HTMX - Status Code Handling
// ------------------------------------
describe("HTMX - Status Code Handling", () => {
    it("hx-status with string config", () => { assert.strictEqual(render(Form().setHtmx(hx("/users", { method: "post", status: { "5xx": "swap:none" } }))), `<form hx-post="/users" hx-status:5xx="swap:none"></form>`); });
    it("hx-status with object config", () => {
        assert.strictEqual(render(Form().setHtmx(hx("/users", { method: "post", status: {
                422: { swap: "innerHTML", target: "#errors" },
            } }))), `<form hx-post="/users" hx-status:422="swap:innerHTML target:#errors"></form>`);
    });
    it("hx-status multiple codes", () => {
        assert.strictEqual(render(Form().setHtmx(hx("/users", { method: "post", status: {
                422: { swap: "innerHTML", target: "#errors" },
                "5xx": { swap: "none" },
            } }))), `<form hx-post="/users" hx-status:422="swap:innerHTML target:#errors" hx-status:5xx="swap:none"></form>`);
    });
    it("hx-status with transition", () => {
        assert.strictEqual(render(Div().setHtmx(hx("/page", { status: {
                200: { swap: "outerMorph", transition: true },
            } }))), `<div hx-get="/page" hx-status:200="swap:outerMorph transition:true"></div>`);
    });
});
// ------------------------------------
// HTMX - Complex Examples
// ------------------------------------
describe("HTMX - Complex Examples", () => {
    it("Full HTMX form", () => {
        assert.strictEqual(render(Form([
            Input().setType("text").setName("search").setPlaceholder("Search..."),
            Button("Search").setType("submit"),
        ]).setHtmx(hx("/search", {
            method: "post",
            target: "#results",
            swap: "innerHTML",
            trigger: "click",
            indicator: "#loading",
        }))), `<form hx-post="/search" hx-target="#results" hx-swap="innerHTML" hx-trigger="click" hx-indicator="#loading"><input type="text" name="search" placeholder="Search...">\n<button type="submit">Search</button></form>`);
    });
    it("Infinite scroll", () => {
        assert.strictEqual(render(Div()
            .setId("feed")
            .setHtmx(hx("/feed?page=2", {
            trigger: "revealed",
            swap: "beforeend",
        }))), `<div id="feed" hx-get="/feed?page=2" hx-swap="beforeend" hx-trigger="revealed"></div>`);
    });
    it("Live search", () => {
        assert.strictEqual(render(Input()
            .setType("search")
            .setName("q")
            .setPlaceholder("Search...")
            .setHtmx(hx("/search", {
            trigger: "keyup delay:300ms",
            target: "#results",
        }))), `<input type="search" name="q" placeholder="Search..." hx-get="/search" hx-target="#results" hx-trigger="keyup delay:300ms">`);
    });
});
// ------------------------------------
// HTMX Helper Functions
// ------------------------------------
describe("HTMX Helpers", () => {
    it("id() helper", () => { assert.strictEqual(id("my-id"), "#my-id"); });
    it("clss() helper", () => { assert.strictEqual(clss("my-class"), ".my-class"); });
});
// ------------------------------------
// setHtmx Overloads
// ------------------------------------
describe("setHtmx Overloads", () => {
    it("setHtmx with endpoint string", () => { assert.strictEqual(render(Div().setHtmx("/api/data")), `<div hx-get="/api/data"></div>`); });
    it("setHtmx with endpoint and options", () => { assert.strictEqual(render(Button("Go").setHtmx("/api/submit", { method: "post", target: "#result" })), `<button hx-post="/api/submit" hx-target="#result">Go</button>`); });
    it("setHtmx with endpoint and swap", () => { assert.strictEqual(render(Div().setHtmx("/api/data", { swap: "outerHTML" })), `<div hx-get="/api/data" hx-swap="outerHTML"></div>`); });
    it("setHtmx with pre-built HTMX object", () => { assert.strictEqual(render(Div().setHtmx(hx("/api/data", { method: "post" }))), `<div hx-post="/api/data"></div>`); });
});
// ------------------------------------
// hx Shorthand Methods
// ------------------------------------
describe("hx Shorthand Methods", () => {
    it("hxGet basic", () => { assert.strictEqual(render(Button("Load").hxGet("/api/items")), `<button hx-get="/api/items">Load</button>`); });
    it("hxGet with options", () => { assert.strictEqual(render(Button("Load").hxGet("/api/items", { target: "#list", swap: "innerHTML" })), `<button hx-get="/api/items" hx-target="#list" hx-swap="innerHTML">Load</button>`); });
    it("hxPost", () => { assert.strictEqual(render(Button("Save").hxPost("/api/save")), `<button hx-post="/api/save">Save</button>`); });
    it("hxPost with options", () => { assert.strictEqual(render(Button("Save").hxPost("/api/save", { target: "#result", trigger: "click" })), `<button hx-post="/api/save" hx-target="#result" hx-trigger="click">Save</button>`); });
    it("hxPut", () => { assert.strictEqual(render(Button("Update").hxPut("/api/update")), `<button hx-put="/api/update">Update</button>`); });
    it("hxPatch", () => { assert.strictEqual(render(Button("Patch").hxPatch("/api/patch")), `<button hx-patch="/api/patch">Patch</button>`); });
    it("hxDelete", () => { assert.strictEqual(render(Button("Remove").hxDelete("/api/item/1")), `<button hx-delete="/api/item/1">Remove</button>`); });
    it("hxDelete with confirm", () => { assert.strictEqual(render(Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" })), `<button hx-delete="/api/item/1" hx-confirm="Sure?">Remove</button>`); });
    it("hxGet chained with other methods", () => { assert.strictEqual(render(Div("Content").setId("box").hxGet("/api/refresh", { swap: "outerHTML" })), `<div id="box" hx-get="/api/refresh" hx-swap="outerHTML">Content</div>`); });
});
// ------------------------------------
// Control Flow - IfThen / IfThenElse
// ------------------------------------
describe("Control Flow - Conditionals", () => {
    it("IfThen true", () => { assert.strictEqual(render(IfThen(true, () => Span("Visible"))), `<span>Visible</span>`); });
    it("IfThen false", () => { assert.strictEqual(render(IfThen(false, () => Span("Hidden"))), ``); });
    it("IfThenElse true", () => { assert.strictEqual(render(IfThenElse(true, () => Span("Yes"), () => Span("No"))), `<span>Yes</span>`); });
    it("IfThenElse false", () => { assert.strictEqual(render(IfThenElse(false, () => Span("Yes"), () => Span("No"))), `<span>No</span>`); });
    it("Nested conditionals", () => {
        assert.strictEqual(render(IfThen(true, () => Div([
            IfThenElse(false, () => P("A"), () => P("B"))
        ]))), `<div><p>B</p></div>`);
    });
    // Nullable value overloads
    it("IfThen with non-null value", () => { assert.strictEqual(render(IfThen("hello", (val) => Span(val))), `<span>hello</span>`); });
    it("IfThen with null value", () => { assert.strictEqual(render(IfThen(null, (val) => Span(val))), ``); });
    it("IfThen with undefined value", () => { assert.strictEqual(render(IfThen(undefined, (val) => Span(val))), ``); });
    it("IfThenElse with non-null value", () => { assert.strictEqual(render(IfThenElse("world", (val) => Span(val), () => Span("fallback"))), `<span>world</span>`); });
    it("IfThenElse with null value", () => { assert.strictEqual(render(IfThenElse(null, (val) => Span(val), () => Span("fallback"))), `<span>fallback</span>`); });
    it("IfThenElse with undefined value", () => { assert.strictEqual(render(IfThenElse(undefined, (val) => Span(String(val)), () => Span("none"))), `<span>none</span>`); });
});
// ------------------------------------
// Control Flow - SwitchCase
// ------------------------------------
describe("Control Flow - SwitchCase", () => {
    it("SwitchCase first match", () => {
        assert.strictEqual(render(SwitchCase([
            { condition: true, component: () => Span("First") },
            { condition: true, component: () => Span("Second") },
        ])), `<span>First</span>`);
    });
    it("SwitchCase second match", () => {
        assert.strictEqual(render(SwitchCase([
            { condition: false, component: () => Span("First") },
            { condition: true, component: () => Span("Second") },
        ])), `<span>Second</span>`);
    });
    it("SwitchCase default", () => {
        assert.strictEqual(render(SwitchCase([
            { condition: false, component: () => Span("First") },
            { condition: false, component: () => Span("Second") },
        ], () => Span("Default"))), `<span>Default</span>`);
    });
    it("SwitchCase no match no default", () => {
        assert.strictEqual(render(SwitchCase([
            { condition: false, component: () => Span("First") },
        ])), ``);
    });
});
// ------------------------------------
// Control Flow - Match
// ------------------------------------
describe("Control Flow - Match", () => {
    it("Match first case", () => {
        assert.strictEqual(render(Match("a", {
            a: () => Span("Alpha"),
            b: () => Span("Beta"),
            c: () => Span("Gamma"),
        })), `<span>Alpha</span>`);
    });
    it("Match last case", () => {
        assert.strictEqual(render(Match("c", {
            a: () => Span("Alpha"),
            b: () => Span("Beta"),
            c: () => Span("Gamma"),
        })), `<span>Gamma</span>`);
    });
    it("Match partial with default (hit)", () => {
        assert.strictEqual(render(Match("x", {
            x: () => Span("Found"),
        }, () => Span("Default"))), `<span>Found</span>`);
    });
    it("Match partial with default (miss)", () => {
        assert.strictEqual(render(Match("z", {
            x: () => Span("Found"),
        }, () => Span("Default"))), `<span>Default</span>`);
    });
    // Discriminated union overload
    it("Match discriminated union — exhaustive", () => {
        const state = { status: "error", message: "Not found" };
        assert.strictEqual(render(Match(state, "status", {
            loading: () => Span("Loading..."),
            error: (s) => Span(s.message),
            success: (s) => Span(`Count: ${s.count}`),
        })), `<span>Not found</span>`);
    });
    it("Match discriminated union — narrowing provides correct type", () => {
        const result = { kind: "ok", value: 42 };
        assert.strictEqual(render(Match(result, "kind", {
            ok: (r) => Span(`Value: ${r.value}`),
            err: (r) => Span(`Error: ${r.reason}`),
        })), `<span>Value: 42</span>`);
    });
    it("Match discriminated union — partial with default (hit)", () => {
        const state = { status: "error", message: "Oops" };
        assert.strictEqual(render(Match(state, "status", {
            error: (s) => Span(s.message),
        }, () => Span("Fallback"))), `<span>Oops</span>`);
    });
    it("Match discriminated union — partial with default (miss)", () => {
        const state = { status: "loading" };
        assert.strictEqual(render(Match(state, "status", {
            error: (s) => Span(s.message),
        }, () => Span("Fallback"))), `<span>Fallback</span>`);
    });
});
// ------------------------------------
// Control Flow - ForEach
// ------------------------------------
describe("Control Flow - ForEach", () => {
    it("ForEach array", () => { assert.strictEqual(render(Ul(ForEach(["A", "B", "C"], item => Li(item)))), `<ul><li>A</li>\n<li>B</li>\n<li>C</li></ul>`); });
    it("ForEach empty", () => { assert.strictEqual(render(Ul(ForEach([], item => Li(item)))), `<ul></ul>`); });
    it("ForEach with index", () => { assert.strictEqual(render(Ul(ForEach(["A", "B", "C"], (item, idx) => Li(`${idx + 1}. ${item}`)))), `<ul><li>1. A</li>\n<li>2. B</li>\n<li>3. C</li></ul>`); });
    it("ForEach range", () => { assert.strictEqual(render(Ul(ForEach(3, idx => Li(`Item ${idx}`)))), `<ul><li>Item 0</li>\n<li>Item 1</li>\n<li>Item 2</li></ul>`); });
    it("ForEach range with start", () => { assert.strictEqual(render(Ul(ForEach(5, 8, idx => Li(`Item ${idx}`)))), `<ul><li>Item 5</li>\n<li>Item 6</li>\n<li>Item 7</li></ul>`); });
    it("Repeat", () => { assert.strictEqual(render(Div(Repeat(3, () => Span("*")))), `<div><span>*</span>\n<span>*</span>\n<span>*</span></div>`); });
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
//# sourceMappingURL=test.js.map