"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../src/index.js");
const htmx_js_1 = require("../src/htmx.js");
// ------------------------------------
// Test Runner
// ------------------------------------
let passCount = 0;
let failCount = 0;
function test(name, got, expected) {
    if (got === expected) {
        console.log(`✅ ${name}`);
        passCount++;
    }
    else {
        console.log(`❌ ${name}`);
        console.log(`   Expected: ${expected}`);
        console.log(`   Got:      ${got}`);
        failCount++;
    }
}
function testView(name, view, expected) {
    test(name, (0, index_js_1.render)(view), expected);
}
function section(name) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`${name}`);
    console.log("=".repeat(50));
}
// ------------------------------------
// Basic Elements
// ------------------------------------
section("Basic Elements");
testView("Empty()", (0, index_js_1.Empty)(), ``);
testView("Empty Div", (0, index_js_1.Div)(), `<div></div>`);
testView("Div with text", (0, index_js_1.Div)("Hello"), `<div>Hello</div>`);
testView("P with text", (0, index_js_1.P)("Paragraph text"), `<p>Paragraph text</p>`);
testView("Span with text", (0, index_js_1.Span)("inline"), `<span>inline</span>`);
testView("All heading levels", [(0, index_js_1.H1)("One"), (0, index_js_1.H2)("Two"), (0, index_js_1.H3)("Three"), (0, index_js_1.H4)("Four"), (0, index_js_1.H5)("Five"), (0, index_js_1.H6)("Six")], `<h1>One</h1>\n<h2>Two</h2>\n<h3>Three</h3>\n<h4>Four</h4>\n<h5>Five</h5>\n<h6>Six</h6>`);
testView("Br element", (0, index_js_1.Br)(), `<br>`);
testView("Hr element", (0, index_js_1.Hr)(), `<hr>`);
testView("Wbr element", (0, index_js_1.Wbr)(), `<wbr>`);
// ------------------------------------
// Semantic Elements
// ------------------------------------
section("Semantic Elements");
testView("Header", (0, index_js_1.Header)("Site header"), `<header>Site header</header>`);
testView("Footer", (0, index_js_1.Footer)("Site footer"), `<footer>Site footer</footer>`);
testView("Main", (0, index_js_1.Main)("Main content"), `<main>Main content</main>`);
testView("Nav", (0, index_js_1.Nav)("Navigation"), `<nav>Navigation</nav>`);
testView("Aside", (0, index_js_1.Aside)("Sidebar"), `<aside>Sidebar</aside>`);
testView("Section", (0, index_js_1.Section)("A section"), `<section>A section</section>`);
testView("Article", (0, index_js_1.Article)("An article"), `<article>An article</article>`);
testView("Figure with Figcaption", (0, index_js_1.Figure)([
    (0, index_js_1.Img)().setSrc("photo.jpg").setAlt("A photo"),
    (0, index_js_1.Figcaption)("Photo caption")
]), `<figure><img src="photo.jpg" alt="A photo">\n<figcaption>Photo caption</figcaption></figure>`);
testView("Address", (0, index_js_1.Address)("123 Main St"), `<address>123 Main St</address>`);
testView("Hgroup", (0, index_js_1.Hgroup)([(0, index_js_1.H1)("Title"), (0, index_js_1.P)("Subtitle")]), `<hgroup><h1>Title</h1>\n<p>Subtitle</p></hgroup>`);
testView("Search", (0, index_js_1.Search)((0, index_js_1.Input)().setType("search")), `<search><input type="search"></search>`);
// ------------------------------------
// Text Formatting Elements
// ------------------------------------
section("Text Formatting");
testView("Strong", (0, index_js_1.Strong)("bold"), `<strong>bold</strong>`);
testView("Em", (0, index_js_1.Em)("italic"), `<em>italic</em>`);
testView("B, I, U, S", [(0, index_js_1.B)("bold"), (0, index_js_1.I)("italic"), (0, index_js_1.U)("underline"), (0, index_js_1.S)("strikethrough")], `<b>bold</b>\n<i>italic</i>\n<u>underline</u>\n<s>strikethrough</s>`);
testView("Mark", (0, index_js_1.Mark)("highlighted"), `<mark>highlighted</mark>`);
testView("Small", (0, index_js_1.Small)("fine print"), `<small>fine print</small>`);
testView("Sub and Sup", (0, index_js_1.P)(["H", (0, index_js_1.Sub)("2"), "O and x", (0, index_js_1.Sup)("2")]), `<p>H\n<sub>2</sub>\nO and x\n<sup>2</sup></p>`);
testView("Abbr", (0, index_js_1.Abbr)("HTML").addAttribute("title", "HyperText Markup Language"), `<abbr title="HyperText Markup Language">HTML</abbr>`);
testView("Cite", (0, index_js_1.Cite)("The Great Gatsby"), `<cite>The Great Gatsby</cite>`);
testView("Q", (0, index_js_1.Q)("To be or not to be"), `<q>To be or not to be</q>`);
testView("Dfn", (0, index_js_1.Dfn)("term"), `<dfn>term</dfn>`);
testView("Kbd", (0, index_js_1.Kbd)("Ctrl+C"), `<kbd>Ctrl+C</kbd>`);
testView("Samp", (0, index_js_1.Samp)("output"), `<samp>output</samp>`);
testView("Blockquote", (0, index_js_1.Blockquote)("A famous quote"), `<blockquote>A famous quote</blockquote>`);
testView("Pre and Code", (0, index_js_1.Pre)((0, index_js_1.Code)("const x = 1;")), `<pre><code>const x = 1;</code></pre>`);
// ------------------------------------
// ID, Class, Style Attributes
// ------------------------------------
section("ID, Class, Style");
testView("Div with id", (0, index_js_1.Div)().setId("my-div"), `<div id="my-div"></div>`);
testView("Div with class", (0, index_js_1.Div)().setClass("container"), `<div class="container"></div>`);
testView("Div with id and class", (0, index_js_1.Div)().setId("main").setClass("container fluid"), `<div id="main" class="container fluid"></div>`);
testView("addClass on empty", (0, index_js_1.Div)().addClass("first"), `<div class="first"></div>`);
testView("addClass appends", (0, index_js_1.Div)().setClass("one").addClass("two").addClass("three"), `<div class="one two three"></div>`);
testView("setStyle", (0, index_js_1.Div)().setStyle("color: red; font-size: 16px"), `<div style="color: red; font-size: 16px"></div>`);
testView("Combined id, class, style", (0, index_js_1.Div)("Content")
    .setId("box")
    .setClass("card shadow")
    .setStyle("padding: 10px"), `<div id="box" class="card shadow" style="padding: 10px">Content</div>`);
