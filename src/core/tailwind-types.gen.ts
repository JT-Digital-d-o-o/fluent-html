// AUTO-GENERATED — do NOT edit by hand. Regenerate: `npm run gen:vocab` (CI checks `--check`).
// Sources: src/class-vocab/vocab.ts (values lists) + scripts/gen-vocab/tailwind-types.template.txt.
// Validity oracle: tailwindcss@4.3.3 (exact pin; see scripts/gen-vocab/load-design-system.ts).
// ------------------------------------
// Tailwind Type Definitions
// ------------------------------------

// Utility: allows both number literals and their string equivalents (e.g. 2 | "2")
type Stringified<T extends number> = `${T}`;

// Escape hatch:
//   `[${string}]`   — bracket-only escape hatch for arbitrary CSS values.
//                      Forces explicit bracket syntax like "[13px]".
//
// NOTE (C-02): the five themeable families (colors, spacing, fontSize, radius,
// shadow) are CLOSED — they no longer carry `(string & {})`. An open tail can't
// typo-check (`.background("brnad")` would compile). Custom tokens instead come
// from the augmentable seams (tailwind-types.seams.ts), populated by `defineTheme()`. The cost of
// closing is the restated opacity/arbitrary arms. Proof: spikes/define-theme.

// ── defineTheme augmentation seams (C-02) — hand-written, in tailwind-types.seams.ts ──
// One EMPTY augmentable interface per themeable @theme family (+ `ThemeKeys`);
// `defineTheme()` targets them, so regeneration must never touch them.
import type {
  FluentCustomColors, FluentCustomSpacing, FluentCustomFontSize, FluentCustomRadius, FluentCustomShadow,
  FluentCustomTextShadow, FluentCustomDropShadow, FluentCustomInsetShadow,
} from "./tailwind-types.seams.js";

// Spacing scale (used for padding, margin, gap, and — via derived types — width/
// height/inset). CLOSED (C-02): custom spacing tokens come from FluentCustomSpacing.
type BaseSpacing =
  | "0" | "px" | "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "3.5" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "11" | "12" | "14" | "16" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96";
export type TailwindSpacing = BaseSpacing | (keyof FluentCustomSpacing & string) | `[${string}]`;

// Width values. CLOSED (F-D-900): a typo like `.w("brnad")` is a compile error. Arbitrary
// values route through `TailwindSpacing`'s `[${string}]` arm and the `(unit, amount)` overload.
export type TailwindWidth =
  | TailwindSpacing | "auto" | "full" | "screen" | "svw" | "lvw" | "dvw" | "min" | "max" | "fit"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5"
  | "1/6" | "2/6" | "3/6" | "4/6" | "5/6" | "1/12" | "2/12" | "3/12" | "4/12" | "5/12" | "6/12" | "7/12" | "8/12" | "9/12" | "10/12" | "11/12";

// Height values. CLOSED — arbitrary via TailwindSpacing's `[${string}]` + the `(unit, amount)` overload.
export type TailwindHeight =
  | TailwindSpacing | "auto" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5" | "1/6" | "2/6" | "3/6" | "4/6" | "5/6";

// Max-width values. CLOSED — explicit `[${string}]` arm (this union does not embed TailwindSpacing).
export type TailwindMaxWidth =
  | "0" | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  | "full" | "min" | "max" | "fit" | "prose" | "screen-sm" | "screen-md" | "screen-lg" | "screen-xl" | "screen-2xl"
  | `[${string}]`;

// Min-width values. CLOSED — explicit `[${string}]` arm.
export type TailwindMinWidth = "0" | "full" | "min" | "max" | "fit" | `[${string}]`;

// Max-height values. CLOSED — arbitrary via TailwindSpacing's `[${string}]`.
export type TailwindMaxHeight = TailwindSpacing | "none" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit";

// Min-height values. CLOSED — explicit `[${string}]` arm.
export type TailwindMinHeight = "0" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit" | `[${string}]`;

// Color shades
export type TailwindShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

// Color names
export type TailwindColorName =
  | "slate" | "gray" | "zinc" | "neutral" | "stone"
  | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";

