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
  Path, Circle, Rect, Line, Ellipse, Polygon, Polyline, G, Use, Text, Tspan, Defs,
  LinearGradient, RadialGradient, Stop, ClipPath, Mask, Filter, FeGaussianBlur,

  // Embedded
  Iframe, Embed,

  // Links
  A, Area,

  // Document
  HTML, Document, Doctype, Head, Body, Title, Meta, Link, Style, Script, Base, Noscript, Template,

  // Data/Time
  Time, Data, Ins, Del, Progress, Meter,

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
    ]).toggle("open")),
    `<details open><summary>Expanded</summary>\n<p>Visible content</p></details>`);
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

  it("Dialog open", () => { assert.strictEqual(render(Dialog("Open dialog").toggle("open")), `<dialog open>Open dialog</dialog>`); });
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

  it("Anchor with hreflang + referrerPolicy", () => { assert.strictEqual(render(A("FR").setHref("/fr").setHreflang("fr").setReferrerPolicy("no-referrer")), `<a href="/fr" referrerpolicy="no-referrer" hreflang="fr">FR</a>`); });

  it("Area with referrerpolicy", () => { assert.strictEqual(render(Area().setShape("rect").setCoords("0,0,80,80").setHref("/a").setReferrerPolicy("no-referrer-when-downgrade")), `<area shape="rect" coords="0,0,80,80" href="/a" referrerpolicy="no-referrer-when-downgrade">`); });

  // Regression (elements-symmetry-4): setRel is variadic — the security pair gets autocomplete;
  // a single space-joined string still works, and no args clears.
  it("setRel joins multiple tokens; single-string and empty forms preserved", () => {
    assert.strictEqual(render(A("x").setRel("noopener", "noreferrer")), `<a rel="noopener noreferrer">x</a>`);
    assert.strictEqual(render(A("x").setRel("noopener")), `<a rel="noopener">x</a>`);
    assert.strictEqual(render(A("x").setRel("nofollow noopener")), `<a rel="nofollow noopener">x</a>`);
    assert.strictEqual(render(A("x").setRel()), `<a>x</a>`);
  });

  // Regression (elements-symmetry-6): Area.setDownload accepts the boolean form like Anchor.
  it("Area.setDownload accepts the boolean form", () => {
    assert.strictEqual(render(Area().setHref("/f").setDownload(true)), `<area href="/f" download="true">`);
  });
});

// ------------------------------------
// Media Elements
// ------------------------------------