// ------------------------------------
// Custom Attributes
// ------------------------------------
section("Custom Attributes");
testView("addAttribute single", (0, index_js_1.Div)().addAttribute("data-id", "123"), `<div data-id="123"></div>`);
testView("addAttribute multiple", (0, index_js_1.Div)()
    .addAttribute("data-id", "123")
    .addAttribute("data-name", "test")
    .addAttribute("aria-label", "Test div"), `<div data-id="123" data-name="test" aria-label="Test div"></div>`);
testView("El custom element", (0, index_js_1.El)("custom-element", "Content").setClass("my-class"), `<custom-element class="my-class">Content</custom-element>`);
// ------------------------------------
// Toggles (Boolean Attributes)
// ------------------------------------
section("Toggles (Boolean Attributes)");
testView("Single toggle", (0, index_js_1.Input)().setToggles(["required"]), `<input required>`);
testView("Multiple toggles", (0, index_js_1.Input)().setToggles(["required", "disabled", "readonly"]), `<input required disabled readonly>`);
testView("Toggle with other attributes", (0, index_js_1.Input)()
    .setType("text")
    .setName("email")
    .setToggles(["required"]), `<input type="text" name="email" required>`);
testView("toggle() single", (0, index_js_1.Input)().toggle("required"), `<input required>`);
testView("toggle() multiple chained", (0, index_js_1.Input)().toggle("required").toggle("disabled"), `<input required disabled>`);
testView("toggle() conditional true", (0, index_js_1.Input)().toggle("required", true), `<input required>`);
testView("toggle() conditional false", (0, index_js_1.Input)().toggle("required", false), `<input>`);
testView("toggle() mixed conditions", (0, index_js_1.Input)().toggle("required", true).toggle("disabled", false).toggle("readonly", true), `<input required readonly>`);
testView("toggle() with other attributes", (0, index_js_1.Input)()
    .setType("email")
    .setName("email")
    .toggle("required"), `<input type="email" name="email" required>`);
testView("toggle() combined with setToggles", (0, index_js_1.Input)().setToggles(["hidden"]).toggle("disabled"), `<input hidden disabled>`);
// ------------------------------------
// Lists
// ------------------------------------
section("Lists");
testView("Unordered list", (0, index_js_1.Ul)([
    (0, index_js_1.Li)("Item 1"),
    (0, index_js_1.Li)("Item 2"),
    (0, index_js_1.Li)("Item 3"),
]), `<ul><li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li></ul>`);
testView("Ordered list", (0, index_js_1.Ol)([
    (0, index_js_1.Li)("First"),
    (0, index_js_1.Li)("Second"),
]), `<ol><li>First</li>\n<li>Second</li></ol>`);
testView("Nested list", (0, index_js_1.Ul)([
    (0, index_js_1.Li)("Item 1"),
    (0, index_js_1.Li)([
        "Item 2",
        (0, index_js_1.Ul)([
            (0, index_js_1.Li)("Sub 1"),
            (0, index_js_1.Li)("Sub 2"),
        ])
    ]),
]), `<ul><li>Item 1</li>\n<li>Item 2\n<ul><li>Sub 1</li>\n<li>Sub 2</li></ul></li></ul>`);
testView("Definition list", (0, index_js_1.Dl)([
    (0, index_js_1.Dt)("Term 1"),
    (0, index_js_1.Dd)("Definition 1"),
    (0, index_js_1.Dt)("Term 2"),
    (0, index_js_1.Dd)("Definition 2"),
]), `<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dt>Term 2</dt>\n<dd>Definition 2</dd></dl>`);
testView("Menu", (0, index_js_1.Menu)([
    (0, index_js_1.Li)("Action 1"),
    (0, index_js_1.Li)("Action 2"),
]), `<menu><li>Action 1</li>\n<li>Action 2</li></menu>`);
// ------------------------------------
// Tables
// ------------------------------------
section("Tables");
testView("Simple table", (0, index_js_1.Table)([
    (0, index_js_1.Thead)((0, index_js_1.Tr)([(0, index_js_1.Th)("Name"), (0, index_js_1.Th)("Age")])),
    (0, index_js_1.Tbody)([
        (0, index_js_1.Tr)([(0, index_js_1.Td)("Alice"), (0, index_js_1.Td)("30")]),
        (0, index_js_1.Tr)([(0, index_js_1.Td)("Bob"), (0, index_js_1.Td)("25")]),
    ])
]), `<table><thead><tr><th>Name</th>\n<th>Age</th></tr></thead>\n<tbody><tr><td>Alice</td>\n<td>30</td></tr>\n<tr><td>Bob</td>\n<td>25</td></tr></tbody></table>`);
testView("Table with Tfoot", (0, index_js_1.Table)([
    (0, index_js_1.Thead)((0, index_js_1.Tr)([(0, index_js_1.Th)("Item"), (0, index_js_1.Th)("Price")])),
    (0, index_js_1.Tbody)((0, index_js_1.Tr)([(0, index_js_1.Td)("Widget"), (0, index_js_1.Td)("$10")])),
    (0, index_js_1.Tfoot)((0, index_js_1.Tr)([(0, index_js_1.Td)("Total"), (0, index_js_1.Td)("$10")])),
]), `<table><thead><tr><th>Item</th>\n<th>Price</th></tr></thead>\n<tbody><tr><td>Widget</td>\n<td>$10</td></tr></tbody>\n<tfoot><tr><td>Total</td>\n<td>$10</td></tr></tfoot></table>`);
testView("Table with Caption", (0, index_js_1.Table)([
    (0, index_js_1.Caption)("Sales Data"),
    (0, index_js_1.Tr)([(0, index_js_1.Th)("Q1"), (0, index_js_1.Th)("Q2")]),
]), `<table><caption>Sales Data</caption>\n<tr><th>Q1</th>\n<th>Q2</th></tr></table>`);
testView("Th with colspan", (0, index_js_1.Th)("Header").setColspan(2), `<th colspan="2">Header</th>`);
testView("Td with rowspan", (0, index_js_1.Td)("Cell").setRowspan(3), `<td rowspan="3">Cell</td>`);
testView("Th with scope", (0, index_js_1.Th)("Column").setScope("col"), `<th scope="col">Column</th>`);
testView("Colgroup and Col", (0, index_js_1.Table)([
    (0, index_js_1.Colgroup)([
        (0, index_js_1.Col)().setSpan(2).setClass("highlight"),
        (0, index_js_1.Col)(),
    ]),
    (0, index_js_1.Tr)([(0, index_js_1.Td)("A"), (0, index_js_1.Td)("B"), (0, index_js_1.Td)("C")]),
]), `<table><colgroup><col class="highlight" span="2">\n<col></colgroup>\n<tr><td>A</td>\n<td>B</td>\n<td>C</td></tr></table>`);
// ------------------------------------
// Forms - Input
// ------------------------------------
section("Forms - Input");
testView("Text input", (0, index_js_1.Input)().setType("text").setName("username").setPlaceholder("Enter username"), `<input type="text" name="username" placeholder="Enter username">`);
testView("Email input with validation", (0, index_js_1.Input)()
    .setAutocomplete("email")
    .setType("email")
    .setName("email")
    .setToggles(["required"]), `<input type="email" name="email" autocomplete="email" required>`);
