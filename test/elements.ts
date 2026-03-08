import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  render,
  // Structural
  Div, Main, Header, Footer, Section, Article, Nav, Aside, Figure, Figcaption, Address, Hgroup, Search,
  // Text
  P, H1, H2, H3, H4, H5, H6, Span, Blockquote, Pre, Code, Hr, Br, Wbr,
  // Inline
  Strong, Em, B, I, U, S, Mark, Small, Sub, Sup, Abbr, Cite, Q, Dfn, Kbd, Samp, Bdi, Bdo, Ruby, Rt, Rp,
  // Lists
  Ul, Ol, Li, Dl, Dt, Dd, Menu,
  // Tables
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, Caption, Colgroup, Col,
  // Forms
  Form, Input, Textarea, Button, Label, Select, Option, Optgroup, Datalist, Fieldset, Legend, Output,
  // Interactive
  Details, Summary, Dialog,
  // Media
  Img, Picture, Source, Video, Audio, Track, Canvas, Svg,
  // SVG elements
  Path, Circle, Rect, Line, Polygon, Polyline, Ellipse, G, Defs, Use, Text, Tspan,
  // Embedded
  Iframe, ObjectEl, Embed,
  // Links
  A, MapEl, Area,
  // Head
  HTML, Head, Body, Title, Meta, Link, Style, Script, Base, Noscript, Template,
  // Data/Time
  Time, Data,
  // Progress/Meter
  Progress, Meter,
  // Web Components
  Slot,
  // Utilities
  El,
} from "../src/index.js";

// Helper: verify element tag name renders correctly
function assertTag(factory: (...args: any[]) => any, tagName: string, isVoid = false) {
  it(`${tagName} renders correct tag`, () => {
    const el = factory();
    const html = render(el);
    if (isVoid) {
      assert.equal(html, `<${tagName}>`);
    } else {
      assert.equal(html, `<${tagName}></${tagName}>`);
    }
  });
}

function assertTagWithChild(factory: (...args: any[]) => any, tagName: string) {
  it(`${tagName} renders with children`, () => {
    const html = render(factory("content"));
    assert.equal(html, `<${tagName}>content</${tagName}>`);
  });
}

describe("Structural elements", () => {
  assertTag(Div, "div");
  assertTag(Main, "main");
  assertTag(Header, "header");
  assertTag(Footer, "footer");
  assertTag(Section, "section");
  assertTag(Article, "article");
  assertTag(Nav, "nav");
  assertTag(Aside, "aside");
  assertTag(Figure, "figure");
  assertTag(Figcaption, "figcaption");
  assertTag(Address, "address");
  assertTag(Hgroup, "hgroup");
  assertTag(Search, "search");
});

describe("Text elements", () => {
  assertTagWithChild(P, "p");
  assertTagWithChild(H1, "h1");
  assertTagWithChild(H2, "h2");
  assertTagWithChild(H3, "h3");
  assertTagWithChild(H4, "h4");
  assertTagWithChild(H5, "h5");
  assertTagWithChild(H6, "h6");
  assertTagWithChild(Span, "span");
  assertTagWithChild(Blockquote, "blockquote");
  assertTagWithChild(Pre, "pre");
  assertTagWithChild(Code, "code");
  assertTag(Hr, "hr", true);
  assertTag(Br, "br", true);
  assertTag(Wbr, "wbr", true);
});

describe("Inline text elements", () => {
  assertTagWithChild(Strong, "strong");
  assertTagWithChild(Em, "em");
  assertTagWithChild(B, "b");
  assertTagWithChild(I, "i");
  assertTagWithChild(U, "u");
  assertTagWithChild(S, "s");
  assertTagWithChild(Mark, "mark");
  assertTagWithChild(Small, "small");
  assertTagWithChild(Sub, "sub");
  assertTagWithChild(Sup, "sup");
  assertTagWithChild(Abbr, "abbr");
  assertTagWithChild(Cite, "cite");
  assertTagWithChild(Q, "q");
  assertTagWithChild(Dfn, "dfn");
  assertTagWithChild(Kbd, "kbd");
  assertTagWithChild(Samp, "samp");
  assertTagWithChild(Bdi, "bdi");
  assertTagWithChild(Bdo, "bdo");
  assertTagWithChild(Ruby, "ruby");
  assertTagWithChild(Rt, "rt");
  assertTagWithChild(Rp, "rp");
});

