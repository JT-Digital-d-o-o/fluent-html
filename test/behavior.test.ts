import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { render, Button, Input, Form, Div, A } from "../src/index.js";
import { defineIds, createId } from "../src/ids.js";
import {
  EVENT_TABLE,
  HTMX_EVENTS,
  LISTEN_SET,
  BUILTIN_SPECS,
  BUILTIN_NAMES,
  registerBehavior,
  sealBehaviorRegistry,
  getBehaviorSpec,
  allBehaviors,
  registryHash,
  decodeOptions,
  verbPrefix,
  optionAttr,
  readAssetStamp,
  assertBehaviorRuntimeAsset,
  behaviorStamp,
} from "../src/behaviors/index.js";
import { BUILTIN_META } from "../src/behaviors/specs.js";
import { unsafeResetBehaviorRegistryForTests } from "../src/behaviors/register.js";
import { Tag } from "../src/core/tag.js";

import type { Id } from "../src/ids.js";

// Typed surface for the extension verb used across these tests.
declare module "../src/behaviors/map.js" {
  interface BehaviorMap {
    "jt:listboxNav": { list: Id; itemSelector: string };
  }
}

const ids = defineIds(["panel", "second", "banner", "mobile-menu", "menu-backdrop", "cancel-entry", "search"] as const);

beforeEach(() => unsafeResetBehaviorRegistryForTests());

// ── the wire grammar, pinned byte-exactly (ADR-01) ───────────────