testView("Number input with min/max/step", (0, index_js_1.Input)()
    .setType("number")
    .setName("quantity")
    .setMin(1)
    .setMax(100)
    .setStep(5), `<input type="number" name="quantity" min="1" max="100" step="5">`);
testView("Password input", (0, index_js_1.Input)()
    .setType("password")
    .setName("password")
    .setMinlength(8)
    .setMaxlength(64), `<input type="password" name="password" minlength="8" maxlength="64">`);
testView("Input with pattern", (0, index_js_1.Input)()
    .setType("text")
    .setName("zipcode")
    .setPattern("[0-9]{5}"), `<input type="text" name="zipcode" pattern="[0-9]{5}">`);
testView("Checkbox input", (0, index_js_1.Input)()
    .setType("checkbox")
    .setName("agree")
    .setValue("yes")
    .setChecked(), `<input type="checkbox" name="agree" value="yes" checked="true">`);
testView("Radio input", (0, index_js_1.Input)()
    .setType("radio")
    .setName("color")
    .setValue("red"), `<input type="radio" name="color" value="red">`);
testView("File input", (0, index_js_1.Input)()
    .setType("file")
    .setName("document")
    .setAccept(".pdf,.doc")
    .setMultiple(), `<input type="file" name="document" accept=".pdf,.doc" multiple="true">`);
testView("Disabled input", (0, index_js_1.Input)()
    .setType("text")
    .setName("locked")
    .setValue("Cannot edit")
    .setDisabled(), `<input type="text" name="locked" value="Cannot edit" disabled="true">`);
testView("Readonly input", (0, index_js_1.Input)()
    .setType("text")
    .setName("readonly")
    .setValue("Read only")
    .setReadonly(), `<input type="text" name="readonly" value="Read only" readonly="true">`);
testView("Input with datalist", [
    (0, index_js_1.Input)().setType("text").setName("browser").setList("browsers"),
    (0, index_js_1.Datalist)([
        (0, index_js_1.Option)("Chrome").setValue("chrome"),
        (0, index_js_1.Option)("Firefox").setValue("firefox"),
    ]).setId("browsers"),
], `<input type="text" name="browser" list="browsers">\n<datalist id="browsers"><option value="chrome">Chrome</option>\n<option value="firefox">Firefox</option></datalist>`);
// ------------------------------------
// Forms - Textarea
// ------------------------------------
section("Forms - Textarea");
testView("Basic textarea", (0, index_js_1.Textarea)().setName("message").setPlaceholder("Enter message"), `<textarea name="message" placeholder="Enter message"></textarea>`);
testView("Textarea with rows/cols", (0, index_js_1.Textarea)()
    .setName("bio")
    .setRows(5)
    .setCols(40), `<textarea name="bio" rows="5" cols="40"></textarea>`);
testView("Textarea with content", (0, index_js_1.Textarea)("Default text").setName("notes"), `<textarea name="notes">Default text</textarea>`);
testView("Textarea with validation", (0, index_js_1.Textarea)()
    .setName("essay")
    .setMinlength(100)
    .setMaxlength(5000)
    .setWrap("soft"), `<textarea name="essay" minlength="100" maxlength="5000" wrap="soft"></textarea>`);
// ------------------------------------
// Forms - Button
// ------------------------------------
section("Forms - Button");
testView("Submit button", (0, index_js_1.Button)("Submit").setType("submit"), `<button type="submit">Submit</button>`);
testView("Reset button", (0, index_js_1.Button)("Reset").setType("reset"), `<button type="reset">Reset</button>`);
testView("Button with name/value", (0, index_js_1.Button)("Save")
    .setType("submit")
    .setName("action")
    .setValue("save"), `<button type="submit" name="action" value="save">Save</button>`);
testView("Disabled button", (0, index_js_1.Button)("Disabled").setDisabled(), `<button disabled="true">Disabled</button>`);
testView("Button with formaction", (0, index_js_1.Button)("Delete")
    .setType("submit")
    .setFormaction("/delete")
    .setFormmethod("post"), `<button type="submit" formaction="/delete" formmethod="post">Delete</button>`);