describe("List elements", () => {
  assertTag(Ul, "ul");
  assertTag(Ol, "ol");
  assertTagWithChild(Li, "li");
  assertTag(Dl, "dl");
  assertTagWithChild(Dt, "dt");
  assertTagWithChild(Dd, "dd");
  assertTag(Menu, "menu");
});

describe("Table elements", () => {
  assertTag(Table, "table");
  assertTag(Thead, "thead");
  assertTag(Tbody, "tbody");
  assertTag(Tfoot, "tfoot");
  assertTag(Tr, "tr");
  assertTag(Th, "th");
  assertTag(Td, "td");
  assertTag(Caption, "caption");
  assertTag(Colgroup, "colgroup");
  assertTag(Col, "col", true);
});

describe("Form elements", () => {
  assertTag(Form, "form");
  assertTag(Input, "input", true);
  assertTag(Textarea, "textarea");
  assertTag(Button, "button");
  assertTagWithChild(Label, "label");
  assertTag(Select, "select");
  assertTagWithChild(Option, "option");
  assertTag(Optgroup, "optgroup");
  assertTag(Datalist, "datalist");
  assertTag(Fieldset, "fieldset");
  assertTagWithChild(Legend, "legend");
  assertTag(Output, "output");
});

describe("Interactive elements", () => {
  assertTag(Details, "details");
  assertTagWithChild(Summary, "summary");
  assertTag(Dialog, "dialog");
});

describe("Media elements", () => {
  assertTag(Img, "img", true);
  assertTag(Picture, "picture");
  assertTag(Source, "source", true);
  assertTag(Video, "video");
  assertTag(Audio, "audio");
  assertTag(Track, "track", true);
  assertTag(Canvas, "canvas");
  assertTag(Svg, "svg");
});

describe("SVG elements", () => {
  assertTag(Path, "path");
  assertTag(Circle, "circle");
  assertTag(Rect, "rect");
  assertTag(Line, "line");
  assertTag(Polygon, "polygon");
  assertTag(Polyline, "polyline");
  assertTag(Ellipse, "ellipse");
  assertTag(G, "g");
  assertTag(Defs, "defs");
  assertTag(Use, "use");
  assertTag(Text, "text");
  assertTag(Tspan, "tspan");
});

describe("Embedded elements", () => {
  assertTag(Iframe, "iframe");
  assertTag(ObjectEl, "object");
  assertTag(Embed, "embed", true);
});

describe("Link elements", () => {
  assertTag(A, "a");
  assertTag(MapEl, "map");
  assertTag(Area, "area", true);
});

describe("Head elements", () => {
  assertTag(Head, "head");
  assertTag(Body, "body");
  assertTagWithChild(Title, "title");
  assertTag(Meta, "meta", true);
  assertTag(Link, "link", true);
  assertTag(Style, "style");
  assertTag(Script, "script");
  assertTag(Base, "base", true);
  assertTag(Noscript, "noscript");
  assertTag(Template, "template");
});

describe("Data/Time elements", () => {
  assertTag(Time, "time");
  assertTag(Data, "data");
});

describe("Progress/Meter elements", () => {
  assertTag(Progress, "progress");
  assertTag(Meter, "meter");
});

describe("Web Component elements", () => {
  assertTag(Slot, "slot");
});

describe("El utility", () => {
  it("creates element with custom tag name", () => {
    assert.equal(render(El("custom-element", "hello")), "<custom-element>hello</custom-element>");
  });
});

describe("HTML element", () => {
  it("renders html tag with lang", () => {
    const html = render(HTML(Head(), Body()).setLang("en"));
    assert.ok(html.includes('<html lang="en">'));
    assert.ok(html.includes("</html>"));
  });
});
