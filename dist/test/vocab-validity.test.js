/**
 * Vocab validity oracle (llm-styling/vocab-generator, CI job 2).
 *
 * Every vocab row's emissions — the row's own `samples` plus the real-value
 * arg tuples below — are compiled through Tailwind's `candidatesToCss`; a
 * `null` result means the class does not exist in Tailwind v4 and the test
 * fails. This is what catches bugs like the historical `gradientConic` sample
 * emitting `bg-conic-undefined/longer`.
 *
 * Requires the exact-pinned tailwindcss devDependency (see
 * scripts/gen-vocab/load-design-system.ts). Runs against dist output like all
 * other tests.
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { classVocab, emitClasses } from "../src/class-vocab/index.js";
import { loadDesignSystem } from "../scripts/gen-vocab/load-design-system.js";
/**
 * Real-value arg tuples per method, exercising every arm of its emit shape
 * (bare, value, direction, unit overload) with values that must exist in
 * Tailwind. Rows that carry `samples` in the vocab are validated from those
 * and need no entry here unless extra arms are worth pinning.
 */
const ORACLE_ARGS = {
    // Spacing
    p: [["4"], ["x", "4"], ["top", "2"], ["px", "16"]],
    m: [["4"], ["x", "4"], ["top", "2"], ["px", "16"]],
    px: [["4"], ["px", "16"]],
    py: [["4"]],
    pt: [["2"]],
    pb: [["2"]],
    pl: [["2"]],
    pr: [["2"]],
    mx: [["4"], ["auto"]],
    my: [["4"], ["auto"]],
    mt: [["2"], ["auto"]],
    mb: [["2"], ["auto"]],
    ml: [["2"], ["auto"]],
    mr: [["2"], ["auto"]],
    spaceX: [["4"]],
    spaceY: [["4"]],
    gap: [["4"], ["x", "4"], ["px", "16"]],
    // Colors
    bg: [["blue-500"], ["transparent"]],
    // Typography (merged .text() / .font())
    text: [["lg"], ["px", "13"], ["red-500"], ["center"], ["balance"]],
    font: [["semibold"], ["mono"]],
    leading: [["tight"], ["6"]],
    tracking: [["wide"]],
    whitespace: [["nowrap"]],
    underlineOffset: [["2"], ["px", "3"]],
    lineClamp: [["3"]],
    // Sizing
    w: [["full"], ["px", "180"]],
    h: [["8"], ["dvh", "100"]],
    maxW: [["md"], ["rem", "12"]],
    minW: [["0"]],
    maxH: [["screen"]],
    minH: [["screen"], ["px", "180"]],
    aspect: [["video"], ["square"]],
    // Flexbox (merged .flex())
    flex: [[], ["1"], ["auto"], ["col"], ["row-reverse"], ["wrap"]],
    justify: [["between"], ["center"]],
    items: [["center"], ["start"]],
    self: [["start"]],
    shrink: [[], ["0"]],
    grow: [[], ["0"]],
    // Grid
    grid: [[]],
    gridCols: [["3"], ["none"]],
    gridRows: [["2"]],
    gridFlow: [["row"], ["col-dense"]],
    autoRows: [["min"]],
    autoCols: [["fr"]],
    colSpan: [["2"], ["full"]],
    order: [["1"], ["first"]],
    // Place
    placeContent: [["center"]],
    placeItems: [["center"]],
    placeSelf: [["center"]],
    // Borders
    divideX: [[], ["2"]],
    divideY: [[], ["2"]],
    // Effects & Appearance (merged .shadow())
    shadow: [[], ["md"], ["red-500"]],
    opacity: [["50"]],
    cursor: [["pointer"], ["not-allowed"]],
    absolute: [[]],
    relative: [[]],
    fixed: [[]],
    sticky: [[]],
    static: [[]],
    z: [["10"]],
    overflow: [["hidden"], ["x", "auto"]],
    object: [["cover"]],
    // Layout & Display
    block: [[]],
    inlineBlock: [[]],
    inline: [[]],
    inlineFlex: [[]],
    inlineGrid: [[]],
    contents: [[]],
    hidden: [[]],
    inset: [["0"], ["px", "10"]],
    top: [["0"], ["px", "10"]],
    right: [["0"]],
    bottom: [["0"]],
    left: [["0"]],
    // Transitions & Animation (merged .transition())
    transition: [[], ["colors"], ["discrete"]],
    duration: [["150"]],
    animate: [["spin"]],
    ease: [["in-out"]],
    // Ring (merged .ring())
    ring: [[], ["2"], ["blue-300"]],
    // Transforms
    scale: [["105"]],
    // Interactivity
    select: [["none"]],
    pointerEvents: [["none"]],
    appearance: [["none"], ["auto"]],
    // List Style (merged .list())
    list: [["disc"], ["inside"]],
    // Accessibility
    srOnly: [[]],
    // Outline (`hidden` absorbed from outlineHidden)
    outline: [["2"], ["none"], ["hidden"]],
    // Typography statics
    italic: [[]],
    uppercase: [[]],
    lowercase: [[]],
    capitalize: [[]],
    underline: [[]],
    noUnderline: [[]],
    lineThrough: [[]],
    truncate: [[]],
    antialiased: [[]],
    tabularNums: [[]],
    breakAll: [[]],
    // Container queries
    containerQuery: [[], ["sidebar"]],
    // Filters
    blur: [[], ["sm"]],
    backdropBlur: [[], ["sm"]],
    brightness: [["50"]],
    backdropBrightness: [["50"]],
    contrast: [["125"]],
    backdropContrast: [["125"]],
    grayscale: [[], ["0"]],
    backdropGrayscale: [[], ["0"]],
    hueRotate: [["90"]],
    backdropHueRotate: [["90"]],
    invert: [[], ["0"]],
    backdropInvert: [[], ["0"]],
    saturate: [["150"]],
    backdropSaturate: [["150"]],
    sepia: [[], ["0"]],
    backdropSepia: [[], ["0"]],
    // Timing / Resize / Overscroll
    willChange: [["transform"]],
    resize: [[], ["y"]],
    overscroll: [["contain"], ["y", "contain"]],
    // Negative value prefix
    neg: [["inset-px"], ["mt-4"]],
    // SVG / form accents (merged .stroke() / .decoration())
    fill: [["red-500"], ["none"]],
    stroke: [["red-500"], ["none"], ["2"], ["px", "3"]],
    accent: [["pink-500"]],
    caret: [["blue-500"]],
    scheme: [["light"], ["dark"]],
    decoration: [["red-500"], ["wavy"], ["2"], ["px", "3"], ["from-font"]],
    // Logical / axis insets
    insetX: [["0"], ["px", "10"]],
    insetY: [["0"]],
    insetS: [["0"]],
    insetE: [["0"]],
    // Text extras
    wrap: [["break-word"], ["anywhere"]],
    hyphens: [["auto"]],
    // Shadow-family merges (size | color)
    textShadow: [["md"], ["red-500"]],
    dropShadow: [["md"], ["red-500"]],
    insetShadow: [["sm"], ["red-500"]],
    insetRing: [[], ["2"], ["red-500"]],
    mixBlend: [["multiply"]],
    bgBlend: [["multiply"]],
    isolate: [[]],
    isolation: [["auto"]],
    // Transition extras
    delay: [["150"]],
    // 3D transforms
    perspective: [["distant"]],
    perspectiveOrigin: [["center"]],
    transform: [["flat"], ["3d"]],
    backface: [["hidden"]],
    scale3d: [[]],
    // Grid placement extras
    rowSpan: [["2"]],
    columns: [["3"]],
    breakBefore: [["page"]],
    breakAfter: [["page"]],
    breakInside: [["avoid"]],
    boxDecoration: [["clone"]],
    // Scroll & snap
    snapStop: [["always"]],
    scroll: [["smooth"]],
    scrollM: [["4"], ["top", "2"], ["px", "16"]],
    scrollP: [["4"], ["top", "2"], ["px", "16"]],
    fieldSizing: [["content"]],
    // Mask
    maskType: [["luminance"]],
    // Deliberately non-Tailwind rows (validated by the KNOWN_NON_TAILWIND test)
    group: [[], ["nav"]],
    peer: [[], ["checkbox"]],
    htmxIndicator: [[]],
};
/**
 * Rows whose emissions are deliberately NOT Tailwind classes. The oracle must
 * report them invalid — if Tailwind ever starts compiling one, this list is
 * stale and the test fails, forcing a conscious re-classification.
 */
