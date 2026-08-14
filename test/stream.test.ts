import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { Readable } from "node:stream";
import {
  render, renderToStream, renderToIterable,
  Div, P, H1, H2, Span, A, Ul, Li, Button, Form, Input,
  Img, Br, Hr, Meta, Link, Script, Style, Source, Col,
  Raw, Table, Tr, Td, Th, Thead, Tbody, Nav, Section,
  Document, Head, Body, Title,
} from "../src/index.js";

import { hx } from "../src/htmx.js";
import type { View } from "../src/index.js";
import { assetUrl } from "../src/htmx.js";

/** Collect a stream's chunks (as strings) preserving boundaries. */
function collectChunks(stream: Readable): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    stream.on("data", (c: Buffer) => chunks.push(c.toString()));
    stream.on("end", () => resolve(chunks));
    stream.on("error", reject);
  });
}

/**
 * Collect all chunks from renderToStream into a single string.
 */
function streamToString(view: View): Promise<string> {
  return streamArgsToString(view);
}

/** Collect a (variadic) renderToStream call into a single string. */
function streamArgsToString(...views: View[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const stream = renderToStream(...views);
    stream.on("data", (chunk: Buffer) => chunks.push(chunk.toString()));
    stream.on("end", () => resolve(chunks.join("")));
    stream.on("error", reject);
  });
}

// ─── Basic elements ──────────────────────────────────────────────

describe("Stream: Basic elements", () => {
  it("renders simple div", async () => {
    assert.equal(await streamToString(Div("Hello")), render(Div("Hello")));
  });

  it("renders nested elements", async () => {
    const view = Div(P("Paragraph"), Span("Inline"));
    assert.equal(await streamToString(view), render(view));
  });

  it("Document() DOCTYPE prefix is identical streamed vs rendered", async () => {
    const view = Document(Head(Title("T")), Body(P("C"))).setLang("en");
    const out = await streamToString(view);
    assert.equal(out, render(view));
    assert.ok(out.startsWith("<!DOCTYPE html>\n<html lang=\"en\">"));
  });

  it("renders deeply nested", async () => {
    const view = Div(Div(Div(Div(Span("Deep")))));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders plain text", async () => {
    assert.equal(await streamToString("Hello World"), render("Hello World" as unknown as Parameters<typeof render>[0]));
  });

  it("renders empty div", async () => {
    assert.equal(await streamToString(Div()), render(Div()));
  });

  it("renders heading elements", async () => {
    const view = Div(H1("Title"), H2("Subtitle"));
    assert.equal(await streamToString(view), render(view));
  });
});

// ─── Arrays / lists ─────────────────────────────────────────────

describe("Stream: Arrays", () => {
  it("renders array of elements", async () => {
    const view = Div(P("One"), P("Two"), P("Three"));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders top-level array", async () => {
    const view = [Div("A"), Div("B"), Div("C")];
    assert.equal(await streamToString(view), render(view));
  });

  it("renders empty array", async () => {
    const view = Div();
    assert.equal(await streamToString(view), render(view));
  });

  it("renders list items", async () => {
    const view = Ul(Li("Item 1"), Li("Item 2"), Li("Item 3"));
    assert.equal(await streamToString(view), render(view));
  });
});

// ─── Attributes ─────────────────────────────────────────────────

describe("Stream: Attributes", () => {
  it("renders id attribute", async () => {
    const view = Div().setId("main");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders class attribute", async () => {
    const view = Div().setClass("container");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders style attribute", async () => {
    const view = Div().setStyle("color: red");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders id + class + style combined", async () => {
    const view = Div("Content").setId("main").setClass("container active").setStyle("margin: 0");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders custom attributes", async () => {
    const view = Div().addAttribute("data-testid", "my-div").addAttribute("role", "banner");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders boolean toggles", async () => {
    const view = Input().toggle("required").toggle("disabled");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders element-specific attributes (href)", async () => {
    const view = A("Link").setHref(assetUrl("/path"));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders element-specific attributes (src)", async () => {
    const view = Img().setSrc("/image.png").setAlt("Photo");
    assert.equal(await streamToString(view), render(view));
  });
});