// Full color type. CLOSED (C-02): custom colors come from FluentCustomColors
// (defineTheme), not `(string & {})`. The opacity + arbitrary forms that the
// open tail gave for free are restated as explicit arms.
type BaseColor =
  | "inherit" | "current" | "transparent" | "black" | "white"
  | `${TailwindColorName}-${TailwindShade}`;
type CustomColor = keyof FluentCustomColors & string;
export type TailwindColor =
  | BaseColor
  | CustomColor
  | `${BaseColor}/${number}`     // base + opacity   (e.g. blue-500/50)
  | `${CustomColor}/${number}`   // custom + opacity (e.g. brand/50)
  | `[${string}]`;               // arbitrary value  (e.g. [#1a2b3c])

// Text size (fontSize family). CLOSED (C-02): custom sizes from FluentCustomFontSize.
export type TailwindTextSize =
  | "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl"
  | (keyof FluentCustomFontSize & string) | `[${string}]`;

// Font weight
export type TailwindFontWeight =
  | "thin" | "extralight" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black"
  | `[${string}]`;

// Leading (line-height)
export type TailwindLeading = "none" | "tight" | "snug" | "normal" | "relaxed" | "loose" | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | `[${string}]`;

// Tracking (letter-spacing)
export type TailwindTracking = "tighter" | "tight" | "normal" | "wide" | "wider" | "widest" | `[${string}]`;

// Border radius (radius family). CLOSED (C-02): custom radii from FluentCustomRadius.
// v4 (C-03): added the `xs` slot and `4xl`.
export type TailwindRounded =
  | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"
  | (keyof FluentCustomRadius & string) | `[${string}]`;
export type TailwindRoundedCorner = "t" | "r" | "b" | "l" | "tl" | "tr" | "br" | "bl" | "s" | "e" | "ss" | "se" | "es" | "ee";

// Shadow (shadow family). CLOSED (C-02): custom shadows from FluentCustomShadow;
// arbitrary `[…]` restated (was riding on the removed `(string & {})`).
// v4 (C-03): added the `2xs`/`xs` slots (the scale shifted — old `shadow-sm` is now `shadow-xs`).
export type TailwindShadow =
  | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "none"
  | (keyof FluentCustomShadow & string) | `[${string}]`;

// Border width
export type TailwindBorderWidth = 0 | 2 | 4 | 8 | Stringified<0 | 2 | 4 | 8> | `[${string}]`;

// Opacity
export type TailwindOpacity =
  | 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45
  | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95 | 100
  | Stringified<0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95 | 100>
  | `[${string}]`;

// Cursor
export type TailwindCursor =
  | "auto" | "default" | "pointer" | "wait" | "text" | "move" | "help" | "not-allowed" | "none"
  | "context-menu" | "progress" | "cell" | "crosshair" | "vertical-text" | "alias" | "copy" | "no-drop"
  | "grab" | "grabbing" | "all-scroll" | "col-resize" | "row-resize" | "n-resize" | "e-resize" | "s-resize"
  | "w-resize" | "ne-resize" | "nw-resize" | "se-resize" | "sw-resize" | "ew-resize" | "ns-resize"
  | "nesw-resize" | "nwse-resize" | "zoom-in" | "zoom-out";

// Z-index
export type TailwindZIndex = 0 | 10 | 20 | 30 | 40 | 50 | Stringified<0 | 10 | 20 | 30 | 40 | 50> | "auto" | `[${string}]`;

// Grid columns/rows — bare numbers beyond 12 via `${number}`; arbitrary track lists via `[…]`.
// (Was `(string & {})`, which also swallowed typos like `.gridCols("brnad")` as dead classes.)
export type TailwindGridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "none" | "subgrid" | `${number}` | `[${string}]`;
export type TailwindGridRows = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "none" | "subgrid" | `${number}` | `[${string}]`;

// Flex
export type TailwindFlex = "1" | "auto" | "initial" | "none";

// Overflow
export type TailwindOverflow = "auto" | "hidden" | "clip" | "visible" | "scroll";

// Object fit
export type TailwindObjectFit = "contain" | "cover" | "fill" | "none" | "scale-down";

// Display
export type TailwindDisplay =
  | "block" | "inline-block" | "inline" | "flex" | "inline-flex"
  | "table" | "inline-table" | "table-cell" | "table-row" | "flow-root"
  | "grid" | "inline-grid" | "contents" | "list-item" | "hidden";

