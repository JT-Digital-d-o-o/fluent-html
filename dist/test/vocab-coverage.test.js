/**
 * Coverage watch (llm-styling/vocab-generator, CI job 3).
 *
 * Diffs Tailwind's utility-root registry against what the vocab can emit.
 * Every root must be either coverable by a vocab row or consciously listed in
 * IGNORED_ROOTS with a reason — so a Tailwind bump that introduces new
 * utility families fails here until each new root is added to the vocab or
 * ignored on purpose. The known gap families are filed in
 * project/pm/llm-styling/vocab-generator/backlog.md.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { loadDesignSystem } from "../scripts/gen-vocab/load-design-system.js";
import { uncoveredRoots } from "../scripts/gen-vocab/vocab-coverage.js";
/**
 * Utility-root families the vocab deliberately does not emit (yet). An entry
 * matches the root itself and any `-`-separated extension of it. Entries that
 * stop matching anything (root gained a vocab row, or vanished upstream) fail
 * the staleness test below — the list can only shrink consciously.
 */
const IGNORED_ROOTS = [
    // Pruned in 8.0.0 — zero call sites across the 40-repo census; the classes
    // stay reachable via `.variant()`/`.cssProp()` (see CHANGELOG [8.0.0]).
    { prefix: "backdrop-brightness", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "backdrop-contrast", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "backdrop-grayscale", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "backdrop-hue-rotate", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "backdrop-invert", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "backdrop-saturate", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "backdrop-sepia", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "backface", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "break-after", reason: "pruned 8.0.0: zero fleet use (break-inside stays — live use)" },
    { prefix: "break-before", reason: "pruned 8.0.0: zero fleet use (break-inside stays — live use)" },
    { prefix: "field-sizing", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "hyphens", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "isolation", reason: "pruned 8.0.0: zero fleet use (isolate stays)" },
    { prefix: "mask", reason: "pruned 8.0.0: zero fleet use (whole mask family)" },
    { prefix: "place", reason: "pruned 8.0.0: zero fleet use (place-content/items/self)" },
    { prefix: "scheme", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "skew", reason: "pruned 8.0.0: zero fleet use" },
    { prefix: "snap", reason: "pruned 8.0.0: zero fleet use (whole snap family)" },
    // Backlog — no fluent method yet (see vocab-generator/backlog.md)
    { prefix: "align", reason: "backlog: vertical-align" },
    { prefix: "basis", reason: "backlog: flex-basis" },
    { prefix: "size", reason: "backlog: size-* (width+height shorthand)" },
    { prefix: "origin", reason: "backlog: transform-origin" },
    { prefix: "indent", reason: "backlog: text-indent" },
    { prefix: "tab", reason: "backlog: tab-size" },
    { prefix: "contain", reason: "backlog: contain-*" },
    { prefix: "container", reason: "backlog: fixed-width container (container queries are covered)" },
    { prefix: "filter", reason: "backlog: bare filter enable/disable" },
    { prefix: "backdrop-filter", reason: "backlog: bare backdrop-filter enable/disable" },
    { prefix: "backdrop-opacity", reason: "backlog: backdrop opacity filter" },
    { prefix: "scrollbar", reason: "backlog: scrollbar-* incl. scrollbar-thumb/track colors" },
    { prefix: "start", reason: "backlog: logical inset start" },
    { prefix: "end", reason: "backlog: logical inset end" },
    { prefix: "ms", reason: "backlog: logical margin inline-start" },
    { prefix: "me", reason: "backlog: logical margin inline-end" },
    { prefix: "mbs", reason: "backlog: logical margin block-start" },
    { prefix: "mbe", reason: "backlog: logical margin block-end" },
    { prefix: "ps", reason: "backlog: logical padding inline-start" },
    { prefix: "pe", reason: "backlog: logical padding inline-end" },
    { prefix: "pbs", reason: "backlog: logical padding block-start" },
    { prefix: "pbe", reason: "backlog: logical padding block-end" },
    { prefix: "block", reason: "backlog: logical sizing block-* (display block is covered)" },
    { prefix: "inline", reason: "backlog: logical sizing inline-* (display inline is covered)" },
    { prefix: "min-block", reason: "backlog: logical sizing min-block-*" },
    { prefix: "max-block", reason: "backlog: logical sizing max-block-*" },
    { prefix: "min-inline", reason: "backlog: logical sizing min-inline-*" },
    { prefix: "max-inline", reason: "backlog: logical sizing max-inline-*" },
    { prefix: "box", reason: "backlog: box-sizing" },
    { prefix: "break-keep", reason: "backlog: word-break (only break-all is covered)" },
    { prefix: "break-normal", reason: "backlog: word-break" },
    { prefix: "break-words", reason: "backlog: word-break" },
    { prefix: "caption", reason: "backlog: caption-side (tables)" },
    { prefix: "clear", reason: "backlog: float clearing" },
    { prefix: "float", reason: "backlog: floats" },
    { prefix: "flow-root", reason: "backlog: display flow-root" },
    { prefix: "inline-table", reason: "backlog: display inline-table" },
    { prefix: "collapse", reason: "backlog: visibility collapse" },
    { prefix: "visible", reason: "backlog: visibility visible" },
    { prefix: "touch", reason: "backlog: touch-action" },
    { prefix: "zoom", reason: "backlog: zoom" },
    { prefix: "placeholder", reason: "backlog: placeholder color" },
    { prefix: "forced-color-adjust", reason: "backlog: forced colors a11y" },
    { prefix: "not-sr-only", reason: "backlog: sr-only inverse" },
    { prefix: "not-italic", reason: "backlog: italic inverse" },
    { prefix: "normal-case", reason: "backlog: text-transform reset" },
    { prefix: "overline", reason: "backlog: text-decoration overline" },
    { prefix: "subpixel-antialiased", reason: "backlog: antialiased inverse" },
    { prefix: "lining-nums", reason: "backlog: font-variant-numeric (only tabular-nums is covered)" },
    { prefix: "oldstyle-nums", reason: "backlog: font-variant-numeric" },
    { prefix: "normal-nums", reason: "backlog: font-variant-numeric" },
    { prefix: "proportional-nums", reason: "backlog: font-variant-numeric" },
    { prefix: "diagonal-fractions", reason: "backlog: font-variant-numeric" },
    { prefix: "stacked-fractions", reason: "backlog: font-variant-numeric" },
    { prefix: "slashed-zero", reason: "backlog: font-variant-numeric" },
    { prefix: "ordinal", reason: "backlog: font-variant-numeric" },
];
const matchesIgnore = (root) => IGNORED_ROOTS.some((e) => root === e.prefix || root.startsWith(`${e.prefix}-`));
describe("vocab coverage watch — Tailwind roots vs vocab", () => {
    let design;
    let uncovered;
    before(async () => {
        ({ design } = await loadDesignSystem());
        uncovered = uncoveredRoots(design);
    });
    it("the registry loaded fully (sanity)", () => {
        const total = design.utilities.keys("functional").length + design.utilities.keys("static").length;
        assert.ok(total >= 1200, `expected ≥1200 utility roots, got ${total}`);
    });
    it("every uncovered root is consciously ignored", () => {
        const unaccounted = uncovered.filter((r) => !matchesIgnore(r));
        assert.deepEqual(unaccounted, [], `new Tailwind utility roots without a vocab row — add a row or an IGNORED_ROOTS entry with a reason: ${unaccounted.join(", ")}`);
    });
    it("no stale ignore entries", () => {
        const stale = IGNORED_ROOTS.filter((e) => !uncovered.some((r) => r === e.prefix || r.startsWith(`${e.prefix}-`))).map((e) => e.prefix);
        assert.deepEqual(stale, [], `IGNORED_ROOTS entries that no longer match any uncovered root (vocab row added, or root removed upstream): ${stale.join(", ")}`);
    });
});
//# sourceMappingURL=vocab-coverage.test.js.map