// ─── Void elements ──────────────────────────────────────────────

describe("Stream: Void elements", () => {
  it("renders <br>", async () => {
    assert.equal(await streamToString(Br()), render(Br()));
  });

  it("renders <hr>", async () => {
    assert.equal(await streamToString(Hr()), render(Hr()));
  });

  it("renders <img> with attributes", async () => {
    const view = Img().setSrc("/photo.jpg").setAlt("A photo");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders <input> with attributes", async () => {
    const view = Input().setType("text").setName("email").addAttribute("placeholder", "Enter email");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders <meta>", async () => {
    const view = Meta().setName("description").setContent("A page");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders <link>", async () => {
    const view = Link().setHref(assetUrl("/style.css")).setRel("stylesheet");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders <source>", async () => {
    const view = Source().setSrc("/video.mp4").setType("video/mp4");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders <col>", async () => {
    const view = Col().addAttribute("span", "2");
    assert.equal(await streamToString(view), render(view));
  });
});

// ─── XSS / escaping ────────────────────────────────────────────

describe("Stream: Escaping", () => {
  it("escapes text content", async () => {
    const view = Span("<script>alert('xss')</script>");
    const html = await streamToString(view);
    assert.equal(html, render(view));
    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!html.includes("<script>alert"));
  });

  it("escapes attribute values", async () => {
    const view = Div().setId('foo"bar');
    const html = await streamToString(view);
    assert.equal(html, render(view));
    assert.ok(html.includes("&quot;"));
  });

  it("passes through Raw HTML unchanged", async () => {
    const view = Div(Raw("<b>bold</b>"));
    const html = await streamToString(view);
    assert.equal(html, render(view));
    assert.ok(html.includes("<b>bold</b>"));
  });
});

// ─── Script/Style raw context ───────────────────────────────────

describe("Stream: Script/Style raw context", () => {
  it("renders script content without escaping", async () => {
    const view = Script("const x = 1 < 2;");
    assert.equal(await streamToString(view), render(view));
  });

  it("sanitizes </script> inside script", async () => {
    const view = Script("document.write('</script>')");
    const html = await streamToString(view);
    assert.equal(html, render(view));
    assert.ok(!html.includes("</script>'"));
  });

  it("renders style content without escaping", async () => {
    const view = Style("body { margin: 0; }");
    assert.equal(await streamToString(view), render(view));
  });

  it("sanitizes </style> inside style", async () => {
    const view = Style("/* </style> hack */");
    const html = await streamToString(view);
    assert.equal(html, render(view));
    assert.ok(!html.includes("</style> hack"));
  });

  it("renders script with attributes", async () => {
    const view = Script("").setSrc("/app.js").addAttribute("defer", "");
    assert.equal(await streamToString(view), render(view));
  });
});

// ─── HTMX attributes ───────────────────────────────────────────