describe("Media Elements", () => {
  it("Basic image", () => { assert.strictEqual(render(Img().setSrc("photo.jpg").setAlt("A photo")), `<img src="photo.jpg" alt="A photo">`); });

  it("Image with dimensions", () => { assert.strictEqual(render(Img().setSrc("photo.jpg").setAlt("Photo").setWidth("640").setHeight("480")), `<img src="photo.jpg" alt="Photo" width="640" height="480">`); });

  // Regression (elements-symmetry-2): setWidth/setHeight accept a number uniformly across
  // Img/Video/Canvas/Source/Svg/Iframe/Object/Embed (the CLS fix idiom), and undefined clears.
  it("setWidth/setHeight accept number and are clearable across sibling classes", () => {
    assert.strictEqual(render(Img().setWidth(800).setHeight(600)), `<img width="800" height="600">`);
    assert.strictEqual(render(Video().setWidth(1920).setHeight(1080)), `<video width="1920" height="1080"></video>`);
    assert.strictEqual(render(Canvas().setWidth(300).setHeight(150)), `<canvas width="300" height="150"></canvas>`);
    assert.strictEqual(render(Img().setWidth(800).setWidth(undefined)), `<img>`);
  });

  it("Lazy loaded image", () => { assert.strictEqual(render(Img().setSrc("photo.jpg").setAlt("Lazy").setLoading("lazy")), `<img src="photo.jpg" alt="Lazy" loading="lazy">`); });

  it("Image with srcset", () => {
    assert.strictEqual(render(Img()
      .setSrc("small.jpg")
      .setAlt("Responsive")
      .setSrcset("small.jpg 480w, medium.jpg 800w, large.jpg 1200w")
      .setSizes("(max-width: 600px) 480px, 800px")),
    `<img src="small.jpg" alt="Responsive" srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 480px, 800px">`);
  });

  it("Image with fetchpriority (LCP promotion)", () => { assert.strictEqual(render(Img().setSrc("/hero.avif").setAlt("").setFetchPriority("high")), `<img src="/hero.avif" alt="" fetchpriority="high">`); });

  it("Picture element", () => {
    assert.strictEqual(render(Picture([
      Source().setSrcset("large.webp").setMedia("(min-width: 800px)").setType("image/webp"),
      Source().setSrcset("small.webp").setType("image/webp"),
      Img().setSrc("fallback.jpg").setAlt("Picture"),
    ])), `<picture><source srcset="large.webp" media="(min-width: 800px)" type="image/webp">\n<source srcset="small.webp" type="image/webp">\n<img src="fallback.jpg" alt="Picture"></picture>`);
  });

  it("Video with controls", () => { assert.strictEqual(render(Video().setSrc("video.mp4").toggle("controls").setWidth(640).setHeight(360)), `<video src="video.mp4" width="640" height="360" controls></video>`); });

  it("Video with multiple sources", () => {
    assert.strictEqual(render(Video([
      Source().setSrc("video.webm").setType("video/webm"),
      Source().setSrc("video.mp4").setType("video/mp4"),
      "Your browser does not support video.",
    ]).toggle("controls")),
    `<video controls><source src="video.webm" type="video/webm">\n<source src="video.mp4" type="video/mp4">\nYour browser does not support video.</video>`);
  });

  it("Video with all options", () => {
    assert.strictEqual(render(Video()
      .setSrc("video.mp4")
      .toggle("controls")
      .toggle("autoplay")
      .toggle("loop")
      .toggle("muted")
      .setPoster("poster.jpg")
      .setPreload("metadata")
      .toggle("playsinline")),
    `<video src="video.mp4" poster="poster.jpg" preload="metadata" controls autoplay loop muted playsinline></video>`);
  });

  it("Audio", () => { assert.strictEqual(render(Audio().setSrc("audio.mp3").toggle("controls")), `<audio src="audio.mp3" controls></audio>`); });

  it("Audio with preload", () => {
    assert.strictEqual(render(Audio()
      .setSrc("audio.mp3")
      .toggle("controls")
      .setPreload("none")),
    `<audio src="audio.mp3" preload="none" controls></audio>`);
  });

  it("Video with Track", () => {
    assert.strictEqual(render(Video([
      Source().setSrc("video.mp4").setType("video/mp4"),
      Track()
        .setSrc("captions.vtt")
        .setKind("subtitles")
        .setSrclang("en")
        .setLabel("English")
        .toggle("default"),
    ]).toggle("controls")),
    `<video controls><source src="video.mp4" type="video/mp4">\n<track src="captions.vtt" kind="subtitles" srclang="en" label="English" default></video>`);
  });

  it("Canvas", () => { assert.strictEqual(render(Canvas().setWidth(800).setHeight(600).setId("myCanvas")), `<canvas id="myCanvas" width="800" height="600"></canvas>`); });

  it("Video with crossorigin", () => { assert.strictEqual(render(Video().setSrc("video.mp4").setCrossOrigin("anonymous")), `<video src="video.mp4" crossorigin="anonymous"></video>`); });

  it("Audio with crossorigin", () => { assert.strictEqual(render(Audio().setSrc("audio.mp3").setCrossOrigin("use-credentials")), `<audio src="audio.mp3" crossorigin="use-credentials"></audio>`); });

  it("Source with width/height (CLS box reservation)", () => { assert.strictEqual(render(Source().setSrcset("/hero.avif").setMedia("(min-width:768px)").setWidth(1280).setHeight(720)), `<source srcset="/hero.avif" media="(min-width:768px)" width="1280" height="720">`); });

  it("Source width accepts string", () => { assert.strictEqual(render(Source().setSrcset("/x.avif").setWidth("1280")), `<source srcset="/x.avif" width="1280">`); });

  it("Image with referrerpolicy", () => { assert.strictEqual(render(Img().setSrc("/avatar.jpg").setReferrerPolicy("no-referrer")), `<img src="/avatar.jpg" referrerpolicy="no-referrer">`); });
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

  it("SvgTag setStrokeWidth", () => {
    assert.strictEqual(render(Svg(
      Path().setD("M0 0 L24 24").setStroke("currentColor"),
    ).setXmlns().setFill("none").setViewBox("0 0 24 24").setStrokeWidth("1.5")),
    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke-width="1.5"><path d="M0 0 L24 24" stroke="currentColor"></path></svg>`);
  });

  it("Circle typed setters", () => {
    assert.strictEqual(render(Circle().setCx("50").setCy("50").setR("25").setFill("blue").setStroke("black").setStrokeWidth("2")),
    `<circle cx="50" cy="50" r="25" fill="blue" stroke="black" stroke-width="2"></circle>`);
  });

  it("Rect typed setters", () => {
    assert.strictEqual(render(Rect().setX("10").setY("10").setWidth("80").setHeight("40").setRx("5").setRy("5")),
    `<rect x="10" y="10" width="80" height="40" rx="5" ry="5"></rect>`);
  });

  it("Line typed setters", () => {
    assert.strictEqual(render(Line().setX1("0").setY1("0").setX2("100").setY2("100").setStroke("red").setStrokeLinecap("round")),
    `<line x1="0" y1="0" x2="100" y2="100" stroke="red" stroke-linecap="round"></line>`);
  });

  it("Path typed setters", () => {
    assert.strictEqual(render(Path().setD("M0 0 L50 50").setFill("none").setStroke("green").setFillRule("evenodd")),
    `<path d="M0 0 L50 50" fill-rule="evenodd" fill="none" stroke="green"></path>`);
  });

  it("Ellipse typed setters", () => {
    assert.strictEqual(render(Ellipse().setCx("50").setCy("50").setRx("30").setRy("20").setFill("orange")),
    `<ellipse cx="50" cy="50" rx="30" ry="20" fill="orange"></ellipse>`);
  });

  it("Polygon typed setters", () => {
    assert.strictEqual(render(Polygon().setPoints("50,0 100,100 0,100").setFill("purple")),
    `<polygon points="50,0 100,100 0,100" fill="purple"></polygon>`);
  });

  it("Polyline typed setters", () => {
    assert.strictEqual(render(Polyline().setPoints("0,0 50,50 100,0").setStroke("black").setFill("none")),
    `<polyline points="0,0 50,50 100,0" fill="none" stroke="black"></polyline>`);
  });

  it("Text typed setters", () => {
    assert.strictEqual(render(Text("Hello").setX("10").setY("20").setTextAnchor("middle").setFontSize("16")),
    `<text x="10" y="20" text-anchor="middle" font-size="16">Hello</text>`);
  });

  it("Tspan typed setters", () => {
    assert.strictEqual(render(Tspan("world").setDx("5").setDy("10")),
    `<tspan dx="5" dy="10">world</tspan>`);
  });

  it("Use typed setters", () => {
    assert.strictEqual(render(Use().setHref("#icon").setX("10").setY("20").setWidth("24").setHeight("24")),
    `<use href="#icon" x="10" y="20" width="24" height="24"></use>`);
  });

  it("SvgShapeTag shared setters", () => {
    assert.strictEqual(render(Circle().setStrokeLinejoin("bevel").setStrokeDasharray("5 3").setTransform("rotate(45)")),
    `<circle stroke-linejoin="bevel" stroke-dasharray="5 3" transform="rotate(45)"></circle>`);
  });

  it("setOpacity emits the opacity attribute via the _sk tuple", () => {
    assert.strictEqual(render(Rect().setOpacity("0.5")),
    `<rect opacity="0.5"></rect>`);
  });

  it("setFilter emits the filter attribute", () => {
    assert.strictEqual(render(Rect().setFilter("url(#blur)")),
    `<rect filter="url(#blur)"></rect>`);
  });

  it("setStrokeDashoffset / setStrokeOpacity round-trip", () => {
    assert.strictEqual(render(Circle().setStrokeDashoffset(8).setStrokeOpacity("0.4")),
    `<circle stroke-dashoffset="8" stroke-opacity="0.4"></circle>`);
  });

  it("LinearGradient with Stops", () => {
    assert.strictEqual(render(
      LinearGradient(
        Stop().setOffset("0%").setStopColor("red"),
        Stop().setOffset("100%").setStopColor("blue").setStopOpacity("0.5"),
      ).setId("g").setX1("0").setY1("0").setX2("1").setY2("1")),
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="red"></stop>\n<stop offset="100%" stop-color="blue" stop-opacity="0.5"></stop></linearGradient>`);
  });

  it("RadialGradient typed setters", () => {
    assert.strictEqual(render(RadialGradient().setId("r").setCx("50%").setCy("50%").setR("50%").setSpreadMethod("reflect")),
    `<radialGradient id="r" cx="50%" cy="50%" r="50%" spreadMethod="reflect"></radialGradient>`);
  });

  it("ClipPath / Mask containers", () => {
    assert.strictEqual(render(ClipPath(Rect().setWidth("10").setHeight("10")).setId("c").setClipPathUnits("objectBoundingBox")),
    `<clipPath id="c" clipPathUnits="objectBoundingBox"><rect width="10" height="10"></rect></clipPath>`);
    assert.strictEqual(render(Mask().setId("m").setMaskUnits("userSpaceOnUse")),
    `<mask id="m" maskUnits="userSpaceOnUse"></mask>`);
  });

  it("Filter with FeGaussianBlur", () => {
    assert.strictEqual(render(
      Defs(Filter(FeGaussianBlur().setIn("SourceGraphic").setStdDeviation(3).setResult("blur")).setId("f"))),
      `<defs><filter id="f"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"></feGaussianBlur></filter></defs>`);
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
      .setSandbox("allow-scripts", "allow-same-origin")
      .setLoading("lazy")),
    `<iframe src="https://example.com" sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>`);
  });

  it("Iframe fully locked (setSandbox no args)", () => { assert.strictEqual(render(Iframe().setSandbox()), `<iframe sandbox=""></iframe>`); });

  it("Iframe with allow", () => {
    assert.strictEqual(render(Iframe()
      .setSrc("https://youtube.com/embed/xyz")
      .setAllow({ accelerometer: "", autoplay: "", "clipboard-write": "" })
      .toggle("allowfullscreen")),
    `<iframe src="https://youtube.com/embed/xyz" allow="accelerometer; autoplay; clipboard-write" allowfullscreen></iframe>`);
  });

  it("Iframe allow with values (record)", () => { assert.strictEqual(render(Iframe().setSrc("/m").setAllow({ geolocation: "'self'", camera: "*" })), `<iframe src="/m" allow="geolocation &#39;self&#39;; camera *"></iframe>`); });

  it("Iframe allow multi-origin value", () => { assert.strictEqual(render(Iframe().setAllow({ geolocation: "'self' https://a.example" })), `<iframe allow="geolocation &#39;self&#39; https://a.example"></iframe>`); });

  it("Iframe allow deny-all (empty record) emits allow=\"\"", () => { assert.strictEqual(render(Iframe().setAllow({})), `<iframe allow=""></iframe>`); });

  it("Iframe allow cleared (no args) omits attribute", () => { assert.strictEqual(render(Iframe().setSrc("/x").setAllow()), `<iframe src="/x"></iframe>`); });

  it("Iframe allow value is escaped (no breakout)", () => { assert.strictEqual(render(Iframe().setAllow({ geolocation: '"onerror=alert(1)' })), `<iframe allow="geolocation &quot;onerror=alert(1)"></iframe>`); });

  it("Iframe with fetchpriority", () => { assert.strictEqual(render(Iframe().setSrc("https://example.com").setFetchPriority("low")), `<iframe src="https://example.com" fetchpriority="low"></iframe>`); });

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

  it("Document() prefixes <!DOCTYPE html>", () => {
    assert.strictEqual(render(Document(Head(Title("T")), Body(P("C")))), `<!DOCTYPE html>\n<html><head><title>T</title></head>\n<body><p>C</p></body></html>`);
  });

  it("Document() is chainable like HtmlTag", () => {
    assert.strictEqual(render(Document(Head(), Body()).setLang("en")), `<!DOCTYPE html>\n<html lang="en"><head></head>\n<body></body></html>`);
  });

  it("plain HTML() stays byte-identical (no DOCTYPE)", () => {
    assert.ok(!render(HTML(Head(), Body())).startsWith("<!DOCTYPE"));
  });

  it("Doctype() renders the standalone declaration", () => {
    assert.strictEqual(render(Doctype()), `<!DOCTYPE html>`);
  });

  it("Meta charset", () => { assert.strictEqual(render(Meta().setCharset("UTF-8")), `<meta charset="UTF-8">`); });

  it("Meta viewport", () => { assert.strictEqual(render(Meta().setName("viewport").setContent("width=device-width, initial-scale=1")), `<meta name="viewport" content="width=device-width, initial-scale=1">`); });

  it("Meta og:title", () => { assert.strictEqual(render(Meta().setProperty("og:title").setContent("My Page")), `<meta property="og:title" content="My Page">`); });

  it("Meta http-equiv emits the real attribute name (not httpEquiv)", () => {
    assert.strictEqual(
      render(Meta().setHttpEquiv("x-ua-compatible").setContent("IE=edge")),
      `<meta http-equiv="x-ua-compatible" content="IE=edge">`,
    );
  });

  it("Link stylesheet", () => { assert.strictEqual(render(Link().setRel("stylesheet").setHref("styles.css")), `<link rel="stylesheet" href="styles.css">`); });

  it("Link favicon", () => { assert.strictEqual(render(Link().setRel("icon").setHref("favicon.ico").setType("image/x-icon")), `<link rel="icon" href="favicon.ico" type="image/x-icon">`); });

  it("Link preload", () => { assert.strictEqual(render(Link().setRel("preload").setHref("font.woff2").setAs("font").setCrossOrigin("anonymous")), `<link rel="preload" href="font.woff2" as="font" crossorigin="anonymous">`); });

  it("Link preconnect with bare crossorigin", () => { assert.strictEqual(render(Link().setRel("preconnect").setHref("https://fonts.gstatic.com").setCrossOrigin("")), `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">`); });

  it("Link modulepreload with fetchpriority", () => { assert.strictEqual(render(Link().setRel("modulepreload").setHref("/app.js").setFetchPriority("low")), `<link rel="modulepreload" href="/app.js" fetchpriority="low">`); });

  it("Link rel/as/type stay open unions (custom values still compile + render)", () => { assert.strictEqual(render(Link().setRel("custom-rel").setAs("font").setType("font/woff2")), `<link rel="custom-rel" type="font/woff2" as="font">`); });

  it("Link responsive image preload (imagesrcset/imagesizes)", () => { assert.strictEqual(render(Link().setRel("preload").setAs("image").setImagesrcset("/hero-480.jpg 480w, /hero-1080.jpg 1080w").setImagesizes("100vw")), `<link rel="preload" as="image" imagesrcset="/hero-480.jpg 480w, /hero-1080.jpg 1080w" imagesizes="100vw">`); });

  it("Link with referrerpolicy", () => { assert.strictEqual(render(Link().setRel("stylesheet").setHref("/s.css").setReferrerPolicy("strict-origin-when-cross-origin")), `<link rel="stylesheet" href="/s.css" referrerpolicy="strict-origin-when-cross-origin">`); });

  it("Meta theme-color per color scheme (media)", () => { assert.strictEqual(render(Meta().setName("theme-color").setContent("#0b0b0b").setMedia("(prefers-color-scheme: dark)")), `<meta name="theme-color" content="#0b0b0b" media="(prefers-color-scheme: dark)">`); });

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

  it("Script external", () => { assert.strictEqual(render(Script().setSrc("app.js").toggle("defer")), `<script src="app.js" defer></script>`); });

  it("Script module", () => { assert.strictEqual(render(Script().setSrc("module.js").setType("module")), `<script src="module.js" type="module"></script>`); });

  it("Script with referrerpolicy", () => { assert.strictEqual(render(Script().setSrc("/a.js").setReferrerPolicy("origin")), `<script src="/a.js" referrerpolicy="origin"></script>`); });

  it("Script with fetchpriority", () => { assert.strictEqual(render(Script().setSrc("/app.js").setType("module").setFetchPriority("high")), `<script src="/app.js" type="module" fetchpriority="high"></script>`); });

  it("Script with integrity", () => {
    assert.strictEqual(render(Script()
      .setSrc("https://cdn.example.com/lib.js")
      .setIntegrity("sha384-abc123")
      .setCrossOrigin("anonymous")),
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
// Edit & Quotation (cite / datetime)
// ------------------------------------

describe("Edit and Quotation Elements", () => {
  it("Ins with cite and datetime", () => { assert.strictEqual(render(Ins("new text").setCite("/edits/42").setDatetime("2026-06-29T10:00")), `<ins cite="/edits/42" datetime="2026-06-29T10:00">new text</ins>`); });

  it("Del with datetime", () => { assert.strictEqual(render(Del("old text").setDatetime("2026-06-29")), `<del datetime="2026-06-29">old text</del>`); });

  it("Ins with no setters is a bare element", () => { assert.strictEqual(render(Ins("x")), `<ins>x</ins>`); });

  it("Q with cite", () => { assert.strictEqual(render(Q("quoted").setCite("https://example.com/src")), `<q cite="https://example.com/src">quoted</q>`); });

  it("Blockquote with cite", () => { assert.strictEqual(render(Blockquote(P("excerpt")).setCite("https://example.com/article")), `<blockquote cite="https://example.com/article"><p>excerpt</p></blockquote>`); });

  it("cite is breakout-escaped", () => { assert.strictEqual(render(Q("x").setCite('"><script>')), `<q cite="&quot;&gt;&lt;script&gt;">x</q>`); });
});

// ------------------------------------
// Web Components
// ------------------------------------

describe("Web Components", () => {
  it("Slot default", () => { assert.strictEqual(render(Slot("Default content")), `<slot>Default content</slot>`); });

  it("Named slot", () => { assert.strictEqual(render(Slot().setName("header")), `<slot name="header"></slot>`); });
});