describe("behavior() emission grammar", () => {
  it("toggle — bare data-behavior + target id", () => {
    const html = render(Button("Danger zone").behavior("toggle", { target: ids.panel }));
    assert.equal(html, `<button data-behavior="toggle" data-behavior-toggle-target="panel">Danger zone</button>`);
  });

  it("toggle — Id[] multi-target joins with spaces; display + force serialize", () => {
    const html = render(
      Button("X").behavior("toggle", { target: [ids.panel, ids.second], display: "flex", force: false }),
    );
    assert.ok(html.includes(`data-behavior-toggle-target="panel second"`));
    assert.ok(html.includes(`data-behavior-toggle-display="flex"`));
    assert.ok(html.includes(`data-behavior-toggle-force="false"`));
  });

  it("toggleClass — camelCase verb kebabs in the attribute prefix", () => {
    const html = render(Button("Fade").behavior("toggleClass", { target: ids.panel, class: "opacity-50" }));
    assert.equal(
      html,
      `<button data-behavior="toggleClass" data-behavior-toggle-class-target="panel" data-behavior-toggle-class-class="opacity-50">Fade</button>`,
    );
  });

  it("drawer — the full composite emits flat options (design doc example)", () => {
    const html = render(
      Button("Menu")
        .setAria({ expanded: false })
        .behavior("drawer", {
          target: ids.mobileMenu,
          class: "is-open",
          backdrop: ids.menuBackdrop,
          bodyClass: "overflow-hidden",
          closeOn: ["escape", "backdrop", "nav"],
          trapFocus: true,
          focusFirst: true,
        }),
    );
    assert.ok(html.includes(`aria-expanded="false"`));
    assert.ok(html.includes(`data-behavior="drawer"`));
    assert.ok(html.includes(`data-behavior-drawer-target="mobile-menu"`));
    assert.ok(html.includes(`data-behavior-drawer-class="is-open"`));
    assert.ok(html.includes(`data-behavior-drawer-backdrop="menu-backdrop"`));
    assert.ok(html.includes(`data-behavior-drawer-body-class="overflow-hidden"`));
    assert.ok(html.includes(`data-behavior-drawer-close-on="escape backdrop nav"`));
    assert.ok(html.includes(`data-behavior-drawer-trap-focus="true"`));
    assert.ok(html.includes(`data-behavior-drawer-focus-first="true"`));
  });

  it("clipboard — nested feedback group flattens with hyphens", () => {
    const html = render(
      Button("Copy invite link").behavior("clipboard", {
        path: "/invite/8f3k",
        feedback: { mode: "text", text: "Copied!", durationMs: 1500 },
      }),
    );
    assert.ok(html.includes(`data-behavior="clipboard"`));
    assert.ok(html.includes(`data-behavior-clipboard-path="/invite/8f3k"`));
    assert.ok(html.includes(`data-behavior-clipboard-feedback-mode="text"`));
    assert.ok(html.includes(`data-behavior-clipboard-feedback-text="Copied!"`));
    assert.ok(html.includes(`data-behavior-clipboard-feedback-duration-ms="1500"`));
  });

  it("onEscape — enum options serialize as literals (design doc example)", () => {
    const html = render(
      Form().behavior("onEscape", { action: "click", target: ids.cancelEntry, scope: "self" }),
    );
    assert.ok(html.includes(`data-behavior="onEscape"`));
    assert.ok(html.includes(`data-behavior-on-escape-action="click"`));
    assert.ok(html.includes(`data-behavior-on-escape-target="cancel-entry"`));
    assert.ok(html.includes(`data-behavior-on-escape-scope="self"`));
  });

  it("resetOnSuccess — void verb emits the bare token", () => {
    const html = render(Form().behavior("resetOnSuccess"));
    assert.ok(html.includes(`data-behavior="resetOnSuccess"`));
    assert.ok(!html.includes("data-behavior-reset-on-success-"));
  });

  it("remove — {closest} target serializes as closest:<selector>", () => {
    const html = render(Button("×").behavior("remove", { target: { closest: "[role=alert]" } }));
    assert.ok(html.includes(`data-behavior-remove-target="closest:[role=alert]"`));
  });

  it("remove — @self target serializes literally", () => {
    const html = render(Button("×").behavior("remove", { target: "@self" }));
    assert.ok(html.includes(`data-behavior-remove-target="@self"`));
  });

  it("back — void verb on an anchor", () => {
    const html = render(A("← Back").behavior("back"));
    assert.ok(html.includes(`data-behavior="back"`));
  });

  it("two behaviors on one element — declaration order preserved in data-behavior", () => {
    const html = render(
      Button("+386 40 123 456")
        .behavior("toggleClass", { target: ids.panel, class: "tooltip-visible" })
        .behavior("clipboard", { value: "+386 40 123 456" }),
    );
    assert.ok(html.includes(`data-behavior="toggleClass clipboard"`));
    assert.ok(html.includes(`data-behavior-toggle-class-target="panel"`));
    assert.ok(html.includes(`data-behavior-clipboard-value="+386 40 123 456"`));
  });

  it("event override — resolves at emit time against EVENT_TABLE (focus→focusin, mouseenter→mouseover)", () => {
    assert.ok(render(Button("H").behavior("toggle", { target: ids.panel, event: "mouseenter" })).includes(`data-behavior-toggle-event="mouseover"`));
    assert.ok(render(Input().behavior("toggle", { target: ids.panel, event: "focus" })).includes(`data-behavior-toggle-event="focusin"`));
    assert.ok(render(Input().behavior("toggle", { target: ids.panel, event: "blur" })).includes(`data-behavior-toggle-event="focusout"`));
    assert.ok(render(Button("C").behavior("toggle", { target: ids.panel, event: "click" })).includes(`data-behavior-toggle-event="click"`));
  });

  it("attribute values get normal HTML escaping — no escapeJs anywhere", () => {
    const html = render(Button("C").behavior("clipboard", { value: `a"b<c>&'d` }));
    assert.ok(html.includes(`data-behavior-clipboard-value="a&quot;b&lt;c&gt;&amp;&#39;d"`));
  });

  it("extension namespace — kebabs with a double hyphen (jt:listboxNav)", () => {
    registerBehavior("jt:listboxNav", {
      options: { list: "id", itemSelector: "string" },
      events: ["keydown"],
      consume: true,
      fixtures: [{ list: createId("ac-results"), itemSelector: "[role=option]" }],
    });
    const html = render(
      Input().behavior("jt:listboxNav", { list: createId("ac-results"), itemSelector: "[role=option]" }),
    );
    assert.ok(html.includes(`data-behavior="jt:listboxNav"`));
    assert.ok(html.includes(`data-behavior-jt--listbox-nav-list="ac-results"`));
    assert.ok(html.includes(`data-behavior-jt--listbox-nav-item-selector="[role=option]"`));
  });
});