// ------------------------------------
// Forms - Select
// ------------------------------------
section("Forms - Select");
testView("Basic select", (0, index_js_1.Select)([
    (0, index_js_1.Option)("Choose...").setValue(""),
    (0, index_js_1.Option)("Option 1").setValue("1"),
    (0, index_js_1.Option)("Option 2").setValue("2"),
]).setName("choice"), `<select name="choice"><option value="">Choose...</option>\n<option value="1">Option 1</option>\n<option value="2">Option 2</option></select>`);
testView("Select with selected option", (0, index_js_1.Select)([
    (0, index_js_1.Option)("A").setValue("a"),
    (0, index_js_1.Option)("B").setValue("b").setSelected(),
    (0, index_js_1.Option)("C").setValue("c"),
]).setName("letter"), `<select name="letter"><option value="a">A</option>\n<option value="b" selected="true">B</option>\n<option value="c">C</option></select>`);
testView("Select with optgroup", (0, index_js_1.Select)([
    (0, index_js_1.Optgroup)([
        (0, index_js_1.Option)("Volvo").setValue("volvo"),
        (0, index_js_1.Option)("Saab").setValue("saab"),
    ]).setLabel("Swedish Cars"),
    (0, index_js_1.Optgroup)([
        (0, index_js_1.Option)("Mercedes").setValue("mercedes"),
        (0, index_js_1.Option)("Audi").setValue("audi"),
    ]).setLabel("German Cars"),
]).setName("car"), `<select name="car"><optgroup label="Swedish Cars"><option value="volvo">Volvo</option>\n<option value="saab">Saab</option></optgroup>\n<optgroup label="German Cars"><option value="mercedes">Mercedes</option>\n<option value="audi">Audi</option></optgroup></select>`);
testView("Multiple select", (0, index_js_1.Select)([
    (0, index_js_1.Option)("Red").setValue("red"),
    (0, index_js_1.Option)("Green").setValue("green"),
    (0, index_js_1.Option)("Blue").setValue("blue"),
]).setName("colors").setMultiple().setSize(3), `<select name="colors" multiple="true" size="3"><option value="red">Red</option>\n<option value="green">Green</option>\n<option value="blue">Blue</option></select>`);
// ------------------------------------
// Forms - Label, Fieldset, Form
// ------------------------------------
section("Forms - Label, Fieldset, Form");
testView("Label with for", (0, index_js_1.Label)("Username").setFor("username"), `<label for="username">Username</label>`);
testView("Fieldset with Legend", (0, index_js_1.Fieldset)([
    (0, index_js_1.Legend)("Personal Info"),
    (0, index_js_1.Label)("Name").setFor("name"),
    (0, index_js_1.Input)().setType("text").setName("name").setId("name"),
]).setName("personal"), `<fieldset name="personal"><legend>Personal Info</legend>\n<label for="name">Name</label>\n<input id="name" type="text" name="name"></fieldset>`);
testView("Disabled fieldset", (0, index_js_1.Fieldset)([
    (0, index_js_1.Legend)("Disabled Section"),
    (0, index_js_1.Input)().setType("text"),
]).setDisabled(), `<fieldset disabled="true"><legend>Disabled Section</legend>\n<input type="text"></fieldset>`);
testView("Form with method and action", (0, index_js_1.Form)([
    (0, index_js_1.Input)().setType("text").setName("q"),
    (0, index_js_1.Button)("Search").setType("submit"),
]).setAction("/search").setMethod("get"), `<form action="/search" method="get"><input type="text" name="q">\n<button type="submit">Search</button></form>`);
testView("Form with enctype", (0, index_js_1.Form)([
    (0, index_js_1.Input)().setType("file").setName("upload"),
]).setAction("/upload").setMethod("post").setEnctype("multipart/form-data"), `<form action="/upload" method="post" enctype="multipart/form-data"><input type="file" name="upload"></form>`);
testView("Form with novalidate", (0, index_js_1.Form)([
    (0, index_js_1.Input)().setType("email").setName("email"),
]).setNovalidate(), `<form novalidate="true"><input type="email" name="email"></form>`);
testView("Output element", (0, index_js_1.Output)("100").setFor("a b").setName("result"), `<output for="a b" name="result">100</output>`);
// ------------------------------------
// Interactive Elements
// ------------------------------------
section("Interactive Elements");
testView("Details/Summary closed", (0, index_js_1.Details)([
    (0, index_js_1.Summary)("Click to expand"),
    (0, index_js_1.P)("Hidden content"),
]), `<details><summary>Click to expand</summary>\n<p>Hidden content</p></details>`);
testView("Details open", (0, index_js_1.Details)([
    (0, index_js_1.Summary)("Expanded"),
    (0, index_js_1.P)("Visible content"),
]).setOpen(), `<details open="true"><summary>Expanded</summary>\n<p>Visible content</p></details>`);
testView("Details with name (accordion)", (0, index_js_1.Details)([
    (0, index_js_1.Summary)("Section 1"),
    (0, index_js_1.P)("Content 1"),
]).setName("accordion"), `<details name="accordion"><summary>Section 1</summary>\n<p>Content 1</p></details>`);
testView("Dialog closed", (0, index_js_1.Dialog)([
    (0, index_js_1.H2)("Dialog Title"),
    (0, index_js_1.P)("Dialog content"),
    (0, index_js_1.Button)("Close"),
]), `<dialog><h2>Dialog Title</h2>\n<p>Dialog content</p>\n<button>Close</button></dialog>`);
testView("Dialog open", (0, index_js_1.Dialog)("Open dialog").setOpen(), `<dialog open="true">Open dialog</dialog>`);
// ------------------------------------
// Links
// ------------------------------------
section("Links");
testView("Basic anchor", (0, index_js_1.A)("Click here").setHref("https://example.com"), `<a href="https://example.com">Click here</a>`);
testView("Anchor with target", (0, index_js_1.A)("External").setHref("https://example.com").setTarget("_blank"), `<a href="https://example.com" target="_blank">External</a>`);
testView("Anchor with rel", (0, index_js_1.A)("Nofollow").setHref("/page").setRel("nofollow noopener"), `<a href="/page" rel="nofollow noopener">Nofollow</a>`);
testView("Download link", (0, index_js_1.A)("Download PDF").setHref("/file.pdf").setDownload("document.pdf"), `<a href="/file.pdf" download="document.pdf">Download PDF</a>`);
testView("Email link", (0, index_js_1.A)("Contact us").setHref("mailto:info@example.com"), `<a href="mailto:info@example.com">Contact us</a>`);
// ------------------------------------
// Media Elements
// ------------------------------------
section("Media Elements");
testView("Basic image", (0, index_js_1.Img)().setSrc("photo.jpg").setAlt("A photo"), `<img src="photo.jpg" alt="A photo">`);
testView("Image with dimensions", (0, index_js_1.Img)().setSrc("photo.jpg").setAlt("Photo").setWidth("640").setHeight("480"), `<img src="photo.jpg" alt="Photo" width="640" height="480">`);
testView("Lazy loaded image", (0, index_js_1.Img)().setSrc("photo.jpg").setAlt("Lazy").setLoading("lazy"), `<img src="photo.jpg" alt="Lazy" loading="lazy">`);
testView("Image with srcset", (0, index_js_1.Img)()
    .setSrc("small.jpg")
    .setAlt("Responsive")
    .setSrcset("small.jpg 480w, medium.jpg 800w, large.jpg 1200w")
    .setSizes("(max-width: 600px) 480px, 800px"), `<img src="small.jpg" alt="Responsive" srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 480px, 800px">`);
testView("Picture element", (0, index_js_1.Picture)([
    (0, index_js_1.Source)().setSrcset("large.webp").setMedia("(min-width: 800px)").setType("image/webp"),
    (0, index_js_1.Source)().setSrcset("small.webp").setType("image/webp"),
    (0, index_js_1.Img)().setSrc("fallback.jpg").setAlt("Picture"),
]), `<picture><source srcset="large.webp" media="(min-width: 800px)" type="image/webp">\n<source srcset="small.webp" type="image/webp">\n<img src="fallback.jpg" alt="Picture"></picture>`);
testView("Video with controls", (0, index_js_1.Video)().setSrc("video.mp4").setControls().setWidth(640).setHeight(360), `<video src="video.mp4" controls="true" width="640" height="360"></video>`);
testView("Video with multiple sources", (0, index_js_1.Video)([
    (0, index_js_1.Source)().setSrc("video.webm").setType("video/webm"),
    (0, index_js_1.Source)().setSrc("video.mp4").setType("video/mp4"),
    "Your browser does not support video.",
]).setControls(), `<video controls="true"><source src="video.webm" type="video/webm">\n<source src="video.mp4" type="video/mp4">\nYour browser does not support video.</video>`);
testView("Video with all options", (0, index_js_1.Video)()
    .setSrc("video.mp4")
    .setControls()
    .setAutoplay()
    .setLoop()
    .setMuted()
    .setPoster("poster.jpg")
    .setPreload("metadata")
    .setPlaysinline(), `<video src="video.mp4" controls="true" autoplay="true" loop="true" muted="true" poster="poster.jpg" preload="metadata" playsinline="true"></video>`);