// Inset (top/right/bottom/left shorthand)
export type TailwindInset = TailwindSpacing | "auto" | "full" | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4";

// Flex wrap
export type TailwindFlexWrap = "wrap" | "wrap-reverse" | "nowrap";

// Align self
export type TailwindAlignSelf = "auto" | "start" | "end" | "center" | "stretch" | "baseline";

// Column span — bare numbers beyond 12 via `${number}`; arbitrary via `[…]`.
export type TailwindColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full" | `${number}` | `[${string}]`;

// Aspect ratio
export type TailwindAspect = "auto" | "square" | "video";

// Transitions & Animation
export type TailwindTransition = "none" | "all" | "colors" | "opacity" | "shadow" | "transform";
export type TailwindDuration = 0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000 | Stringified<0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000> | `${number}` | `[${string}]`;
export type TailwindAnimate = "none" | "spin" | "ping" | "pulse" | "bounce" | `[${string}]`;

// Ring — v4 (C-03): added the `3` slot. Bare `ring` = 1px in v4 (was 3px).
export type TailwindRingWidth = 0 | 1 | 2 | 3 | 4 | 8 | Stringified<0 | 1 | 2 | 3 | 4 | 8> | `${number}` | `[${string}]`;

// Transforms
export type TailwindScale = 0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150 | Stringified<0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150> | `${number}` | `[${string}]`;
// v4 (A-07): admit negatives — `.rotate(-45)` emits `-rotate-45` (sign relocated).
export type TailwindRotate =
  | 0 | 1 | 2 | 3 | 6 | 12 | 45 | 90 | 180
  | -1 | -2 | -3 | -6 | -12 | -45 | -90 | -180
  | Stringified<0 | 1 | 2 | 3 | 6 | 12 | 45 | 90 | 180 | -1 | -2 | -3 | -6 | -12 | -45 | -90 | -180>
  | `[${string}]`;
/** Translate distance — the spacing scale plus its negatives (`-translate-y-1`). */
export type TailwindTranslate = TailwindSpacing | `-${number}` | `-${number}/${number}` | "-full" | "-px";

// Interactivity
export type TailwindSelect = "none" | "text" | "all" | "auto";
export type TailwindPointerEvents = "none" | "auto";

// List style
export type TailwindListStyleType = "none" | "disc" | "decimal" | `[${string}]`;
export type TailwindListStylePosition = "inside" | "outside";

// Whitespace
export type TailwindWhitespace = "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap" | "break-spaces";

// Border style
export type TailwindBorderStyle = "solid" | "dashed" | "dotted" | "double" | "hidden" | "none";

// Outline
export type TailwindOutline = "none" | "dashed" | "dotted" | "double";

// Position
export type TailwindPosition = "static" | "fixed" | "absolute" | "relative" | "sticky";

// Text align
export type TailwindTextAlign = "left" | "center" | "right" | "justify";

// Flexbox layout
export type TailwindFlexDirection = "row" | "col" | "row-reverse" | "col-reverse";
export type TailwindJustifyContent = "start" | "end" | "center" | "between" | "around" | "evenly";
export type TailwindAlignItems = "start" | "end" | "center" | "baseline" | "stretch";

// Variant proxy types
export type TailwindState =
  | "hover" | "focus" | "focus-within" | "focus-visible"
  | "active" | "visited"
  | "disabled" | "enabled" | "checked" | "indeterminate" | "required" | "invalid" | "valid"
  | "first" | "last" | "odd" | "even" | "empty"
  | "first-of-type" | "last-of-type"
  | "placeholder" | "selection" | "marker" | "file"
  | "before" | "after"
  | "dark"
  // v4 (C-06): new states + the `not-*` negation, `supports-[…]` arms
  | "print" | "motion-reduce" | "motion-safe" | "portrait" | "landscape"
  | "starting" | "open" | "inert"
  | `not-${string}` | `supports-[${string}]`
  // v4 relational hooks (F-B-180): `:has()` (self + group/peer scopes) and the implicit-ancestor `in-*`
  | `has-[${string}]` | `group-has-[${string}]` | `peer-has-[${string}]` | `in-[${string}]`
  // unnamed + named group/peer states, aria/data attribute variants, extra
  // pseudo-classes, the structural `nth-*` family, and child/descendant (`*`/`**`)
  // variants. Each member is the bare prefix; the base utility goes in the callback.
  | `group-${GroupPeerState}` | `peer-${GroupPeerState}`
  | `group-${GroupPeerState}/${string}` | `peer-${GroupPeerState}/${string}`
  | AriaBoolVariant | `aria-[${string}]`
  | `group-${AriaBoolVariant}` | `peer-${AriaBoolVariant}`
  | `group-aria-[${string}]` | `peer-aria-[${string}]`
  | `data-[${string}]` | `group-data-[${string}]` | `peer-data-[${string}]`
  | ExtraPseudoState | StructuralNthVariant | ChildDescendantVariant;