// ── render-time throws (all modes — acceptance row 26) ───────────

describe("behavior() render-time guards", () => {
  it("throws on an unknown verb", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberately bypassing the typed surface
    assert.throws(() => (Button("X") as any).behavior("openDialog", { target: ids.panel }), /unknown behavior/);
  });

  it("throws on duplicate same-verb on one element", () => {
    assert.throws(
      () => Button("X").behavior("toggle", { target: ids.panel }).behavior("toggle", { target: ids.second }),
      /duplicate verb/,
    );
  });

  it("throws on an unknown option", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberately bypassing the typed surface
    assert.throws(() => (Button("X") as any).behavior("toggle", { target: ids.panel, foo: 1 }), /unknown option "foo"/);
  });

  it("throws on option type mismatches", () => {
    /* eslint-disable @typescript-eslint/no-explicit-any -- deliberately bypassing the typed surface */
    assert.throws(() => (Button("X") as any).behavior("toggle", { target: "panel" }), /expects an Id/);
    assert.throws(() => (Button("X") as any).behavior("toggleClass", { target: ids.panel, class: 5 }), /single CSS class token/);
    assert.throws(() => (Button("X") as any).behavior("remove", { target: ids.panel, animateOutTimeoutMs: "x" }), /finite number/);
    assert.throws(() => (Button("X") as any).behavior("drawer", { target: ids.panel, closeOn: ["escape", "poll"] }), /expects a list of/);
    assert.throws(() => (Button("X") as any).behavior("onEscape", { action: "explode" }), /expects one of/);
    assert.throws(() => (Button("X") as any).behavior("toggle", { target: ids.panel, event: "keyup" }), /expects one of/);
    assert.throws(() => (Button("X") as any).behavior("toggle", { target: ids.panel, force: "true" }), /expects a boolean/);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  it("prototype keys never satisfy closed sets (event enum, option lookup)", () => {
    /* eslint-disable @typescript-eslint/no-explicit-any -- deliberately bypassing the typed surface */
    assert.throws(() => (Button("X") as any).behavior("toggle", { target: ids.panel, event: "constructor" }), /expects one of/);
    assert.throws(() => (Button("X") as any).behavior("toggle", { target: ids.panel, constructor: "x" }), /unknown option "constructor"/);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  it("class-typed options reject empty/whitespace values (classList would throw at event time)", () => {
    assert.throws(() => Button("X").behavior("toggleClass", { target: ids.panel, class: "a b" }), /single CSS class token/);
    assert.throws(() => Button("X").behavior("toggleClass", { target: ids.panel, class: "" }), /single CSS class token/);
    assert.throws(() => Button("X").behavior("remove", { target: ids.banner, animateOut: "fade out" }), /single CSS class token/);
    assert.doesNotThrow(() => Button("X").behavior("toggleClass", { target: ids.panel, class: "is-active" }));
  });

  it("clipboard requires one of value/path", () => {
    assert.throws(() => Button("X").behavior("clipboard", { feedback: { mode: "text", text: "!" } }), /one of "value" \/ "path" is required/);
    assert.doesNotThrow(() => Button("X").behavior("clipboard", { value: "v" }));
  });

  it("rejects ids that would corrupt the space-separated grammar", () => {
    assert.throws(() => Button("X").behavior("toggle", { target: createId("has space") }), /whitespace/);
  });

  it('defineIds/createId reserve "@self"', () => {
    assert.throws(() => createId("@self"), /reserved/);
  });
});

// ── registry (ADR-07) ────────────────────────────────────────────

describe("registerBehavior", () => {
  const spec = {
    options: { list: "id" },
    events: ["keydown"],
    fixtures: [{ list: createId("l") }],
  } as const;

  it("registers a namespaced verb and getBehaviorSpec finds it", () => {
    registerBehavior("jt:listboxNav", spec);
    assert.ok(getBehaviorSpec("jt:listboxNav"));
    assert.equal(allBehaviors().length, BUILTIN_NAMES.length + 1);
  });

  it("throws on built-in override", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberately invalid
    assert.throws(() => registerBehavior("toggle" as any, spec), /built-in/);
  });

  it("throws on a missing or invalid namespace", () => {
    assert.throws(() => registerBehavior("listboxNav", spec), /namespaced/);
    assert.throws(() => registerBehavior("j:listboxNav", spec), /namespaced/);
    assert.throws(() => registerBehavior("JT:listboxNav", spec), /namespaced/);
  });

  it("throws on duplicate registration", () => {
    registerBehavior("jt:listboxNav", spec);
    assert.throws(() => registerBehavior("jt:listboxNav", spec), /duplicate/);
  });

  it("throws on a kebab-prefix collision (prefix-extension ambiguity)", () => {
    registerBehavior("jt:listbox", spec);
    assert.throws(() => registerBehavior("jt:listboxNav", spec), /collides/);
    registerBehavior("jt:timezone", spec); // disjoint prefix still fine
  });

  it("throws without fixtures — a verb without coverage cannot register (ADR-12)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberately invalid
    assert.throws(() => registerBehavior("jt:bare", { options: {}, events: ["click"], fixtures: [] as any }), /fixture/);
  });

  it("throws on unknown events — including prototype keys", () => {
    /* eslint-disable @typescript-eslint/no-explicit-any -- deliberately invalid */
    assert.throws(() => registerBehavior("jt:odd", { ...spec, events: ["keyup" as any] }), /unknown event/);
    assert.throws(() => registerBehavior("jt:odd", { ...spec, events: ["constructor" as any] }), /unknown event/);
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  it("throws after seal; rendering an unregistered verb still throws", () => {
    sealBehaviorRegistry();
    assert.throws(() => registerBehavior("jt:late", spec), /sealed/);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- deliberately bypassing the typed surface
    assert.throws(() => (Button("X") as any).behavior("jt:late"), /unknown behavior/);
  });

  it("prototype keys are not verbs", () => {
    assert.equal(getBehaviorSpec("constructor"), undefined);
    assert.equal(BUILTIN_META["constructor"], undefined);
  });

  it("registryHash — stable for builtins, changes with registration", () => {
    const base = registryHash();
    assert.match(base, /^[0-9a-f]{8}$/);
    assert.equal(registryHash(), base);
    registerBehavior("jt:listboxNav", spec);
    assert.notEqual(registryHash(), base);
  });
});

// ── single-source pins (ADR-10 / size-budget projections) ────────

describe("derived-table pins", () => {
  it("LISTEN_SET is exactly the deduped EVENT_TABLE listen set", () => {
    assert.deepEqual([...LISTEN_SET], [...new Set(Object.values(EVENT_TABLE).map((b) => b.listen))]);
  });

  it("BUILTIN_META matches BUILTIN_SPECS (triggers, consume, preventDefault) for every verb", () => {
    assert.deepEqual(Object.keys(BUILTIN_META).sort(), [...BUILTIN_NAMES].sort());
    for (const name of BUILTIN_NAMES) {
      const spec = BUILTIN_SPECS[name]!;
      const meta = BUILTIN_META[name]!;
      const triggers = spec.events
        .map((e) => (e in HTMX_EVENTS ? HTMX_EVENTS[e as keyof typeof HTMX_EVENTS] : EVENT_TABLE[e as keyof typeof EVENT_TABLE].listen))
        .join(" ");
      assert.equal(meta[0], triggers, `${name}: triggers`);
      assert.equal(meta[1] === 1, spec.consume === true, `${name}: consume`);
      assert.equal(meta[2] === 1, spec.preventDefault === true, `${name}: preventDefault`);
    }
  });

  it("every built-in has ≥ 1 fixture and every fixture emits cleanly", () => {
    for (const { name, fixtures } of allBehaviors()) {
      assert.ok(fixtures.length >= 1, `${name} has no fixtures`);
      for (const fixture of fixtures) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- fixtures are untyped bags by design
        assert.doesNotThrow(() => render((Div() as any).behavior(name, fixture)), `${name} fixture failed to emit`);
      }
    }
  });

  it("all 10 built-ins exist — the ADR-09 vocabulary, nothing else", () => {
    assert.deepEqual(
      [...BUILTIN_NAMES].sort(),
      ["back", "clipboard", "drawer", "focus", "onClickOutside", "onEscape", "remove", "resetOnSuccess", "toggle", "toggleClass"],
    );
  });

  it(".hxOn is gone", () => {
    assert.equal((Tag.prototype as unknown as Record<string, unknown>)["hxOn"], undefined);
  });
});

// ── wire decode (client-shared, DOM-free) ────────────────────────

describe("decodeOptions", () => {
  it("decodes numbers, booleans, lists and reconstructs nested groups", () => {
    const attrs: Record<string, string> = {
      "data-behavior-clipboard-path": "/x",
      "data-behavior-clipboard-feedback-mode": "text",
      "data-behavior-clipboard-feedback-duration-ms": "300",
    };
    const decoded = decodeOptions("clipboard", BUILTIN_SPECS["clipboard"]!.options, (n) => attrs[n] ?? null);
    assert.deepEqual(decoded, { path: "/x", feedback: { mode: "text", durationMs: 300 } });
  });

  it("decodes id-lists and enum-lists as arrays; booleans as booleans", () => {
    const attrs: Record<string, string> = {
      "data-behavior-drawer-target": "menu",
      "data-behavior-drawer-close-on": "escape nav",
      "data-behavior-drawer-trap-focus": "true",
    };
    const decoded = decodeOptions("drawer", BUILTIN_SPECS["drawer"]!.options, (n) => attrs[n] ?? null);
    assert.deepEqual(decoded, { target: "menu", closeOn: ["escape", "nav"], trapFocus: true });
  });

  it("optionAttr/verbPrefix — double-hyphen namespace grammar", () => {
    assert.equal(verbPrefix("toggleClass"), "toggle-class");
    assert.equal(verbPrefix("jt:listboxNav"), "jt--listbox-nav");
    assert.equal(optionAttr("jt:listboxNav", "itemSelector"), "data-behavior-jt--listbox-nav-item-selector");
    assert.equal(optionAttr("clipboard", "feedback.durationMs"), "data-behavior-clipboard-feedback-duration-ms");
  });
});

// ── asset stamp plumbing (ADR-11) ────────────────────────────────

describe("asset stamp", () => {
  it("readAssetStamp parses the banner", () => {
    const stamp = readAssetStamp(`/*! fluent-behaviors 6.4.0:0123abcd */\n"use strict";`);
    assert.deepEqual(stamp, { version: "6.4.0", registryHash: "0123abcd" });
    assert.equal(readAssetStamp(`"use strict";`), undefined);
  });

  it("assertBehaviorRuntimeAsset — server-boot handshake (acceptance row 3, boot half)", () => {
    const current = `/*! fluent-behaviors ${behaviorStamp()} */\n"use strict";`;
    assert.doesNotThrow(() => assertBehaviorRuntimeAsset(current));
    assert.throws(() => assertBehaviorRuntimeAsset(`/*! fluent-behaviors 0.0.0:00000000 */\n`), /asset mismatch/);
    assert.throws(() => assertBehaviorRuntimeAsset(`"use strict";`), /asset mismatch/);
  });
});
