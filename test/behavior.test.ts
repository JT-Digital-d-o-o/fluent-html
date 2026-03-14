import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Div, Button, Input, Textarea } from "../src/index.js";
import { type Id, createId, defineIds } from "../src/ids.js";

// Augment BehaviorMap for testing
declare module "../src/core/behavior-methods.js" {
  interface BehaviorMap {
    toggle: { target: Id };
    charCount: { target: Id; max: number };
    confirm: { message?: string };
    autofocus: void;
    trackClick: { event: string };
  }
}

describe("behavior()", () => {
  it("renders data-behavior and option attributes", () => {
    const ids = defineIds(["filter-panel"] as const);
    const html = render(Button("Toggle").behavior("toggle", { target: ids.filterPanel }));
    assert.ok(html.includes('data-behavior="toggle"'));
    assert.ok(html.includes('data-toggle-target="#filter-panel"'));
  });

  it("resolves Id objects to selector strings", () => {
    const id = createId("bio-count");
    const html = render(Textarea().behavior("charCount", { target: id, max: 280 }));
    assert.ok(html.includes('data-char-count-target="#bio-count"'));
    assert.ok(html.includes('data-char-count-max="280"'));
  });

  it("renders void behavior with no options", () => {
    const html = render(Input().behavior("autofocus"));
    assert.ok(html.includes('data-behavior="autofocus"'));
    // Should not have any other data- attributes from the behavior
    assert.ok(!html.includes("data-autofocus-"));
  });

  it("appends multiple behaviors as space-separated list", () => {
    const html = render(
      Button("Delete")
        .behavior("confirm", { message: "Sure?" })
        .behavior("trackClick", { event: "delete-user" })
    );
    assert.ok(html.includes('data-behavior="confirm trackClick"'));
    assert.ok(html.includes('data-confirm-message="Sure?"'));
    assert.ok(html.includes('data-track-click-event="delete-user"'));
  });

  it("namespaces options per-behavior (no collisions)", () => {
    const ids = defineIds(["panel", "counter"] as const);
    const html = render(
      Div()
        .behavior("toggle", { target: ids.panel })
        .behavior("charCount", { target: ids.counter, max: 100 })
    );
    assert.ok(html.includes('data-toggle-target="#panel"'));
    assert.ok(html.includes('data-char-count-target="#counter"'));
    // Targets should not collide
    assert.ok(!html.includes('data-toggle-max'));
    assert.ok(!html.includes('data-char-count-target="#panel"'));
  });

  it("converts camelCase option keys to kebab-case", () => {
    const ids = defineIds(["count"] as const);
    const html = render(Textarea().behavior("charCount", { target: ids.count, max: 280 }));
    assert.ok(html.includes("data-char-count-target"));
    assert.ok(html.includes("data-char-count-max"));
  });

  it("converts camelCase behavior names to kebab-case in prefix", () => {
    const ids = defineIds(["count"] as const);
    const html = render(Textarea().behavior("charCount", { target: ids.count, max: 280 }));
    // "charCount" → "char-count" in the attribute prefix
    assert.ok(html.includes("data-char-count-"));
    assert.ok(!html.includes("data-charCount-"));
  });

  it("skips null and undefined option values", () => {
    const html = render(Button("Del").behavior("confirm", { message: undefined }));
    assert.ok(html.includes('data-behavior="confirm"'));
    assert.ok(!html.includes("data-confirm-message"));
  });
});
