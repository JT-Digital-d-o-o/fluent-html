import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render,

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

  // Interactive
  Details, Summary, Dialog,

  // Media
  Img, Picture, Source, Video, Audio, Track, Canvas, Svg,
  Path, Circle, Rect, Line, G,

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
  Empty, Input, Button,
} from "../src/index.js";

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
    ]).setOpen()),
    `<details open="true"><summary>Expanded</summary>\n<p>Visible content</p></details>`);
  });

  it("Details with name (accordion)", () => {
    assert.strictEqual(render(Details([
      Summary("Section 1"),
      P("Content 1"),
    ]).setName("accordion")),
    `<details name="accordion"><summary>Section 1</summary>\n<p>Content 1</p></details>`);
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
      .setSizes("(max-width: 600px) 480px, 800px")),
    `<img src="small.jpg" alt="Responsive" srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 480px, 800px">`);
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
    ]).setControls()),
    `<video controls="true"><source src="video.webm" type="video/webm">\n<source src="video.mp4" type="video/mp4">\nYour browser does not support video.</video>`);
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
      .setPlaysinline()),
    `<video src="video.mp4" controls="true" autoplay="true" loop="true" muted="true" poster="poster.jpg" preload="metadata" playsinline="true"></video>`);
  });

  it("Audio", () => { assert.strictEqual(render(Audio().setSrc("audio.mp3").setControls()), `<audio src="audio.mp3" controls="true"></audio>`); });

  it("Audio with preload", () => {
    assert.strictEqual(render(Audio()
      .setSrc("audio.mp3")
      .setControls()
      .setPreload("none")),
    `<audio src="audio.mp3" controls="true" preload="none"></audio>`);
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
    ]).setControls()),
    `<video controls="true"><source src="video.mp4" type="video/mp4">\n<track src="captions.vtt" kind="subtitles" srclang="en" label="English" default="true"></video>`);
  });

  it("Canvas", () => { assert.strictEqual(render(Canvas().setWidth(800).setHeight(600).setId("myCanvas")), `<canvas id="myCanvas" width="800" height="600"></canvas>`); });
});

// ------------------------------------
// SVG
// ------------------------------------

describe("SVG", () => {
  it("Basic SVG", () => {
    assert.strictEqual(render(Svg(
      Circle().setCx("50").setCy("50").setR("40").setFill("red"),
    ).setWidth("100").setHeight("100").setViewBox("0 0 100 100")),
    `<svg width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"></circle></svg>`);
  });

  it("SVG with path", () => {
    assert.strictEqual(render(Svg(
      Path().setD("M10 10 H 90 V 90 H 10 Z").setFill("none").setStroke("black"),
    ).setViewBox("0 0 100 100")),
    `<svg viewBox="0 0 100 100"><path d="M10 10 H 90 V 90 H 10 Z" fill="none" stroke="black"></path></svg>`);
  });

  it("SVG with group", () => {
    assert.strictEqual(render(Svg(
      G(
        Rect().setWidth("50").setHeight("50"),
        Line().setX1("0").setY1("0").setX2("50").setY2("50"),
      ).addAttribute("transform", "translate(10, 10)"),
    ).setViewBox("0 0 100 100")),
    `<svg viewBox="0 0 100 100"><g transform="translate(10, 10)"><rect width="50" height="50"></rect>\n<line x1="0" y1="0" x2="50" y2="50"></line></g></svg>`);
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
      .setLoading("lazy")),
    `<iframe src="https://example.com" sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>`);
  });

  it("Iframe with allow", () => {
    assert.strictEqual(render(Iframe()
      .setSrc("https://youtube.com/embed/xyz")
      .setAllow("accelerometer; autoplay; clipboard-write")
      .setAllowfullscreen()),
    `<iframe src="https://youtube.com/embed/xyz" allow="accelerometer; autoplay; clipboard-write" allowfullscreen="true"></iframe>`);
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
      .setCrossorigin("anonymous")),
    `<script src="https://cdn.example.com/lib.js" integrity="sha384-abc123" crossorigin="anonymous"></script>`);
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
      .setOptimum(5)),
    `<meter value="6" min="0" max="10" low="3" high="7" optimum="5"></meter>`);
  });
});

// ------------------------------------
// Web Components
// ------------------------------------

describe("Web Components", () => {
  it("Slot default", () => { assert.strictEqual(render(Slot("Default content")), `<slot>Default content</slot>`); });

  it("Named slot", () => { assert.strictEqual(render(Slot().setName("header")), `<slot name="header"></slot>`); });
});
