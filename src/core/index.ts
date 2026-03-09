// Core types
export type { View, Thunk } from "./types.js";

// Tag class
export { Tag } from "./tag.js";

// Mixins — add methods to Tag.prototype via declaration merging
import "./tailwind-methods.js";
import "./htmx-methods.js";

// Raw HTML support
export { RawString, Raw } from "./raw-string.js";

// Utility functions
export { Empty, El } from "./utils.js";

// Type guards
export { isTag, isRawString } from "./guards.js";

// Tailwind types (re-export for consumers who need them)
export type {
  TailwindSpacing,
  TailwindWidth,
  TailwindHeight,
  TailwindMaxWidth,
  TailwindMinWidth,
  TailwindMaxHeight,
  TailwindMinHeight,
  TailwindColor,
  TailwindColorName,
  TailwindShade,
  TailwindTextSize,
  TailwindFontWeight,
  TailwindLeading,
  TailwindTracking,
  TailwindRounded,
  TailwindRoundedCorner,
  TailwindShadow,
  TailwindBorderWidth,
  TailwindOpacity,
  TailwindCursor,
  TailwindZIndex,
  TailwindGridCols,
  TailwindGridRows,
  TailwindFlex,
  TailwindOverflow,
  TailwindObjectFit,
  TailwindDisplay,
  TailwindInset,
  TailwindFlexWrap,
  TailwindAlignSelf,
  TailwindColSpan,
  TailwindAspect,
  TailwindTransition,
  TailwindDuration,
  TailwindAnimate,
  TailwindRingWidth,
  TailwindScale,
  TailwindRotate,
  TailwindSelect,
  TailwindPointerEvents,
  TailwindWhitespace,
  TailwindOutline,
  TailwindPosition,
  TailwindTextAlign,
  TailwindFlexDirection,
  TailwindJustifyContent,
  TailwindAlignItems,
  TailwindState,
  TailwindBreakpoint,
  TailwindUnit,
} from "./tailwind-types.js";
