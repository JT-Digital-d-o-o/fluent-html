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
import type { DesignSystem } from "../scripts/gen-vocab/load-design-system.js";

/**
 * Real-value arg tuples per method, exercising every arm of its emit shape
 * (bare, value, direction, unit overload) with values that must exist in
 * Tailwind. Rows that carry `samples` in the vocab are validated from those
 * and need no entry here unless extra arms are worth pinning.
 */
const ORACLE_ARGS: Readonly<Record<string, readonly (readonly string[])[]>> = {
  // Spacing
  padding: [["4"], ["x", "4"], ["top", "2"], ["px", "16"]],
  margin: [["4"], ["x", "4"], ["top", "2"], ["px", "16"]],
  spaceX: [["4"]],
  spaceY: [["4"]],
  gap: [["4"], ["x", "4"], ["px", "16"]],
  // Colors
  background: [["blue-500"], ["transparent"]],
  textColor: [["red-500"]],
  ringColor: [["blue-300"]],
  shadowColor: [["red-500"]],
  // Typography
  textSize: [["lg"], ["px", "13"]],
  textAlign: [["center"]],
  fontWeight: [["semibold"]],
  fontFamily: [["mono"]],
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
  // Flexbox
  flex: [[], ["1"], ["auto"]],
  flexShorthand: [["1"]],
  flexDirection: [["col"], ["row-reverse"]],
  flexWrap: [["wrap"]],
  justifyContent: [["between"], ["center"]],
  alignItems: [["center"], ["start"]],
  alignSelf: [["start"]],
  shrink: [[], ["0"]],
  grow: [[], ["0"]],
  // Grid
  grid: [[]],
  gridCols: [["3"], ["none"]],
  gridRows: [["2"]],
  gridAutoFlow: [["row"], ["col-dense"]],
  gridAutoRows: [["min"]],
  gridAutoCols: [["fr"]],
  colSpan: [["2"], ["full"]],
  order: [["1"], ["first"]],
  // Place
  placeContent: [["center"]],
  placeItems: [["center"]],
  placeSelf: [["center"]],
  // Borders
  borderStyle: [["dashed"]],
  divideX: [[], ["2"]],
  divideY: [[], ["2"]],
  // Effects & Appearance
  shadow: [[], ["md"]],
  opacity: [["50"]],
  cursor: [["pointer"], ["not-allowed"]],
  absolute: [[]],
  relative: [[]],
  fixed: [[]],
  sticky: [[]],
  static: [[]],
  zIndex: [["10"]],
  overflow: [["hidden"], ["x", "auto"]],
  objectFit: [["cover"]],
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
  // Transitions & Animation
  transition: [[], ["colors"]],
  duration: [["150"]],
  animate: [["spin"]],
  ease: [["in-out"]],
  // Ring
  ring: [[], ["2"]],
  // Transforms
  scale: [["105"]],
  // Interactivity
  select: [["none"]],
  pointerEvents: [["none"]],
  // List Style
  listStyleType: [["disc"]],
  listStylePosition: [["inside"]],
  // Accessibility
  srOnly: [[]],
  // Outline
  outline: [["2"], ["none"]],
  outlineHidden: [[]],
  // Typography statics
  bold: [[]],
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
  // SVG / form accents
  fillColor: [["red-500"]],
  strokeColor: [["red-500"]],
  strokeWidth: [["2"], ["px", "3"]],
  accentColor: [["pink-500"]],
  caretColor: [["blue-500"]],
  scheme: [["light"], ["dark"]],
  decorationColor: [["red-500"]],
  decorationStyle: [["wavy"]],
  decorationThickness: [["2"], ["px", "3"]],
  // Logical / axis insets
  insetX: [["0"], ["px", "10"]],
  insetY: [["0"]],
  insetS: [["0"]],
  insetE: [["0"]],
  // Text extras
  textWrap: [["balance"]],
  hyphens: [["auto"]],
  textShadow: [["md"]],
  textShadowColor: [["red-500"]],
  // Shadows & blend
  dropShadow: [["md"]],
  dropShadowColor: [["red-500"]],
  insetShadow: [["sm"]],
  insetShadowColor: [["red-500"]],
  insetRing: [[], ["2"]],
  insetRingColor: [["red-500"]],
  mixBlend: [["multiply"]],
  bgBlend: [["multiply"]],
  isolate: [[]],
  isolation: [["auto"]],
  // Transition extras
  delay: [["150"]],
  transitionBehavior: [["discrete"]],
  // 3D transforms
  perspective: [["distant"]],
  perspectiveOrigin: [["center"]],
  transformStyle: [["flat"]],
  backfaceVisibility: [["hidden"]],
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
  scrollBehavior: [["smooth"]],
  scrollMargin: [["4"], ["top", "2"], ["px", "16"]],
  scrollPadding: [["4"], ["top", "2"], ["px", "16"]],
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
const KNOWN_NON_TAILWIND: ReadonlyMap<string, string> = new Map([
  ["group", "marker class consumed by group-* variants; compiles to no CSS"],
  ["peer", "marker class consumed by peer-* variants; compiles to no CSS"],
  ["htmxIndicator", "htmx's loading-indicator class, styled by htmx.css, not Tailwind"],
]);

function argTuplesFor(method: string, samples: readonly (readonly string[])[] | undefined): readonly (readonly string[])[] {
  return [...(samples ?? []), ...(ORACLE_ARGS[method] ?? [])];
}

describe("vocab validity oracle — every emission compiles in Tailwind", () => {
  let design: DesignSystem;
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

  for (const def of classVocab) {
    if (KNOWN_NON_TAILWIND.has(def.method)) continue;
    it(`${def.method} emits only valid Tailwind classes`, () => {
      for (const args of argTuplesFor(def.method, def.samples)) {
        const classes = emitClasses(def.emit, args);
        assert.ok(classes.length > 0, `.${def.method}(${JSON.stringify(args)}) emitted nothing`);
        const css = design.candidatesToCss([...classes]);
        classes.forEach((cls, i) => {
          assert.notEqual(
            css[i],
            null,
            `.${def.method}(${JSON.stringify(args)}) emitted "${cls}", which Tailwind does not compile`,
          );
        });
      }
    });
  }

  it("KNOWN_NON_TAILWIND rows really are invisible to Tailwind", () => {
    for (const [method, reason] of KNOWN_NON_TAILWIND) {
      const def = classVocab.find((d) => d.method === method);
      assert.ok(def, `KNOWN_NON_TAILWIND row "${method}" is not in the vocab`);
      for (const args of argTuplesFor(method, def!.samples)) {
        for (const cls of emitClasses(def!.emit, args)) {
          // Named group/peer forms (`group/nav`) parse as candidates with a
          // modifier but still compile to no CSS.
          assert.equal(
            design.candidatesToCss([cls])[0],
            null,
            `"${cls}" (${method}) now compiles in Tailwind — remove it from KNOWN_NON_TAILWIND (${reason})`,
          );
        }
      }
    }
  });
});
