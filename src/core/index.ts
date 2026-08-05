// Core types
export type { View, Thunk } from "./types.js";

// Tag class
export { Tag } from "./tag.js";
export type { FluentCustomMethods } from "./tag.js";

// Mixins — attach every chainable method to Tag.prototype (side-effecting).
// Registration lives in one module so any barrel that re-exports Tag factories
// yields a fully-populated prototype (see register.ts + package.json sideEffects).
import "./register.js";

// Overlay position type (the method itself is registered via ./register.js)
export type { OverlayPosition } from "./overlay.js";

// Object-form variants (llm-styling/object-variants)
export type { VariantStyleObject, StyleProps, NestedVariants, DirectVariant } from "./variant-object.js";

// Raw HTML support
export { RawString, Raw } from "./raw-string.js";

// Utility functions
export { Empty, El } from "./utils.js";

// Type guards
export { isTag, isRawString } from "./guards.js";

// Dev-mode structural guards for the mutable builder
export { setDevChecks } from "./dev-checks.js";

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
  FluentCustomFontFamily,
  ThemeKeys,
} from "./tailwind-types.js";

// `.cssProp()` property-name union (llm-styling/escape-hatch, generated)
export type { CssPropertyName } from "./css-props.gen.js";

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
