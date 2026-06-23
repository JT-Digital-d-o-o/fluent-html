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
import { DIR_MAP, ROUNDED_CORNERS, defineUtility } from "./types.js";
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

// ── The vocabulary ──────────────────────────────────────────────────
//
// NOTE (A-07, P3): `display`/`position` are `value` rows here, faithful to the
// current `.display(v)`/`.position(v)` passthroughs. A-07 replaces them with
// dedicated `static` rows (`.block()`/`.absolute()`/…) — the `static` shape is
// already provided for that. C-05 stays validated against today's lib surface.

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
  pre("textSize", "text"),
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
  pre("leading", "leading"),
  pre("tracking", "tracking"),
  pre("whitespace", "whitespace"),
  pre("underlineOffset", "underline-offset"),
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
  stat("flex1", "flex-1"),
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
  val("position"),
  pre("zIndex", "z"),
  space("overflow", "overflow", "-", false, false),
  pre("objectFit", "object"),

  // Layout & Display
  val("display"),
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

  // Transforms (translate is strictly 2-arg: `translate-${axis}-${value}`, no unit/bare form)
  pre("scale", "scale"),
  pre("rotate", "rotate"),
  custom("translate", (args) => (args.length === 2 ? [`translate-${args[0]}-${args[1]}`] : []), [["x", "2"], ["y", "4"]]),
  pre("skewX", "skew-x"),
  pre("skewY", "skew-y"),

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
  custom("gradient", (args) => (args.length >= 2 ? [`bg-linear-${args[2] ?? "to-r"}`, `from-${args[0]}`, `to-${args[1]}`] : []), [["red-500", "blue-500"], ["red-500", "blue-500", "to-br"]]),
  pre("gradientTo", "bg-linear"),
  stat("gradientRadial", "bg-radial"),
  stat("gradientConic", "bg-conic"),
  pre("from", "from"),
  pre("via", "via"),
  pre("to", "to"),

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
];