// Container-query breakpoints (v4, C-06): `@sm` / `@max-lg` / `@[480px]` / `@sm/sidebar`.
export type TailwindContainerBreakpoint =
  | TailwindContainerSize                                   // @sm, @lg, …
  | `@max-${"3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"}`  // @max-lg
  | `${TailwindContainerSize}/${string}`                    // named scope: @lg/sidebar
  | `@[${string}]` | `@min-[${string}]` | `@max-[${string}]`;  // arbitrary widths (escape hatch)

// Responsive breakpoints — folded with container queries so `.at("@sm", …)` type-checks.
export type TailwindBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl" | TailwindContainerBreakpoint;

// Font family
export type TailwindFontFamily = "sans" | "serif" | "mono" | (string & {});

// Gradient direction — keyword only; an angle goes through `gradientLinear`.
export type TailwindGradientDirection =
  | "to-t" | "to-tr" | "to-r" | "to-br" | "to-b" | "to-bl" | "to-l" | "to-tl";

// Gradient stop (color with optional opacity)
export type TailwindGradientStop = TailwindColor;

// Blur — v4 (C-03): added the `xs` slot.
export type TailwindBlur = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | `[${string}]`;

// Line clamp
export type TailwindLineClamp = 1 | 2 | 3 | 4 | 5 | 6 | "none" | `${number}` | `[${string}]`;

// Underline offset
export type TailwindUnderlineOffset = "auto" | 0 | 1 | 2 | 4 | 8 | Stringified<0 | 1 | 2 | 4 | 8> | `[${string}]`;

// Timing function
export type TailwindEase = "linear" | "in" | "out" | "in-out" | `[${string}]`;

// Resize
export type TailwindResize = "none" | "x" | "y";

// Filters
export type TailwindBrightness = 0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150 | 200 | Stringified<0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150 | 200> | `[${string}]`;
export type TailwindContrast = 0 | 50 | 75 | 100 | 125 | 150 | 200 | Stringified<0 | 50 | 75 | 100 | 125 | 150 | 200> | `[${string}]`;
export type TailwindHueRotate = 0 | 15 | 30 | 60 | 90 | 180 | Stringified<0 | 15 | 30 | 60 | 90 | 180> | `[${string}]`;
export type TailwindSaturate = 0 | 50 | 100 | 150 | 200 | Stringified<0 | 50 | 100 | 150 | 200> | `[${string}]`;

// Layout: Place & Grid Auto
export type TailwindPlaceContent =
  | "center" | "start" | "end" | "between" | "around" | "evenly" | "baseline" | "stretch";
export type TailwindPlaceItems = "start" | "end" | "center" | "baseline" | "stretch";
export type TailwindPlaceSelf = "auto" | "start" | "end" | "center" | "stretch";
export type TailwindGridAutoFlow = "row" | "col" | "dense" | "row-dense" | "col-dense";
export type TailwindGridAuto = "auto" | "min" | "max" | "fr" | `[${string}]`;
export type TailwindOrder = "first" | "last" | "none" | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | Stringified<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12> | `[${string}]`;

/**
 * `position-area` grid placement (CSS anchor positioning, B-010). The common
 * single- and two-axis cells, plus the `[${string}]` arbitrary hatch for the full
 * grammar (`[top span-left]`) — emitted verbatim, same contract as `.textSize("[13px]")`.
 */
export type TailwindPositionArea =
  | "top" | "bottom" | "left" | "right" | "center"
  | "top-left" | "top-right" | "bottom-left" | "bottom-right"
  | "top-span-left" | "top-span-right"
  | "bottom-span-left" | "bottom-span-right"
  | `[${string}]`;