testView("Audio", (0, index_js_1.Audio)().setSrc("audio.mp3").setControls(), `<audio src="audio.mp3" controls="true"></audio>`);
testView("Audio with preload", (0, index_js_1.Audio)()
    .setSrc("audio.mp3")
    .setControls()
    .setPreload("none"), `<audio src="audio.mp3" controls="true" preload="none"></audio>`);
testView("Video with Track", (0, index_js_1.Video)([
    (0, index_js_1.Source)().setSrc("video.mp4").setType("video/mp4"),
    (0, index_js_1.Track)()
        .setSrc("captions.vtt")
        .setKind("subtitles")
        .setSrclang("en")
        .setLabel("English")
        .setDefault(),
]).setControls(), `<video controls="true"><source src="video.mp4" type="video/mp4">\n<track src="captions.vtt" kind="subtitles" srclang="en" label="English" default="true"></video>`);
testView("Canvas", (0, index_js_1.Canvas)().setWidth(800).setHeight(600).setId("myCanvas"), `<canvas id="myCanvas" width="800" height="600"></canvas>`);
// ------------------------------------
// SVG
// ------------------------------------
section("SVG");
testView("Basic SVG", (0, index_js_1.Svg)([
    (0, index_js_1.Circle)().addAttribute("cx", "50").addAttribute("cy", "50").addAttribute("r", "40").addAttribute("fill", "red"),
]).setWidth("100").setHeight("100").setViewBox("0 0 100 100"), `<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"></circle></svg>`);
testView("SVG with path", (0, index_js_1.Svg)([
    (0, index_js_1.Path)().addAttribute("d", "M10 10 H 90 V 90 H 10 Z").addAttribute("fill", "none").addAttribute("stroke", "black"),
]).setViewBox("0 0 100 100"), `<svg viewBox="0 0 100 100"><path d="M10 10 H 90 V 90 H 10 Z" fill="none" stroke="black"></path></svg>`);
testView("SVG with group", (0, index_js_1.Svg)([
    (0, index_js_1.G)([
        (0, index_js_1.Rect)().addAttribute("width", "50").addAttribute("height", "50"),
        (0, index_js_1.Line)().addAttribute("x1", "0").addAttribute("y1", "0").addAttribute("x2", "50").addAttribute("y2", "50"),
    ]).addAttribute("transform", "translate(10, 10)"),
]).setViewBox("0 0 100 100"), `<svg viewBox="0 0 100 100"><g transform="translate(10, 10)"><rect width="50" height="50"></rect>\n<line x1="0" y1="0" x2="50" y2="50"></line></g></svg>`);
// ------------------------------------
// Embedded Content
// ------------------------------------
section("Embedded Content");
testView("Iframe basic", (0, index_js_1.Iframe)().setSrc("https://example.com").setWidth("600").setHeight("400"), `<iframe src="https://example.com" width="600" height="400"></iframe>`);
testView("Iframe with sandbox", (0, index_js_1.Iframe)()
    .setSrc("https://example.com")
    .setSandbox("allow-scripts allow-same-origin")
    .setLoading("lazy"), `<iframe src="https://example.com" sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>`);
testView("Iframe with allow", (0, index_js_1.Iframe)()
    .setSrc("https://youtube.com/embed/xyz")
    .setAllow("accelerometer; autoplay; clipboard-write")
    .setAllowfullscreen(), `<iframe src="https://youtube.com/embed/xyz" allow="accelerometer; autoplay; clipboard-write" allowfullscreen="true"></iframe>`);
testView("Embed", (0, index_js_1.Embed)().setSrc("game.swf").setType("application/x-shockwave-flash").setWidth("400").setHeight("300"), `<embed src="game.swf" type="application/x-shockwave-flash" width="400" height="300">`);
// ------------------------------------
// Document Structure
// ------------------------------------
section("Document Structure");
testView("HTML element", (0, index_js_1.HTML)([
    (0, index_js_1.Head)((0, index_js_1.Title)("Page Title")),
    (0, index_js_1.Body)((0, index_js_1.P)("Content")),
]), `<html><head><title>Page Title</title></head>\n<body><p>Content</p></body></html>`);
testView("Meta charset", (0, index_js_1.Meta)().setCharset("UTF-8"), `<meta charset="UTF-8">`);
testView("Meta viewport", (0, index_js_1.Meta)().setName("viewport").setContent("width=device-width, initial-scale=1"), `<meta name="viewport" content="width=device-width, initial-scale=1">`);
testView("Meta og:title", (0, index_js_1.Meta)().setProperty("og:title").setContent("My Page"), `<meta property="og:title" content="My Page">`);
testView("Link stylesheet", (0, index_js_1.Link)().setRel("stylesheet").setHref("styles.css"), `<link rel="stylesheet" href="styles.css">`);
testView("Link favicon", (0, index_js_1.Link)().setRel("icon").setHref("favicon.ico").setType("image/x-icon"), `<link rel="icon" href="favicon.ico" type="image/x-icon">`);
testView("Link preload", (0, index_js_1.Link)().setRel("preload").setHref("font.woff2").setAs("font").setCrossorigin("anonymous"), `<link rel="preload" href="font.woff2" as="font" crossorigin="anonymous">`);
testView("Base", (0, index_js_1.Base)().setHref("https://example.com/").setTarget("_blank"), `<base href="https://example.com/" target="_blank">`);
testView("Noscript", (0, index_js_1.Noscript)((0, index_js_1.P)("JavaScript is required")), `<noscript><p>JavaScript is required</p></noscript>`);
testView("Template", (0, index_js_1.Template)((0, index_js_1.Div)("Template content")), `<template><div>Template content</div></template>`);
// ------------------------------------
// Script and Style (Raw Content)
// ------------------------------------
section("Script and Style (Raw Content)");
testView("Script inline", (0, index_js_1.Script)(`console.log("Hello");`), `<script>console.log("Hello");</script>`);
testView("Script with special chars (not escaped)", (0, index_js_1.Script)("if (a < b && c > d) { alert('<test>'); }"), "<script>if (a < b && c > d) { alert('<test>'); }</script>");
testView("Script external", (0, index_js_1.Script)().setSrc("app.js").setDefer(), `<script src="app.js" defer="true"></script>`);
testView("Script module", (0, index_js_1.Script)().setSrc("module.js").setType("module"), `<script src="module.js" type="module"></script>`);
testView("Script with integrity", (0, index_js_1.Script)()
    .setSrc("https://cdn.example.com/lib.js")
    .setIntegrity("sha384-abc123")
    .setCrossorigin("anonymous"), `<script src="https://cdn.example.com/lib.js" integrity="sha384-abc123" crossorigin="anonymous"></script>`);
