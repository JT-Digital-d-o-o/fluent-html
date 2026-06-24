import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { render, Div } from "../src/index.js";
import { Tag } from "../src/core/index.js";
import { classVocab, emitClasses, prefixOf } from "../src/class-vocab/index.js";
import type { UtilityDef } from "../src/class-vocab/index.js";

// ---------------------------------------------------------------------------
// 1. emitClasses — hand-picked exact assertions (one+ per shape kind).
//    Independent of the lib, so an emit-logic bug is caught even if the lib
//    drifts the same way.
// ---------------------------------------------------------------------------

describe("emitClasses — per-shape exact output", () => {
  const cases: Array<[label: string, method: string, args: string[], expected: string[]]> = [
    // static
    ["static bold", "bold", [], ["font-bold"]],
    ["static srOnly", "srOnly", [], ["sr-only"]],
    // prefix
    ["prefix background", "background", ["blue-500"], ["bg-blue-500"]],
    ["prefix gridCols", "gridCols", ["3"], ["grid-cols-3"]],
    ["custom skewX", "skewX", ["6"], ["skew-x-6"]],
    ["custom skewX negative", "skewX", ["-6"], ["-skew-x-6"]],
    // optional
    ["optional shadow bare", "shadow", [], ["shadow"]],
    ["optional shadow value", "shadow", ["md"], ["shadow-md"]],
    ["optional ring value", "ring", ["2"], ["ring-2"]],
    ["optional group bare (slash)", "group", [], ["group"]],
    ["optional group named (slash)", "group", ["nav"], ["group/nav"]],
    // spacing — padding (abbrev, no sep)
    ["spacing padding value", "padding", ["4"], ["p-4"]],
    ["spacing padding axis", "padding", ["x", "4"], ["px-4"]],
    ["spacing padding long dir", "padding", ["top", "2"], ["pt-2"]],
    ["spacing padding unit", "padding", ["px", "16"], ["p-[16px]"]],
    ["spacing padding percent", "padding", ["%", "50"], ["p-[50%]"]],
    // spacing — gap (sep "-", no abbrev)
    ["spacing gap value", "gap", ["4"], ["gap-4"]],
    ["spacing gap axis", "gap", ["x", "4"], ["gap-x-4"]],
    ["spacing overflow value (no units)", "overflow", ["hidden"], ["overflow-hidden"]],
    ["spacing overflow axis (no units)", "overflow", ["x", "auto"], ["overflow-x-auto"]],
    ["custom translate axis", "translate", ["x", "2"], ["translate-x-2"]],
    ["custom translate negative", "translate", ["y", "-1"], ["-translate-y-1"]],
    ["custom rotate negative", "rotate", ["-45"], ["-rotate-45"]],
    // sizing
    ["sizing w value", "w", ["full"], ["w-full"]],
    ["sizing w unit", "w", ["px", "180"], ["w-[180px]"]],
    ["sizing minH unit", "minH", ["px", "180"], ["min-h-[180px]"]],
    // static shortcuts (A-07: replaced the display/position passthroughs)
    ["static block", "block", [], ["block"]],
    ["static absolute", "absolute", [], ["absolute"]],
    ["static contents", "contents", [], ["contents"]],
    ["prefix flexShorthand", "flexShorthand", ["1"], ["flex-1"]],
    // value
    ["value neg (dash prefix)", "neg", ["inset-px"], ["-inset-px"]],
    // custom
    ["custom border bare", "border", [], ["border"]],
    ["custom border width", "border", ["2"], ["border-2"]],
    ["custom border dir", "border", ["top", "2"], ["border-t-2"]],
    ["custom borderColor", "borderColor", ["red-500"], ["border-red-500"]],
    ["custom borderColor dir", "borderColor", ["top", "red-500"], ["border-t-red-500"]],
    ["custom rounded bare", "rounded", [], ["rounded"]],
    ["custom rounded corner", "rounded", ["tl", "lg"], ["rounded-tl-lg"]],
  ];

  const byMethod = new Map(classVocab.map((d) => [d.method, d]));

  for (const [label, method, args, expected] of cases) {
    it(label, () => {
      const def = byMethod.get(method);
      assert.ok(def, `vocab has a row for "${method}"`);
      assert.deepEqual(emitClasses(def!.emit, args), expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Lib parity — THE anti-drift guard. Render each method through the real
//    library and assert the emitted class string equals emitClasses() from the
//    vocab. If tailwind-methods.ts and the vocab ever disagree, this fails.
// ---------------------------------------------------------------------------

/** Per-row sample arg tuples: `lib` (passed to the method, numbers for unit overloads) + `emit` (strings, for emitClasses). */
function samplesFor(def: UtilityDef): Array<{ lib: Array<string | number>; emit: string[] }> {
  const s = def.emit;
  switch (s.kind) {
    case "static":
      return [{ lib: [], emit: [] }];
    case "prefix":
      return [{ lib: ["v"], emit: ["v"] }];
    case "optional":
      return [{ lib: [], emit: [] }, { lib: ["v"], emit: ["v"] }];
    case "value":
      return [{ lib: ["block"], emit: ["block"] }];
    case "spacing": {
      const base: Array<{ lib: Array<string | number>; emit: string[] }> = [
        { lib: ["4"], emit: ["4"] },
        { lib: ["x", "4"], emit: ["x", "4"] },
      ];
      if (s.units) base.push({ lib: ["px", 16], emit: ["px", "16"] });
      return base;
    }
    case "sizing":
      return [
        { lib: ["full"], emit: ["full"] },
        { lib: ["px", 180], emit: ["px", "180"] },
      ];
    case "custom":
      return (def.samples ?? []).map((args) => ({ lib: [...args], emit: [...args] }));
  }
}

function renderedClass(tag: Tag): string {
  const html = render(tag);
  const m = /class="([^"]*)"/.exec(html);
  return m ? m[1]! : "";
}

describe("lib parity — vocab emit matches tailwind-methods render", () => {
  const proto = Tag.prototype as unknown as Record<string, (...a: unknown[]) => Tag>;

  for (const def of classVocab) {
    it(`${def.method} renders the vocab-emitted class`, () => {
      assert.equal(typeof proto[def.method], "function", `Tag.prototype.${def.method} exists`);
      for (const sample of samplesFor(def)) {
        const tag = (proto[def.method] as (this: Tag, ...a: unknown[]) => Tag).apply(Div(), sample.lib);
        const expected = emitClasses(def.emit, sample.emit).join(" ");
        assert.equal(
          renderedClass(tag),
          expected,
          `.${def.method}(${sample.lib.map((a) => JSON.stringify(a)).join(", ")})`,
        );
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 3. prefixOf
// ---------------------------------------------------------------------------

describe("prefixOf", () => {
  it("returns the stable prefix for prefix/spacing/sizing rows", () => {
    assert.equal(prefixOf("padding"), "p");
    assert.equal(prefixOf("margin"), "m");
    assert.equal(prefixOf("background"), "bg");
    assert.equal(prefixOf("w"), "w");
    assert.equal(prefixOf("minH"), "min-h");
    assert.equal(prefixOf("gridCols"), "grid-cols");
  });

  it("returns the full class for static rows", () => {
    assert.equal(prefixOf("bold"), "font-bold");
    assert.equal(prefixOf("srOnly"), "sr-only");
  });

  it("returns the bare prefix for optional rows", () => {
    assert.equal(prefixOf("shadow"), "shadow");
    assert.equal(prefixOf("group"), "group");
  });

  it("throws for value/custom rows (no stable prefix)", () => {
    assert.throws(() => prefixOf("display"), /no stable class prefix/);
    assert.throws(() => prefixOf("neg"), /no stable class prefix/);
    assert.throws(() => prefixOf("border"), /no stable class prefix/);
  });

  it("throws for unknown methods", () => {
    assert.throws(() => prefixOf("notAMethod"), /unknown/);
  });
});

// ---------------------------------------------------------------------------
// 4. Vocab integrity
// ---------------------------------------------------------------------------

describe("classVocab integrity", () => {
  it("has no duplicate method rows", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const def of classVocab) {
      if (seen.has(def.method)) dupes.push(def.method);
      seen.add(def.method);
    }
    assert.deepEqual(dupes, [], "duplicate vocab rows");
  });

  it("covers the styling surface (~120 rows)", () => {
    assert.ok(classVocab.length >= 100, `expected ≥100 rows, got ${classVocab.length}`);
  });

  it("every custom row carries samples for the round-trip test", () => {
    for (const def of classVocab) {
      if (def.emit.kind === "custom") {
        assert.ok(def.samples && def.samples.length > 0, `custom row "${def.method}" needs samples`);
      }
    }
  });
});