// Modern features
// v4 (A-07): admit negatives — `.skewX(-12)` emits `-skew-x-12`.
export type TailwindSkew =
  | 0 | 1 | 2 | 3 | 6 | 12
  | -1 | -2 | -3 | -6 | -12
  | Stringified<0 | 1 | 2 | 3 | 6 | 12 | -1 | -2 | -3 | -6 | -12>
  | `[${string}]`;
export type TailwindWillChange = "auto" | "scroll" | "contents" | "transform" | `[${string}]`;
export type TailwindOverscroll = "auto" | "contain" | "none";

// CSS unit for arbitrary value overloads: .minH("px", 180) → min-h-[180px]
export type TailwindUnit = "px" | "rem" | "em" | "%" | "vh" | "vw" | "dvh" | "svh" | "lvh";

// SVG paint
export type TailwindStrokeWidth =
  | 0 | 1 | 2
  | Stringified<0 | 1 | 2>
  | `[${string}]`;

// Text decoration style / thickness
export type TailwindDecorationStyle = "solid" | "double" | "dotted" | "dashed" | "wavy";
export type TailwindDecorationThickness =
  | "auto" | "from-font"
  | 0 | 1 | 2 | 4 | 8
  | Stringified<0 | 1 | 2 | 4 | 8>
  | `[${string}]`;

// Color scheme
export type TailwindColorScheme = "normal" | "light" | "dark" | "light-dark" | "only-light" | "only-dark";

// Text wrap / hyphenation
export type TailwindTextWrap = "wrap" | "nowrap" | "balance" | "pretty";
export type TailwindHyphens = "none" | "manual" | "auto";

// Text shadow. Value is required (no bare `text-shadow`); size + size/opacity forms.
export type TailwindTextShadowSize = "2xs" | "xs" | "sm" | "md" | "lg" | "none";
export type TailwindTextShadow =
  | TailwindTextShadowSize
  | `${TailwindTextShadowSize}/${number}`
  | (keyof FluentCustomTextShadow & string)
  | `[${string}]`;

// Drop shadow (filter). Value is required; no bare `drop-shadow`.
export type TailwindDropShadow =
  | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "none"
  | (keyof FluentCustomDropShadow & string) | `[${string}]`;

// Inset (inner) box-shadow. Value is required; slots 2xs|xs|sm|none.
export type TailwindInsetShadow =
  | "2xs" | "xs" | "sm" | "none"
  | (keyof FluentCustomInsetShadow & string) | `[${string}]`;

// Blend modes — mix-blend (18, incl. plus-*) and bg-blend (16, no plus-*)
export type TailwindMixBlendMode =
  | "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn"
  | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity"
  | "plus-darker" | "plus-lighter";
export type TailwindBgBlendMode =
  | "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn"
  | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";

// Isolation (the reset value; `isolate` is its own zero-arg method)
export type TailwindIsolation = "auto";

// Transition delay / behavior
export type TailwindDelay =
  | 0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000
  | Stringified<0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000>
  | `${number}` | `[${string}]`;
export type TailwindTransitionBehavior = "normal" | "discrete";

// Gradient stop position — closed 0–100% (5% step) ladder + arbitrary `[…]`
export type TailwindGradientPosition =
  | "0%" | "5%" | "10%" | "15%" | "20%" | "25%" | "30%" | "35%" | "40%" | "45%"
  | "50%" | "55%" | "60%" | "65%" | "70%" | "75%" | "80%" | "85%" | "90%" | "95%"
  | "100%"
  | `[${string}]`;

// Gradient angle (linear / conic) — a bare degree or arbitrary `[…]`
export type TailwindGradientAngle = number | `[${string}]`;

// Radial gradient origin (compiles to `[at_…]`)
export type TailwindGradientOrigin =
  | "top" | "top-right" | "right" | "bottom-right"
  | "bottom" | "bottom-left" | "left" | "top-left" | "center"
  | `[${string}]`;

// Gradient color interpolation (the `/{space}` slash modifier)
export type TailwindGradientColorSpace =
  | "oklch" | "oklab" | "srgb" | "srgb-linear" | "hsl" | "hwb" | "lab" | "lch";
export type TailwindGradientHueInterpolation =
  | "shorter" | "longer" | "increasing" | "decreasing";
