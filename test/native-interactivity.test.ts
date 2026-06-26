import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Div, Button, A, Span, Dialog, P } from "../src/index.js";
import { defineIds, createId } from "../src/index.js";

const ids = defineIds(["user-menu", "dialog"] as const);

// ---------------------------------------------------------------------------
// Native interactivity (B-010): Popover API + invoker Commands + anchor positioning
// ---------------------------------------------------------------------------

describe("Popover API", () => {
  it("bare setPopover() defaults to auto", () => {
    assert.equal(render(Div("m").setPopover()), `<div popover="auto">m</div>`);
  });

  it("setPopover('manual')", () => {
    assert.equal(render(Div("m").setPopover("manual")), `<div popover="manual">m</div>`);
  });

  it("invoker: setPopovertarget takes an Id and renders the raw id", () => {
    assert.equal(
      render(Button("Account").setPopovertarget(ids.userMenu)),
      `<button popovertarget="user-menu">Account</button>`,
    );
  });

  it("setPopovertargetaction emits the action", () => {
    assert.equal(
      render(Button("Open").setPopovertarget(ids.userMenu).setPopovertargetaction("show")),
      `<button popovertarget="user-menu" popovertargetaction="show">Open</button>`,
    );
  });

  it("setPopovertargetaction() with no arg omits the attribute (native toggle default)", () => {
    assert.equal(
      render(Button("Toggle").setPopovertarget(ids.userMenu).setPopovertargetaction()),
      `<button popovertarget="user-menu">Toggle</button>`,
    );
  });

  it("popover + id on one element", () => {
    assert.equal(
      render(Div("items").setId(ids.userMenu).setPopover()),
      `<div id="user-menu" popover="auto">items</div>`,
    );
  });
});

describe("Invoker Commands (<button>)", () => {
  it("show-modal + commandfor (JS-free, no hx-on)", () => {
    assert.equal(
      render(Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog)),
      `<button command="show-modal" commandfor="dialog">Edit</button>`,
    );
  });

  it("close", () => {
    assert.equal(
      render(Button("Done").setCommand("close").setCommandfor(ids.dialog)),
      `<button command="close" commandfor="dialog">Done</button>`,
    );
  });

  it("author command (--name) is allowed", () => {
    assert.equal(
      render(Button("Go").setCommand("--my-cmd").setCommandfor(ids.dialog)),
      `<button command="--my-cmd" commandfor="dialog">Go</button>`,
    );
  });
});

describe("Dialog light-dismiss + formmethod (B-010 completion)", () => {
  it("setClosedby renders the closedby attribute", () => {
    assert.equal(render(Dialog(P("hi")).setClosedby("any")), `<dialog closedby="any"><p>hi</p></dialog>`);
  });

  it("closedby + id + open render in schema order", () => {
    assert.equal(
      render(Dialog().setId(ids.dialog).setClosedby("closerequest").toggle("open")),
      `<dialog id="dialog" closedby="closerequest" open></dialog>`,
    );
  });

  it("a submit button closes an ancestor <dialog> via formmethod=dialog", () => {
    assert.equal(
      render(Button("Cancel").setType("submit").setFormmethod("dialog")),
      `<button type="submit" formmethod="dialog">Cancel</button>`,
    );
  });
});

describe("CSS anchor positioning", () => {
  it("anchorName emits the [anchor-name:--id] class", () => {
    assert.equal(
      render(A("Account").setPopovertarget(ids.userMenu).anchorName(ids.userMenu)),
      `<a class="[anchor-name:--user-menu]" popovertarget="user-menu">Account</a>`,
    );
  });

  it("positionAnchor + positionArea place a popover against its anchor", () => {
    assert.equal(
      render(Div("menu").setId(ids.userMenu).setPopover().positionAnchor(ids.userMenu).positionArea("bottom")),
      `<div id="user-menu" class="[position-anchor:--user-menu] position-area-bottom" popover="auto">menu</div>`,
    );
  });

  it("positionArea arbitrary [..] value is emitted verbatim", () => {
    assert.equal(render(Div().positionArea("[top span-left]")), `<div class="position-area-[top span-left]"></div>`);
  });
});

// The verdict's required breakout test (security/escape lens): an Id whose raw `.id`
// carries HTML-special + CSS-grammar chars, driven through all four Id sinks, must be
// entity-escaped in BOTH the class="…" and the attribute outputs — no double-quote /
// angle-bracket break-out. defineIds does NOT validate id chars; escapeAttr is the backstop.
describe("anchor/command/popover Id sinks ride the escapeAttr choke point", () => {
  const evil = createId(`x"] ;color:red[ &<>'`);

  it("setPopovertarget / setCommandfor escape the id in the attribute", () => {
    const html = render(Button("z").setPopovertarget(evil).setCommandfor(evil).setCommand("show-modal"));
    // every HTML-special char neutralized; no raw `"`, `<`, `>` to break out of the attribute
    assert.ok(html.includes("&quot;") && html.includes("&lt;") && html.includes("&gt;") && html.includes("&amp;") && html.includes("&#39;"));
    assert.ok(!/popovertarget="[^"]*"[^>]*</.test(html.replace(/&quot;/g, "")), "no attribute break-out");
    assert.ok(!html.includes(`x"]`), "raw unescaped id must not survive");
  });

  it("anchorName / positionAnchor escape the id inside class", () => {
    const html = render(Span("z").anchorName(evil).positionAnchor(evil));
    assert.ok(html.includes("&quot;") && html.includes("&lt;") && html.includes("&gt;") && html.includes("&#39;"));
    assert.ok(!html.includes(`x"]`), "raw unescaped id must not survive in class");
  });
});
