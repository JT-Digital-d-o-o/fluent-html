/**
 * `classVocab` — the ~120-row source of truth for the fluent styling
 * vocabulary. Mirrors the render-time emitters in `src/core/tailwind-methods.ts`
 * exactly (the `class-vocab.test.ts` lib-parity test renders each method and
 * compares). The extractor + ESLint maps are generated from this array.
 *
 * Rows are grouped to match the sections in `tailwind-methods.ts`.
 *
 * Enrichment (llm-styling/vocab-generator): each row carries `values` — where
 * its accepted values come from (`literals` lists are rendered into
 * `tailwind-types.gen.ts` by the types emitter and compiled member-by-member
 * through the Tailwind validity oracle; `theme` records the `@theme` namespace
 * linkage; `typeRef` points at a curated union) — and a one-line `doc`.
 *
 * @module
 */
import { DIR_MAP, ROUNDED_CORNERS, signNeg, cssPropValue, defineUtility, radialGradientClass } from "./types.js";
import type { UtilityDef, ValuesSpec, LeafValuesSpec, VariantObjectSpec, VariantKeyDef } from "./types.js";

// ── Values-spec constructors ────────────────────────────────────────

/** Closed keyword list — the types emitter renders it; the oracle compiles every member. */
const lit = (...list: readonly string[]): LeafValuesSpec => ({ kind: "literals", list });
/** Values are the keys of a Tailwind `@theme` namespace. */
const theme = (ns: `--${string}`): LeafValuesSpec => ({ kind: "theme", ns });
/** Transition state: the union in `tailwind-types` is curated beyond a flat list. */
const ref = (name: string): LeafValuesSpec => ({ kind: "typeRef", name });
/** Merged method (canonical-names): several value families through one emit shape. */
const group = (groups: Readonly<Record<string, LeafValuesSpec>>): ValuesSpec => ({ kind: "group", groups });

type Extras = { readonly values?: ValuesSpec; readonly doc?: string; readonly variantObject?: VariantObjectSpec };

/**
 * Variant-object spec shorthand (llm-styling/object-variants). One string =
 * a value-type override for the row's single key; full `VariantKeyDef`s for
 * positional flattening (`translate` → `translateX`/`translateY`/`translateZ`).
 */
const vo = (...keys: readonly (string | VariantKeyDef)[]): VariantObjectSpec =>
  ({ keys: keys.map((k) => (typeof k === "string" ? { type: k } : k)) });

// ── Row constructors (keep the table terse + uniform) ───────────────

/** Zero-arg fixed class. */
const stat = (method: string, cls: string, x?: Extras): UtilityDef =>
  defineUtility({ method, emit: { kind: "static", class: cls }, ...x });

/** Exactly one value → `prefix-value`. */
const pre = (method: string, prefix: string, x?: Extras): UtilityDef =>
  defineUtility({ method, emit: { kind: "prefix", prefix }, ...x });

/** Optional value → `prefix` | `prefix${sep}value`. */
const opt = (method: string, prefix: string, sep?: "-" | "/", x?: Extras): UtilityDef =>
  defineUtility({ method, emit: sep ? { kind: "optional", prefix, sep } : { kind: "optional", prefix }, ...x });

/** Spacing/directional family. `units` enables the `(unit, amount)` arbitrary overload. */
const space = (method: string, prefix: string, sep: "" | "-", abbrev: boolean, units: boolean, x?: Extras): UtilityDef =>
  defineUtility({ method, emit: { kind: "spacing", prefix, sep, abbrev, units }, ...x });

/** Single-axis sizing/inset (unit overload, no direction). */
const size = (method: string, prefix: string, x?: Extras): UtilityDef =>
  defineUtility({ method, emit: { kind: "sizing", prefix }, ...x });

/** Arg-verbatim value, optionally prefixed. */
const val = (method: string, prefix?: string, x?: Extras): UtilityDef =>
  defineUtility({ method, emit: prefix ? { kind: "value", prefix } : { kind: "value" }, ...x });

// ── Custom (straggler) emitters ─────────────────────────────────────

