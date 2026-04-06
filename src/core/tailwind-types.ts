// ------------------------------------
// Tailwind Type Definitions
// ------------------------------------

// Utility: allows both number literals and their string equivalents (e.g. 2 | "2")
type Stringified<T extends number> = `${T}`;

// Escape hatches:
//   (string & {})   — accepts any string while preserving autocomplete.
//                      Used where custom theme tokens are common (colors, spacing).
//   `[${string}]`   — bracket-only escape hatch for arbitrary CSS values.
//                      Stricter: forces explicit bracket syntax like "[13px]".

// Spacing scale (used for padding, margin, gap, width, height)
// Keeps (string & {}) — custom theme spacing tokens (e.g. "18") are common.
export type TailwindSpacing =
  | "0" | "px" | "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "3.5" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "11" | "12" | "14" | "16" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96"
  | (string & {});

// Width values
export type TailwindWidth =
  | TailwindSpacing | "auto" | "full" | "screen" | "svw" | "lvw" | "dvw" | "min" | "max" | "fit"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5"
  | "1/6" | "2/6" | "3/6" | "4/6" | "5/6" | "1/12" | "2/12" | "3/12" | "4/12" | "5/12" | "6/12" | "7/12" | "8/12" | "9/12" | "10/12" | "11/12"
  | (string & {});

// Height values
export type TailwindHeight =
  | TailwindSpacing | "auto" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5" | "1/6" | "2/6" | "3/6" | "4/6" | "5/6"
  | (string & {});

// Max-width values
export type TailwindMaxWidth =
  | "0" | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  | "full" | "min" | "max" | "fit" | "prose" | "screen-sm" | "screen-md" | "screen-lg" | "screen-xl" | "screen-2xl"
  | (string & {});

// Min-width values
export type TailwindMinWidth = "0" | "full" | "min" | "max" | "fit" | (string & {});

// Max-height values
export type TailwindMaxHeight = TailwindSpacing | "none" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit" | (string & {});

// Min-height values
export type TailwindMinHeight = "0" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit" | (string & {});

// Color shades
export type TailwindShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

// Color names
export type TailwindColorName =
  | "slate" | "gray" | "zinc" | "neutral" | "stone"
  | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";

// Full color type — includes (string & {}) so custom theme colors
// (e.g. "accent", "brand-500", "accent-dark") work with fluent methods.
export type TailwindColor =
  | "inherit" | "current" | "transparent" | "black" | "white"
  | `${TailwindColorName}-${TailwindShade}`
  | (string & {});

// Text size
export type TailwindTextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl" | `[${string}]`;

// Font weight
export type TailwindFontWeight = "thin" | "extralight" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black" | `[${string}]`;

// Leading (line-height)
export type TailwindLeading = "none" | "tight" | "snug" | "normal" | "relaxed" | "loose" | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | `[${string}]`;

// Tracking (letter-spacing)
export type TailwindTracking = "tighter" | "tight" | "normal" | "wide" | "wider" | "widest" | `[${string}]`;

// Border radius
export type TailwindRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full" | `[${string}]`;
export type TailwindRoundedCorner = "t" | "r" | "b" | "l" | "tl" | "tr" | "br" | "bl" | "s" | "e" | "ss" | "se" | "es" | "ee";

// Shadow
export type TailwindShadow = "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "none" | `[${string}]`;

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
  | "grab" | "grabbing" | "all-scroll" | "col-resize" | "row-resize"
  | "n-resize" | "e-resize" | "s-resize" | "w-resize" | "ne-resize" | "nw-resize" | "se-resize" | "sw-resize"
  | "ew-resize" | "ns-resize" | "nesw-resize" | "nwse-resize" | "zoom-in" | "zoom-out";

// Z-index
export type TailwindZIndex = 0 | 10 | 20 | 30 | 40 | 50 | Stringified<0 | 10 | 20 | 30 | 40 | 50> | "auto" | `[${string}]`;

// Grid columns/rows — keeps (string & {}) for JIT bare numbers beyond 12
export type TailwindGridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "none" | "subgrid" | (string & {});
export type TailwindGridRows = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "none" | "subgrid" | (string & {});

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

// Column span — keeps (string & {}) for JIT bare numbers beyond 12
export type TailwindColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full" | (string & {});

// Aspect ratio
export type TailwindAspect = "auto" | "square" | "video";

// Transitions & Animation
export type TailwindTransition = "none" | "all" | "colors" | "opacity" | "shadow" | "transform";
export type TailwindDuration = 0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000 | Stringified<0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000> | (string & {});
export type TailwindAnimate = "none" | "spin" | "ping" | "pulse" | "bounce" | `[${string}]`;

// Ring
export type TailwindRingWidth = 0 | 1 | 2 | 4 | 8 | Stringified<0 | 1 | 2 | 4 | 8> | `[${string}]`;

// Transforms
export type TailwindScale = 0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150 | Stringified<0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150> | `[${string}]`;
export type TailwindRotate = 0 | 1 | 2 | 3 | 6 | 12 | 45 | 90 | 180 | Stringified<0 | 1 | 2 | 3 | 6 | 12 | 45 | 90 | 180> | `[${string}]`;

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
  | "first-of-type" | "last-of-type" | "only-child"
  | "placeholder" | "selection" | "marker" | "file"
  | "before" | "after"
  | "dark"
  | "group-hover" | "group-focus" | "group-active" | "group-disabled"
  | "peer-hover" | "peer-focus" | "peer-checked" | "peer-invalid";

export type TailwindBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

// Font family
export type TailwindFontFamily = "sans" | "serif" | "mono" | (string & {});

// Gradient direction
export type TailwindGradientDirection =
  | "to-t" | "to-tr" | "to-r" | "to-br" | "to-b" | "to-bl" | "to-l" | "to-tl"
  | (string & {});

// Gradient stop (color with optional opacity)
export type TailwindGradientStop = TailwindColor;

// Blur
export type TailwindBlur = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | `[${string}]`;

// Line clamp
export type TailwindLineClamp = 1 | 2 | 3 | 4 | 5 | 6 | "none" | (string & {});

// Underline offset
export type TailwindUnderlineOffset = "auto" | 0 | 1 | 2 | 4 | 8 | `[${string}]`;

// Timing function
export type TailwindEase = "linear" | "in" | "out" | "in-out" | `[${string}]`;

// Resize
export type TailwindResize = "none" | "x" | "y";

// CSS unit for arbitrary value overloads: .minH("px", 180) → min-h-[180px]
export type TailwindUnit = "px" | "rem" | "em" | "%" | "vh" | "vw" | "dvh" | "svh" | "lvh";
