import {
  // Core
  render, View, Tag,

  // Structural
  Div, Main, Header, Footer, Section, Article, Nav, Aside,
  Figure, Figcaption, Address, Hgroup, Search,

  // Text content
  P, H1, H2, H3, H4, H5, H6, Span, Blockquote, Pre, Code, Hr, Br, Wbr,

  // Inline text
  Strong, Em, B, I, U, S, Mark, Small, Sub, Sup,
  Abbr, Cite, Q, Dfn, Kbd, Samp,

  // Lists
  Ul, Ol, Li, Dl, Dt, Dd, Menu,

  // Tables
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, Caption, Colgroup, Col,

  // Forms
  Form, Input, Textarea, Button, Label, Select, Option, Optgroup,
  Datalist, Fieldset, Legend, Output,

  // Interactive
  Details, Summary, Dialog,

  // Media
  Img, Picture, Source, Video, Audio, Track, Canvas, Svg,
  Path, Circle, Rect, Line, G,

  // Embedded
  Iframe, Embed,

  // Links
  A, Area,

  // Document
  HTML, Head, Body, Title, Meta, Link, Style, Script, Base, Noscript, Template,

  // Data/Time
  Time, Data, Progress, Meter,

  // Web Components
  Slot,

  // Utilities
  El, Empty, Overlay,

  // Control flow
  IfThen, IfThenElse, SwitchCase, ForEach, ForEach1, ForEach2, ForEach3, Repeat,
} from "../src/index.js";

import { hx, id, clss, HxSwap, HxTrigger } from "../src/htmx.js";

// ------------------------------------
// Test Runner
// ------------------------------------

let passCount = 0;
let failCount = 0;

