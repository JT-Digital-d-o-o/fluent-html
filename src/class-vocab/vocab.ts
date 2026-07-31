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
import { DIR_MAP, ROUNDED_CORNERS, signNeg, defineUtility, radialGradientClass } from "./types.js";
import type { UtilityDef, ValuesSpec } from "./types.js";

// ── Values-spec constructors ────────────────────────────────────────

/** Closed keyword list — the types emitter renders it; the oracle compiles every member. */
const lit = (...list: readonly string[]): ValuesSpec => ({ kind: "literals", list });
/** Values are the keys of a Tailwind `@theme` namespace. */
const theme = (ns: `--${string}`): ValuesSpec => ({ kind: "theme", ns });
/** Transition state: the union in `tailwind-types` is curated beyond a flat list. */
const ref = (name: string): ValuesSpec => ({ kind: "typeRef", name });

type Extras = { readonly values?: ValuesSpec; readonly doc?: string };

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

function emitBorderColor(args: readonly string[]): string[] {
  if (args.length === 0) return [];
  if (args.length === 1) return [`border-${args[0]}`];
  const dir = DIR_MAP[args[0]!] ?? args[0]!;
  return [`border-${dir}-${args[1]}`];
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
  space("padding", "p", "", true, true, { values: theme("--spacing"), doc: "Padding — all sides, one axis/side, or an arbitrary length via the unit overload." }),
  space("margin", "m", "", true, true, { values: theme("--spacing"), doc: "Margin — all sides, one axis/side, or an arbitrary length via the unit overload." }),
  pre("spaceX", "space-x", { values: theme("--spacing"), doc: "Horizontal space between children (prefer flex/grid + gap)." }),
  pre("spaceY", "space-y", { values: theme("--spacing"), doc: "Vertical space between children (prefer flex/grid + gap)." }),
  space("gap", "gap", "-", false, true, { values: theme("--spacing"), doc: "Gap between flex/grid children — both axes or one." }),

  // Colors
  pre("background", "bg", { values: theme("--color"), doc: "Background color." }),
  pre("textColor", "text", { values: theme("--color"), doc: "Text color." }),
  custom("borderColor", emitBorderColor, [["red-500"], ["top", "red-500"]], { values: theme("--color"), doc: "Border color — all sides or one." }),
  pre("ringColor", "ring", { values: theme("--color"), doc: "Ring color." }),
  pre("shadowColor", "shadow", { values: theme("--color"), doc: "Box-shadow color." }),

  // Typography
  size("textSize", "text", { values: theme("--text"), doc: "Font size — theme scale or an arbitrary length via the unit overload." }),
  pre("textAlign", "text", { values: lit("left", "center", "right", "justify"), doc: "Horizontal text alignment." }),
  pre("fontWeight", "font", { values: lit("thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"), doc: "Font weight." }),
  pre("fontFamily", "font", { values: theme("--font"), doc: "Font family — theme families (sans/serif/mono + custom tokens)." }),
  stat("bold", "font-bold", { doc: "Bold font weight (`font-bold`)." }),
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

  // Flexbox
  opt("flex", "flex", undefined, { values: lit("1", "auto", "initial", "none"), doc: "Flex container (bare) or flex shorthand value." }),
  pre("flexShorthand", "flex", { doc: "Raw `flex-*` shorthand value (e.g. `flex-2`)." }),
  pre("flexDirection", "flex", { values: lit("row", "col", "row-reverse", "col-reverse"), doc: "Main-axis direction of a flex container." }),
  pre("flexWrap", "flex", { values: lit("wrap", "wrap-reverse", "nowrap"), doc: "Whether flex items wrap." }),
  pre("justifyContent", "justify", { values: lit("start", "end", "center", "between", "around", "evenly"), doc: "Main-axis distribution." }),
  pre("alignItems", "items", { values: lit("start", "end", "center", "baseline", "stretch"), doc: "Cross-axis alignment of items." }),
  pre("alignSelf", "self", { values: lit("auto", "start", "end", "center", "stretch", "baseline"), doc: "Cross-axis alignment of one item." }),
  opt("shrink", "shrink", undefined, { doc: "Allow shrinking (bare) or `shrink-0` to forbid it." }),
  opt("grow", "grow", undefined, { doc: "Allow growing (bare) or `grow-0` to forbid it." }),

  // Grid
  stat("grid", "grid", { doc: "Grid container." }),
  pre("gridCols", "grid-cols", { values: ref("TailwindGridCols"), doc: "Number of grid columns, `none`/`subgrid`, or an arbitrary track list." }),
  pre("gridRows", "grid-rows", { values: ref("TailwindGridRows"), doc: "Number of grid rows, `none`/`subgrid`, or an arbitrary track list." }),
  pre("gridAutoFlow", "grid-flow", { values: lit("row", "col", "dense", "row-dense", "col-dense"), doc: "Auto-placement flow of grid items." }),
  pre("gridAutoRows", "auto-rows", { values: lit("auto", "min", "max", "fr"), doc: "Size of implicit grid rows." }),
  pre("gridAutoCols", "auto-cols", { values: lit("auto", "min", "max", "fr"), doc: "Size of implicit grid columns." }),
  pre("colSpan", "col-span", { values: ref("TailwindColSpan"), doc: "How many columns an item spans." }),
  pre("order", "order", { values: ref("TailwindOrder"), doc: "Visual order of a flex/grid item." }),

  // Place
  pre("placeContent", "place-content", { values: lit("center", "start", "end", "between", "around", "evenly", "baseline", "stretch"), doc: "Shorthand for align-content + justify-content." }),
  pre("placeItems", "place-items", { values: lit("start", "end", "center", "baseline", "stretch"), doc: "Shorthand for align-items + justify-items." }),
  pre("placeSelf", "place-self", { values: lit("auto", "start", "end", "center", "stretch"), doc: "Shorthand for align-self + justify-self." }),

  // Borders
  custom("border", emitBorder, [[], ["2"], ["t"], ["top", "2"]], { values: ref("TailwindBorderWidth"), doc: "Border width — all sides (bare = 1px), one side, or side + width." }),
  pre("borderStyle", "border", { values: lit("solid", "dashed", "dotted", "double", "hidden", "none"), doc: "Border style." }),
  custom("rounded", emitRounded, [[], ["lg"], ["t"], ["tl", "lg"]], { values: theme("--radius"), doc: "Border radius — all corners (bare = default), one corner, or corner + size." }),
  opt("divideX", "divide-x", undefined, { values: ref("TailwindBorderWidth"), doc: "Border between horizontal children." }),
  opt("divideY", "divide-y", undefined, { values: ref("TailwindBorderWidth"), doc: "Border between vertical children." }),

  // Effects & Appearance
  opt("shadow", "shadow", undefined, { values: theme("--shadow"), doc: "Box shadow — bare default or a theme size." }),
  pre("opacity", "opacity", { values: ref("TailwindOpacity"), doc: "Element opacity (0–100)." }),
  pre("cursor", "cursor", { values: lit("auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out"), doc: "Mouse cursor." }),
  // Position — dedicated shortcuts (A-07, replaced the `.position(value)` passthrough).
  stat("absolute", "absolute", { doc: "Absolute positioning." }),
  stat("relative", "relative", { doc: "Relative positioning." }),
  stat("fixed", "fixed", { doc: "Fixed positioning." }),
  stat("sticky", "sticky", { doc: "Sticky positioning." }),
  stat("static", "static", { doc: "Static (default) positioning." }),
  pre("zIndex", "z", { values: ref("TailwindZIndex"), doc: "Stacking order." }),
  space("overflow", "overflow", "-", false, false, { values: lit("auto", "hidden", "clip", "visible", "scroll"), doc: "Overflow behavior — both axes or one." }),
  pre("objectFit", "object", { values: lit("contain", "cover", "fill", "none", "scale-down"), doc: "How replaced content fits its box." }),

  // Layout & Display — dedicated shortcuts (A-07; `.flex()`/`.grid()`/`.hidden()` cover the rest).
  stat("block", "block", { doc: "Block display." }),
  stat("inlineBlock", "inline-block", { doc: "Inline-block display." }),
  stat("inline", "inline", { doc: "Inline display." }),
  stat("inlineFlex", "inline-flex", { doc: "Inline-level flex container." }),
  stat("inlineGrid", "inline-grid", { doc: "Inline-level grid container." }),
  stat("contents", "contents", { doc: "Children participate in the parent's layout (`display: contents`)." }),
  stat("hidden", "hidden", { doc: "Remove from layout (`display: none`)." }),
  size("inset", "inset", { values: ref("TailwindInset"), doc: "All four inset offsets at once." }),
  size("top", "top", { values: ref("TailwindInset"), doc: "Top offset of a positioned element." }),
  size("right", "right", { values: ref("TailwindInset"), doc: "Right offset of a positioned element." }),
  size("bottom", "bottom", { values: ref("TailwindInset"), doc: "Bottom offset of a positioned element." }),
  size("left", "left", { values: ref("TailwindInset"), doc: "Left offset of a positioned element." }),

  // Transitions & Animation
  opt("transition", "transition", undefined, { values: lit("none", "all", "colors", "opacity", "shadow", "transform"), doc: "Transitioned property group (bare = default set)." }),
  pre("duration", "duration", { values: ref("TailwindDuration"), doc: "Transition duration in ms." }),
  pre("animate", "animate", { values: lit("none", "spin", "ping", "pulse", "bounce"), doc: "Named animation." }),
  pre("ease", "ease", { values: lit("linear", "in", "out", "in-out"), doc: "Transition timing function." }),

  // Ring
  opt("ring", "ring", undefined, { values: ref("TailwindRingWidth"), doc: "Ring width (bare = 1px in v4)." }),

  // Transforms (A-07: rotate/skew/translate relocate a leading `-` via signNeg, so
  // `.rotate(-45)` → `-rotate-45`; translate is strictly 2-arg `translate-${axis}-${value}`)
  pre("scale", "scale", { values: ref("TailwindScale"), doc: "Uniform scale (percent of original size)." }),
  custom("rotate", (args) => [signNeg("rotate", args[0]!)], [["45"], ["-45"]], { values: ref("TailwindRotate"), doc: "Rotation in degrees; negatives relocate the sign (`-rotate-45`)." }),
  custom("translate", (args) => (args.length === 2 ? [signNeg(`translate-${args[0]}`, args[1]!)] : []), [["x", "2"], ["y", "-4"]], { values: ref("TailwindTranslate"), doc: "Translate along an axis; negatives relocate the sign." }),
  custom("skewX", (args) => [signNeg("skew-x", args[0]!)], [["6"], ["-6"]], { values: ref("TailwindSkew"), doc: "Skew on the X axis in degrees." }),
  custom("skewY", (args) => [signNeg("skew-y", args[0]!)], [["6"], ["-6"]], { values: ref("TailwindSkew"), doc: "Skew on the Y axis in degrees." }),

  // Interactivity
  pre("select", "select", { values: lit("none", "text", "all", "auto"), doc: "Text selection behavior." }),
  pre("pointerEvents", "pointer-events", { values: lit("none", "auto"), doc: "Whether the element receives pointer events." }),
  pre("appearance", "appearance", { values: lit("none", "auto"), doc: "Native appearance of form controls." }),

  // List Style (both emit `list-…`)
  pre("listStyleType", "list", { values: lit("none", "disc", "decimal"), doc: "List marker style." }),
  pre("listStylePosition", "list", { values: lit("inside", "outside"), doc: "List marker position." }),

  // Accessibility
  stat("srOnly", "sr-only", { doc: "Visually hidden but readable by screen readers." }),

  // Outline
  pre("outline", "outline", { values: lit("none", "dashed", "dotted", "double"), doc: "Outline style (prefer `outlineHidden` over `outline-none` in v4)." }),
  stat("outlineHidden", "outline-hidden", { doc: "Hide the outline while preserving it in forced-colors mode." }),

  // Gradients (v4-native: bg-linear-* / bg-radial-* / bg-conic-*)
  custom("gradient", (a) => (a.length >= 2
    ? [interp(`bg-linear-${a[2] ?? "to-r"}`, a[3]), `from-${a[0]}`, `to-${a[1]}`] : []),
    [["red-500", "blue-500"], ["red-500", "blue-500", "to-br"], ["red-500", "blue-500", "to-br", "oklab"]],
    { values: theme("--color"), doc: "Linear gradient from → to, with optional direction + interpolation." }),
  custom("gradientTo", (a) => (a.length >= 1 ? [interp(`bg-linear-${a[0]}`, a[1])] : []),
    [["to-r"], ["to-r", "oklch"], ["to-tr", "longer"]],
    { values: lit("to-t", "to-tr", "to-r", "to-br", "to-b", "to-bl", "to-l", "to-tl"), doc: "Linear-gradient direction keyword, with optional interpolation." }),
  custom("gradientLinear", (a) => [signNeg("bg-linear", a[0]!)],
    [["45"], ["-65"], ["[0.25turn]"]],
    { values: ref("TailwindGradientAngle"), doc: "Linear gradient at an angle in degrees." }),
  custom("gradientRadial", (a) => [radialGradientClass(a[0], a[1])],
    [[], ["top-left"], ["[at_top_left]"], ["top-right", "oklch"], ["top-right", "longer"]],
    { values: ref("TailwindGradientOrigin"), doc: "Radial gradient, optionally positioned at an origin." }),
  custom("gradientConic", (a) => [interp(a[0] === undefined ? "bg-conic" : signNeg("bg-conic", a[0]), a[1])],
    [[], ["180"], ["-90"], ["180", "longer"]],
    { values: ref("TailwindGradientAngle"), doc: "Conic gradient, optionally from an angle in degrees." }),
  stop("from", "from", { values: theme("--color"), doc: "First gradient stop — color with optional position." }),
  stop("via", "via", { values: theme("--color"), doc: "Middle gradient stop — color with optional position." }),
  stop("to", "to", { values: theme("--color"), doc: "Last gradient stop — color with optional position." }),

  // Group / Peer markers
  opt("group", "group", "/", { doc: "Group marker — enables `group-*` variants on descendants; optionally named." }),
  opt("peer", "peer", "/", { doc: "Peer marker — enables `peer-*` variants on siblings; optionally named." }),

  // Container-query container (v4): @container / @container/{name}
  opt("containerQuery", "@container", "/", { doc: "Container-query container; optionally named." }),

  // Filters
  opt("blur", "blur", undefined, { values: lit("none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"), doc: "Blur filter (bare = default)." }),
  opt("backdropBlur", "backdrop-blur", undefined, { values: lit("none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"), doc: "Backdrop blur filter (bare = default)." }),
  pre("brightness", "brightness", { values: ref("TailwindBrightness"), doc: "Brightness filter (percent)." }),
  pre("backdropBrightness", "backdrop-brightness", { values: ref("TailwindBrightness"), doc: "Backdrop brightness filter (percent)." }),
  pre("contrast", "contrast", { values: ref("TailwindContrast"), doc: "Contrast filter (percent)." }),
  pre("backdropContrast", "backdrop-contrast", { values: ref("TailwindContrast"), doc: "Backdrop contrast filter (percent)." }),
  opt("grayscale", "grayscale", undefined, { doc: "Grayscale filter (bare = 100%)." }),
  opt("backdropGrayscale", "backdrop-grayscale", undefined, { doc: "Backdrop grayscale filter (bare = 100%)." }),
  pre("hueRotate", "hue-rotate", { values: ref("TailwindHueRotate"), doc: "Hue-rotate filter in degrees." }),
  pre("backdropHueRotate", "backdrop-hue-rotate", { values: ref("TailwindHueRotate"), doc: "Backdrop hue-rotate filter in degrees." }),
  opt("invert", "invert", undefined, { doc: "Invert filter (bare = 100%)." }),
  opt("backdropInvert", "backdrop-invert", undefined, { doc: "Backdrop invert filter (bare = 100%)." }),
  pre("saturate", "saturate", { values: ref("TailwindSaturate"), doc: "Saturation filter (percent)." }),
  pre("backdropSaturate", "backdrop-saturate", { values: ref("TailwindSaturate"), doc: "Backdrop saturation filter (percent)." }),
  opt("sepia", "sepia", undefined, { doc: "Sepia filter (bare = 100%)." }),
  opt("backdropSepia", "backdrop-sepia", undefined, { doc: "Backdrop sepia filter (bare = 100%)." }),

  // Timing / Resize / Performance / Overscroll
  pre("willChange", "will-change", { values: lit("auto", "scroll", "contents", "transform"), doc: "Hint the browser about upcoming changes." }),
  opt("resize", "resize", undefined, { values: lit("none", "x", "y"), doc: "User-resizability (bare = both axes)." }),
  space("overscroll", "overscroll", "-", false, false, { values: lit("auto", "contain", "none"), doc: "Overscroll behavior — both axes or one." }),

  // Negative value prefix
  val("neg", "-", { doc: "Prefix an arbitrary utility with `-` (negative value passthrough)." }),

  // Typed escape (llm-styling/escape-hatch): arbitrary CSS property → Tailwind's
  // `[prop:value]` arbitrary-property form (spaces → `_`). A vocab row so the
  // extractor scans it — literal args are safelisted, non-literal args are
  // tracked as unresolved (build error under `onUnresolved: "error"`).
  custom("cssProp", (a) => (a.length === 2 ? [`[${a[0]}:${a[1]!.replace(/\s+/g, "_")}]`] : []),
    [["mask-repeat", "no-repeat"], ["border", "1px solid red"], ["--brand-glow", "0 0 4px red"]],
    { doc: "Arbitrary-CSS escape — emits `[prop:value]` (spaces become `_`); variant-composable." }),

  // htmx (B-04): sanctioned loading-indicator class, so the extractor/ESLint accept it
  stat("htmxIndicator", "htmx-indicator", { doc: "htmx loading-indicator marker class." }),

  pre("fillColor", "fill", { values: theme("--color"), doc: "SVG fill color." }),
  pre("strokeColor", "stroke", { values: theme("--color"), doc: "SVG stroke color." }),
  size("strokeWidth", "stroke", { values: ref("TailwindStrokeWidth"), doc: "SVG stroke width." }),
  pre("accentColor", "accent", { values: theme("--color"), doc: "Accent color of form controls." }),
  pre("caretColor", "caret", { values: theme("--color"), doc: "Text-input caret color." }),
  pre("scheme", "scheme", { values: lit("normal", "light", "dark", "light-dark", "only-light", "only-dark"), doc: "color-scheme of the element." }),
  pre("decorationColor", "decoration", { values: theme("--color"), doc: "Text-decoration color." }),
  pre("decorationStyle", "decoration", { values: lit("solid", "double", "dotted", "dashed", "wavy"), doc: "Text-decoration style." }),
  size("decorationThickness", "decoration", { values: ref("TailwindDecorationThickness"), doc: "Text-decoration thickness." }),

  size("insetX", "inset-x", { values: ref("TailwindInset"), doc: "Left + right offsets at once." }),
  size("insetY", "inset-y", { values: ref("TailwindInset"), doc: "Top + bottom offsets at once." }),
  size("insetS", "inset-s", { values: ref("TailwindInset"), doc: "Logical inline-start offset." }),
  size("insetE", "inset-e", { values: ref("TailwindInset"), doc: "Logical inline-end offset." }),

  pre("textWrap", "text", { values: lit("wrap", "nowrap", "balance", "pretty"), doc: "Text wrapping strategy." }),
  pre("wrap", "wrap", { values: lit("break-word", "anywhere", "normal"), doc: "Overflow-wrap — where long words may break." }),
  pre("hyphens", "hyphens", { values: lit("none", "manual", "auto"), doc: "Hyphenation behavior." }),
  pre("textShadow", "text-shadow", { values: theme("--text-shadow"), doc: "Text shadow — theme size (value required)." }),
  pre("textShadowColor", "text-shadow", { values: theme("--color"), doc: "Text-shadow color." }),

  pre("dropShadow", "drop-shadow", { values: theme("--drop-shadow"), doc: "Drop-shadow filter — theme size (value required)." }),
  pre("dropShadowColor", "drop-shadow", { values: theme("--color"), doc: "Drop-shadow color." }),
  pre("insetShadow", "inset-shadow", { values: theme("--inset-shadow"), doc: "Inner box shadow — theme size (value required)." }),
  pre("insetShadowColor", "inset-shadow", { values: theme("--color"), doc: "Inner box-shadow color." }),
  opt("insetRing", "inset-ring", undefined, { values: ref("TailwindRingWidth"), doc: "Inner ring width (bare = 1px)." }),
  pre("insetRingColor", "inset-ring", { values: theme("--color"), doc: "Inner ring color." }),
  pre("mixBlend", "mix-blend", { values: lit("normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity", "plus-darker", "plus-lighter"), doc: "Blend mode of the element against its backdrop." }),
  pre("bgBlend", "bg-blend", { values: lit("normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"), doc: "Blend mode of the background layers." }),
  stat("isolate", "isolate", { doc: "Create a new stacking context." }),
  pre("isolation", "isolation", { values: lit("auto"), doc: "Reset stacking-context isolation." }),

  pre("delay", "delay", { values: ref("TailwindDelay"), doc: "Transition delay in ms." }),
  pre("transitionBehavior", "transition", { values: lit("normal", "discrete"), doc: "Whether discrete properties transition." }),

  pre("perspective", "perspective", { values: lit("dramatic", "near", "normal", "midrange", "distant", "none"), doc: "3D perspective depth on the parent." }),
  pre("perspectiveOrigin", "perspective-origin", { values: lit("center", "top", "top-right", "right", "bottom-right", "bottom", "bottom-left", "left", "top-left"), doc: "Vanishing-point origin for 3D perspective." }),
  pre("transformStyle", "transform", { values: lit("3d", "flat"), doc: "Whether children are positioned in 3D space." }),
  pre("backfaceVisibility", "backface", { values: lit("visible", "hidden"), doc: "Visibility of an element's back face." }),
  stat("scale3d", "scale-3d", { doc: "Apply scale on all three axes." }),
  custom("rotateX", (args) => [signNeg("rotate-x", args[0]!)], [["45"], ["-45"]], { values: ref("TailwindRotate"), doc: "Rotation around the X axis in degrees." }),
  custom("rotateY", (args) => [signNeg("rotate-y", args[0]!)], [["30"], ["-30"]], { values: ref("TailwindRotate"), doc: "Rotation around the Y axis in degrees." }),
  custom("rotateZ", (args) => [signNeg("rotate-z", args[0]!)], [["90"], ["-90"]], { values: ref("TailwindRotate"), doc: "Rotation around the Z axis in degrees." }),
  custom("scaleX", (args) => [signNeg("scale-x", args[0]!)], [["110"], ["-100"]], { values: ref("TailwindScale"), doc: "Scale on the X axis (percent)." }),
  custom("scaleY", (args) => [signNeg("scale-y", args[0]!)], [["75"], ["-75"]], { values: ref("TailwindScale"), doc: "Scale on the Y axis (percent)." }),
  custom("scaleZ", (args) => [signNeg("scale-z", args[0]!)], [["150"], ["-150"]], { values: ref("TailwindScale"), doc: "Scale on the Z axis (percent)." }),

  custom("colStart", (a) => [signNeg("col-start", a[0]!)], [["2"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid column start line (negatives count from the end)." }),
  custom("colEnd", (a) => [signNeg("col-end", a[0]!)], [["2"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid column end line (negatives count from the end)." }),
  custom("rowStart", (a) => [signNeg("row-start", a[0]!)], [["3"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid row start line (negatives count from the end)." }),
  custom("rowEnd", (a) => [signNeg("row-end", a[0]!)], [["3"], ["-1"], ["auto"]], { values: ref("TailwindGridLine"), doc: "Grid row end line (negatives count from the end)." }),
  pre("rowSpan", "row-span", { values: ref("TailwindRowSpan"), doc: "How many rows an item spans." }),
  pre("columns", "columns", { values: ref("TailwindColumns"), doc: "Multi-column count or width." }),
  pre("breakBefore", "break-before", { values: lit("auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"), doc: "Column/page break before the element." }),
  pre("breakAfter", "break-after", { values: lit("auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"), doc: "Column/page break after the element." }),
  pre("breakInside", "break-inside", { values: lit("auto", "avoid", "avoid-page", "avoid-column"), doc: "Column/page break inside the element." }),
  pre("boxDecoration", "box-decoration", { values: lit("clone", "slice"), doc: "How box decorations behave across fragments." }),
  custom("snap", (a) => (a.length <= 1 ? [`snap-${a[0] ?? "none"}`] : [`snap-${a[0]}`, `snap-${a[1]}`]), [["x"], ["both"], ["x", "mandatory"], ["y", "proximity"]], { values: ref("TailwindSnapAxis"), doc: "Scroll-snap axis with optional strictness." }),
  custom("snapAlign", (a) => [a[0] === "none" ? "snap-align-none" : `snap-${a[0]}`], [["start"], ["center"], ["none"]], { values: lit("start", "end", "center", "none"), doc: "Snap alignment of a snapped child." }),
  pre("snapStop", "snap", { values: lit("normal", "always"), doc: "Whether scrolling may skip past snap positions." }),
  pre("scrollBehavior", "scroll", { values: lit("auto", "smooth"), doc: "Programmatic scrolling behavior." }),
  space("scrollMargin", "scroll-m", "", true, true, { values: theme("--spacing"), doc: "Scroll margin — all sides, one axis/side, or the unit overload." }),
  space("scrollPadding", "scroll-p", "", true, true, { values: theme("--spacing"), doc: "Scroll padding — all sides, one axis/side, or the unit overload." }),
  pre("fieldSizing", "field-sizing", { values: lit("content", "fixed"), doc: "Whether form fields size to their content." }),

  // Pseudo-element content — bare = empty string (the common `before:`/`after:` case)
  custom("content", (a) => [a[0] === undefined ? "content-['']" : `content-${a[0]}`],
    [[], ["none"], ["[attr(data-label)]"]],
    { values: lit("none"), doc: "Pseudo-element content — `none`, arbitrary `[…]`, or bare for the empty string." }),

  custom("maskImage", (a) => (a[0] === "none" ? ["mask-none"] : [`mask-${a[0]}`]), [["none"], ["[url(/x.png)]"]], { doc: "Mask image — `none` or an arbitrary source." }),
  custom("maskFrom", (a) => (a.length === 2 ? [`mask-${a[0]}-from-${a[1]}`] : []), [["t", "50%"], ["x", "70%"], ["r", "blue-500"], ["l", "4"], ["t", "[20px]"]], { values: ref("TailwindMaskStop"), doc: "Edge-fade mask start — edge + stop." }),
  custom("maskTo", (a) => (a.length === 2 ? [`mask-${a[0]}-to-${a[1]}`] : []), [["b", "90%"], ["y", "95%"]], { values: ref("TailwindMaskStop"), doc: "Edge-fade mask end — edge + stop." }),
  custom("maskComposite", (a) => [`mask-${a[0]}`], [["add"], ["subtract"], ["intersect"], ["exclude"]], { values: lit("add", "subtract", "intersect", "exclude"), doc: "How multiple masks combine." }),
  pre("maskType", "mask-type", { values: lit("alpha", "luminance"), doc: "SVG mask interpretation mode." }),

  // CSS Anchor Positioning (B-010) emits *inline style*, never a class — anchorName /
  // positionAnchor / positionArea (and viewTransitionName, F-B-181) all take arbitrary
  // custom-idents or multi-keyword grammar the extractor can't resolve and Tailwind has no
  // native utility for, so they are deliberately NOT in the class vocab. See tailwind-methods.ts.
];