describe("Stream: HTMX", () => {
  it("renders hx-get", async () => {
    const view = Div().setHtmx(hx(assetUrl("/api/data")));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-post", async () => {
    const view = Button("Submit").setHtmx(hx(assetUrl("/api/submit"), { method: "post" }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-target + hx-swap", async () => {
    const view = Button("Load").setHtmx(hx(assetUrl("/api"), { target: "#main", swap: "innerHTML" }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-push-url", async () => {
    const view = A("Page").setHtmx(hx(assetUrl("/page"), { pushUrl: true }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-trigger", async () => {
    const view = Input().setHtmx(hx(assetUrl("/search"), { trigger: "keyup changed delay:500ms" }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-vals", async () => {
    const view = Button("Go").setHtmx(hx(assetUrl("/api"), { method: "post", vals: { key: "value" } }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-headers", async () => {
    const view = Div().setHtmx(hx(assetUrl("/api"), { headers: { "X-Custom": "yes" } }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-confirm", async () => {
    const view = Button("Delete").setHtmx(hx(assetUrl("/delete"), { method: "delete", confirm: "Are you sure?" }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-swap-oob", async () => {
    const view = Div("Updated").setHtmx(hx(assetUrl("/api"), { swapOob: "true" }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-boost", async () => {
    const view = Nav().setHtmx(hx(assetUrl("/nav"), { boost: true }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders hx-indicator", async () => {
    const view = Form().setHtmx(hx(assetUrl("/submit"), { method: "post", indicator: "#spinner" }));
    assert.equal(await streamToString(view), render(view));
  });
});

// ─── Complex / realistic structures ─────────────────────────────

describe("Stream: Complex structures", () => {
  it("renders a realistic page", async () => {
    const view = Div(
      Nav(
        A("Home").setHref(assetUrl("/")),
        A("About").setHref(assetUrl("/about")),
      ).setClass("nav"),
      Section(
        H1("Welcome"),
        P("This is a ", Span("fluent-html").setClass("brand"), " page."),
      ).setId("content"),
    ).setId("app");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders a table", async () => {
    const view = Table(
      Thead(Tr(Th("Name"), Th("Age"))),
      Tbody(
        Tr(Td("Alice"), Td("30")),
        Tr(Td("Bob"), Td("25")),
      ),
    ).setClass("table");
    assert.equal(await streamToString(view), render(view));
  });

  it("renders a form with inputs", async () => {
    const view = Form(
      Div(
        Input().setType("text").setName("username").addAttribute("placeholder", "Username"),
      ).setClass("field"),
      Div(
        Input().setType("password").setName("password").addAttribute("placeholder", "Password"),
      ).setClass("field"),
      Button("Login").setType("submit"),
    ).setHtmx(hx(assetUrl("/login"), { method: "post" }));
    assert.equal(await streamToString(view), render(view));
  });

  it("renders mixed content with Raw", async () => {
    const view = Div(
      H1("Title"),
      Raw("<hr>"),
      P("Paragraph with ", A("link").setHref(assetUrl("/foo")), " inside."),
      Raw("<!-- comment -->"),
    );
    assert.equal(await streamToString(view), render(view));
  });

  it("produces correct chunks for large array", async () => {
    const items = Array.from({ length: 100 }, (_, i) => Li(`Item ${i}`));
    const view = Ul(...items);
    assert.equal(await streamToString(view), render(view));
  });
});

// ─── Stream-specific behavior ───────────────────────────────────

describe("Stream: Chunked output", () => {
  it("batches small content into a single chunk (default chunkSize)", async () => {
    // Small content fits in one ~16 KB chunk now — the old ">= 3 chunks" was never a contract.
    const chunks = await collectChunks(renderToStream(Div(P("Hello"))));
    assert.equal(chunks.length, 1);
    assert.equal(chunks.join(""), render(Div(P("Hello"))));
  });

  it("emits multiple chunks when content exceeds chunkSize", async () => {
    const big = Div(...Array.from({ length: 300 }, (_, i) => P(`item ${i}`)));
    const chunks = await collectChunks(renderToStream(big, { chunkSize: 64 }));
    assert.ok(chunks.length > 1, `expected multiple chunks, got ${chunks.length}`);
    assert.equal(chunks.join(""), render(big));
  });

  it("is a valid Readable stream", async () => {
    const stream = renderToStream(Div("Test"));
    assert.equal(typeof stream.read, "function");
    assert.equal(typeof stream.pipe, "function");
    assert.ok((await streamToString(Div("Test"))).length > 0);
  });
});

// ─── Backpressure + renderToIterable (D-02) ─────────────────────────

describe("Stream: backpressure + renderToIterable", () => {
  const big = Div(...Array.from({ length: 500 }, (_, i) => P(`item ${i}`).setId(`i${i}`)));

  it("delivers complete, correct output under tight backpressure", async () => {
    // Tiny chunkSize + highWaterMark force many push()===false suspend/resume cycles.
    const out = (await collectChunks(renderToStream(big, { chunkSize: 16, highWaterMark: 16 }))).join("");
    assert.equal(out, render(big)); // nothing dropped, nothing duplicated
  });

  it("walks the tree exactly once (no double-render)", async () => {
    const out = await streamToString(big);
    assert.equal(out.length, render(big).length); // a double-render would double the length
  });

  it("renderToIterable joins to the render output", () => {
    const v = Div(P("a"), Span("b"), Raw("<hr>"));
    assert.equal([...renderToIterable(v)].join(""), render(v));
  });

  it("renderToIterable chunks large content with a small chunkSize", () => {
    const chunks = [...renderToIterable(big, { chunkSize: 32 })];
    assert.ok(chunks.length > 1, `expected multiple chunks, got ${chunks.length}`);
    assert.equal(chunks.join(""), render(big));
  });

  it("renderToIterable threads a nonce", () => {
    const out = [...renderToIterable(Div(Script("a")), { nonce: "n9" })].join("");
    assert.ok(out.includes('nonce="n9"'));
  });

  it("destroys the stream if the walk throws mid-stream (invalid hx-status key)", async () => {
    const evil = hx(assetUrl("/x"), { status: { "bad key": "swap:none" } } as unknown as Parameters<typeof hx>[1]);
    const stream = renderToStream(Div().setHtmx(evil));
    await assert.rejects(
      new Promise<void>((resolve, reject) => {
        stream.on("data", () => {});
        stream.on("end", () => resolve());
        stream.on("error", reject);
      }),
      /Invalid hx-status key/,
    );
  });
});

// ─── Variadic / multi-swap (D-03: symmetric with render) ────────────

describe("Stream: variadic / multi-swap", () => {
  it("streams two top-level views joined like render(a, b)", async () => {
    const a = Div("A").setId("a");
    const b = Span("B").setId("b");
    assert.equal(await streamArgsToString(a, b), render(a, b));
  });

  it("matches render for a 3-view multi-swap response", async () => {
    const v1 = Div(P("list")).setId("list");
    const v2 = Span("42").setId("count");
    const v3 = Div("toast").setId("toast");
    assert.equal(await streamArgsToString(v1, v2, v3), render(v1, v2, v3));
  });

  it("single-arg call is unchanged (backward compatible)", async () => {
    const v = Div(P("x"));
    assert.equal(await streamArgsToString(v), render(v));
  });
});

// ─── Fuzz: stream ≡ render over random trees ────────────────────────

describe("Stream: fuzz equivalence with render", () => {
  function randView(depth: number): View {
    const r = Math.random();
    if (depth <= 0 || r < 0.35) {
      const leaves = ["plain text", "<b>html</b>", `quote " and ' apos`, "amp & amp", "<script>x</script>"];
      return leaves[Math.floor(Math.random() * leaves.length)]!;
    }
    if (r < 0.48) return [randView(depth - 1), randView(depth - 1)];
    if (r < 0.56) return Img().setSrc("/x.png").setAlt("alt");                 // void element
    if (r < 0.64) return Script("a < b; </script> end");                       // raw (script) ctx
    if (r < 0.72) return Style("/* </style> */ body{margin:0}");               // raw (style) ctx
    if (r < 0.82) {
      return Button("go").setHtmx(hx(assetUrl("/api"), {
        method: "post", target: "#m", swap: "outerHTML", pushUrl: true,
        vals: { k: "v" }, headers: { "X-Y": "z" }, confirm: "ok?", boost: true,
      }));
    }
    const kids = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => randView(depth - 1));
    return Div(...kids).setId("x").setClass("c d").addAttribute("data-y", `z"<&`).toggle("hidden");
  }

  it("stream output equals render output over 300 random trees", async () => {
    for (let i = 0; i < 300; i++) {
      const v = randView(4);
      assert.equal(await streamToString(v), render(v), `mismatch on tree #${i}`);
    }
  });
});
