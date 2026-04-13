import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, renderToStream, Div, P, H1, H2, Span, A, Ul, Li, Button, Form, Input, Img, Br, Hr, Meta, Link, Script, Style, Source, Col, Raw, Table, Tr, Td, Th, Thead, Tbody, Nav, Section, } from "../src/index.js";
import { hx } from "../src/htmx.js";
/**
 * Collect all chunks from renderToStream into a single string.
 */
function streamToString(view) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const stream = renderToStream(view);
        stream.on("data", (chunk) => chunks.push(chunk.toString()));
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
    it("renders deeply nested", async () => {
        const view = Div(Div(Div(Div(Span("Deep")))));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders plain text", async () => {
        assert.equal(await streamToString("Hello World"), render("Hello World"));
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
        const view = A("Link").setHref("/path");
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
        const view = Link().setHref("/style.css").setRel("stylesheet");
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
        const view = Div().setHtmx(hx("/api/data"));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-post", async () => {
        const view = Button("Submit").setHtmx(hx("/api/submit", { method: "post" }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-target + hx-swap", async () => {
        const view = Button("Load").setHtmx(hx("/api", { target: "#main", swap: "innerHTML" }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-push-url", async () => {
        const view = A("Page").setHtmx(hx("/page", { pushUrl: true }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-trigger", async () => {
        const view = Input().setHtmx(hx("/search", { trigger: "keyup changed delay:500ms" }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-vals", async () => {
        const view = Button("Go").setHtmx(hx("/api", { method: "post", vals: { key: "value" } }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-headers", async () => {
        const view = Div().setHtmx(hx("/api", { headers: { "X-Custom": "yes" } }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-confirm", async () => {
        const view = Button("Delete").setHtmx(hx("/delete", { method: "delete", confirm: "Are you sure?" }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-swap-oob", async () => {
        const view = Div("Updated").setHtmx(hx("/api", { swapOob: "true" }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-boost", async () => {
        const view = Nav().setHtmx(hx("/nav", { boost: true }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders hx-indicator", async () => {
        const view = Form().setHtmx(hx("/submit", { method: "post", indicator: "#spinner" }));
        assert.equal(await streamToString(view), render(view));
    });
});
// ─── Complex / realistic structures ─────────────────────────────
describe("Stream: Complex structures", () => {
    it("renders a realistic page", async () => {
        const view = Div(Nav(A("Home").setHref("/"), A("About").setHref("/about")).setClass("nav"), Section(H1("Welcome"), P("This is a ", Span("fluent-html").setClass("brand"), " page.")).setId("content")).setId("app");
        assert.equal(await streamToString(view), render(view));
    });
    it("renders a table", async () => {
        const view = Table(Thead(Tr(Th("Name"), Th("Age"))), Tbody(Tr(Td("Alice"), Td("30")), Tr(Td("Bob"), Td("25")))).setClass("table");
        assert.equal(await streamToString(view), render(view));
    });
    it("renders a form with inputs", async () => {
        const view = Form(Div(Input().setType("text").setName("username").addAttribute("placeholder", "Username")).setClass("field"), Div(Input().setType("password").setName("password").addAttribute("placeholder", "Password")).setClass("field"), Button("Login").setType("submit")).setHtmx(hx("/login", { method: "post" }));
        assert.equal(await streamToString(view), render(view));
    });
    it("renders mixed content with Raw", async () => {
        const view = Div(H1("Title"), Raw("<hr>"), P("Paragraph with ", A("link").setHref("/foo"), " inside."), Raw("<!-- comment -->"));
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
    it("emits multiple chunks for a tag", async () => {
        const chunks = [];
        const stream = renderToStream(Div(P("Hello")));
        await new Promise((resolve, reject) => {
            stream.on("data", (chunk) => chunks.push(chunk.toString()));
            stream.on("end", resolve);
            stream.on("error", reject);
        });
        // At minimum: open div, open p, text, close p, close div
        assert.ok(chunks.length >= 3, `Expected at least 3 chunks, got ${chunks.length}`);
        assert.equal(chunks.join(""), render(Div(P("Hello"))));
    });
    it("is a valid Readable stream", async () => {
        const stream = renderToStream(Div("Test"));
        assert.equal(typeof stream.read, "function");
        assert.equal(typeof stream.pipe, "function");
        // Consume fully
        const html = await streamToString(Div("Test"));
        assert.ok(html.length > 0);
    });
});
//# sourceMappingURL=stream.test.js.map