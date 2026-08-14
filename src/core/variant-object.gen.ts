// AUTO-GENERATED — do NOT edit by hand. Regenerate: `npm run gen:vocab` (CI checks `--check`).
// Sources: src/class-vocab/variant-keys.ts (key derivation) + src/class-vocab/vocab.ts (value specs).
// Validity oracle: tailwindcss@4.3.3 (exact pin; see scripts/gen-vocab/load-design-system.ts).
import type {
  TailwindAlignItems,
  TailwindAlignSelf,
  TailwindAnimate,
  TailwindAppearance,
  TailwindAspect,
  TailwindBgBlendMode,
  TailwindBlur,
  TailwindBorderStyle,
  TailwindBorderWidth,
  TailwindBoxDecoration,
  TailwindBreakInside,
  TailwindBrightness,
  TailwindColSpan,
  TailwindColor,
  TailwindColumns,
  TailwindContent,
  TailwindContrast,
  TailwindCursor,
  TailwindDecorationStyle,
  TailwindDecorationThickness,
  TailwindDelay,
  TailwindDropShadow,
  TailwindDuration,
  TailwindEase,
  TailwindFlex,
  TailwindFlexDirection,
  TailwindFlexWrap,
  TailwindFontFamily,
  TailwindFontWeight,
  TailwindGradientAngle,
  TailwindGradientDirection,
  TailwindGradientInterpolation,
  TailwindGradientOrigin,
  TailwindGradientPosition,
  TailwindGradientStop,
  TailwindGridAuto,
  TailwindGridAutoFlow,
  TailwindGridCols,
  TailwindGridLine,
  TailwindGridRows,
  TailwindHeight,
  TailwindHueRotate,
  TailwindInset,
  TailwindInsetShadow,
  TailwindJustifyContent,
  TailwindLeading,
  TailwindLineClamp,
  TailwindListStylePosition,
  TailwindListStyleType,
  TailwindMaxHeight,
  TailwindMaxWidth,
  TailwindMinHeight,
  TailwindMinWidth,
  TailwindMixBlendMode,
  TailwindObjectFit,
  TailwindOpacity,
  TailwindOrder,
  TailwindOutline,
  TailwindOverflow,
  TailwindOverscroll,
  TailwindPerspective,
  TailwindPointerEvents,
  TailwindResize,
  TailwindRingWidth,
  TailwindRotate,
  TailwindRounded,
  TailwindRoundedCorner,
  TailwindRowSpan,
  TailwindSaturate,
  TailwindScale,
  TailwindScrollBehavior,
  TailwindSelect,
  TailwindShadow,
  TailwindSpacing,
  TailwindStrokeWidth,
  TailwindTable,
  TailwindTextAlign,
  TailwindTextShadow,
  TailwindTextSize,
  TailwindTextWrap,
  TailwindTracking,
  TailwindTransformStyle,
  TailwindTransition,
  TailwindTransitionBehavior,
  TailwindTranslate,
  TailwindTranslateZ,
  TailwindUnderlineOffset,
  TailwindWhitespace,
  TailwindWidth,
  TailwindWillChange,
  TailwindWrap,
  TailwindZIndex,
} from "./tailwind-types.js";
import type { CssPropertyName } from "./css-props.gen.js";

/**
 * The style half of a variant object (llm-styling/object-variants): one
 * optional property per fluent styling key. `false`/`undefined` values are
 * skipped at apply time, so conditional styling is a plain expression
 * (`italic: isDraft`, `bg: active ? "blue-600" : undefined`). Multi-arg
 * utilities take readonly tuples; arbitrary values use the `[…]` arms.
 */