export type TailwindGradientInterpolation =
  TailwindGradientColorSpace | TailwindGradientHueInterpolation;

// 3D transforms — depth gate (set on the parent), per-axis leaves
export type TailwindPerspective =
  | "dramatic" | "near" | "normal" | "midrange" | "distant" | "none" | `[${string}]`;
export type TailwindPerspectiveOrigin =
  | "center" | "top" | "top-right" | "right" | "bottom-right" | "bottom" | "bottom-left" | "left" | "top-left"
  | `[${string}]`;
// Narrower than TailwindTranslate: translate-z has no `-full` and no fractions.
export type TailwindTranslateZ = TailwindSpacing | `-${number}` | "-px";
export type TailwindTransformStyle = "3d" | "flat";
export type TailwindBackfaceVisibility = "visible" | "hidden";

// Variant selectors for `.on()` — aria / group / peer / pseudo / nth / child.
// Each member is the bare prefix; the base utility is added inside the callback.
export type AriaBoolVariant =
  | "aria-busy" | "aria-checked" | "aria-disabled" | "aria-expanded"
  | "aria-hidden" | "aria-pressed" | "aria-readonly" | "aria-required"
  | "aria-selected";
export type GroupPeerState =
  | "hover" | "focus" | "focus-within" | "focus-visible"
  | "active" | "disabled" | "checked" | "required"
  | "invalid" | "valid" | "open";
export type ExtraPseudoState =
  | "only" | "only-of-type" | "target" | "default" | "optional"
  | "read-only" | "autofill" | "in-range" | "out-of-range"
  | "placeholder-shown" | "details-content" | "user-valid" | "user-invalid"
  | "rtl" | "ltr" | "contrast-more" | "contrast-less" | "forced-colors";
export type StructuralNthVariant =
  | `nth-${string}` | `nth-last-${string}`
  | `nth-of-type-${string}` | `nth-last-of-type-${string}`;
// Direct children (`*`) or all descendants (`**`)
export type ChildDescendantVariant = "*" | "**";

// Container-query sizes for `.at()` (@3xs … @7xl)
export type TailwindContainerSize =
  | "@3xs" | "@2xs" | "@xs" | "@sm" | "@md" | "@lg" | "@xl"
  | "@2xl" | "@3xl" | "@4xl" | "@5xl" | "@6xl" | "@7xl";

// Grid-line placement / span. A negative line is end-relative (`-col-start-1`).
type GridLineN = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
type NegGridLineN = -1 | -2 | -3 | -4 | -5 | -6 | -7 | -8 | -9 | -10 | -11 | -12 | -13;
export type TailwindGridLine =
  | GridLineN | NegGridLineN
  | Stringified<GridLineN | NegGridLineN>
  | "auto"
  | `[${string}]`;
export type TailwindRowSpan =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  | Stringified<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  | "full"
  | `[${string}]`;

// Multi-column count / width + fragmentation
export type TailwindColumns =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  | Stringified<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  | "auto"
  | "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl"
  | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  | `[${string}]`;
export type TailwindBreakBeforeAfter =
  | "auto" | "avoid" | "all" | "avoid-page" | "page" | "left" | "right" | "column";
export type TailwindBreakInside = "auto" | "avoid" | "avoid-page" | "avoid-column";
export type TailwindBoxDecoration = "clone" | "slice";

// Scroll snap / behavior / field-sizing
export type TailwindSnapAxis = "none" | "x" | "y" | "both";
export type TailwindSnapStrictness = "mandatory" | "proximity";
export type TailwindSnapAlign = "start" | "end" | "center" | "none";
export type TailwindSnapStop = "normal" | "always";
export type TailwindScrollBehavior = "auto" | "smooth";
export type TailwindFieldSizing = "content" | "fixed";

// Masks (v4.1) — edge fades, composite, SVG mask-type
export type TailwindMaskEdge = "t" | "r" | "b" | "l" | "x" | "y";
export type TailwindMaskStop =
  | `${number}%`
  | TailwindColor
  | TailwindSpacing
  | `(${string})`
  | `[${string}]`;
export type TailwindMaskComposite = "add" | "subtract" | "intersect" | "exclude";
export type TailwindMaskType = "alpha" | "luminance";
