// ------------------------------------
// Tailwind Type Definitions
// ------------------------------------

// Spacing scale (used for padding, margin, gap, width, height)
export type TailwindSpacing =
  | "0" | "px" | "0.5" | "1" | "1.5" | "2" | "2.5" | "3" | "3.5" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "11" | "12" | "14" | "16" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96";

// Width values
export type TailwindWidth =
  | TailwindSpacing | "auto" | "full" | "screen" | "svw" | "lvw" | "dvw" | "min" | "max" | "fit"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5"
  | "1/6" | "2/6" | "3/6" | "4/6" | "5/6" | "1/12" | "2/12" | "3/12" | "4/12" | "5/12" | "6/12" | "7/12" | "8/12" | "9/12" | "10/12" | "11/12";

// Height values
export type TailwindHeight =
  | TailwindSpacing | "auto" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit"
  | "1/2" | "1/3" | "2/3" | "1/4" | "2/4" | "3/4" | "1/5" | "2/5" | "3/5" | "4/5" | "1/6" | "2/6" | "3/6" | "4/6" | "5/6";

// Max-width values
export type TailwindMaxWidth =
  | "0" | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  | "full" | "min" | "max" | "fit" | "prose" | "screen-sm" | "screen-md" | "screen-lg" | "screen-xl" | "screen-2xl";

// Min-width values
export type TailwindMinWidth = "0" | "full" | "min" | "max" | "fit";

// Max-height values
export type TailwindMaxHeight = TailwindSpacing | "none" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit";

// Min-height values
export type TailwindMinHeight = "0" | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit";

// Color shades
export type TailwindShade = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "950";

// Color names
export type TailwindColorName =
  | "slate" | "gray" | "zinc" | "neutral" | "stone"
  | "red" | "orange" | "amber" | "yellow" | "lime" | "green" | "emerald" | "teal" | "cyan" | "sky" | "blue" | "indigo" | "violet" | "purple" | "fuchsia" | "pink" | "rose";

// Full color type
export type TailwindColor =
  | "inherit" | "current" | "transparent" | "black" | "white"
  | `${TailwindColorName}-${TailwindShade}`;

// Text size
export type TailwindTextSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "8xl" | "9xl";

// Font weight
export type TailwindFontWeight = "thin" | "extralight" | "light" | "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black";

// Leading (line-height)
export type TailwindLeading = "none" | "tight" | "snug" | "normal" | "relaxed" | "loose" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";

// Tracking (letter-spacing)
export type TailwindTracking = "tighter" | "tight" | "normal" | "wide" | "wider" | "widest";

// Border radius
export type TailwindRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

// Shadow
export type TailwindShadow = "sm" | "md" | "lg" | "xl" | "2xl" | "inner" | "none";

// Border width
export type TailwindBorderWidth = "0" | "2" | "4" | "8";

// Opacity
export type TailwindOpacity =
  | "0" | "5" | "10" | "15" | "20" | "25" | "30" | "35" | "40" | "45"
  | "50" | "55" | "60" | "65" | "70" | "75" | "80" | "85" | "90" | "95" | "100";

// Cursor
export type TailwindCursor =
  | "auto" | "default" | "pointer" | "wait" | "text" | "move" | "help" | "not-allowed" | "none"
  | "context-menu" | "progress" | "cell" | "crosshair" | "vertical-text" | "alias" | "copy" | "no-drop"
  | "grab" | "grabbing" | "all-scroll" | "col-resize" | "row-resize"
  | "n-resize" | "e-resize" | "s-resize" | "w-resize" | "ne-resize" | "nw-resize" | "se-resize" | "sw-resize"
  | "ew-resize" | "ns-resize" | "nesw-resize" | "nwse-resize" | "zoom-in" | "zoom-out";

// Z-index
export type TailwindZIndex = "0" | "10" | "20" | "30" | "40" | "50" | "auto";

// Grid columns/rows
export type TailwindGridCols = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "none" | "subgrid";
export type TailwindGridRows = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "none" | "subgrid";

// Flex
export type TailwindFlex = "1" | "auto" | "initial" | "none";

// Overflow
export type TailwindOverflow = "auto" | "hidden" | "clip" | "visible" | "scroll";

// Helper type to allow autocomplete while accepting any string
export type Autocomplete<T extends string> = T | (string & {});
