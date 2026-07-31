import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

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
    ["static srOnly", "srOnly", [], ["sr-only"]],
    // prefix
    ["prefix bg", "bg", ["blue-500"], ["bg-blue-500"]],
    ["prefix gridCols", "gridCols", ["3"], ["grid-cols-3"]],
    ["custom skewX", "skewX", ["6"], ["skew-x-6"]],
    ["custom skewX negative", "skewX", ["-6"], ["-skew-x-6"]],
    // optional
    ["optional shadow bare", "shadow", [], ["shadow"]],
    ["optional shadow value", "shadow", ["md"], ["shadow-md"]],
    ["optional shadow color (merged)", "shadow", ["red-500"], ["shadow-red-500"]],
    ["optional ring value", "ring", ["2"], ["ring-2"]],
    ["optional ring color (merged)", "ring", ["blue-300"], ["ring-blue-300"]],
    ["optional group bare (slash)", "group", [], ["group"]],
    ["optional group named (slash)", "group", ["nav"], ["group/nav"]],
    // spacing — p (abbrev, no sep)
    ["spacing p value", "p", ["4"], ["p-4"]],
    ["spacing p axis", "p", ["x", "4"], ["px-4"]],
    ["spacing p long dir", "p", ["top", "2"], ["pt-2"]],
    ["spacing p unit", "p", ["px", "16"], ["p-[16px]"]],
    ["spacing p percent", "p", ["%", "50"], ["p-[50%]"]],
    // directional shorthands (sizing shape)
    ["shorthand px value", "px", ["4"], ["px-4"]],
    ["shorthand px unit", "px", ["px", "16"], ["px-[16px]"]],
    ["shorthand mx auto", "mx", ["auto"], ["mx-auto"]],
    ["shorthand mt value", "mt", ["2"], ["mt-2"]],
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
    // merged text/font (size shape + one prefix)
    ["merged text size", "text", ["lg"], ["text-lg"]],
    ["merged text color", "text", ["red-500"], ["text-red-500"]],
    ["merged text align", "text", ["center"], ["text-center"]],
    ["merged text wrap", "text", ["balance"], ["text-balance"]],
    ["merged text unit", "text", ["px", "13"], ["text-[13px]"]],
    ["merged font weight", "font", ["bold"], ["font-bold"]],
    ["merged font family", "font", ["mono"], ["font-mono"]],
    // static shortcuts (A-07: replaced the display/position passthroughs)
    ["static block", "block", [], ["block"]],
    ["static absolute", "absolute", [], ["absolute"]],
    ["static contents", "contents", [], ["contents"]],
    ["static htmxIndicator", "htmxIndicator", [], ["htmx-indicator"]],
    ["merged flex shorthand", "flex", ["1"], ["flex-1"]],
    ["merged flex direction", "flex", ["col"], ["flex-col"]],
    ["merged flex wrap", "flex", ["wrap"], ["flex-wrap"]],
    // value
    ["value neg (dash prefix)", "neg", ["inset-px"], ["-inset-px"]],
    // custom
    ["custom border bare", "border", [], ["border"]],
    ["custom border width", "border", ["2"], ["border-2"]],
    ["custom border dir", "border", ["top", "2"], ["border-t-2"]],
    ["custom border style (merged)", "border", ["dashed"], ["border-dashed"]],
    ["custom border color (merged)", "border", ["red-500"], ["border-red-500"]],
    ["custom border color dir (merged)", "border", ["top", "red-500"], ["border-t-red-500"]],
    ["custom rounded bare", "rounded", [], ["rounded"]],
    ["custom rounded corner", "rounded", ["tl", "lg"], ["rounded-tl-lg"]],
    // merged bgLinear (direction | angle)
    ["merged bgLinear direction", "bgLinear", ["to-r"], ["bg-linear-to-r"]],
    ["merged bgLinear angle", "bgLinear", ["45"], ["bg-linear-45"]],
    ["merged bgLinear negative angle", "bgLinear", ["-65"], ["-bg-linear-65"]],
    ["merged bgLinear interpolation", "bgLinear", ["to-r", "oklch"], ["bg-linear-to-r/oklch"]],
    // merged mask (image | composite)
    ["merged mask none", "mask", ["none"], ["mask-none"]],
    ["merged mask composite", "mask", ["add"], ["mask-add"]],
    ["merged mask arbitrary", "mask", ["[url(/x.png)]"], ["mask-[url(/x.png)]"]],
    // merged list / outline absorb
    ["merged list type", "list", ["disc"], ["list-disc"]],
    ["merged list position", "list", ["inside"], ["list-inside"]],
    ["outline hidden (absorbed)", "outline", ["hidden"], ["outline-hidden"]],
    // escape-hatch gap fills
    ["prefix appearance", "appearance", ["none"], ["appearance-none"]],
    ["prefix wrap", "wrap", ["anywhere"], ["wrap-anywhere"]],
    ["custom content bare (empty string)", "content", [], ["content-['']"]],
    ["custom content none", "content", ["none"], ["content-none"]],
    ["custom content arbitrary", "content", ["[attr(data-label)]"], ["content-[attr(data-label)]"]],
    // typed escapes
    ["custom cssProp simple", "cssProp", ["mask-repeat", "no-repeat"], ["[mask-repeat:no-repeat]"]],
    ["custom cssProp spaces → underscores", "cssProp", ["border", "1px solid red"], ["[border:1px_solid_red]"]],
    ["custom cssProp custom property", "cssProp", ["--brand-glow", "0 0 4px red"], ["[--brand-glow:0_0_4px_red]"]],
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
  if (!m) return "";
  // Decode escapeAttr's entities back to the DOM-level class value the browser
  // sees (content-[&#39;&#39;] → content-['']) so parity compares real classes.
  return m[1]!
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
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
    assert.equal(prefixOf("p"), "p");
    assert.equal(prefixOf("m"), "m");
    assert.equal(prefixOf("px"), "px");
    assert.equal(prefixOf("mx"), "mx");
    assert.equal(prefixOf("bg"), "bg");
    assert.equal(prefixOf("text"), "text");
    assert.equal(prefixOf("w"), "w");
    assert.equal(prefixOf("minH"), "min-h");
    assert.equal(prefixOf("gridCols"), "grid-cols");
  });

  it("returns the full class for static rows", () => {
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

// ---------------------------------------------------------------------------
// 5. Reverse parity (F-A-163) — every class-emitting prototype method must be in
//    classVocab, or the extractor/eslint will never know about the class it emits.
//    (The forward loop above checks every vocab row HAS a method; this is the mirror.)
// ---------------------------------------------------------------------------

describe("reverse class-vocab parity", () => {
  // Non-utility class touchers that legitimately call addClass but aren't vocab rows.
  const STRUCTURAL = new Set(["setClass", "addClass", "setClasses", "on", "at", "apply", "when", "whenElse"]);
  const SOURCES = ["tailwind-methods.ts", "htmx-methods.ts"].map((f) =>
    readFileSync(fileURLToPath(new URL(`../../src/core/${f}`, import.meta.url)), "utf8"),
  );

  /** `p.<name> = function … { … }` defs whose body emits a class-shaped literal via addClass. */
  function scanEmitters(): { name: string; emits: boolean }[] {
    const out: { name: string; emits: boolean }[] = [];
    const defRe = /(?:^|\n)\s*p\.([A-Za-z_$][\w$]*)\s*=\s*function\b([\s\S]*?)(?=(?:\n\s*p\.[A-Za-z_$][\w$]*\s*=)|$)/g;
    for (const src of SOURCES) {
      let m: RegExpExecArray | null;
      while ((m = defRe.exec(src)) !== null) {
        out.push({ name: m[1]!, emits: /this\.addClass\(\s*[`"'][:\w[-]/.test(m[2]!) });
      }
    }
    return out;
  }

  it("the source scan has teeth (finds the class emitters)", () => {
    const emitters = scanEmitters().filter((e) => e.emits);
    assert.ok(emitters.length >= 100, `expected the scan to find ≥100 class emitters, got ${emitters.length}`);
  });

  it("every class-emitting prototype method is registered in classVocab", () => {
    const vocab = new Set(classVocab.map((d) => d.method));
    const missing = scanEmitters()
      .filter((e) => e.emits && !vocab.has(e.name) && !STRUCTURAL.has(e.name))
      .map((e) => e.name);
    assert.deepEqual(missing, [], `class emitters missing from classVocab: ${JSON.stringify(missing)}`);
  });
});