function test(name: string, got: string, expected: string) {
  if (got === expected) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Got:      ${got}`);
    failCount++;
  }
}

function testView(name: string, view: View, expected: string) {
  test(name, render(view), expected);
}

function section(name: string) {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`${name}`);
  console.log("=".repeat(50));
}

// ------------------------------------
// Basic Elements
// ------------------------------------

section("Basic Elements");

testView("Empty()",
  Empty(),
  ``);

testView("Empty Div",
  Div(),
  `<div></div>`);

testView("Div with text",
  Div("Hello"),
  `<div>Hello</div>`);

testView("P with text",
  P("Paragraph text"),
  `<p>Paragraph text</p>`);

testView("Span with text",
  Span("inline"),
  `<span>inline</span>`);

testView("All heading levels",
  [H1("One"), H2("Two"), H3("Three"), H4("Four"), H5("Five"), H6("Six")],
  `<h1>One</h1>\n<h2>Two</h2>\n<h3>Three</h3>\n<h4>Four</h4>\n<h5>Five</h5>\n<h6>Six</h6>`);

testView("Br element",
  Br(),
  `<br>`);

testView("Hr element",
  Hr(),
  `<hr>`);

testView("Wbr element",
  Wbr(),
  `<wbr>`);


// ------------------------------------
// Semantic Elements
// ------------------------------------

section("Semantic Elements");

testView("Header",
  Header("Site header"),
  `<header>Site header</header>`);

testView("Footer",
  Footer("Site footer"),
  `<footer>Site footer</footer>`);

testView("Main",
  Main("Main content"),
  `<main>Main content</main>`);

testView("Nav",
  Nav("Navigation"),
  `<nav>Navigation</nav>`);

testView("Aside",
  Aside("Sidebar"),
  `<aside>Sidebar</aside>`);

testView("Section",
  Section("A section"),
  `<section>A section</section>`);

testView("Article",
  Article("An article"),
  `<article>An article</article>`);

testView("Figure with Figcaption",
  Figure([
    Img().setSrc("photo.jpg").setAlt("A photo"),
    Figcaption("Photo caption")
  ]),
  `<figure><img src="photo.jpg" alt="A photo">\n<figcaption>Photo caption</figcaption></figure>`);

testView("Address",
  Address("123 Main St"),
  `<address>123 Main St</address>`);

testView("Hgroup",
  Hgroup([H1("Title"), P("Subtitle")]),
  `<hgroup><h1>Title</h1>\n<p>Subtitle</p></hgroup>`);

testView("Search",
  Search(Input().setType("search")),
  `<search><input type="search"></search>`);

// ------------------------------------
// Text Formatting Elements
// ------------------------------------

section("Text Formatting");

testView("Strong",
  Strong("bold"),
  `<strong>bold</strong>`);

testView("Em",
  Em("italic"),
  `<em>italic</em>`);

testView("B, I, U, S",
  [B("bold"), I("italic"), U("underline"), S("strikethrough")],
  `<b>bold</b>\n<i>italic</i>\n<u>underline</u>\n<s>strikethrough</s>`);

testView("Mark",
  Mark("highlighted"),
  `<mark>highlighted</mark>`);

testView("Small",
  Small("fine print"),
  `<small>fine print</small>`);

testView("Sub and Sup",
  P(["H", Sub("2"), "O and x", Sup("2")]),
  `<p>H\n<sub>2</sub>\nO and x\n<sup>2</sup></p>`);

testView("Abbr",
  Abbr("HTML").addAttribute("title", "HyperText Markup Language"),
  `<abbr title="HyperText Markup Language">HTML</abbr>`);

testView("Cite",
  Cite("The Great Gatsby"),
  `<cite>The Great Gatsby</cite>`);

testView("Q",
  Q("To be or not to be"),
  `<q>To be or not to be</q>`);

testView("Dfn",
  Dfn("term"),
  `<dfn>term</dfn>`);

testView("Kbd",
  Kbd("Ctrl+C"),
  `<kbd>Ctrl+C</kbd>`);

testView("Samp",
  Samp("output"),
  `<samp>output</samp>`);

testView("Blockquote",
  Blockquote("A famous quote"),
  `<blockquote>A famous quote</blockquote>`);

testView("Pre and Code",
  Pre(Code("const x = 1;")),
  `<pre><code>const x = 1;</code></pre>`);

// ------------------------------------
// ID, Class, Style Attributes
// ------------------------------------

section("ID, Class, Style");

testView("Div with id",
  Div().setId("my-div"),
  `<div id="my-div"></div>`);

testView("Div with class",
  Div().setClass("container"),
  `<div class="container"></div>`);

testView("Div with id and class",
  Div().setId("main").setClass("container fluid"),
  `<div id="main" class="container fluid"></div>`);

testView("addClass on empty",
  Div().addClass("first"),
  `<div class="first"></div>`);

testView("addClass appends",
  Div().setClass("one").addClass("two").addClass("three"),
  `<div class="one two three"></div>`);

testView("setStyle",
  Div().setStyle("color: red; font-size: 16px"),
  `<div style="color: red; font-size: 16px"></div>`);

testView("Combined id, class, style",
  Div("Content")
    .setId("box")
    .setClass("card shadow")
    .setStyle("padding: 10px"),
  `<div id="box" class="card shadow" style="padding: 10px">Content</div>`);

// ------------------------------------
// Custom Attributes
// ------------------------------------

section("Custom Attributes");

testView("addAttribute single",
  Div().addAttribute("data-id", "123"),
  `<div data-id="123"></div>`);

testView("addAttribute multiple",
  Div()
    .addAttribute("data-id", "123")
    .addAttribute("data-name", "test")
    .addAttribute("aria-label", "Test div"),
  `<div data-id="123" data-name="test" aria-label="Test div"></div>`);

testView("El custom element",
  El("custom-element", "Content").setClass("my-class"),
  `<custom-element class="my-class">Content</custom-element>`);

// ------------------------------------
// Toggles (Boolean Attributes)
// ------------------------------------

section("Toggles (Boolean Attributes)");

testView("Single toggle",
  Input().setToggles(["required"]),
  `<input required>`);

testView("Multiple toggles",
  Input().setToggles(["required", "disabled", "readonly"]),
  `<input required disabled readonly>`);

testView("Toggle with other attributes",
  Input()
    .setType("text")
    .setName("email")
    .setToggles(["required"]),
  `<input type="text" name="email" required>`);

testView("toggle() single",
  Input().toggle("required"),
  `<input required>`);

testView("toggle() multiple chained",
  Input().toggle("required").toggle("disabled"),
  `<input required disabled>`);

testView("toggle() conditional true",
  Input().toggle("required", true),
  `<input required>`);

testView("toggle() conditional false",
  Input().toggle("required", false),
  `<input>`);

testView("toggle() mixed conditions",
  Input().toggle("required", true).toggle("disabled", false).toggle("readonly", true),
  `<input required readonly>`);

testView("toggle() with other attributes",
  Input()
    .setType("email")
    .setName("email")
    .toggle("required"),
  `<input type="email" name="email" required>`);

testView("toggle() combined with setToggles",
  Input().setToggles(["hidden"]).toggle("disabled"),
  `<input hidden disabled>`);

// ------------------------------------
// Lists
// ------------------------------------

section("Lists");

testView("Unordered list",
  Ul([
    Li("Item 1"),
    Li("Item 2"),
    Li("Item 3"),
  ]),
  `<ul><li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li></ul>`);

testView("Ordered list",
  Ol([
    Li("First"),
    Li("Second"),
  ]),
  `<ol><li>First</li>\n<li>Second</li></ol>`);

testView("Nested list",
  Ul([
    Li("Item 1"),
    Li([
      "Item 2",
      Ul([
        Li("Sub 1"),
        Li("Sub 2"),
      ])
    ]),
  ]),
  `<ul><li>Item 1</li>\n<li>Item 2\n<ul><li>Sub 1</li>\n<li>Sub 2</li></ul></li></ul>`);

testView("Definition list",
  Dl([
    Dt("Term 1"),
    Dd("Definition 1"),
    Dt("Term 2"),
    Dd("Definition 2"),
  ]),
  `<dl><dt>Term 1</dt>\n<dd>Definition 1</dd>\n<dt>Term 2</dt>\n<dd>Definition 2</dd></dl>`);

testView("Menu",
  Menu([
    Li("Action 1"),
    Li("Action 2"),
  ]),
  `<menu><li>Action 1</li>\n<li>Action 2</li></menu>`);

// ------------------------------------
// Tables
// ------------------------------------

section("Tables");

testView("Simple table",
  Table([
    Thead(Tr([Th("Name"), Th("Age")])),
    Tbody([
      Tr([Td("Alice"), Td("30")]),
      Tr([Td("Bob"), Td("25")]),
    ])
  ]),
  `<table><thead><tr><th>Name</th>\n<th>Age</th></tr></thead>\n<tbody><tr><td>Alice</td>\n<td>30</td></tr>\n<tr><td>Bob</td>\n<td>25</td></tr></tbody></table>`);

testView("Table with Tfoot",
  Table([
    Thead(Tr([Th("Item"), Th("Price")])),
    Tbody(Tr([Td("Widget"), Td("$10")])),
    Tfoot(Tr([Td("Total"), Td("$10")])),
  ]),
  `<table><thead><tr><th>Item</th>\n<th>Price</th></tr></thead>\n<tbody><tr><td>Widget</td>\n<td>$10</td></tr></tbody>\n<tfoot><tr><td>Total</td>\n<td>$10</td></tr></tfoot></table>`);

testView("Table with Caption",
  Table([
    Caption("Sales Data"),
    Tr([Th("Q1"), Th("Q2")]),
  ]),
  `<table><caption>Sales Data</caption>\n<tr><th>Q1</th>\n<th>Q2</th></tr></table>`);

testView("Th with colspan",
  Th("Header").setColspan(2),
  `<th colspan="2">Header</th>`);

testView("Td with rowspan",
  Td("Cell").setRowspan(3),
  `<td rowspan="3">Cell</td>`);

testView("Th with scope",
  Th("Column").setScope("col"),
  `<th scope="col">Column</th>`);

testView("Colgroup and Col",
  Table([
    Colgroup([
      Col().setSpan(2).setClass("highlight"),
      Col(),
    ]),
    Tr([Td("A"), Td("B"), Td("C")]),
  ]),
  `<table><colgroup><col class="highlight" span="2">\n<col></colgroup>\n<tr><td>A</td>\n<td>B</td>\n<td>C</td></tr></table>`);

// ------------------------------------
// Forms - Input
// ------------------------------------

section("Forms - Input");

testView("Text input",
  Input().setType("text").setName("username").setPlaceholder("Enter username"),
  `<input type="text" name="username" placeholder="Enter username">`);

testView("Email input with validation",
  Input()
    .setAutocomplete("email")
    .setType("email")
    .setName("email")
    .setToggles(["required"]),
  `<input type="email" name="email" autocomplete="email" required>`);

testView("Number input with min/max/step",
  Input()
    .setType("number")
    .setName("quantity")
    .setMin(1)
    .setMax(100)
    .setStep(5),
  `<input type="number" name="quantity" min="1" max="100" step="5">`);

testView("Password input",
  Input()
    .setType("password")
    .setName("password")
    .setMinlength(8)
    .setMaxlength(64),
  `<input type="password" name="password" minlength="8" maxlength="64">`);

testView("Input with pattern",
  Input()
    .setType("text")
    .setName("zipcode")
    .setPattern("[0-9]{5}"),
  `<input type="text" name="zipcode" pattern="[0-9]{5}">`);

testView("Checkbox input",
  Input()
    .setType("checkbox")
    .setName("agree")
    .setValue("yes")
    .setChecked(),
  `<input type="checkbox" name="agree" value="yes" checked="true">`);

testView("Radio input",
  Input()
    .setType("radio")
    .setName("color")
    .setValue("red"),
  `<input type="radio" name="color" value="red">`);

testView("File input",
  Input()
    .setType("file")
    .setName("document")
    .setAccept(".pdf,.doc")
    .setMultiple(),
  `<input type="file" name="document" accept=".pdf,.doc" multiple="true">`);

testView("Disabled input",
  Input()
    .setType("text")
    .setName("locked")
    .setValue("Cannot edit")
    .setDisabled(),
  `<input type="text" name="locked" value="Cannot edit" disabled="true">`);

testView("Readonly input",
  Input()
    .setType("text")
    .setName("readonly")
    .setValue("Read only")
    .setReadonly(),
  `<input type="text" name="readonly" value="Read only" readonly="true">`);

testView("Input with datalist",
  [
    Input().setType("text").setName("browser").setList("browsers"),
    Datalist([
      Option("Chrome").setValue("chrome"),
      Option("Firefox").setValue("firefox"),
    ]).setId("browsers"),
  ],
  `<input type="text" name="browser" list="browsers">\n<datalist id="browsers"><option value="chrome">Chrome</option>\n<option value="firefox">Firefox</option></datalist>`);

// ------------------------------------
// Forms - Textarea
// ------------------------------------

section("Forms - Textarea");

testView("Basic textarea",
  Textarea().setName("message").setPlaceholder("Enter message"),
  `<textarea name="message" placeholder="Enter message"></textarea>`);

testView("Textarea with rows/cols",
  Textarea()
    .setName("bio")
    .setRows(5)
    .setCols(40),
  `<textarea name="bio" rows="5" cols="40"></textarea>`);

testView("Textarea with content",
  Textarea("Default text").setName("notes"),
  `<textarea name="notes">Default text</textarea>`);

testView("Textarea with validation",
  Textarea()
    .setName("essay")
    .setMinlength(100)
    .setMaxlength(5000)
    .setWrap("soft"),
  `<textarea name="essay" minlength="100" maxlength="5000" wrap="soft"></textarea>`);

// ------------------------------------
// Forms - Button
// ------------------------------------

section("Forms - Button");

testView("Submit button",
  Button("Submit").setType("submit"),
  `<button type="submit">Submit</button>`);

testView("Reset button",
  Button("Reset").setType("reset"),
  `<button type="reset">Reset</button>`);

testView("Button with name/value",
  Button("Save")
    .setType("submit")
    .setName("action")
    .setValue("save"),
  `<button type="submit" name="action" value="save">Save</button>`);

testView("Disabled button",
  Button("Disabled").setDisabled(),
  `<button disabled="true">Disabled</button>`);

testView("Button with formaction",
  Button("Delete")
    .setType("submit")
    .setFormaction("/delete")
    .setFormmethod("post"),
  `<button type="submit" formaction="/delete" formmethod="post">Delete</button>`);

// ------------------------------------
// Forms - Select
// ------------------------------------

section("Forms - Select");

testView("Basic select",
  Select([
    Option("Choose...").setValue(""),
    Option("Option 1").setValue("1"),
    Option("Option 2").setValue("2"),
  ]).setName("choice"),
  `<select name="choice"><option value="">Choose...</option>\n<option value="1">Option 1</option>\n<option value="2">Option 2</option></select>`);

testView("Select with selected option",
  Select([
    Option("A").setValue("a"),
    Option("B").setValue("b").setSelected(),
    Option("C").setValue("c"),
  ]).setName("letter"),
  `<select name="letter"><option value="a">A</option>\n<option value="b" selected="true">B</option>\n<option value="c">C</option></select>`);

testView("Select with optgroup",
  Select([
    Optgroup([
      Option("Volvo").setValue("volvo"),
      Option("Saab").setValue("saab"),
    ]).setLabel("Swedish Cars"),
    Optgroup([
      Option("Mercedes").setValue("mercedes"),
      Option("Audi").setValue("audi"),
    ]).setLabel("German Cars"),
  ]).setName("car"),
  `<select name="car"><optgroup label="Swedish Cars"><option value="volvo">Volvo</option>\n<option value="saab">Saab</option></optgroup>\n<optgroup label="German Cars"><option value="mercedes">Mercedes</option>\n<option value="audi">Audi</option></optgroup></select>`);

testView("Multiple select",
  Select([
    Option("Red").setValue("red"),
    Option("Green").setValue("green"),
    Option("Blue").setValue("blue"),
  ]).setName("colors").setMultiple().setSize(3),
  `<select name="colors" multiple="true" size="3"><option value="red">Red</option>\n<option value="green">Green</option>\n<option value="blue">Blue</option></select>`);

// ------------------------------------
// Forms - Label, Fieldset, Form
// ------------------------------------

section("Forms - Label, Fieldset, Form");

testView("Label with for",
  Label("Username").setFor("username"),
  `<label for="username">Username</label>`);

testView("Fieldset with Legend",
  Fieldset([
    Legend("Personal Info"),
    Label("Name").setFor("name"),
    Input().setType("text").setName("name").setId("name"),
  ]).setName("personal"),
  `<fieldset name="personal"><legend>Personal Info</legend>\n<label for="name">Name</label>\n<input id="name" type="text" name="name"></fieldset>`);

testView("Disabled fieldset",
  Fieldset([
    Legend("Disabled Section"),
    Input().setType("text"),
  ]).setDisabled(),
  `<fieldset disabled="true"><legend>Disabled Section</legend>\n<input type="text"></fieldset>`);

testView("Form with method and action",
  Form([
    Input().setType("text").setName("q"),
    Button("Search").setType("submit"),
  ]).setAction("/search").setMethod("get"),
  `<form action="/search" method="get"><input type="text" name="q">\n<button type="submit">Search</button></form>`);

testView("Form with enctype",
  Form([
    Input().setType("file").setName("upload"),
  ]).setAction("/upload").setMethod("post").setEnctype("multipart/form-data"),
  `<form action="/upload" method="post" enctype="multipart/form-data"><input type="file" name="upload"></form>`);

testView("Form with novalidate",
  Form([
    Input().setType("email").setName("email"),
  ]).setNovalidate(),
  `<form novalidate="true"><input type="email" name="email"></form>`);

testView("Output element",
  Output("100").setFor("a b").setName("result"),
  `<output for="a b" name="result">100</output>`);

// ------------------------------------
// Interactive Elements
// ------------------------------------

section("Interactive Elements");

testView("Details/Summary closed",
  Details([
    Summary("Click to expand"),
    P("Hidden content"),
  ]),
  `<details><summary>Click to expand</summary>\n<p>Hidden content</p></details>`);

testView("Details open",
  Details([
    Summary("Expanded"),
    P("Visible content"),
  ]).setOpen(),
  `<details open="true"><summary>Expanded</summary>\n<p>Visible content</p></details>`);

testView("Details with name (accordion)",
  Details([
    Summary("Section 1"),
    P("Content 1"),
  ]).setName("accordion"),
  `<details name="accordion"><summary>Section 1</summary>\n<p>Content 1</p></details>`);

testView("Dialog closed",
  Dialog([
    H2("Dialog Title"),
    P("Dialog content"),
    Button("Close"),
  ]),
  `<dialog><h2>Dialog Title</h2>\n<p>Dialog content</p>\n<button>Close</button></dialog>`);

testView("Dialog open",
  Dialog("Open dialog").setOpen(),
  `<dialog open="true">Open dialog</dialog>`);

// ------------------------------------
// Links
// ------------------------------------

section("Links");

testView("Basic anchor",
  A("Click here").setHref("https://example.com"),
  `<a href="https://example.com">Click here</a>`);

testView("Anchor with target",
  A("External").setHref("https://example.com").setTarget("_blank"),
  `<a href="https://example.com" target="_blank">External</a>`);

testView("Anchor with rel",
  A("Nofollow").setHref("/page").setRel("nofollow noopener"),
  `<a href="/page" rel="nofollow noopener">Nofollow</a>`);

testView("Download link",
  A("Download PDF").setHref("/file.pdf").setDownload("document.pdf"),
  `<a href="/file.pdf" download="document.pdf">Download PDF</a>`);

testView("Email link",
  A("Contact us").setHref("mailto:info@example.com"),
  `<a href="mailto:info@example.com">Contact us</a>`);

// ------------------------------------
// Media Elements
// ------------------------------------

section("Media Elements");

testView("Basic image",
  Img().setSrc("photo.jpg").setAlt("A photo"),
  `<img src="photo.jpg" alt="A photo">`);

testView("Image with dimensions",
  Img().setSrc("photo.jpg").setAlt("Photo").setWidth("640").setHeight("480"),
  `<img src="photo.jpg" alt="Photo" width="640" height="480">`);

testView("Lazy loaded image",
  Img().setSrc("photo.jpg").setAlt("Lazy").setLoading("lazy"),
  `<img src="photo.jpg" alt="Lazy" loading="lazy">`);

testView("Image with srcset",
  Img()
    .setSrc("small.jpg")
    .setAlt("Responsive")
    .setSrcset("small.jpg 480w, medium.jpg 800w, large.jpg 1200w")
    .setSizes("(max-width: 600px) 480px, 800px"),
  `<img src="small.jpg" alt="Responsive" srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 480px, 800px">`);

testView("Picture element",
  Picture([
    Source().setSrcset("large.webp").setMedia("(min-width: 800px)").setType("image/webp"),
    Source().setSrcset("small.webp").setType("image/webp"),
    Img().setSrc("fallback.jpg").setAlt("Picture"),
  ]),
  `<picture><source srcset="large.webp" media="(min-width: 800px)" type="image/webp">\n<source srcset="small.webp" type="image/webp">\n<img src="fallback.jpg" alt="Picture"></picture>`);

testView("Video with controls",
  Video().setSrc("video.mp4").setControls().setWidth(640).setHeight(360),
  `<video src="video.mp4" controls="true" width="640" height="360"></video>`);

testView("Video with multiple sources",
  Video([
    Source().setSrc("video.webm").setType("video/webm"),
    Source().setSrc("video.mp4").setType("video/mp4"),
    "Your browser does not support video.",
  ]).setControls(),
  `<video controls="true"><source src="video.webm" type="video/webm">\n<source src="video.mp4" type="video/mp4">\nYour browser does not support video.</video>`);

testView("Video with all options",
  Video()
    .setSrc("video.mp4")
    .setControls()
    .setAutoplay()
    .setLoop()
    .setMuted()
    .setPoster("poster.jpg")
    .setPreload("metadata")
    .setPlaysinline(),
  `<video src="video.mp4" controls="true" autoplay="true" loop="true" muted="true" poster="poster.jpg" preload="metadata" playsinline="true"></video>`);

testView("Audio",
  Audio().setSrc("audio.mp3").setControls(),
  `<audio src="audio.mp3" controls="true"></audio>`);

testView("Audio with preload",
  Audio()
    .setSrc("audio.mp3")
    .setControls()
    .setPreload("none"),
  `<audio src="audio.mp3" controls="true" preload="none"></audio>`);

testView("Video with Track",
  Video([
    Source().setSrc("video.mp4").setType("video/mp4"),
    Track()
      .setSrc("captions.vtt")
      .setKind("subtitles")
      .setSrclang("en")
      .setLabel("English")
      .setDefault(),
  ]).setControls(),
  `<video controls="true"><source src="video.mp4" type="video/mp4">\n<track src="captions.vtt" kind="subtitles" srclang="en" label="English" default="true"></video>`);

testView("Canvas",
  Canvas().setWidth(800).setHeight(600).setId("myCanvas"),
  `<canvas id="myCanvas" width="800" height="600"></canvas>`);

// ------------------------------------
// SVG
// ------------------------------------

section("SVG");

testView("Basic SVG",
  Svg([
    Circle().addAttribute("cx", "50").addAttribute("cy", "50").addAttribute("r", "40").addAttribute("fill", "red"),
  ]).setWidth("100").setHeight("100").setViewBox("0 0 100 100"),
  `<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"></circle></svg>`);

testView("SVG with path",
  Svg([
    Path().addAttribute("d", "M10 10 H 90 V 90 H 10 Z").addAttribute("fill", "none").addAttribute("stroke", "black"),
  ]).setViewBox("0 0 100 100"),
  `<svg viewBox="0 0 100 100"><path d="M10 10 H 90 V 90 H 10 Z" fill="none" stroke="black"></path></svg>`);

testView("SVG with group",
  Svg([
    G([
      Rect().addAttribute("width", "50").addAttribute("height", "50"),
      Line().addAttribute("x1", "0").addAttribute("y1", "0").addAttribute("x2", "50").addAttribute("y2", "50"),
    ]).addAttribute("transform", "translate(10, 10)"),
  ]).setViewBox("0 0 100 100"),
  `<svg viewBox="0 0 100 100"><g transform="translate(10, 10)"><rect width="50" height="50"></rect>\n<line x1="0" y1="0" x2="50" y2="50"></line></g></svg>`);

// ------------------------------------
// Embedded Content
// ------------------------------------

section("Embedded Content");

testView("Iframe basic",
  Iframe().setSrc("https://example.com").setWidth("600").setHeight("400"),
  `<iframe src="https://example.com" width="600" height="400"></iframe>`);

testView("Iframe with sandbox",
  Iframe()
    .setSrc("https://example.com")
    .setSandbox("allow-scripts allow-same-origin")
    .setLoading("lazy"),
  `<iframe src="https://example.com" sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>`);

testView("Iframe with allow",
  Iframe()
    .setSrc("https://youtube.com/embed/xyz")
    .setAllow("accelerometer; autoplay; clipboard-write")
    .setAllowfullscreen(),
  `<iframe src="https://youtube.com/embed/xyz" allow="accelerometer; autoplay; clipboard-write" allowfullscreen="true"></iframe>`);

testView("Embed",
  Embed().setSrc("game.swf").setType("application/x-shockwave-flash").setWidth("400").setHeight("300"),
  `<embed src="game.swf" type="application/x-shockwave-flash" width="400" height="300">`);

// ------------------------------------
// Document Structure
// ------------------------------------

section("Document Structure");

testView("HTML element",
  HTML([
    Head(Title("Page Title")),
    Body(P("Content")),
  ]),
  `<html><head><title>Page Title</title></head>\n<body><p>Content</p></body></html>`);

testView("Meta charset",
  Meta().setCharset("UTF-8"),
  `<meta charset="UTF-8">`);

testView("Meta viewport",
  Meta().setName("viewport").setContent("width=device-width, initial-scale=1"),
  `<meta name="viewport" content="width=device-width, initial-scale=1">`);

testView("Meta og:title",
  Meta().setProperty("og:title").setContent("My Page"),
  `<meta property="og:title" content="My Page">`);

testView("Link stylesheet",
  Link().setRel("stylesheet").setHref("styles.css"),
  `<link rel="stylesheet" href="styles.css">`);

testView("Link favicon",
  Link().setRel("icon").setHref("favicon.ico").setType("image/x-icon"),
  `<link rel="icon" href="favicon.ico" type="image/x-icon">`);

testView("Link preload",
  Link().setRel("preload").setHref("font.woff2").setAs("font").setCrossorigin("anonymous"),
  `<link rel="preload" href="font.woff2" as="font" crossorigin="anonymous">`);

testView("Base",
  Base().setHref("https://example.com/").setTarget("_blank"),
  `<base href="https://example.com/" target="_blank">`);

testView("Noscript",
  Noscript(P("JavaScript is required")),
  `<noscript><p>JavaScript is required</p></noscript>`);

testView("Template",
  Template(Div("Template content")),
  `<template><div>Template content</div></template>`);

// ------------------------------------
// Script and Style (Raw Content)
// ------------------------------------

section("Script and Style (Raw Content)");

testView("Script inline",
  Script(`console.log("Hello");`),
  `<script>console.log("Hello");</script>`);

testView("Script with special chars (not escaped)",
  Script("if (a < b && c > d) { alert('<test>'); }"),
  "<script>if (a < b && c > d) { alert('<test>'); }</script>");

testView("Script external",
  Script().setSrc("app.js").setDefer(),
  `<script src="app.js" defer="true"></script>`);

testView("Script module",
  Script().setSrc("module.js").setType("module"),
  `<script src="module.js" type="module"></script>`);

testView("Script with integrity",
  Script()
    .setSrc("https://cdn.example.com/lib.js")
    .setIntegrity("sha384-abc123")
    .setCrossorigin("anonymous"),
  `<script src="https://cdn.example.com/lib.js" integrity="sha384-abc123" crossorigin="anonymous"></script>`);

testView("Style inline",
  Style(`.red { color: red; }`),
  `<style>.red { color: red; }</style>`);

testView("Style with special chars (not escaped)",
  Style(`body > div { content: '<test>'; }`),
  `<style>body > div { content: '<test>'; }</style>`);

// ------------------------------------
// Data and Time Elements
// ------------------------------------

section("Data and Time Elements");

testView("Time with datetime",
  Time("December 25, 2024").setDatetime("2024-12-25"),
  `<time datetime="2024-12-25">December 25, 2024</time>`);

testView("Data with value",
  Data("Large").setValue("999"),
  `<data value="999">Large</data>`);

testView("Progress",
  Progress().setValue(70).setMax(100),
  `<progress value="70" max="100"></progress>`);

testView("Meter",
  Meter()
    .setValue(6)
    .setMin(0)
    .setMax(10)
    .setLow(3)
    .setHigh(7)
    .setOptimum(5),
  `<meter value="6" min="0" max="10" low="3" high="7" optimum="5"></meter>`);

// ------------------------------------
// Web Components
// ------------------------------------

section("Web Components");

testView("Slot default",
  Slot("Default content"),
  `<slot>Default content</slot>`);

testView("Named slot",
  Slot().setName("header"),
  `<slot name="header"></slot>`);

// ------------------------------------
// XSS Prevention
// ------------------------------------

section("XSS Prevention");

testView("Escapes < and >",
  Div("<script>alert('xss')</script>"),
  `<div>&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;</div>`);

testView("Escapes quotes",
  Div(`He said "hello" and 'goodbye'`),
  `<div>He said &quot;hello&quot; and &#39;goodbye&#39;</div>`);

testView("Escapes ampersand",
  Div("Tom & Jerry"),
  `<div>Tom &amp; Jerry</div>`);

testView("Escapes in attributes",
  Div().addAttribute("data-value", `<script>"xss"</script>`),
  `<div data-value="&lt;script&gt;&quot;xss&quot;&lt;/script&gt;"></div>`);

testView("Escapes in class",
  Div().setClass(`"><script>alert(1)</script>`),
  `<div class="&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"></div>`);

testView("Escapes in style",
  Div().setStyle(`color: red" onclick="alert(1)`),
  `<div style="color: red&quot; onclick=&quot;alert(1)"></div>`);

testView("Nested content escaped",
  Div([P("<b>bold</b>"), Span("&amp;")]),
  `<div><p>&lt;b&gt;bold&lt;/b&gt;</p>\n<span>&amp;amp;</span></div>`);

testView("Script content NOT escaped",
  Script("if (x < 10 && y > 5) { return '<tag>'; }"),
  "<script>if (x < 10 && y > 5) { return '<tag>'; }</script>");

testView("Style content NOT escaped",
  Style(`.class > .child { content: "a & b"; }`),
  `<style>.class > .child { content: "a & b"; }</style>`);

// ------------------------------------
// HTMX - Basic
// ------------------------------------

section("HTMX - Basic");

testView("hx-get",
  Div().setHtmx(hx("/api/data")),
  `<div hx-get="/api/data"></div>`);

testView("hx-post",
  Button("Submit").setHtmx(hx("/api/submit", { method: "post" })),
  `<button hx-post="/api/submit">Submit</button>`);

testView("hx-put",
  Button("Update").setHtmx(hx("/api/update", { method: "put" })),
  `<button hx-put="/api/update">Update</button>`);

testView("hx-delete",
  Button("Delete").setHtmx(hx("/api/delete", { method: "delete" })),
  `<button hx-delete="/api/delete">Delete</button>`);

// ------------------------------------
// HTMX - Target and Swap
// ------------------------------------

section("HTMX - Target and Swap");

testView("hx-target with id",
  Button("Load").setHtmx(hx("/content", { target: "#result" })),
  `<button hx-get="/content" hx-target="#result">Load</button>`);

testView("hx-target with class",
  Button("Load").setHtmx(hx("/content", { target: ".container" })),
  `<button hx-get="/content" hx-target=".container">Load</button>`);

testView("hx-swap innerHTML",
  Div().setHtmx(hx("/data", { swap: "innerHTML" })),
  `<div hx-get="/data" hx-swap="innerHTML"></div>`);

testView("hx-swap outerHTML",
  Div().setHtmx(hx("/data", { swap: "outerHTML" })),
  `<div hx-get="/data" hx-swap="outerHTML"></div>`);

testView("hx-swap beforeend",
  Ul().setHtmx(hx("/items", { swap: "beforeend" })),
  `<ul hx-get="/items" hx-swap="beforeend"></ul>`);

testView("Combined target and swap",
  Button("Load").setHtmx(hx("/api", { target: "#main", swap: "innerHTML" })),
  `<button hx-get="/api" hx-target="#main" hx-swap="innerHTML">Load</button>`);

// ------------------------------------
// HTMX - Triggers
// ------------------------------------

section("HTMX - Triggers");

testView("hx-trigger click",
  Div().setHtmx(hx("/click", { trigger: "click" })),
  `<div hx-get="/click" hx-trigger="click"></div>`);

testView("hx-trigger load",
  Div().setHtmx(hx("/load", { trigger: "load" })),
  `<div hx-get="/load" hx-trigger="load"></div>`);

testView("hx-trigger revealed",
  Div().setHtmx(hx("/lazy", { trigger: "revealed" })),
  `<div hx-get="/lazy" hx-trigger="revealed"></div>`);

testView("hx-trigger with delay",
  Input().setHtmx(hx("/search", { trigger: "keyup delay:500ms" })),
  `<input hx-get="/search" hx-trigger="keyup delay:500ms">`);

// testView("hx-trigger with throttle",
//   Div().setHtmx(hx("/scroll", { trigger: "scroll throttle:1s" })),
//   `<div hx-get="/scroll" hx-trigger="scroll throttle:1s"></div>`);

testView("hx-trigger polling",
  Div().setHtmx(hx("/poll", { trigger: "every 5s" })),
  `<div hx-get="/poll" hx-trigger="every 5s"></div>`);

// ------------------------------------
// HTMX - URL Manipulation
// ------------------------------------

section("HTMX - URL Manipulation");

testView("hx-push-url",
  A("Page").setHtmx(hx("/page", { pushUrl: true })),
  `<a hx-get="/page" hx-push-url="true">Page</a>`);

testView("hx-replace-url",
  Button("Replace").setHtmx(hx("/new", { replaceUrl: true })),
  `<button hx-get="/new" hx-replace-url="true">Replace</button>`);

// ------------------------------------
// HTMX - Form Handling
// ------------------------------------

section("HTMX - Form Handling");

testView("hx-encoding multipart",
  Form().setHtmx(hx("/upload", { method: "post", encoding: "multipart/form-data" })),
  `<form hx-post="/upload" hx-encoding="multipart/form-data"></form>`);

testView("hx-validate",
  Form().setHtmx(hx("/submit", { method: "post", validate: true })),
  `<form hx-post="/submit" hx-validate="true"></form>`);

testView("hx-vals object",
  Button("Send").setHtmx(hx("/api", { vals: { key: "value", num: 42 } })),
  `<button hx-get="/api" hx-vals='{"key":"value","num":42}'>Send</button>`);

testView("hx-include",
  Button("Submit").setHtmx(hx("/api", { method: "post", include: "#extra-field" })),
  `<button hx-post="/api" hx-include="#extra-field">Submit</button>`);

testView("hx-params",
  Button("Submit").setHtmx(hx("/api", { method: "post", params: "*" })),
  `<button hx-post="/api" hx-params="*">Submit</button>`);

// ------------------------------------
// HTMX - Misc Attributes
// ------------------------------------

section("HTMX - Misc Attributes");

testView("hx-confirm",
  Button("Delete").setHtmx(hx("/delete", { method: "delete", confirm: "Are you sure?" })),
  `<button hx-delete="/delete" hx-confirm="Are you sure?">Delete</button>`);

testView("hx-indicator",
  Button("Load").setHtmx(hx("/slow", { indicator: "#spinner" })),
  `<button hx-get="/slow" hx-indicator="#spinner">Load</button>`);

testView("hx-ext",
  Div().setHtmx(hx("/data", { ext: "json-enc" })),
  `<div hx-get="/data" hx-ext="json-enc"></div>`);

testView("hx-headers",
  Div().setHtmx(hx("/api", { headers: { "X-Custom": "value" } })),
  `<div hx-get="/api" hx-headers='{"X-Custom":"value"}'></div>`);

testView("hx-select",
  Div().setHtmx(hx("/page", { select: "#content" })),
  `<div hx-get="/page" hx-select="#content"></div>`);

testView("hx-select-oob",
  Div().setHtmx(hx("/page", { selectOob: "#sidebar" })),
  `<div hx-get="/page" hx-select-oob="#sidebar"></div>`);

testView("hx-sync",
  Button("Click").setHtmx(hx("/api", { sync: "closest form:abort" })),
  `<button hx-get="/api" hx-sync="closest form:abort">Click</button>`);

// ------------------------------------
// HTMX - Complex Examples
// ------------------------------------

section("HTMX - Complex Examples");

testView("Full HTMX form",
  Form([
    Input().setType("text").setName("search").setPlaceholder("Search..."),
    Button("Search").setType("submit"),
  ]).setHtmx(hx("/search", {
    method: "post",
    target: "#results",
    swap: "innerHTML",
    trigger: "click",
    indicator: "#loading",
  })),
  `<form hx-post="/search" hx-target="#results" hx-swap="innerHTML" hx-trigger="click" hx-indicator="#loading"><input type="text" name="search" placeholder="Search...">\n<button type="submit">Search</button></form>`);

testView("Infinite scroll",
  Div()
    .setId("feed")
    .setHtmx(hx("/feed?page=2", {
      trigger: "revealed",
      swap: "beforeend",
    })),
  `<div id="feed" hx-get="/feed?page=2" hx-swap="beforeend" hx-trigger="revealed"></div>`);

testView("Live search",
  Input()
    .setType("search")
    .setName("q")
    .setPlaceholder("Search...")
    .setHtmx(hx("/search", {
      trigger: "keyup delay:300ms",
      target: "#results",
    })),
  `<input type="search" name="q" placeholder="Search..." hx-get="/search" hx-target="#results" hx-trigger="keyup delay:300ms">`);

// ------------------------------------
// HTMX Helper Functions
// ------------------------------------

section("HTMX Helpers");

test("id() helper", id("my-id"), "#my-id");
test("clss() helper", clss("my-class"), ".my-class");

// ------------------------------------
// setHtmx Overloads
// ------------------------------------

section("setHtmx Overloads");

testView("setHtmx with endpoint string",
  Div().setHtmx("/api/data"),
  `<div hx-get="/api/data"></div>`);

testView("setHtmx with endpoint and options",
  Button("Go").setHtmx("/api/submit", { method: "post", target: "#result" }),
  `<button hx-post="/api/submit" hx-target="#result">Go</button>`);

testView("setHtmx with endpoint and swap",
  Div().setHtmx("/api/data", { swap: "outerHTML" }),
  `<div hx-get="/api/data" hx-swap="outerHTML"></div>`);

testView("setHtmx with pre-built HTMX object",
  Div().setHtmx(hx("/api/data", { method: "post" })),
  `<div hx-post="/api/data"></div>`);

// ------------------------------------
// hx Shorthand Methods
// ------------------------------------

section("hx Shorthand Methods");

testView("hxGet basic",
  Button("Load").hxGet("/api/items"),
  `<button hx-get="/api/items">Load</button>`);

testView("hxGet with options",
  Button("Load").hxGet("/api/items", { target: "#list", swap: "innerHTML" }),
  `<button hx-get="/api/items" hx-target="#list" hx-swap="innerHTML">Load</button>`);

testView("hxPost",
  Button("Save").hxPost("/api/save"),
  `<button hx-post="/api/save">Save</button>`);

testView("hxPost with options",
  Button("Save").hxPost("/api/save", { target: "#result", trigger: "click" }),
  `<button hx-post="/api/save" hx-target="#result" hx-trigger="click">Save</button>`);

testView("hxPut",
  Button("Update").hxPut("/api/update"),
  `<button hx-put="/api/update">Update</button>`);

testView("hxPatch",
  Button("Patch").hxPatch("/api/patch"),
  `<button hx-patch="/api/patch">Patch</button>`);

testView("hxDelete",
  Button("Remove").hxDelete("/api/item/1"),
  `<button hx-delete="/api/item/1">Remove</button>`);

testView("hxDelete with confirm",
  Button("Remove").hxDelete("/api/item/1", { confirm: "Sure?" }),
  `<button hx-delete="/api/item/1" hx-confirm="Sure?">Remove</button>`);

testView("hxGet chained with other methods",
  Div("Content").setId("box").hxGet("/api/refresh", { swap: "outerHTML" }),
  `<div id="box" hx-get="/api/refresh" hx-swap="outerHTML">Content</div>`);

// ------------------------------------
// Control Flow - IfThen / IfThenElse
// ------------------------------------

section("Control Flow - Conditionals");

testView("IfThen true",
  IfThen(true, () => Span("Visible")),
  `<span>Visible</span>`);

testView("IfThen false",
  IfThen(false, () => Span("Hidden")),
  ``);

testView("IfThenElse true",
  IfThenElse(true, () => Span("Yes"), () => Span("No")),
  `<span>Yes</span>`);

testView("IfThenElse false",
  IfThenElse(false, () => Span("Yes"), () => Span("No")),
  `<span>No</span>`);

testView("Nested conditionals",
  IfThen(true, () =>
    Div([
      IfThenElse(false,
        () => P("A"),
        () => P("B")
      )
    ])
  ),
  `<div><p>B</p></div>`);

// Nullable value overloads

testView("IfThen with non-null value",
  IfThen("hello" as string | null, (val) => Span(val)),
  `<span>hello</span>`);

testView("IfThen with null value",
  IfThen(null as string | null, (val) => Span(val)),
  ``);

testView("IfThen with undefined value",
  IfThen(undefined as string | undefined, (val) => Span(val)),
  ``);

testView("IfThenElse with non-null value",
  IfThenElse("world" as string | null, (val) => Span(val), () => Span("fallback")),
  `<span>world</span>`);

testView("IfThenElse with null value",
  IfThenElse(null as string | null, (val) => Span(val), () => Span("fallback")),
  `<span>fallback</span>`);

testView("IfThenElse with undefined value",
  IfThenElse(undefined as number | undefined, (val) => Span(String(val)), () => Span("none")),
  `<span>none</span>`);

// ------------------------------------
// Control Flow - SwitchCase
// ------------------------------------

section("Control Flow - SwitchCase");

testView("SwitchCase first match",
  SwitchCase([
    { condition: true, component: () => Span("First") },
    { condition: true, component: () => Span("Second") },
  ]),
  `<span>First</span>`);

testView("SwitchCase second match",
  SwitchCase([
    { condition: false, component: () => Span("First") },
    { condition: true, component: () => Span("Second") },
  ]),
  `<span>Second</span>`);

testView("SwitchCase default",
  SwitchCase([
    { condition: false, component: () => Span("First") },
    { condition: false, component: () => Span("Second") },
  ], () => Span("Default")),
  `<span>Default</span>`);

testView("SwitchCase no match no default",
  SwitchCase([
    { condition: false, component: () => Span("First") },
  ]),
  ``);

// ------------------------------------
// Control Flow - ForEach
// ------------------------------------

section("Control Flow - ForEach");

testView("ForEach array",
  Ul(ForEach(["A", "B", "C"], item => Li(item))),
  `<ul><li>A</li>\n<li>B</li>\n<li>C</li></ul>`);

testView("ForEach empty",
  Ul(ForEach([], item => Li(item))),
  `<ul></ul>`);

testView("ForEach1 with index",
  Ul(ForEach1(["A", "B", "C"], (item, idx) => Li(`${idx + 1}. ${item}`))),
  `<ul><li>1. A</li>\n<li>2. B</li>\n<li>3. C</li></ul>`);

testView("ForEach2 range",
  Ul(ForEach2(3, idx => Li(`Item ${idx}`))),
  `<ul><li>Item 0</li>\n<li>Item 1</li>\n<li>Item 2</li></ul>`);

testView("ForEach3 range with start",
  Ul(ForEach3(5, 8, idx => Li(`Item ${idx}`))),
  `<ul><li>Item 5</li>\n<li>Item 6</li>\n<li>Item 7</li></ul>`);

testView("Repeat",
  Div(Repeat(3, () => Span("*"))),
  `<div><span>*</span>\n<span>*</span>\n<span>*</span></div>`);

// ------------------------------------
// Nested Structures
// ------------------------------------

section("Nested Structures");

testView("Deeply nested",
  Div(
    Section(
      Article(
        Header(
          H1("Title")
        )
      )
    )
  ),
  `<div><section><article><header><h1>Title</h1></header></article></section></div>`);

testView("Complex page structure",
  Div([
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
    Footer(
      P("Copyright 2024")
    ).setClass("footer"),
  ]).setClass("container"),
  `<div class="container"><header class="header"><nav><a href="/">Home</a>\n<a href="/about">About</a></nav></header>\n<main class="content"><article><h1>Article Title</h1>\n<p>First paragraph</p>\n<p>Second paragraph</p></article></main>\n<footer class="footer"><p>Copyright 2024</p></footer></div>`);

// ------------------------------------
// Overlay Utility
// ------------------------------------

section("Overlay Utility");

testView("Overlay center",
  Overlay(
    Img().setSrc("bg.jpg").setAlt("Background"),
    Span("Centered text")
  ),
  `<div style="position: relative"><img src="bg.jpg" alt="Background">\n<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10"><span>Centered text</span></div></div>`);

testView("Overlay top-right",
  Overlay(
    Div("Card"),
    Span("Badge"),
    "top-right"
  ),
  `<div style="position: relative"><div>Card</div>\n<div style="position: absolute; top: 0; right: 0; z-index: 10"><span>Badge</span></div></div>`);

// ------------------------------------
// Mixed Content
// ------------------------------------

section("Mixed Content");

testView("Array as child",
  Div([
    "Text before",
    P("Paragraph"),
    "Text after",
  ]),
  `<div>Text before\n<p>Paragraph</p>\nText after</div>`);

testView("Nested arrays",
  Div([
    [Span("A"), Span("B")],
    [Span("C"), Span("D")],
  ]),
  `<div><span>A</span>\n<span>B</span>\n<span>C</span>\n<span>D</span></div>`);

testView("Empty in array",
  Div([
    P("Before"),
    Empty(),
    P("After"),
  ]),
  `<div><p>Before</p>\n\n<p>After</p></div>`);

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