const KNOWN_NON_TAILWIND = new Map([
    ["group", "marker class consumed by group-* variants; compiles to no CSS"],
    ["peer", "marker class consumed by peer-* variants; compiles to no CSS"],
    ["htmxIndicator", "htmx's loading-indicator class, styled by htmx.css, not Tailwind"],
]);
function argTuplesFor(method, samples) {
    return [...(samples ?? []), ...(ORACLE_ARGS[method] ?? [])];
}
describe("vocab validity oracle — every emission compiles in Tailwind", () => {
    let design;
    before(async () => {
        ({ design } = await loadDesignSystem());
    });
    it("every vocab row has oracle coverage (samples or ORACLE_ARGS)", () => {
        const uncovered = classVocab
            .filter((def) => argTuplesFor(def.method, def.samples).length === 0)
            .map((def) => def.method);
        assert.deepEqual(uncovered, [], `add ORACLE_ARGS (or samples) for: ${uncovered.join(", ")}`);
    });
    it("ORACLE_ARGS has no orphan entries", () => {
        const methods = new Set(classVocab.map((d) => d.method));
        const orphans = Object.keys(ORACLE_ARGS).filter((m) => !methods.has(m));
        assert.deepEqual(orphans, [], `ORACLE_ARGS entries without a vocab row: ${orphans.join(", ")}`);
    });
    // Every `values.literals` member × the row's emit shape must compile — the
    // generated type unions (tailwind-types.gen.ts) are rendered from these
    // lists, so an invalid member would ship as a typed-but-dead value. Merged
    // methods contribute one list per literals group (`text.align`, `flex.wrap`, …).
    for (const def of classVocab) {
        if (KNOWN_NON_TAILWIND.has(def.method))
            continue;
        const lists = [];
        if (def.values?.kind === "literals")
            lists.push({ label: def.method, list: def.values.list });
        if (def.values?.kind === "group") {
            for (const [name, spec] of Object.entries(def.values.groups)) {
                if (spec.kind === "literals")
                    lists.push({ label: `${def.method}.${name}`, list: spec.list });
            }
        }
        for (const { label, list } of lists) {
            it(`${label} literals all compile (${list.length} members)`, () => {
                for (const member of list) {
                    const tuples = [[member]];
                    if (def.emit.kind === "spacing")
                        tuples.push(["x", member], ["y", member]);
                    for (const args of tuples) {
                        for (const cls of emitClasses(def.emit, args)) {
                            assert.notEqual(design.candidatesToCss([cls])[0], null, `.${def.method}(${JSON.stringify(args)}) emitted "${cls}", which Tailwind does not compile — fix the values.literals list`);
                        }
                    }
                }
            });
        }
    }
    for (const def of classVocab) {
        if (KNOWN_NON_TAILWIND.has(def.method))
            continue;
        it(`${def.method} emits only valid Tailwind classes`, () => {
            for (const args of argTuplesFor(def.method, def.samples)) {
                const classes = emitClasses(def.emit, args);
                assert.ok(classes.length > 0, `.${def.method}(${JSON.stringify(args)}) emitted nothing`);
                const css = design.candidatesToCss([...classes]);
                classes.forEach((cls, i) => {
                    assert.notEqual(css[i], null, `.${def.method}(${JSON.stringify(args)}) emitted "${cls}", which Tailwind does not compile`);
                });
            }
        });
    }
    it("KNOWN_NON_TAILWIND rows really are invisible to Tailwind", () => {
        for (const [method, reason] of KNOWN_NON_TAILWIND) {
            const def = classVocab.find((d) => d.method === method);
            assert.ok(def, `KNOWN_NON_TAILWIND row "${method}" is not in the vocab`);
            for (const args of argTuplesFor(method, def.samples)) {
                for (const cls of emitClasses(def.emit, args)) {
                    // Named group/peer forms (`group/nav`) parse as candidates with a
                    // modifier but still compile to no CSS.
                    assert.equal(design.candidatesToCss([cls])[0], null, `"${cls}" (${method}) now compiles in Tailwind — remove it from KNOWN_NON_TAILWIND (${reason})`);
                }
            }
        }
    });
});
//# sourceMappingURL=vocab-validity.test.js.map