export interface StyleProps {
  /** Padding — all sides, one axis/side, or an arbitrary length via the unit overload. */
  p?: TailwindSpacing | undefined;
  /** Margin — all sides, one axis/side, or an arbitrary length via the unit overload. */
  m?: TailwindSpacing | "auto" | undefined;
  /** Horizontal padding (`px-*`). */
  px?: TailwindSpacing | undefined;
  /** Vertical padding (`py-*`). */
  py?: TailwindSpacing | undefined;
  /** Top padding (`pt-*`). */
  pt?: TailwindSpacing | undefined;
  /** Bottom padding (`pb-*`). */
  pb?: TailwindSpacing | undefined;
  /** Left padding (`pl-*`). */
  pl?: TailwindSpacing | undefined;
  /** Right padding (`pr-*`). */
  pr?: TailwindSpacing | undefined;
  /** Horizontal margin (`mx-*`, incl. `auto`). */
  mx?: TailwindSpacing | "auto" | undefined;
  /** Vertical margin (`my-*`, incl. `auto`). */
  my?: TailwindSpacing | "auto" | undefined;
  /** Top margin (`mt-*`, incl. `auto`). */
  mt?: TailwindSpacing | "auto" | undefined;
  /** Bottom margin (`mb-*`, incl. `auto`). */
  mb?: TailwindSpacing | "auto" | undefined;
  /** Left margin (`ml-*`, incl. `auto`). */
  ml?: TailwindSpacing | "auto" | undefined;
  /** Right margin (`mr-*`, incl. `auto`). */
  mr?: TailwindSpacing | "auto" | undefined;
  /** Horizontal space between children (prefer flex/grid + gap). */
  spaceX?: TailwindSpacing | undefined;
  /** Vertical space between children (prefer flex/grid + gap). */
  spaceY?: TailwindSpacing | undefined;
  /** Gap between flex/grid children — both axes or one. */
  gap?: TailwindSpacing | undefined;
  /** Background color. */
  bg?: TailwindColor | undefined;
  /** Text size, color, alignment, or wrapping — one merged `text-*` emitter; arbitrary length via the unit overload. */
  text?: TailwindTextSize | TailwindColor | TailwindTextAlign | TailwindTextWrap | undefined;
  /** Font weight or family — one merged `font-*` emitter. */
  font?: TailwindFontWeight | TailwindFontFamily | undefined;
  /** Italic text. */
  italic?: boolean | undefined;
  /** Uppercase transform. */
  uppercase?: boolean | undefined;
  /** Lowercase transform. */
  lowercase?: boolean | undefined;
  /** Capitalize each word. */
  capitalize?: boolean | undefined;
  /** Underlined text. */
  underline?: boolean | undefined;
  /** Remove text decoration. */
  noUnderline?: boolean | undefined;
  /** Struck-through text. */
  lineThrough?: boolean | undefined;
  /** Truncate overflowing text with an ellipsis. */
  truncate?: boolean | undefined;
  /** Grayscale font smoothing. */
  antialiased?: boolean | undefined;
  /** Tabular (fixed-width) numerals. */
  tabularNums?: boolean | undefined;
  /** Allow line breaks anywhere within words. */
  breakAll?: boolean | undefined;
  /** Line height — named scale or a number of spacing units. */
  leading?: TailwindLeading | undefined;
  /** Letter spacing. */
  tracking?: TailwindTracking | undefined;
  /** White-space handling. */
  whitespace?: TailwindWhitespace | undefined;
  /** Distance between text and its underline. */
  underlineOffset?: TailwindUnderlineOffset | undefined;
  /** Clamp text to N lines with an ellipsis. */
  lineClamp?: TailwindLineClamp | undefined;
  /** Width — spacing scale, fractions, keywords, or the unit overload. */
  w?: TailwindWidth | undefined;
  /** Height — spacing scale, fractions, keywords, or the unit overload. */
  h?: TailwindHeight | undefined;
  /** Max-width — named container sizes, keywords, or the unit overload. */
  maxW?: TailwindMaxWidth | undefined;
  /** Min-width. */
  minW?: TailwindMinWidth | undefined;
  /** Max-height. */
  maxH?: TailwindMaxHeight | undefined;
  /** Min-height. */
  minH?: TailwindMinHeight | undefined;
  /** Aspect ratio. */
  aspect?: TailwindAspect | undefined;
  /** Flex container (bare), flex shorthand value, main-axis direction, or wrapping. */
  flex?: true | TailwindFlex | TailwindFlexDirection | TailwindFlexWrap | undefined;
  /** Main-axis distribution. */
  justify?: TailwindJustifyContent | undefined;
  /** Cross-axis alignment of items. */
  items?: TailwindAlignItems | undefined;
  /** Cross-axis alignment of one item. */
  self?: TailwindAlignSelf | undefined;
  /** Allow shrinking (bare) or `shrink-0` to forbid it. */
  shrink?: true | 0 | "0" | undefined;
  /** Allow growing (bare) or `grow-0` to forbid it. */
  grow?: true | 0 | "0" | undefined;
  /** Grid container. */
  grid?: boolean | undefined;
  /** Number of grid columns, `none`/`subgrid`, or an arbitrary track list. */
  gridCols?: TailwindGridCols | undefined;
  /** Number of grid rows, `none`/`subgrid`, or an arbitrary track list. */
  gridRows?: TailwindGridRows | undefined;
  /** Auto-placement flow of grid items. */
  gridFlow?: TailwindGridAutoFlow | undefined;
  /** Size of implicit grid rows. */
  autoRows?: TailwindGridAuto | undefined;
  /** Size of implicit grid columns. */
  autoCols?: TailwindGridAuto | undefined;
  /** How many columns an item spans. */
  colSpan?: TailwindColSpan | undefined;
  /** Visual order of a flex/grid item. */
  order?: TailwindOrder | undefined;
  /** Border width, style, or color — all sides (bare = 1px width), one side, or side + width/color. */
  border?: true | TailwindBorderWidth | TailwindBorderStyle | TailwindColor | "t" | "b" | "l" | "r" | "x" | "y" | "top" | "bottom" | "left" | "right" | readonly ["x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", TailwindBorderWidth | TailwindColor] | undefined;
  /** Border radius — all corners (bare = default), one corner, or corner + size. */
  rounded?: true | TailwindRounded | TailwindRoundedCorner | readonly [TailwindRoundedCorner, TailwindRounded] | undefined;
  /** Border between horizontal children. */
  divideX?: true | TailwindBorderWidth | undefined;
  /** Border between vertical children. */
  divideY?: true | TailwindBorderWidth | undefined;
  /** Color of the between-children borders (pairs with `.divideX()`/`.divideY()`). */
  divide?: TailwindColor | undefined;
  /** Box shadow — bare default, a theme size, or a shadow color. */
  shadow?: true | TailwindShadow | TailwindColor | undefined;
  /** Element opacity (0–100). */
  opacity?: TailwindOpacity | undefined;
  /** Mouse cursor. */
  cursor?: TailwindCursor | undefined;
  /** Absolute positioning. */
  absolute?: boolean | undefined;
  /** Relative positioning. */
  relative?: boolean | undefined;
  /** Fixed positioning. */
  fixed?: boolean | undefined;
  /** Sticky positioning. */
  sticky?: boolean | undefined;
  /** Static (default) positioning. */
  static?: boolean | undefined;
  /** Stacking order. */
  z?: TailwindZIndex | undefined;
  /** Overflow behavior — both axes or one. */
  overflow?: TailwindOverflow | undefined;
  /** How replaced content fits its box. */
  object?: TailwindObjectFit | undefined;
  /** Block display. */
  block?: boolean | undefined;
  /** Inline-block display. */
  inlineBlock?: boolean | undefined;
  /** Inline display. */
  inline?: boolean | undefined;
  /** Inline-level flex container. */
  inlineFlex?: boolean | undefined;
  /** Inline-level grid container. */
  inlineGrid?: boolean | undefined;
  /** Children participate in the parent's layout (`display: contents`). */
  contents?: boolean | undefined;
  /** Remove from layout (`display: none`). */
  hidden?: boolean | undefined;
  /** Hide but keep layout space (`visibility: hidden`) — unlike `.hidden()`. */
  invisible?: boolean | undefined;
  /** Table display (bare) or the table-layout algorithm (`auto`/`fixed`). */
  table?: true | TailwindTable | undefined;
  /** Table-cell display (responsive column show/hide). */
  tableCell?: boolean | undefined;
  /** Table-row display. */
  tableRow?: boolean | undefined;
  /** All four inset offsets at once. */
  inset?: TailwindInset | undefined;
  /** Top offset of a positioned element. */
  top?: TailwindInset | undefined;
  /** Right offset of a positioned element. */
  right?: TailwindInset | undefined;
  /** Bottom offset of a positioned element. */
  bottom?: TailwindInset | undefined;
  /** Left offset of a positioned element. */
  left?: TailwindInset | undefined;
  /** Transitioned property group (bare = default set) or discrete-transition behavior. */
  transition?: true | TailwindTransition | TailwindTransitionBehavior | undefined;
  /** Transition duration in ms. */
  duration?: TailwindDuration | undefined;
  /** Named animation. */
  animate?: TailwindAnimate | undefined;
  /** Transition timing function. */
  ease?: TailwindEase | undefined;
  /** Ring width (bare = 1px in v4) or ring color. */
  ring?: true | TailwindRingWidth | TailwindColor | undefined;
  /** Uniform scale (percent of original size). */
  scale?: TailwindScale | undefined;
  /** Rotation in degrees; negatives relocate the sign (`-rotate-45`). */
  rotate?: TailwindRotate | undefined;
  /** Translate along an axis; negatives relocate the sign. */
  translateX?: TailwindTranslate | undefined;
  /** Translate along an axis; negatives relocate the sign. */
  translateY?: TailwindTranslate | undefined;
  /** Translate along an axis; negatives relocate the sign. */
  translateZ?: TailwindTranslateZ | undefined;
  /** Text selection behavior. */
  select?: TailwindSelect | undefined;
  /** Whether the element receives pointer events. */
  pointerEvents?: TailwindPointerEvents | undefined;
  /** Native appearance of form controls. */
  appearance?: TailwindAppearance | undefined;
  /** List marker style or position. */
  list?: TailwindListStyleType | TailwindListStylePosition | undefined;
  /** Visually hidden but readable by screen readers. */
  srOnly?: boolean | undefined;
  /** Outline style (prefer `hidden` over `none` in v4 — forced-colors safe). */
  outline?: TailwindOutline | undefined;
  /** Linear gradient from → to, with optional direction + interpolation. */
  gradient?: readonly [TailwindColor, TailwindColor, TailwindGradientDirection?, TailwindGradientInterpolation?] | undefined;
  /** Linear-gradient direction keyword or angle, with optional interpolation. */
  bgLinear?: TailwindGradientDirection | TailwindGradientAngle | readonly [TailwindGradientDirection | TailwindGradientAngle, TailwindGradientInterpolation] | undefined;
  /** Radial gradient, optionally positioned at an origin. */
  bgRadial?: true | TailwindGradientOrigin | readonly [TailwindGradientOrigin, TailwindGradientInterpolation] | undefined;
  /** Conic gradient, optionally from an angle in degrees. */
  bgConic?: true | TailwindGradientAngle | readonly [TailwindGradientAngle, TailwindGradientInterpolation] | undefined;
  /** First gradient stop — color with optional position. */
  from?: TailwindGradientStop | readonly [TailwindGradientStop, TailwindGradientPosition] | undefined;
  /** Middle gradient stop — color with optional position. */
  via?: TailwindGradientStop | readonly [TailwindGradientStop, TailwindGradientPosition] | undefined;
  /** Last gradient stop — color with optional position. */
  to?: TailwindGradientStop | readonly [TailwindGradientStop, TailwindGradientPosition] | undefined;
  /** Group marker — enables `group-*` variants on descendants; optionally named. */
  group?: true | string | undefined;
  /** Peer marker — enables `peer-*` variants on siblings; optionally named. */
  peer?: true | string | undefined;
  /** Container-query container; optionally named. */
  containerQuery?: true | string | undefined;
  /** Blur filter (bare = default). */
  blur?: true | TailwindBlur | undefined;
  /** Backdrop blur filter (bare = default). */
  backdropBlur?: true | TailwindBlur | undefined;
  /** Brightness filter (percent). */
  brightness?: TailwindBrightness | undefined;
  /** Contrast filter (percent). */
  contrast?: TailwindContrast | undefined;
  /** Grayscale filter (bare = 100%). */
  grayscale?: true | 0 | "0" | undefined;
  /** Hue-rotate filter in degrees. */
  hueRotate?: TailwindHueRotate | undefined;
  /** Invert filter (bare = 100%). */
  invert?: true | 0 | "0" | undefined;
  /** Saturation filter (percent). */
  saturate?: TailwindSaturate | undefined;
  /** Sepia filter (bare = 100%). */
  sepia?: true | 0 | "0" | undefined;
  /** Hint the browser about upcoming changes. */
  willChange?: TailwindWillChange | undefined;
  /** User-resizability (bare = both axes). */
  resize?: true | TailwindResize | undefined;
  /** Overscroll behavior — both axes or one. */
  overscroll?: TailwindOverscroll | undefined;
  /** Prefix an arbitrary utility with `-` (negative value passthrough). */
  neg?: string | undefined;
  /** Arbitrary-CSS escape — emits `[prop:value]` (spaces → `_`, literal `_` escaped); variant-composable. */
  cssProp?: readonly [CssPropertyName, string] | undefined;
  /** htmx loading-indicator marker class. */
  htmxIndicator?: boolean | undefined;
  /** SVG fill color (`none` to unset). */
  fill?: TailwindColor | "none" | undefined;
  /** SVG stroke color or width — one merged `stroke-*` emitter; arbitrary width via the unit overload. */
  stroke?: TailwindColor | "none" | TailwindStrokeWidth | undefined;
  /** Accent color of form controls. */
  accent?: TailwindColor | undefined;
  /** Text-input caret color. */
  caret?: TailwindColor | undefined;
  /** Text-decoration color, style, or thickness — one merged `decoration-*` emitter. */
  decoration?: TailwindColor | TailwindDecorationStyle | TailwindDecorationThickness | undefined;
  /** Left + right offsets at once. */
  insetX?: TailwindInset | undefined;
  /** Top + bottom offsets at once. */
  insetY?: TailwindInset | undefined;
  /** Logical inline-start offset. */
  insetS?: TailwindInset | undefined;
  /** Logical inline-end offset. */
  insetE?: TailwindInset | undefined;
  /** Overflow-wrap — where long words may break. */
  wrap?: TailwindWrap | undefined;
  /** Text shadow — theme size or shadow color (value required). */
  textShadow?: TailwindTextShadow | TailwindColor | undefined;
  /** Drop-shadow filter — theme size or shadow color (value required). */
  dropShadow?: TailwindDropShadow | TailwindColor | undefined;
  /** Inner box shadow — theme size or shadow color (value required). */
  insetShadow?: TailwindInsetShadow | TailwindColor | undefined;
  /** Inner ring width (bare = 1px) or inner ring color. */
  insetRing?: true | TailwindRingWidth | TailwindColor | undefined;
  /** Blend mode of the element against its backdrop. */
  mixBlend?: TailwindMixBlendMode | undefined;
  /** Blend mode of the background layers. */
  bgBlend?: TailwindBgBlendMode | undefined;
  /** Create a new stacking context. */
  isolate?: boolean | undefined;
  /** Transition delay in ms. */
  delay?: TailwindDelay | undefined;
  /** 3D perspective depth on the parent. */
  perspective?: TailwindPerspective | undefined;
  /** Whether children are positioned in 3D space (transform-style). */
  transform?: TailwindTransformStyle | undefined;
  /** Grid column start line (negatives count from the end). */
  colStart?: TailwindGridLine | undefined;
  /** Grid column end line (negatives count from the end). */
  colEnd?: TailwindGridLine | undefined;
  /** Grid row start line (negatives count from the end). */
  rowStart?: TailwindGridLine | undefined;
  /** Grid row end line (negatives count from the end). */
  rowEnd?: TailwindGridLine | undefined;
  /** How many rows an item spans. */
  rowSpan?: TailwindRowSpan | undefined;
  /** Multi-column count or width. */
  columns?: TailwindColumns | undefined;
  /** Column/page break inside the element. */
  breakInside?: TailwindBreakInside | undefined;
  /** How box decorations behave across fragments. */
  boxDecoration?: TailwindBoxDecoration | undefined;
  /** Programmatic scrolling behavior. */
  scroll?: TailwindScrollBehavior | undefined;
  /** Scroll padding — all sides, one axis/side, or the unit overload. */
  scrollP?: TailwindSpacing | undefined;
  /** Pseudo-element content — `none`, arbitrary `[…]`, or bare for the empty string. */
  content?: true | TailwindContent | undefined;
  /** Gap between flex/grid children — both axes or one. */
  gapX?: TailwindSpacing | undefined;
  /** Gap between flex/grid children — both axes or one. */
  gapY?: TailwindSpacing | undefined;
  /** Overflow behavior — both axes or one. */
  overflowX?: TailwindOverflow | undefined;
  /** Overflow behavior — both axes or one. */
  overflowY?: TailwindOverflow | undefined;
  /** Overscroll behavior — both axes or one. */
  overscrollX?: TailwindOverscroll | undefined;
  /** Overscroll behavior — both axes or one. */
  overscrollY?: TailwindOverscroll | undefined;
  /** Scroll padding — all sides, one axis/side, or the unit overload. */
  scrollPx?: TailwindSpacing | undefined;
  /** Scroll padding — all sides, one axis/side, or the unit overload. */
  scrollPy?: TailwindSpacing | undefined;
  /** Scroll padding — all sides, one axis/side, or the unit overload. */
  scrollPt?: TailwindSpacing | undefined;
  /** Scroll padding — all sides, one axis/side, or the unit overload. */
  scrollPb?: TailwindSpacing | undefined;
  /** Scroll padding — all sides, one axis/side, or the unit overload. */
  scrollPl?: TailwindSpacing | undefined;
  /** Scroll padding — all sides, one axis/side, or the unit overload. */
  scrollPr?: TailwindSpacing | undefined;
}