function emitBorder(args: readonly string[]): string[] {
  if (args.length === 0) return ["border"];
  const a = args[0]!;
  const dir = DIR_MAP[a];
  if (dir !== undefined) return args.length >= 2 ? [`border-${dir}-${args[1]}`] : [`border-${dir}`];
  return [`border-${a}`];
}

function emitRounded(args: readonly string[]): string[] {
  if (args.length === 0) return ["rounded"];
  const a = args[0]!;
  if (ROUNDED_CORNERS.has(a)) return args.length >= 2 ? [`rounded-${a}-${args[1]}`] : [`rounded-${a}`];
  return [`rounded-${a}`];
}

const custom = (method: string, emit: (args: readonly string[]) => string[], samples: readonly (readonly string[])[], x?: Extras): UtilityDef =>
  defineUtility({ method, emit: { kind: "custom", emit }, samples, ...x });

const interp = (cls: string, i?: string): string => (i ? `${cls}/${i}` : cls);
const stop = (method: string, prefix: string, x?: Extras): UtilityDef =>
  custom(method, (a) => (a.length >= 2 ? [`${prefix}-${a[0]}`, `${prefix}-${a[1]}`] : a.length === 1 ? [`${prefix}-${a[0]}`] : []),
    [["red-500"], ["red-500", "10%"]], x);

// ── The vocabulary ──────────────────────────────────────────────────

