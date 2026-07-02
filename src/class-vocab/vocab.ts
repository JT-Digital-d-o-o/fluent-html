/**
 * `classVocab` — the ~120-row source of truth for the fluent styling
 * vocabulary. Mirrors the render-time emitters in `src/core/tailwind-methods.ts`
 * exactly (the `class-vocab.test.ts` lib-parity test renders each method and
 * compares). The extractor + ESLint maps are generated from this array.
 *
 * Rows are grouped to match the sections in `tailwind-methods.ts`.
 *
 * @module
 */
import { DIR_MAP, ROUNDED_CORNERS, signNeg, defineUtility, radialGradientClass } from "./types.js";
import type { UtilityDef } from "./types.js";

// ── Row constructors (keep the table terse + uniform) ───────────────

/** Zero-arg fixed class. */
const stat = (method: string, cls: string): UtilityDef =>
  defineUtility({ method, emit: { kind: "static", class: cls } });

/** Exactly one value → `prefix-value`. */
const pre = (method: string, prefix: string): UtilityDef =>
  defineUtility({ method, emit: { kind: "prefix", prefix } });

/** Optional value → `prefix` | `prefix${sep}value`. */
const opt = (method: string, prefix: string, sep?: "-" | "/"): UtilityDef =>
  defineUtility({ method, emit: sep ? { kind: "optional", prefix, sep } : { kind: "optional", prefix } });

/** Spacing/directional family. `units` enables the `(unit, amount)` arbitrary overload. */
const space = (method: string, prefix: string, sep: "" | "-", abbrev: boolean, units: boolean): UtilityDef =>
  defineUtility({ method, emit: { kind: "spacing", prefix, sep, abbrev, units } });

/** Single-axis sizing/inset (unit overload, no direction). */
const size = (method: string, prefix: string): UtilityDef =>
  defineUtility({ method, emit: { kind: "sizing", prefix } });

/** Arg-verbatim value, optionally prefixed. */
const val = (method: string, prefix?: string): UtilityDef =>
  defineUtility({ method, emit: prefix ? { kind: "value", prefix } : { kind: "value" } });

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

const custom = (method: string, emit: (args: readonly string[]) => string[], samples: readonly (readonly string[])[]): UtilityDef =>
  defineUtility({ method, emit: { kind: "custom", emit }, samples });

const interp = (cls: string, i?: string): string => (i ? `${cls}/${i}` : cls);
const stop = (method: string, prefix: string): UtilityDef =>
  custom(method, (a) => (a.length >= 2 ? [`${prefix}-${a[0]}`, `${prefix}-${a[1]}`] : a.length === 1 ? [`${prefix}-${a[0]}`] : []),
    [["red-500"], ["red-500", "10%"]]);

// ── The vocabulary ──────────────────────────────────────────────────

