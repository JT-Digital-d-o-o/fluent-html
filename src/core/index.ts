// Core types
export type { View, Thunk } from "./types.js";

// Tag class
export { Tag } from "./tag.js";
export type { FluentCustomMethods } from "./tag.js";

// Mixins — add methods to Tag.prototype via declaration merging
import "./tailwind-methods.js";
import "./htmx-methods.js";
import "./behavior-methods.js";

// Raw HTML support
export { RawString, Raw } from "./raw-string.js";

// Utility functions
export { Empty, El } from "./utils.js";

// Type guards
export { isTag, isRawString } from "./guards.js";

// ARIA types — for setRole / setAria (A-02)
export type { AriaRole, AriaAttributeName, AriaValue, AriaAttrs } from "./aria-types.js";

// Theming — defineTheme + the augmentation seams (C-02)
export { defineTheme } from "./define-theme.js";
export type { ThemeSpec } from "./define-theme.js";
export type {
  FluentCustomColors,
  FluentCustomSpacing,
  FluentCustomFontSize,
  FluentCustomRadius,
  FluentCustomShadow,
  ThemeKeys,
} from "./tailwind-types.js";

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
  TailwindListStyleType,
  TailwindListStylePosition,
  TailwindOutline,
  TailwindPosition,
  TailwindTextAlign,
  TailwindFlexDirection,
  TailwindJustifyContent,
  TailwindAlignItems,
  TailwindState,
  TailwindBreakpoint,
  TailwindUnit,
  TailwindFontFamily,
  TailwindGradientDirection,
  TailwindGradientStop,
  TailwindBlur,
  TailwindLineClamp,
  TailwindUnderlineOffset,
  TailwindEase,
  TailwindResize,
} from "./tailwind-types.js";