export const classVocab: readonly UtilityDef[] = [
  // Spacing
  space("p", "p", "", true, true, { values: theme("--spacing"), doc: "Padding — all sides, one axis/side, or an arbitrary length via the unit overload." }),
  space("m", "m", "", true, true, { values: theme("--spacing"), doc: "Margin — all sides, one axis/side, or an arbitrary length via the unit overload.", variantObject: vo('TailwindSpacing | "auto"') }),
  // Directional shorthands (canonical-names): the Tailwind spelling models reach
  // for first (`px-4` → `.px("4")`). `.p("x", "4")` stays as the parametric form.
  size("px", "px", { values: theme("--spacing"), doc: "Horizontal padding (`px-*`)." }),
  size("py", "py", { values: theme("--spacing"), doc: "Vertical padding (`py-*`)." }),
  size("pt", "pt", { values: theme("--spacing"), doc: "Top padding (`pt-*`)." }),
  size("pb", "pb", { values: theme("--spacing"), doc: "Bottom padding (`pb-*`)." }),
  size("pl", "pl", { values: theme("--spacing"), doc: "Left padding (`pl-*`)." }),
  size("pr", "pr", { values: theme("--spacing"), doc: "Right padding (`pr-*`)." }),
  size("mx", "mx", { values: theme("--spacing"), doc: "Horizontal margin (`mx-*`, incl. `auto`).", variantObject: vo('TailwindSpacing | "auto"') }),
  size("my", "my", { values: theme("--spacing"), doc: "Vertical margin (`my-*`, incl. `auto`).", variantObject: vo('TailwindSpacing | "auto"') }),
  size("mt", "mt", { values: theme("--spacing"), doc: "Top margin (`mt-*`, incl. `auto`).", variantObject: vo('TailwindSpacing | "auto"') }),
  size("mb", "mb", { values: theme("--spacing"), doc: "Bottom margin (`mb-*`, incl. `auto`).", variantObject: vo('TailwindSpacing | "auto"') }),
  size("ml", "ml", { values: theme("--spacing"), doc: "Left margin (`ml-*`, incl. `auto`).", variantObject: vo('TailwindSpacing | "auto"') }),
  size("mr", "mr", { values: theme("--spacing"), doc: "Right margin (`mr-*`, incl. `auto`).", variantObject: vo('TailwindSpacing | "auto"') }),
  pre("spaceX", "space-x", { values: theme("--spacing"), doc: "Horizontal space between children (prefer flex/grid + gap)." }),
  pre("spaceY", "space-y", { values: theme("--spacing"), doc: "Vertical space between children (prefer flex/grid + gap)." }),
  space("gap", "gap", "-", false, true, { values: theme("--spacing"), doc: "Gap between flex/grid children — both axes or one." }),

  // Colors
  pre("bg", "bg", { values: theme("--color"), doc: "Background color." }),

  // Typography — `.text()` is the canonical merged method: size, color, align,
  // and wrap all emit `text-*` (Tailwind's own overload; unions are disjoint).
  size("text", "text", {
    values: group({
      size: theme("--text"),
      color: theme("--color"),
      align: lit("left", "center", "right", "justify"),
      wrap: lit("wrap", "nowrap", "balance", "pretty"),
    }),
    doc: "Text size, color, alignment, or wrapping — one merged `text-*` emitter; arbitrary length via the unit overload.",
  }),
  pre("font", "font", {
    values: group({
      weight: lit("thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"),
      family: theme("--font"),
    }),
    doc: "Font weight or family — one merged `font-*` emitter.",
  }),
  stat("italic", "italic", { doc: "Italic text." }),
  stat("uppercase", "uppercase", { doc: "Uppercase transform." }),
  stat("lowercase", "lowercase", { doc: "Lowercase transform." }),
  stat("capitalize", "capitalize", { doc: "Capitalize each word." }),
  stat("underline", "underline", { doc: "Underlined text." }),
  stat("noUnderline", "no-underline", { doc: "Remove text decoration." }),
  stat("lineThrough", "line-through", { doc: "Struck-through text." }),
  stat("truncate", "truncate", { doc: "Truncate overflowing text with an ellipsis." }),
  stat("antialiased", "antialiased", { doc: "Grayscale font smoothing." }),
  stat("tabularNums", "tabular-nums", { doc: "Tabular (fixed-width) numerals." }),
  stat("breakAll", "break-all", { doc: "Allow line breaks anywhere within words." }),
  size("leading", "leading", { values: ref("TailwindLeading"), doc: "Line height — named scale or a number of spacing units." }),
  size("tracking", "tracking", { values: lit("tighter", "tight", "normal", "wide", "wider", "widest"), doc: "Letter spacing." }),
  pre("whitespace", "whitespace", { values: lit("normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"), doc: "White-space handling." }),
  size("underlineOffset", "underline-offset", { values: ref("TailwindUnderlineOffset"), doc: "Distance between text and its underline." }),
  pre("lineClamp", "line-clamp", { values: ref("TailwindLineClamp"), doc: "Clamp text to N lines with an ellipsis." }),

  // Sizing
  size("w", "w", { values: ref("TailwindWidth"), doc: "Width — spacing scale, fractions, keywords, or the unit overload." }),
  size("h", "h", { values: ref("TailwindHeight"), doc: "Height — spacing scale, fractions, keywords, or the unit overload." }),
  size("maxW", "max-w", { values: ref("TailwindMaxWidth"), doc: "Max-width — named container sizes, keywords, or the unit overload." }),
  size("minW", "min-w", { values: ref("TailwindMinWidth"), doc: "Min-width." }),
  size("maxH", "max-h", { values: ref("TailwindMaxHeight"), doc: "Max-height." }),
  size("minH", "min-h", { values: ref("TailwindMinHeight"), doc: "Min-height." }),
  pre("aspect", "aspect", { values: lit("auto", "square", "video"), doc: "Aspect ratio." }),

  // Flexbox — `.flex()` is merged: bare container, shorthand value, direction,
  // or wrap, all through the one `flex-*` emitter (disjoint keyword sets).
  opt("flex", "flex", undefined, {
    values: group({
      shorthand: lit("1", "auto", "initial", "none"),
      direction: lit("row", "col", "row-reverse", "col-reverse"),
      wrap: lit("wrap", "wrap-reverse", "nowrap"),
    }),
    doc: "Flex container (bare), flex shorthand value, main-axis direction, or wrapping.",
  }),
  pre("justify", "justify", { values: lit("start", "end", "center", "between", "around", "evenly"), doc: "Main-axis distribution." }),
  pre("items", "items", { values: lit("start", "end", "center", "baseline", "stretch"), doc: "Cross-axis alignment of items." }),
  pre("self", "self", { values: lit("auto", "start", "end", "center", "stretch", "baseline"), doc: "Cross-axis alignment of one item." }),
  opt("shrink", "shrink", undefined, { doc: "Allow shrinking (bare) or `shrink-0` to forbid it.", variantObject: vo('true | 0 | "0"') }),
  opt("grow", "grow", undefined, { doc: "Allow growing (bare) or `grow-0` to forbid it.", variantObject: vo('true | 0 | "0"') }),

  // Grid
  stat("grid", "grid", { doc: "Grid container." }),
  pre("gridCols", "grid-cols", { values: ref("TailwindGridCols"), doc: "Number of grid columns, `none`/`subgrid`, or an arbitrary track list." }),
  pre("gridRows", "grid-rows", { values: ref("TailwindGridRows"), doc: "Number of grid rows, `none`/`subgrid`, or an arbitrary track list." }),
  pre("gridFlow", "grid-flow", { values: lit("row", "col", "dense", "row-dense", "col-dense"), doc: "Auto-placement flow of grid items." }),
  pre("autoRows", "auto-rows", { values: lit("auto", "min", "max", "fr"), doc: "Size of implicit grid rows." }),
  pre("autoCols", "auto-cols", { values: lit("auto", "min", "max", "fr"), doc: "Size of implicit grid columns." }),
  pre("colSpan", "col-span", { values: ref("TailwindColSpan"), doc: "How many columns an item spans." }),
  pre("order", "order", { values: ref("TailwindOrder"), doc: "Visual order of a flex/grid item." }),

  // Borders — `.border()` is merged: width, style, and color through the one
  // `border-*` emitter (widths are bare numerals, colors carry letters, styles
  // are keywords — disjoint). Side forms take a width or color; style is all-sides.
  custom("border", emitBorder, [[], ["2"], ["t"], ["top", "2"], ["dashed"], ["red-500"], ["top", "red-500"]], {
    values: group({
      width: ref("TailwindBorderWidth"),
      style: lit("solid", "dashed", "dotted", "double", "hidden", "none"),
      color: theme("--color"),
    }),
    doc: "Border width, style, or color — all sides (bare = 1px width), one side, or side + width/color.",
    variantObject: vo('true | TailwindBorderWidth | TailwindBorderStyle | TailwindColor | "t" | "b" | "l" | "r" | "x" | "y" | "top" | "bottom" | "left" | "right" | readonly ["x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", TailwindBorderWidth | TailwindColor]'),
  }),
  custom("rounded", emitRounded, [[], ["lg"], ["t"], ["tl", "lg"]], { values: theme("--radius"), doc: "Border radius — all corners (bare = default), one corner, or corner + size.", variantObject: vo("true | TailwindRounded | TailwindRoundedCorner | readonly [TailwindRoundedCorner, TailwindRounded]") }),
  opt("divideX", "divide-x", undefined, { values: ref("TailwindBorderWidth"), doc: "Border between horizontal children." }),
  opt("divideY", "divide-y", undefined, { values: ref("TailwindBorderWidth"), doc: "Border between vertical children." }),
  pre("divide", "divide", { values: theme("--color"), doc: "Color of the between-children borders (pairs with `.divideX()`/`.divideY()`)." }),

  // Effects & Appearance — `.shadow()` merged: size or color through `shadow-*`.
  opt("shadow", "shadow", undefined, {
    values: group({ size: theme("--shadow"), color: theme("--color") }),
    doc: "Box shadow — bare default, a theme size, or a shadow color.",
  }),
  pre("opacity", "opacity", { values: ref("TailwindOpacity"), doc: "Element opacity (0–100)." }),
  pre("cursor", "cursor", { values: lit("auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out"), doc: "Mouse cursor." }),
  // Position — dedicated shortcuts (A-07, replaced the `.position(value)` passthrough).
  stat("absolute", "absolute", { doc: "Absolute positioning." }),
  stat("relative", "relative", { doc: "Relative positioning." }),
  stat("fixed", "fixed", { doc: "Fixed positioning." }),
  stat("sticky", "sticky", { doc: "Sticky positioning." }),
  stat("static", "static", { doc: "Static (default) positioning." }),
  pre("z", "z", { values: ref("TailwindZIndex"), doc: "Stacking order." }),
  space("overflow", "overflow", "-", false, false, { values: lit("auto", "hidden", "clip", "visible", "scroll"), doc: "Overflow behavior — both axes or one." }),
  pre("object", "object", { values: lit("contain", "cover", "fill", "none", "scale-down"), doc: "How replaced content fits its box." }),

  // Layout & Display — dedicated shortcuts (A-07; `.flex()`/`.grid()`/`.hidden()` cover the rest).
  stat("block", "block", { doc: "Block display." }),
  stat("inlineBlock", "inline-block", { doc: "Inline-block display." }),
  stat("inline", "inline", { doc: "Inline display." }),
  stat("inlineFlex", "inline-flex", { doc: "Inline-level flex container." }),
  stat("inlineGrid", "inline-grid", { doc: "Inline-level grid container." }),
  stat("contents", "contents", { doc: "Children participate in the parent's layout (`display: contents`)." }),
  stat("hidden", "hidden", { doc: "Remove from layout (`display: none`)." }),
  stat("invisible", "invisible", { doc: "Hide but keep layout space (`visibility: hidden`) — unlike `.hidden()`." }),
  opt("table", "table", undefined, { values: lit("auto", "fixed"), doc: "Table display (bare) or the table-layout algorithm (`auto`/`fixed`)." }),
  stat("tableCell", "table-cell", { doc: "Table-cell display (responsive column show/hide)." }),
  stat("tableRow", "table-row", { doc: "Table-row display." }),
  size("inset", "inset", { values: ref("TailwindInset"), doc: "All four inset offsets at once." }),
  size("top", "top", { values: ref("TailwindInset"), doc: "Top offset of a positioned element." }),
  size("right", "right", { values: ref("TailwindInset"), doc: "Right offset of a positioned element." }),
  size("bottom", "bottom", { values: ref("TailwindInset"), doc: "Bottom offset of a positioned element." }),
  size("left", "left", { values: ref("TailwindInset"), doc: "Left offset of a positioned element." }),

  // Transitions & Animation — `.transition()` merged: property group or
  // discrete-behavior value through `transition-*`.
  opt("transition", "transition", undefined, {
    values: group({
      property: lit("none", "all", "colors", "opacity", "shadow", "transform"),
      behavior: lit("normal", "discrete"),
    }),
    doc: "Transitioned property group (bare = default set) or discrete-transition behavior.",
  }),
  pre("duration", "duration", { values: ref("TailwindDuration"), doc: "Transition duration in ms." }),
  pre("animate", "animate", { values: lit("none", "spin", "ping", "pulse", "bounce"), doc: "Named animation." }),
  pre("ease", "ease", { values: lit("linear", "in", "out", "in-out"), doc: "Transition timing function." }),

  // Ring — `.ring()` merged: width or color through `ring-*`.
  opt("ring", "ring", undefined, {
    values: group({ width: ref("TailwindRingWidth"), color: theme("--color") }),
    doc: "Ring width (bare = 1px in v4) or ring color.",
  }),

  // Transforms (A-07: rotate/skew/translate relocate a leading `-` via signNeg, so
  // `.rotate(-45)` → `-rotate-45`; translate is strictly 2-arg `translate-${axis}-${value}`)
  pre("scale", "scale", { values: ref("TailwindScale"), doc: "Uniform scale (percent of original size)." }),
  custom("rotate", (args) => [signNeg("rotate", args[0]!)], [["45"], ["-45"]], { values: ref("TailwindRotate"), doc: "Rotation in degrees; negatives relocate the sign (`-rotate-45`)." }),
  custom("translate", (args) => (args.length === 2 ? [signNeg(`translate-${args[0]}`, args[1]!)] : []), [["x", "2"], ["y", "-4"]], {
    values: ref("TailwindTranslate"), doc: "Translate along an axis; negatives relocate the sign.",
    variantObject: vo(
      { key: "translateX", pre: ["x"], type: "TailwindTranslate" },
      { key: "translateY", pre: ["y"], type: "TailwindTranslate" },
      { key: "translateZ", pre: ["z"], type: "TailwindTranslateZ" },
    ),
  }),
  // Interactivity
  pre("select", "select", { values: lit("none", "text", "all", "auto"), doc: "Text selection behavior." }),
  pre("pointerEvents", "pointer-events", { values: lit("none", "auto"), doc: "Whether the element receives pointer events." }),
  pre("appearance", "appearance", { values: lit("none", "auto"), doc: "Native appearance of form controls." }),

  // List Style — `.list()` merged: marker type or position through `list-*`.
  pre("list", "list", {
    values: group({ type: lit("none", "disc", "decimal"), position: lit("inside", "outside") }),
    doc: "List marker style or position.",
  }),

  // Accessibility
  stat("srOnly", "sr-only", { doc: "Visually hidden but readable by screen readers." }),

  // Outline — `hidden` absorbed from the old `outlineHidden()` (v4 a11y-safe
  // focus-hiding: keeps a visible outline in forced-colors mode; prefer over `none`).
  pre("outline", "outline", { values: lit("none", "hidden", "dashed", "dotted", "double"), doc: "Outline style (prefer `hidden` over `none` in v4 — forced-colors safe)." }),

  // Gradients (v4-native: bg-linear-* / bg-radial-* / bg-conic-*)
  custom("gradient", (a) => (a.length >= 2
    ? [interp(`bg-linear-${a[2] ?? "to-r"}`, a[3]), `from-${a[0]}`, `to-${a[1]}`] : []),
    [["red-500", "blue-500"], ["red-500", "blue-500", "to-br"], ["red-500", "blue-500", "to-br", "oklab"]],
    { values: theme("--color"), doc: "Linear gradient from → to, with optional direction + interpolation.",
      variantObject: vo("readonly [TailwindColor, TailwindColor, TailwindGradientDirection?, TailwindGradientInterpolation?]") }),
  // `.bgLinear()` merged: direction keyword or angle (negatives relocate the
  // sign), with optional interpolation — one `bg-linear-*` emitter.
  custom("bgLinear", (a) => (a.length >= 1 ? [interp(signNeg("bg-linear", a[0]!), a[1])] : []),
    [["to-r"], ["to-r", "oklch"], ["to-tr", "longer"], ["45"], ["-65"], ["[0.25turn]"], ["180", "longer"]],
    {
      values: group({
        direction: lit("to-t", "to-tr", "to-r", "to-br", "to-b", "to-bl", "to-l", "to-tl"),
        angle: ref("TailwindGradientAngle"),
      }),
      doc: "Linear-gradient direction keyword or angle, with optional interpolation.",
      variantObject: vo("TailwindGradientDirection | TailwindGradientAngle | readonly [TailwindGradientDirection | TailwindGradientAngle, TailwindGradientInterpolation]"),
    }),
  custom("bgRadial", (a) => [radialGradientClass(a[0], a[1])],
    [[], ["top-left"], ["[at_top_left]"], ["top-right", "oklch"], ["top-right", "longer"]],
    { values: ref("TailwindGradientOrigin"), doc: "Radial gradient, optionally positioned at an origin.",
      variantObject: vo("true | TailwindGradientOrigin | readonly [TailwindGradientOrigin, TailwindGradientInterpolation]") }),
  custom("bgConic", (a) => [interp(a[0] === undefined ? "bg-conic" : signNeg("bg-conic", a[0]), a[1])],
    [[], ["180"], ["-90"], ["180", "longer"]],
    { values: ref("TailwindGradientAngle"), doc: "Conic gradient, optionally from an angle in degrees.",
      variantObject: vo("true | TailwindGradientAngle | readonly [TailwindGradientAngle, TailwindGradientInterpolation]") }),
  stop("from", "from", { values: theme("--color"), doc: "First gradient stop — color with optional position.", variantObject: vo("TailwindGradientStop | readonly [TailwindGradientStop, TailwindGradientPosition]") }),
  stop("via", "via", { values: theme("--color"), doc: "Middle gradient stop — color with optional position.", variantObject: vo("TailwindGradientStop | readonly [TailwindGradientStop, TailwindGradientPosition]") }),
  stop("to", "to", { values: theme("--color"), doc: "Last gradient stop — color with optional position.", variantObject: vo("TailwindGradientStop | readonly [TailwindGradientStop, TailwindGradientPosition]") }),

  // Group / Peer markers
  opt("group", "group", "/", { doc: "Group marker — enables `group-*` variants on descendants; optionally named.", variantObject: vo("true | string") }),
  opt("peer", "peer", "/", { doc: "Peer marker — enables `peer-*` variants on siblings; optionally named.", variantObject: vo("true | string") }),

  // Container-query container (v4): @container / @container/{name}
  opt("containerQuery", "@container", "/", { doc: "Container-query container; optionally named.", variantObject: vo("true | string") }),

  // Filters
  opt("blur", "blur", undefined, { values: lit("none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"), doc: "Blur filter (bare = default)." }),
  opt("backdropBlur", "backdrop-blur", undefined, { values: lit("none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"), doc: "Backdrop blur filter (bare = default)." }),
  pre("brightness", "brightness", { values: ref("TailwindBrightness"), doc: "Brightness filter (percent)." }),
  pre("contrast", "contrast", { values: ref("TailwindContrast"), doc: "Contrast filter (percent)." }),
  opt("grayscale", "grayscale", undefined, { doc: "Grayscale filter (bare = 100%).", variantObject: vo('true | 0 | "0"') }),
  pre("hueRotate", "hue-rotate", { values: ref("TailwindHueRotate"), doc: "Hue-rotate filter in degrees." }),
  opt("invert", "invert", undefined, { doc: "Invert filter (bare = 100%).", variantObject: vo('true | 0 | "0"') }),
  pre("saturate", "saturate", { values: ref("TailwindSaturate"), doc: "Saturation filter (percent)." }),
  opt("sepia", "sepia", undefined, { doc: "Sepia filter (bare = 100%).", variantObject: vo('true | 0 | "0"') }),

  // Timing / Resize / Performance / Overscroll
  pre("willChange", "will-change", { values: lit("auto", "scroll", "contents", "transform"), doc: "Hint the browser about upcoming changes." }),
  opt("resize", "resize", undefined, { values: lit("none", "x", "y"), doc: "User-resizability (bare = both axes)." }),
  space("overscroll", "overscroll", "-", false, false, { values: lit("auto", "contain", "none"), doc: "Overscroll behavior — both axes or one." }),

  // Negative value prefix
  val("neg", "-", { doc: "Prefix an arbitrary utility with `-` (negative value passthrough).", variantObject: vo("string") }),

  // Typed escape (llm-styling/escape-hatch): arbitrary CSS property → Tailwind's
  // `[prop:value]` arbitrary-property form (spaces → `_`, literal `_` escaped
  // as `\_`, `url(…)` left as-is — see `cssPropValue`). A vocab row so the
  // extractor scans it — literal args are safelisted, non-literal args are
  // tracked as unresolved (build error under `onUnresolved: "error"`).
  custom("cssProp", (a) => (a.length === 2 ? [`[${a[0]}:${cssPropValue(a[1]!)}]`] : []),
    [["mask-repeat", "no-repeat"], ["border", "1px solid red"], ["--brand-glow", "0 0 4px red"]],
    { doc: "Arbitrary-CSS escape — emits `[prop:value]` (spaces → `_`, literal `_` escaped); variant-composable.", variantObject: vo("readonly [CssPropertyName, string]") }),

  // htmx (B-04): sanctioned loading-indicator class, so the extractor/ESLint accept it
  stat("htmxIndicator", "htmx-indicator", { doc: "htmx loading-indicator marker class." }),

  pre("fill", "fill", { values: theme("--color"), doc: "SVG fill color (`none` to unset).", variantObject: vo('TailwindColor | "none"') }),
  // `.stroke()` merged: color or width through `stroke-*` (widths are bare numerals).
  size("stroke", "stroke", {
    values: group({ color: theme("--color"), width: ref("TailwindStrokeWidth") }),
    doc: "SVG stroke color or width — one merged `stroke-*` emitter; arbitrary width via the unit overload.",
    variantObject: vo('TailwindColor | "none" | TailwindStrokeWidth'),
  }),
  pre("accent", "accent", { values: theme("--color"), doc: "Accent color of form controls." }),
  pre("caret", "caret", { values: theme("--color"), doc: "Text-input caret color." }),
  // `.decoration()` merged: color, style, or thickness through `decoration-*`.
  size("decoration", "decoration", {
    values: group({
      color: theme("--color"),
      style: lit("solid", "double", "dotted", "dashed", "wavy"),
      thickness: ref("TailwindDecorationThickness"),
    }),
    doc: "Text-decoration color, style, or thickness — one merged `decoration-*` emitter.",
  }),

  size("insetX", "inset-x", { values: ref("TailwindInset"), doc: "Left + right offsets at once." }),
  size("insetY", "inset-y", { values: ref("TailwindInset"), doc: "Top + bottom offsets at once." }),
  size("insetS", "inset-s", { values: ref("TailwindInset"), doc: "Logical inline-start offset." }),
  size("insetE", "inset-e", { values: ref("TailwindInset"), doc: "Logical inline-end offset." }),

  pre("wrap", "wrap", { values: lit("break-word", "anywhere", "normal"), doc: "Overflow-wrap — where long words may break." }),
  // Shadow-family merges: size or color through the one prefix each.
  pre("textShadow", "text-shadow", {
    values: group({ size: theme("--text-shadow"), color: theme("--color") }),
    doc: "Text shadow — theme size or shadow color (value required).",
  }),
  pre("dropShadow", "drop-shadow", {
    values: group({ size: theme("--drop-shadow"), color: theme("--color") }),
    doc: "Drop-shadow filter — theme size or shadow color (value required).",
  }),
  pre("insetShadow", "inset-shadow", {
    values: group({ size: theme("--inset-shadow"), color: theme("--color") }),
    doc: "Inner box shadow — theme size or shadow color (value required).",
  }),
  opt("insetRing", "inset-ring", undefined, {
    values: group({ width: ref("TailwindRingWidth"), color: theme("--color") }),
    doc: "Inner ring width (bare = 1px) or inner ring color.",
  }),
  pre("mixBlend", "mix-blend", { values: lit("normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity", "plus-darker", "plus-lighter"), doc: "Blend mode of the element against its backdrop." }),
  pre("bgBlend", "bg-blend", { values: lit("normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"), doc: "Blend mode of the background layers." }),
  stat("isolate", "isolate", { doc: "Create a new stacking context." }),

  pre("delay", "delay", { values: ref("TailwindDelay"), doc: "Transition delay in ms." }),

  pre("perspective", "perspective", { values: lit("dramatic", "near", "normal", "midrange", "distant", "none"), doc: "3D perspective depth on the parent." }),
  pre("transform", "transform", { values: lit("3d", "flat"), doc: "Whether children are positioned in 3D space (transform-style)." }),

  custom("colStart", (a) => [signNeg("col-start", a[0]!)], [["2"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid column start line (negatives count from the end)." }),
  custom("colEnd", (a) => [signNeg("col-end", a[0]!)], [["2"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid column end line (negatives count from the end)." }),
  custom("rowStart", (a) => [signNeg("row-start", a[0]!)], [["3"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid row start line (negatives count from the end)." }),
  custom("rowEnd", (a) => [signNeg("row-end", a[0]!)], [["3"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid row end line (negatives count from the end)." }),
  pre("rowSpan", "row-span", { values: ref("TailwindRowSpan"), doc: "How many rows an item spans." }),
  pre("columns", "columns", { values: ref("TailwindColumns"), doc: "Multi-column count or width." }),
  pre("breakInside", "break-inside", { values: lit("auto", "avoid", "avoid-page", "avoid-column"), doc: "Column/page break inside the element." }),
  pre("boxDecoration", "box-decoration", { values: lit("clone", "slice"), doc: "How box decorations behave across fragments." }),
  pre("scroll", "scroll", { values: lit("auto", "smooth"), doc: "Programmatic scrolling behavior." }),
  space("scrollP", "scroll-p", "", true, true, { values: theme("--spacing"), doc: "Scroll padding — all sides, one axis/side, or the unit overload." }),

  // Pseudo-element content — bare = empty string (the common `before:`/`after:` case)
  custom("content", (a) => [a[0] === undefined ? "content-['']" : `content-${a[0]}`],
    [[], ["none"], ["[attr(data-label)]"]],
    { values: lit("none"), doc: "Pseudo-element content — `none`, arbitrary `[…]`, or bare for the empty string.", variantObject: vo("true | TailwindContent") }),

  // CSS Anchor Positioning (B-010) emits *inline style*, never a class — anchorName /
  // positionAnchor / positionArea (and viewTransitionName, F-B-181) all take arbitrary
  // custom-idents or multi-keyword grammar the extractor can't resolve and Tailwind has no
  // native utility for, so they are deliberately NOT in the class vocab. See tailwind-methods.ts.
];