export const classVocab: readonly UtilityDef[] = [
  // Spacing
  space("padding", "p", "", true, true),
  space("margin", "m", "", true, true),
  pre("spaceX", "space-x"),
  pre("spaceY", "space-y"),
  space("gap", "gap", "-", false, true),

  // Colors
  pre("background", "bg"),
  pre("textColor", "text"),
  custom("borderColor", emitBorderColor, [["red-500"], ["top", "red-500"]]),
  pre("ringColor", "ring"),
  pre("shadowColor", "shadow"),

  // Typography
  size("textSize", "text"),
  pre("textAlign", "text"),
  pre("fontWeight", "font"),
  pre("fontFamily", "font"),
  stat("bold", "font-bold"),
  stat("italic", "italic"),
  stat("uppercase", "uppercase"),
  stat("lowercase", "lowercase"),
  stat("capitalize", "capitalize"),
  stat("underline", "underline"),
  stat("noUnderline", "no-underline"),
  stat("lineThrough", "line-through"),
  stat("truncate", "truncate"),
  stat("antialiased", "antialiased"),
  stat("tabularNums", "tabular-nums"),
  stat("breakAll", "break-all"),
  size("leading", "leading"),
  size("tracking", "tracking"),
  pre("whitespace", "whitespace"),
  size("underlineOffset", "underline-offset"),
  pre("lineClamp", "line-clamp"),

  // Sizing
  size("w", "w"),
  size("h", "h"),
  size("maxW", "max-w"),
  size("minW", "min-w"),
  size("maxH", "max-h"),
  size("minH", "min-h"),
  pre("aspect", "aspect"),

  // Flexbox
  opt("flex", "flex"),
  pre("flexShorthand", "flex"),
  pre("flexDirection", "flex"),
  pre("flexWrap", "flex"),
  pre("justifyContent", "justify"),
  pre("alignItems", "items"),
  pre("alignSelf", "self"),
  opt("shrink", "shrink"),
  opt("grow", "grow"),

  // Grid
  stat("grid", "grid"),
  pre("gridCols", "grid-cols"),
  pre("gridRows", "grid-rows"),
  pre("gridAutoFlow", "grid-flow"),
  pre("gridAutoRows", "auto-rows"),
  pre("gridAutoCols", "auto-cols"),
  pre("colSpan", "col-span"),
  pre("order", "order"),

  // Place
  pre("placeContent", "place-content"),
  pre("placeItems", "place-items"),
  pre("placeSelf", "place-self"),

  // Borders
  custom("border", emitBorder, [[], ["2"], ["t"], ["top", "2"]]),
  pre("borderStyle", "border"),
  custom("rounded", emitRounded, [[], ["lg"], ["t"], ["tl", "lg"]]),
  opt("divideX", "divide-x"),
  opt("divideY", "divide-y"),

  // Effects & Appearance
  opt("shadow", "shadow"),
  pre("opacity", "opacity"),
  pre("cursor", "cursor"),
  // Position — dedicated shortcuts (A-07, replaced the `.position(value)` passthrough).
  stat("absolute", "absolute"),
  stat("relative", "relative"),
  stat("fixed", "fixed"),
  stat("sticky", "sticky"),
  stat("static", "static"),
  pre("zIndex", "z"),
  space("overflow", "overflow", "-", false, false),
  pre("objectFit", "object"),

  // Layout & Display — dedicated shortcuts (A-07; `.flex()`/`.grid()`/`.hidden()` cover the rest).
  stat("block", "block"),
  stat("inlineBlock", "inline-block"),
  stat("inline", "inline"),
  stat("inlineFlex", "inline-flex"),
  stat("inlineGrid", "inline-grid"),
  stat("contents", "contents"),
  stat("hidden", "hidden"),
  size("inset", "inset"),
  size("top", "top"),
  size("right", "right"),
  size("bottom", "bottom"),
  size("left", "left"),

  // Transitions & Animation
  opt("transition", "transition"),
  pre("duration", "duration"),
  pre("animate", "animate"),
  pre("ease", "ease"),

  // Ring
  opt("ring", "ring"),

  // Transforms (A-07: rotate/skew/translate relocate a leading `-` via signNeg, so
  // `.rotate(-45)` → `-rotate-45`; translate is strictly 2-arg `translate-${axis}-${value}`)
  pre("scale", "scale"),
  custom("rotate", (args) => [signNeg("rotate", args[0]!)], [["45"], ["-45"]]),
  custom("translate", (args) => (args.length === 2 ? [signNeg(`translate-${args[0]}`, args[1]!)] : []), [["x", "2"], ["y", "-4"]]),
  custom("skewX", (args) => [signNeg("skew-x", args[0]!)], [["6"], ["-6"]]),
  custom("skewY", (args) => [signNeg("skew-y", args[0]!)], [["6"], ["-6"]]),

  // Interactivity
  pre("select", "select"),
  pre("pointerEvents", "pointer-events"),

  // List Style (both emit `list-…`)
  pre("listStyleType", "list"),
  pre("listStylePosition", "list"),

  // Accessibility
  stat("srOnly", "sr-only"),

  // Outline
  pre("outline", "outline"),
  stat("outlineHidden", "outline-hidden"),

  // Gradients (v4-native: bg-linear-* / bg-radial-* / bg-conic-*)
  custom("gradient", (a) => (a.length >= 2
    ? [interp(`bg-linear-${a[2] ?? "to-r"}`, a[3]), `from-${a[0]}`, `to-${a[1]}`] : []),
    [["red-500", "blue-500"], ["red-500", "blue-500", "to-br"], ["red-500", "blue-500", "to-br", "oklab"]]),
  custom("gradientTo", (a) => (a.length >= 1 ? [interp(`bg-linear-${a[0]}`, a[1])] : []),
    [["to-r"], ["to-r", "oklch"], ["to-tr", "longer"]]),
  custom("gradientLinear", (a) => [signNeg("bg-linear", a[0]!)],
    [["45"], ["-65"], ["[0.25turn]"]]),
  custom("gradientRadial", (a) => [radialGradientClass(a[0], a[1])],
    [[], ["top-left"], ["[at_top_left]"], ["top-right", "oklch"], ["top-right", "longer"]]),
  custom("gradientConic", (a) => [interp(a[0] === undefined ? "bg-conic" : signNeg("bg-conic", a[0]), a[1])],
    [[], ["180"], ["-90"], ["undefined", "longer"]]),
  stop("from", "from"),
  stop("via", "via"),
  stop("to", "to"),

  // Group / Peer markers
  opt("group", "group", "/"),
  opt("peer", "peer", "/"),

  // Container-query container (v4): @container / @container/{name}
  opt("containerQuery", "@container", "/"),

  // Filters
  opt("blur", "blur"),
  opt("backdropBlur", "backdrop-blur"),
  pre("brightness", "brightness"),
  pre("backdropBrightness", "backdrop-brightness"),
  pre("contrast", "contrast"),
  pre("backdropContrast", "backdrop-contrast"),
  opt("grayscale", "grayscale"),
  opt("backdropGrayscale", "backdrop-grayscale"),
  pre("hueRotate", "hue-rotate"),
  pre("backdropHueRotate", "backdrop-hue-rotate"),
  opt("invert", "invert"),
  opt("backdropInvert", "backdrop-invert"),
  pre("saturate", "saturate"),
  pre("backdropSaturate", "backdrop-saturate"),
  opt("sepia", "sepia"),
  opt("backdropSepia", "backdrop-sepia"),

  // Timing / Resize / Performance / Overscroll
  pre("willChange", "will-change"),
  opt("resize", "resize"),
  space("overscroll", "overscroll", "-", false, false),

  // Negative value prefix
  val("neg", "-"),

  // htmx (B-04): sanctioned loading-indicator class, so the extractor/ESLint accept it
  stat("htmxIndicator", "htmx-indicator"),

  pre("fillColor", "fill"),
  pre("strokeColor", "stroke"),
  size("strokeWidth", "stroke"),
  pre("accentColor", "accent"),
  pre("caretColor", "caret"),
  pre("scheme", "scheme"),
  pre("decorationColor", "decoration"),
  pre("decorationStyle", "decoration"),
  size("decorationThickness", "decoration"),

  size("insetX", "inset-x"),
  size("insetY", "inset-y"),
  size("insetS", "inset-s"),
  size("insetE", "inset-e"),

  pre("textWrap", "text"),
  pre("hyphens", "hyphens"),
  pre("textShadow", "text-shadow"),
  pre("textShadowColor", "text-shadow"),

  pre("dropShadow", "drop-shadow"),
  pre("dropShadowColor", "drop-shadow"),
  pre("insetShadow", "inset-shadow"),
  pre("insetShadowColor", "inset-shadow"),
  opt("insetRing", "inset-ring"),
  pre("insetRingColor", "inset-ring"),
  pre("mixBlend", "mix-blend"),
  pre("bgBlend", "bg-blend"),
  stat("isolate", "isolate"),
  pre("isolation", "isolation"),

  pre("delay", "delay"),
  pre("transitionBehavior", "transition"),

  pre("perspective", "perspective"),
  pre("perspectiveOrigin", "perspective-origin"),
  pre("transformStyle", "transform"),
  pre("backfaceVisibility", "backface"),
  stat("scale3d", "scale-3d"),
  custom("rotateX", (args) => [signNeg("rotate-x", args[0]!)], [["45"], ["-45"]]),
  custom("rotateY", (args) => [signNeg("rotate-y", args[0]!)], [["30"], ["-30"]]),
  custom("rotateZ", (args) => [signNeg("rotate-z", args[0]!)], [["90"], ["-90"]]),
  custom("scaleX", (args) => [signNeg("scale-x", args[0]!)], [["110"], ["-100"]]),
  custom("scaleY", (args) => [signNeg("scale-y", args[0]!)], [["75"], ["-75"]]),
  custom("scaleZ", (args) => [signNeg("scale-z", args[0]!)], [["150"], ["-150"]]),

  custom("colStart", (a) => [signNeg("col-start", a[0]!)], [["2"], ["-1"], ["auto"]]),
  custom("colEnd", (a) => [signNeg("col-end", a[0]!)], [["2"], ["-1"], ["auto"]]),
  custom("rowStart", (a) => [signNeg("row-start", a[0]!)], [["3"], ["-1"], ["auto"]]),
  custom("rowEnd", (a) => [signNeg("row-end", a[0]!)], [["3"], ["-1"], ["auto"]]),
  pre("rowSpan", "row-span"),
  pre("columns", "columns"),
  pre("breakBefore", "break-before"),
  pre("breakAfter", "break-after"),
  pre("breakInside", "break-inside"),
  pre("boxDecoration", "box-decoration"),
  custom("snap", (a) => (a.length <= 1 ? [`snap-${a[0] ?? "none"}`] : [`snap-${a[0]}`, `snap-${a[1]}`]), [["x"], ["both"], ["x", "mandatory"], ["y", "proximity"]]),
  custom("snapAlign", (a) => [a[0] === "none" ? "snap-align-none" : `snap-${a[0]}`], [["start"], ["center"], ["none"]]),
  pre("snapStop", "snap"),
  pre("scrollBehavior", "scroll"),
  space("scrollMargin", "scroll-m", "", true, true),
  space("scrollPadding", "scroll-p", "", true, true),
  pre("fieldSizing", "field-sizing"),

  custom("maskImage", (a) => (a[0] === "none" ? ["mask-none"] : [`mask-${a[0]}`]), [["none"], ["[url(/x.png)]"]]),
  custom("maskFrom", (a) => (a.length === 2 ? [`mask-${a[0]}-from-${a[1]}`] : []), [["t", "50%"], ["x", "70%"], ["r", "blue-500"], ["l", "4"], ["t", "[20px]"]]),
  custom("maskTo", (a) => (a.length === 2 ? [`mask-${a[0]}-to-${a[1]}`] : []), [["b", "90%"], ["y", "95%"]]),
  custom("maskComposite", (a) => [`mask-${a[0]}`], [["add"], ["subtract"], ["intersect"], ["exclude"]]),
  pre("maskType", "mask-type"),

  // CSS Anchor Positioning (B-010) emits *inline style*, never a class — anchorName /
  // positionAnchor / positionArea (and viewTransitionName, F-B-181) all take arbitrary
  // custom-idents or multi-keyword grammar the extractor can't resolve and Tailwind has no
  // native utility for, so they are deliberately NOT in the class vocab. See tailwind-methods.ts.
];
