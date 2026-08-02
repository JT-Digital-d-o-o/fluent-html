import type { TailwindAlignItems, TailwindAlignSelf, TailwindAnimate, TailwindAppearance, TailwindAspect, TailwindBackfaceVisibility, TailwindBgBlendMode, TailwindBlur, TailwindBorderStyle, TailwindBorderWidth, TailwindBoxDecoration, TailwindBreakBeforeAfter, TailwindBreakInside, TailwindBrightness, TailwindColSpan, TailwindColor, TailwindColorScheme, TailwindColumns, TailwindContent, TailwindContrast, TailwindCursor, TailwindDecorationStyle, TailwindDecorationThickness, TailwindDelay, TailwindDropShadow, TailwindDuration, TailwindEase, TailwindFieldSizing, TailwindFlex, TailwindFlexDirection, TailwindFlexWrap, TailwindFontFamily, TailwindFontWeight, TailwindGradientAngle, TailwindGradientDirection, TailwindGradientInterpolation, TailwindGradientOrigin, TailwindGradientPosition, TailwindGradientStop, TailwindGridAuto, TailwindGridAutoFlow, TailwindGridCols, TailwindGridLine, TailwindGridRows, TailwindHeight, TailwindHueRotate, TailwindHyphens, TailwindInset, TailwindInsetShadow, TailwindIsolation, TailwindJustifyContent, TailwindLeading, TailwindLineClamp, TailwindListStylePosition, TailwindListStyleType, TailwindMaskComposite, TailwindMaskEdge, TailwindMaskStop, TailwindMaskType, TailwindMaxHeight, TailwindMaxWidth, TailwindMinHeight, TailwindMinWidth, TailwindMixBlendMode, TailwindObjectFit, TailwindOpacity, TailwindOrder, TailwindOutline, TailwindOverflow, TailwindOverscroll, TailwindPerspective, TailwindPerspectiveOrigin, TailwindPlaceContent, TailwindPlaceItems, TailwindPlaceSelf, TailwindPointerEvents, TailwindResize, TailwindRingWidth, TailwindRotate, TailwindRounded, TailwindRoundedCorner, TailwindRowSpan, TailwindSaturate, TailwindScale, TailwindScrollBehavior, TailwindSelect, TailwindShadow, TailwindSkew, TailwindSnapAlign, TailwindSnapAxis, TailwindSnapStop, TailwindSnapStrictness, TailwindSpacing, TailwindStrokeWidth, TailwindTextAlign, TailwindTextShadow, TailwindTextSize, TailwindTextWrap, TailwindTracking, TailwindTransformStyle, TailwindTransition, TailwindTransitionBehavior, TailwindTranslate, TailwindTranslateZ, TailwindUnderlineOffset, TailwindWhitespace, TailwindWidth, TailwindWillChange, TailwindWrap, TailwindZIndex } from "./tailwind-types.js";
import type { CssPropertyName } from "./css-props.gen.js";
/**
 * The style half of a variant object (llm-styling/object-variants): one
 * optional property per fluent styling key. `false`/`undefined` values are
 * skipped at apply time, so conditional styling is a plain expression
 * (`bold: isImportant`, `bg: active ? "blue-600" : undefined`). Multi-arg
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
    /** Shorthand for align-content + justify-content. */
    placeContent?: TailwindPlaceContent | undefined;
    /** Shorthand for align-items + justify-items. */
    placeItems?: TailwindPlaceItems | undefined;
    /** Shorthand for align-self + justify-self. */
    placeSelf?: TailwindPlaceSelf | undefined;
    /** Border width, style, or color — all sides (bare = 1px width), one side, or side + width/color. */
    border?: true | TailwindBorderWidth | TailwindBorderStyle | TailwindColor | "t" | "b" | "l" | "r" | "x" | "y" | "top" | "bottom" | "left" | "right" | readonly ["x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", TailwindBorderWidth | TailwindColor] | undefined;
    /** Border radius — all corners (bare = default), one corner, or corner + size. */
    rounded?: true | TailwindRounded | TailwindRoundedCorner | readonly [TailwindRoundedCorner, TailwindRounded] | undefined;
    /** Border between horizontal children. */
    divideX?: true | TailwindBorderWidth | undefined;
    /** Border between vertical children. */
    divideY?: true | TailwindBorderWidth | undefined;
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
    /** Skew on the X axis in degrees. */
    skewX?: TailwindSkew | undefined;
    /** Skew on the Y axis in degrees. */
    skewY?: TailwindSkew | undefined;
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
    /** Backdrop brightness filter (percent). */
    backdropBrightness?: TailwindBrightness | undefined;
    /** Contrast filter (percent). */
    contrast?: TailwindContrast | undefined;
    /** Backdrop contrast filter (percent). */
    backdropContrast?: TailwindContrast | undefined;
    /** Grayscale filter (bare = 100%). */
    grayscale?: true | 0 | "0" | undefined;
    /** Backdrop grayscale filter (bare = 100%). */
    backdropGrayscale?: true | 0 | "0" | undefined;
    /** Hue-rotate filter in degrees. */
    hueRotate?: TailwindHueRotate | undefined;
    /** Backdrop hue-rotate filter in degrees. */
    backdropHueRotate?: TailwindHueRotate | undefined;
    /** Invert filter (bare = 100%). */
    invert?: true | 0 | "0" | undefined;
    /** Backdrop invert filter (bare = 100%). */
    backdropInvert?: true | 0 | "0" | undefined;
    /** Saturation filter (percent). */
    saturate?: TailwindSaturate | undefined;
    /** Backdrop saturation filter (percent). */
    backdropSaturate?: TailwindSaturate | undefined;
    /** Sepia filter (bare = 100%). */
    sepia?: true | 0 | "0" | undefined;
    /** Backdrop sepia filter (bare = 100%). */
    backdropSepia?: true | 0 | "0" | undefined;
    /** Hint the browser about upcoming changes. */
    willChange?: TailwindWillChange | undefined;
    /** User-resizability (bare = both axes). */
    resize?: true | TailwindResize | undefined;
    /** Overscroll behavior — both axes or one. */
    overscroll?: TailwindOverscroll | undefined;
    /** Prefix an arbitrary utility with `-` (negative value passthrough). */
    neg?: string | undefined;
    /** Arbitrary-CSS escape — emits `[prop:value]` (spaces become `_`); variant-composable. */
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
    /** color-scheme of the element. */
    scheme?: TailwindColorScheme | undefined;
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
    /** Hyphenation behavior. */
    hyphens?: TailwindHyphens | undefined;
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
    /** Reset stacking-context isolation. */
    isolation?: TailwindIsolation | undefined;
    /** Transition delay in ms. */
    delay?: TailwindDelay | undefined;
    /** 3D perspective depth on the parent. */
    perspective?: TailwindPerspective | undefined;
    /** Vanishing-point origin for 3D perspective. */
    perspectiveOrigin?: TailwindPerspectiveOrigin | undefined;
    /** Whether children are positioned in 3D space (transform-style). */
    transform?: TailwindTransformStyle | undefined;
    /** Visibility of an element's back face. */
    backface?: TailwindBackfaceVisibility | undefined;
    /** Apply scale on all three axes. */
    scale3d?: boolean | undefined;
    /** Rotation around the X axis in degrees. */
    rotateX?: TailwindRotate | undefined;
    /** Rotation around the Y axis in degrees. */
    rotateY?: TailwindRotate | undefined;
    /** Rotation around the Z axis in degrees. */
    rotateZ?: TailwindRotate | undefined;
    /** Scale on the X axis (percent). */
    scaleX?: TailwindScale | undefined;
    /** Scale on the Y axis (percent). */
    scaleY?: TailwindScale | undefined;
    /** Scale on the Z axis (percent). */
    scaleZ?: TailwindScale | undefined;
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
    /** Column/page break before the element. */
    breakBefore?: TailwindBreakBeforeAfter | undefined;
    /** Column/page break after the element. */
    breakAfter?: TailwindBreakBeforeAfter | undefined;
    /** Column/page break inside the element. */
    breakInside?: TailwindBreakInside | undefined;
    /** How box decorations behave across fragments. */
    boxDecoration?: TailwindBoxDecoration | undefined;
    /** Scroll-snap axis with optional strictness. */
    snap?: TailwindSnapAxis | readonly [Exclude<TailwindSnapAxis, "none">, TailwindSnapStrictness] | undefined;
    /** Snap alignment of a snapped child. */
    snapAlign?: TailwindSnapAlign | undefined;
    /** Whether scrolling may skip past snap positions. */
    snapStop?: TailwindSnapStop | undefined;
    /** Programmatic scrolling behavior. */
    scroll?: TailwindScrollBehavior | undefined;
    /** Scroll margin — all sides, one axis/side, or the unit overload. */
    scrollM?: TailwindSpacing | undefined;
    /** Scroll padding — all sides, one axis/side, or the unit overload. */
    scrollP?: TailwindSpacing | undefined;
    /** Whether form fields size to their content. */
    fieldSizing?: TailwindFieldSizing | undefined;
    /** Pseudo-element content — `none`, arbitrary `[…]`, or bare for the empty string. */
    content?: true | TailwindContent | undefined;
    /** Mask image (`none` or an arbitrary source) or mask-composite mode. */
    mask?: "none" | `[${string}]` | TailwindMaskComposite | undefined;
    /** Edge-fade mask start — edge + stop. */
    maskFrom?: readonly [TailwindMaskEdge, TailwindMaskStop] | undefined;
    /** Edge-fade mask end — edge + stop. */
    maskTo?: readonly [TailwindMaskEdge, TailwindMaskStop] | undefined;
    /** SVG mask interpretation mode. */
    maskType?: TailwindMaskType | undefined;
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
    /** Scroll margin — all sides, one axis/side, or the unit overload. */
    scrollMx?: TailwindSpacing | undefined;
    /** Scroll margin — all sides, one axis/side, or the unit overload. */
    scrollMy?: TailwindSpacing | undefined;
    /** Scroll margin — all sides, one axis/side, or the unit overload. */
    scrollMt?: TailwindSpacing | undefined;
    /** Scroll margin — all sides, one axis/side, or the unit overload. */
    scrollMb?: TailwindSpacing | undefined;
    /** Scroll margin — all sides, one axis/side, or the unit overload. */
    scrollMl?: TailwindSpacing | undefined;
    /** Scroll margin — all sides, one axis/side, or the unit overload. */
    scrollMr?: TailwindSpacing | undefined;
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
//# sourceMappingURL=variant-object.gen.d.ts.map