testView("Style inline", (0, index_js_1.Style)(`.red { color: red; }`), `<style>.red { color: red; }</style>`);
testView("Style with special chars (not escaped)", (0, index_js_1.Style)(`body > div { content: '<test>'; }`), `<style>body > div { content: '<test>'; }</style>`);
// ------------------------------------
// Data and Time Elements
// ------------------------------------
section("Data and Time Elements");
testView("Time with datetime", (0, index_js_1.Time)("December 25, 2024").setDatetime("2024-12-25"), `<time datetime="2024-12-25">December 25, 2024</time>`);
testView("Data with value", (0, index_js_1.Data)("Large").setValue("999"), `<data value="999">Large</data>`);
testView("Progress", (0, index_js_1.Progress)().setValue(70).setMax(100), `<progress value="70" max="100"></progress>`);
testView("Meter", (0, index_js_1.Meter)()
    .setValue(6)
    .setMin(0)
    .setMax(10)
    .setLow(3)
    .setHigh(7)
    .setOptimum(5), `<meter value="6" min="0" max="10" low="3" high="7" optimum="5"></meter>`);
// ------------------------------------
// Web Components
// ------------------------------------
section("Web Components");
testView("Slot default", (0, index_js_1.Slot)("Default content"), `<slot>Default content</slot>`);
testView("Named slot", (0, index_js_1.Slot)().setName("header"), `<slot name="header"></slot>`);
// ------------------------------------
// XSS Prevention
// ------------------------------------
section("XSS Prevention");
testView("Escapes < and >", (0, index_js_1.Div)("<script>alert('xss')</script>"), `<div>&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</div>`);
testView("Escapes quotes", (0, index_js_1.Div)(`He said "hello" and 'goodbye'`), `<div>He said &quot;hello&quot; and &#39;goodbye&#39;</div>`);
testView("Escapes ampersand", (0, index_js_1.Div)("Tom & Jerry"), `<div>Tom &amp; Jerry</div>`);
testView("Escapes in attributes", (0, index_js_1.Div)().addAttribute("data-value", `<script>"xss"</script>`), `<div data-value="&lt;script&gt;&quot;xss&quot;&lt;/script&gt;"></div>`);
testView("Escapes in class", (0, index_js_1.Div)().setClass(`"><script>alert(1)</script>`), `<div class="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"></div>`);
testView("Escapes in style", (0, index_js_1.Div)().setStyle(`color: red" onclick="alert(1)`), `<div style="color: red&quot; onclick=&quot;alert(1)"></div>`);
testView("Nested content escaped", (0, index_js_1.Div)([(0, index_js_1.P)("<b>bold</b>"), (0, index_js_1.Span)("&amp;")]), `<div><p>&lt;b&gt;bold&lt;/b&gt;</p>\n<span>&amp;amp;</span></div>`);
testView("Script content NOT escaped", (0, index_js_1.Script)("if (x < 10 && y > 5) { return '<tag>'; }"), "<script>if (x < 10 && y > 5) { return '<tag>'; }</script>");
testView("Style content NOT escaped", (0, index_js_1.Style)(`.class > .child { content: "a & b"; }`), `<style>.class > .child { content: "a & b"; }</style>`);
// ------------------------------------
// HTMX - Basic
// ------------------------------------
section("HTMX - Basic");
testView("hx-get", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/api/data")), `<div hx-get="/api/data"></div>`);
testView("hx-post", (0, index_js_1.Button)("Submit").setHtmx((0, htmx_js_1.hx)("/api/submit", { method: "post" })), `<button hx-post="/api/submit">Submit</button>`);
testView("hx-put", (0, index_js_1.Button)("Update").setHtmx((0, htmx_js_1.hx)("/api/update", { method: "put" })), `<button hx-put="/api/update">Update</button>`);
testView("hx-delete", (0, index_js_1.Button)("Delete").setHtmx((0, htmx_js_1.hx)("/api/delete", { method: "delete" })), `<button hx-delete="/api/delete">Delete</button>`);
// ------------------------------------
// HTMX - Target and Swap
// ------------------------------------
section("HTMX - Target and Swap");
testView("hx-target with id", (0, index_js_1.Button)("Load").setHtmx((0, htmx_js_1.hx)("/content", { target: "#result" })), `<button hx-get="/content" hx-target="#result">Load</button>`);
testView("hx-target with class", (0, index_js_1.Button)("Load").setHtmx((0, htmx_js_1.hx)("/content", { target: ".container" })), `<button hx-get="/content" hx-target=".container">Load</button>`);
testView("hx-swap innerHTML", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/data", { swap: "innerHTML" })), `<div hx-get="/data" hx-swap="innerHTML"></div>`);
testView("hx-swap outerHTML", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/data", { swap: "outerHTML" })), `<div hx-get="/data" hx-swap="outerHTML"></div>`);
testView("hx-swap beforeend", (0, index_js_1.Ul)().setHtmx((0, htmx_js_1.hx)("/items", { swap: "beforeend" })), `<ul hx-get="/items" hx-swap="beforeend"></ul>`);
testView("Combined target and swap", (0, index_js_1.Button)("Load").setHtmx((0, htmx_js_1.hx)("/api", { target: "#main", swap: "innerHTML" })), `<button hx-get="/api" hx-target="#main" hx-swap="innerHTML">Load</button>`);
// ------------------------------------
// HTMX - Triggers
// ------------------------------------
section("HTMX - Triggers");
testView("hx-trigger click", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/click", { trigger: "click" })), `<div hx-get="/click" hx-trigger="click"></div>`);
testView("hx-trigger load", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/load", { trigger: "load" })), `<div hx-get="/load" hx-trigger="load"></div>`);
testView("hx-trigger revealed", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/lazy", { trigger: "revealed" })), `<div hx-get="/lazy" hx-trigger="revealed"></div>`);
testView("hx-trigger with delay", (0, index_js_1.Input)().setHtmx((0, htmx_js_1.hx)("/search", { trigger: "keyup delay:500ms" })), `<input hx-get="/search" hx-trigger="keyup delay:500ms">`);
// testView("hx-trigger with throttle",
//   Div().setHtmx(hx("/scroll", { trigger: "scroll throttle:1s" })),
//   `<div hx-get="/scroll" hx-trigger="scroll throttle:1s"></div>`);
testView("hx-trigger polling", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/poll", { trigger: "every 5s" })), `<div hx-get="/poll" hx-trigger="every 5s"></div>`);
// ------------------------------------
// HTMX - URL Manipulation
// ------------------------------------
section("HTMX - URL Manipulation");
testView("hx-push-url", (0, index_js_1.A)("Page").setHtmx((0, htmx_js_1.hx)("/page", { pushUrl: true })), `<a hx-get="/page" hx-push-url="true">Page</a>`);
testView("hx-replace-url", (0, index_js_1.Button)("Replace").setHtmx((0, htmx_js_1.hx)("/new", { replaceUrl: true })), `<button hx-get="/new" hx-replace-url="true">Replace</button>`);
// ------------------------------------
// HTMX - Form Handling
// ------------------------------------
section("HTMX - Form Handling");
testView("hx-encoding multipart", (0, index_js_1.Form)().setHtmx((0, htmx_js_1.hx)("/upload", { method: "post", encoding: "multipart/form-data" })), `<form hx-post="/upload" hx-encoding="multipart/form-data"></form>`);
testView("hx-validate", (0, index_js_1.Form)().setHtmx((0, htmx_js_1.hx)("/submit", { method: "post", validate: true })), `<form hx-post="/submit" hx-validate="true"></form>`);
testView("hx-vals object", (0, index_js_1.Button)("Send").setHtmx((0, htmx_js_1.hx)("/api", { vals: { key: "value", num: 42 } })), `<button hx-get="/api" hx-vals='{"key":"value","num":42}'>Send</button>`);
testView("hx-include", (0, index_js_1.Button)("Submit").setHtmx((0, htmx_js_1.hx)("/api", { method: "post", include: "#extra-field" })), `<button hx-post="/api" hx-include="#extra-field">Submit</button>`);
testView("hx-params", (0, index_js_1.Button)("Submit").setHtmx((0, htmx_js_1.hx)("/api", { method: "post", params: "*" })), `<button hx-post="/api" hx-params="*">Submit</button>`);
// ------------------------------------
// HTMX - Misc Attributes
// ------------------------------------
section("HTMX - Misc Attributes");
testView("hx-confirm", (0, index_js_1.Button)("Delete").setHtmx((0, htmx_js_1.hx)("/delete", { method: "delete", confirm: "Are you sure?" })), `<button hx-delete="/delete" hx-confirm="Are you sure?">Delete</button>`);
testView("hx-indicator", (0, index_js_1.Button)("Load").setHtmx((0, htmx_js_1.hx)("/slow", { indicator: "#spinner" })), `<button hx-get="/slow" hx-indicator="#spinner">Load</button>`);
testView("hx-ext", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/data", { ext: "json-enc" })), `<div hx-get="/data" hx-ext="json-enc"></div>`);
testView("hx-headers", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/api", { headers: { "X-Custom": "value" } })), `<div hx-get="/api" hx-headers='{"X-Custom":"value"}'></div>`);
testView("hx-select", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/page", { select: "#content" })), `<div hx-get="/page" hx-select="#content"></div>`);
testView("hx-select-oob", (0, index_js_1.Div)().setHtmx((0, htmx_js_1.hx)("/page", { selectOob: "#sidebar" })), `<div hx-get="/page" hx-select-oob="#sidebar"></div>`);
testView("hx-sync", (0, index_js_1.Button)("Click").setHtmx((0, htmx_js_1.hx)("/api", { sync: "closest form:abort" })), `<button hx-get="/api" hx-sync="closest form:abort">Click</button>`);
// ------------------------------------
// HTMX - Complex Examples
// ------------------------------------
section("HTMX - Complex Examples");
testView("Full HTMX form", (0, index_js_1.Form)([
    (0, index_js_1.Input)().setType("text").setName("search").setPlaceholder("Search..."),
    (0, index_js_1.Button)("Search").setType("submit"),
]).setHtmx((0, htmx_js_1.hx)("/search", {
    method: "post",
    target: "#results",
    swap: "innerHTML",
    trigger: "click",
    indicator: "#loading",
})), `<form hx-post="/search" hx-target="#results" hx-swap="innerHTML" hx-trigger="click" hx-indicator="#loading"><input type="text" name="search" placeholder="Search...">\n<button type="submit">Search</button></form>`);
testView("Infinite scroll", (0, index_js_1.Div)()
    .setId("feed")
    .setHtmx((0, htmx_js_1.hx)("/feed?page=2", {
    trigger: "revealed",
    swap: "beforeend",
})), `<div id="feed" hx-get="/feed?page=2" hx-swap="beforeend" hx-trigger="revealed"></div>`);
testView("Live search", (0, index_js_1.Input)()
    .setType("search")
    .setName("q")
    .setPlaceholder("Search...")
    .setHtmx((0, htmx_js_1.hx)("/search", {
    trigger: "keyup delay:300ms",
    target: "#results",
})), `<input type="search" name="q" placeholder="Search..." hx-get="/search" hx-target="#results" hx-trigger="keyup delay:300ms">`);
// ------------------------------------
// HTMX Helper Functions
// ------------------------------------
section("HTMX Helpers");
test("id() helper", (0, htmx_js_1.id)("my-id"), "#my-id");
test("clss() helper", (0, htmx_js_1.clss)("my-class"), ".my-class");
// ------------------------------------
// Control Flow - IfThen / IfThenElse
// ------------------------------------
section("Control Flow - Conditionals");
testView("IfThen true", (0, index_js_1.IfThen)(true, () => (0, index_js_1.Span)("Visible")), `<span>Visible</span>`);
testView("IfThen false", (0, index_js_1.IfThen)(false, () => (0, index_js_1.Span)("Hidden")), ``);
testView("IfThenElse true", (0, index_js_1.IfThenElse)(true, () => (0, index_js_1.Span)("Yes"), () => (0, index_js_1.Span)("No")), `<span>Yes</span>`);
testView("IfThenElse false", (0, index_js_1.IfThenElse)(false, () => (0, index_js_1.Span)("Yes"), () => (0, index_js_1.Span)("No")), `<span>No</span>`);
testView("Nested conditionals", (0, index_js_1.IfThen)(true, () => (0, index_js_1.Div)([
    (0, index_js_1.IfThenElse)(false, () => (0, index_js_1.P)("A"), () => (0, index_js_1.P)("B"))
])), `<div><p>B</p></div>`);
// Nullable value overloads
testView("IfThen with non-null value", (0, index_js_1.IfThen)("hello", (val) => (0, index_js_1.Span)(val)), `<span>hello</span>`);
testView("IfThen with null value", (0, index_js_1.IfThen)(null, (val) => (0, index_js_1.Span)(val)), ``);
testView("IfThen with undefined value", (0, index_js_1.IfThen)(undefined, (val) => (0, index_js_1.Span)(val)), ``);
testView("IfThenElse with non-null value", (0, index_js_1.IfThenElse)("world", (val) => (0, index_js_1.Span)(val), () => (0, index_js_1.Span)("fallback")), `<span>world</span>`);
testView("IfThenElse with null value", (0, index_js_1.IfThenElse)(null, (val) => (0, index_js_1.Span)(val), () => (0, index_js_1.Span)("fallback")), `<span>fallback</span>`);
testView("IfThenElse with undefined value", (0, index_js_1.IfThenElse)(undefined, (val) => (0, index_js_1.Span)(String(val)), () => (0, index_js_1.Span)("none")), `<span>none</span>`);
// ------------------------------------
// Control Flow - SwitchCase
// ------------------------------------
section("Control Flow - SwitchCase");
testView("SwitchCase first match", (0, index_js_1.SwitchCase)([
    { condition: true, component: () => (0, index_js_1.Span)("First") },
    { condition: true, component: () => (0, index_js_1.Span)("Second") },
]), `<span>First</span>`);
testView("SwitchCase second match", (0, index_js_1.SwitchCase)([
    { condition: false, component: () => (0, index_js_1.Span)("First") },
    { condition: true, component: () => (0, index_js_1.Span)("Second") },
]), `<span>Second</span>`);
testView("SwitchCase default", (0, index_js_1.SwitchCase)([
    { condition: false, component: () => (0, index_js_1.Span)("First") },
    { condition: false, component: () => (0, index_js_1.Span)("Second") },
], () => (0, index_js_1.Span)("Default")), `<span>Default</span>`);
testView("SwitchCase no match no default", (0, index_js_1.SwitchCase)([
    { condition: false, component: () => (0, index_js_1.Span)("First") },
]), ``);
// ------------------------------------
// Control Flow - ForEach
// ------------------------------------
section("Control Flow - ForEach");
testView("ForEach array", (0, index_js_1.Ul)((0, index_js_1.ForEach)(["A", "B", "C"], item => (0, index_js_1.Li)(item))), `<ul><li>A</li>\n<li>B</li>\n<li>C</li></ul>`);
testView("ForEach empty", (0, index_js_1.Ul)((0, index_js_1.ForEach)([], item => (0, index_js_1.Li)(item))), `<ul></ul>`);
testView("ForEach1 with index", (0, index_js_1.Ul)((0, index_js_1.ForEach1)(["A", "B", "C"], (item, idx) => (0, index_js_1.Li)(`${idx + 1}. ${item}`))), `<ul><li>1. A</li>\n<li>2. B</li>\n<li>3. C</li></ul>`);
testView("ForEach2 range", (0, index_js_1.Ul)((0, index_js_1.ForEach2)(3, idx => (0, index_js_1.Li)(`Item ${idx}`))), `<ul><li>Item 0</li>\n<li>Item 1</li>\n<li>Item 2</li></ul>`);
testView("ForEach3 range with start", (0, index_js_1.Ul)((0, index_js_1.ForEach3)(5, 8, idx => (0, index_js_1.Li)(`Item ${idx}`))), `<ul><li>Item 5</li>\n<li>Item 6</li>\n<li>Item 7</li></ul>`);
testView("Repeat", (0, index_js_1.Div)((0, index_js_1.Repeat)(3, () => (0, index_js_1.Span)("*"))), `<div><span>*</span>\n<span>*</span>\n<span>*</span></div>`);
// ------------------------------------
// Nested Structures
// ------------------------------------
section("Nested Structures");
testView("Deeply nested", (0, index_js_1.Div)((0, index_js_1.Section)((0, index_js_1.Article)((0, index_js_1.Header)((0, index_js_1.H1)("Title"))))), `<div><section><article><header><h1>Title</h1></header></article></section></div>`);
testView("Complex page structure", (0, index_js_1.Div)([
    (0, index_js_1.Header)([
        (0, index_js_1.Nav)([
            (0, index_js_1.A)("Home").setHref("/"),
            (0, index_js_1.A)("About").setHref("/about"),
        ])
    ]).setClass("header"),
    (0, index_js_1.Main)([
        (0, index_js_1.Article)([
            (0, index_js_1.H1)("Article Title"),
            (0, index_js_1.P)("First paragraph"),
            (0, index_js_1.P)("Second paragraph"),
        ])
    ]).setClass("content"),
    (0, index_js_1.Footer)((0, index_js_1.P)("Copyright 2024")).setClass("footer"),
]).setClass("container"), `<div class="container"><header class="header"><nav><a href="/">Home</a>\n<a href="/about">About</a></nav></header>\n<main class="content"><article><h1>Article Title</h1>\n<p>First paragraph</p>\n<p>Second paragraph</p></article></main>\n<footer class="footer"><p>Copyright 2024</p></footer></div>`);
// ------------------------------------
// Overlay Utility
// ------------------------------------
section("Overlay Utility");
testView("Overlay center", (0, index_js_1.Overlay)((0, index_js_1.Img)().setSrc("bg.jpg").setAlt("Background"), (0, index_js_1.Span)("Centered text")), `<div style="position: relative"><img src="bg.jpg" alt="Background">\n<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10"><span>Centered text</span></div></div>`);
testView("Overlay top-right", (0, index_js_1.Overlay)((0, index_js_1.Div)("Card"), (0, index_js_1.Span)("Badge"), "top-right"), `<div style="position: relative"><div>Card</div>\n<div style="position: absolute; top: 0; right: 0; z-index: 10"><span>Badge</span></div></div>`);
// ------------------------------------
// Mixed Content
// ------------------------------------
section("Mixed Content");
testView("Array as child", (0, index_js_1.Div)([
    "Text before",
    (0, index_js_1.P)("Paragraph"),
    "Text after",
]), `<div>Text before\n<p>Paragraph</p>\nText after</div>`);
testView("Nested arrays", (0, index_js_1.Div)([
    [(0, index_js_1.Span)("A"), (0, index_js_1.Span)("B")],
    [(0, index_js_1.Span)("C"), (0, index_js_1.Span)("D")],
]), `<div><span>A</span>\n<span>B</span>\n<span>C</span>\n<span>D</span></div>`);
testView("Empty in array", (0, index_js_1.Div)([
    (0, index_js_1.P)("Before"),
    (0, index_js_1.Empty)(),
    (0, index_js_1.P)("After"),
]), `<div><p>Before</p>\n\n<p>After</p></div>`);
// ------------------------------------
// Summary
// ------------------------------------
console.log(`\n${"=".repeat(50)}`);
console.log(`TEST SUMMARY`);
console.log("=".repeat(50));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`Total: ${passCount + failCount}`);
console.log("=".repeat(50));
// if (failCount > 0) {
//   process.exit(1);
// }
//# sourceMappingURL=test.js.map