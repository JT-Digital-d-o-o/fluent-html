import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { render, Overlay, Span } from "../src/index.js";
describe("Overlay", () => {
    it("renders with default center position", () => {
        const html = render(Overlay(Span("Content"), Span("Badge")));
        assert.ok(html.includes("position: relative"));
        assert.ok(html.includes("position: absolute"));
        assert.ok(html.includes("translate(-50%, -50%)"));
        assert.ok(html.includes("Content"));
        assert.ok(html.includes("Badge"));
    });
    it("renders with top position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "top"));
        assert.ok(html.includes("top: 0; left: 50%; transform: translateX(-50%)"));
    });
    it("renders with bottom position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "bottom"));
        assert.ok(html.includes("bottom: 0; left: 50%; transform: translateX(-50%)"));
    });
    it("renders with top-left position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "top-left"));
        assert.ok(html.includes("top: 0; left: 0;"));
    });
    it("renders with top-right position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "top-right"));
        assert.ok(html.includes("top: 0; right: 0;"));
    });
    it("renders with bottom-left position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "bottom-left"));
        assert.ok(html.includes("bottom: 0; left: 0;"));
    });
    it("renders with bottom-right position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "bottom-right"));
        assert.ok(html.includes("bottom: 0; right: 0;"));
    });
    it("renders with left position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "left"));
        assert.ok(html.includes("top: 50%; left: 0; transform: translateY(-50%)"));
    });
    it("renders with right position", () => {
        const html = render(Overlay(Span("C"), Span("O"), "right"));
        assert.ok(html.includes("top: 50%; right: 0; transform: translateY(-50%)"));
    });
    it("includes z-index on overlay", () => {
        const html = render(Overlay(Span("C"), Span("O")));
        assert.ok(html.includes("z-index: 10"));
    });
});
//# sourceMappingURL=overlay.js.map