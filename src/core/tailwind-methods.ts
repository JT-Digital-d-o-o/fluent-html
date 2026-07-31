/**
 * Tailwind CSS utility methods for Tag — extracted as a mixin.
 * This file adds all Tailwind styling methods, variant proxy (.on/.at),
 * and layout helpers to Tag.prototype via declaration merging.
 *
 * @module
 */
import { Tag } from "./tag.js";
// Shared with the class-vocab source of truth (C-05) — one home for these
// constants (the extractor + ESLint maps derive from the same module).
import { DIR_MAP, ROUNDED_CORNERS, signNeg, radialGradientClass } from "../class-vocab/types.js";
import type {
  TailwindSpacing,
  TailwindWidth,
  TailwindHeight,
  TailwindMaxWidth,
  TailwindMinWidth,
  TailwindMaxHeight,
  TailwindMinHeight,
  TailwindColor,
  TailwindTextSize,
  TailwindFontWeight,
  TailwindLeading,
  TailwindTracking,
  TailwindRounded,
  TailwindRoundedCorner,
  TailwindShadow,
  TailwindBorderWidth,
  TailwindBorderStyle,
  TailwindOpacity,
  TailwindCursor,
  TailwindZIndex,
  TailwindGridCols,
  TailwindGridRows,
  TailwindFlex,
  TailwindOverflow,
  TailwindObjectFit,
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
  TailwindTranslate,
  TailwindSelect,
  TailwindPointerEvents,
  TailwindWhitespace,
  TailwindListStyleType,
  TailwindListStylePosition,
  TailwindOutline,
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
  TailwindBrightness,
  TailwindContrast,
  TailwindHueRotate,
  TailwindSaturate,
  TailwindPlaceContent,
  TailwindPlaceItems,
  TailwindPlaceSelf,
  TailwindGridAutoFlow,
  TailwindGridAuto,
  TailwindOrder,
  TailwindSkew,
  TailwindWillChange,
  TailwindOverscroll,
  TailwindPositionArea,
  TailwindStrokeWidth,
  TailwindDecorationStyle,
  TailwindDecorationThickness,
  TailwindColorScheme,
  TailwindTextWrap,
  TailwindHyphens,
  TailwindTextShadow,
  TailwindDropShadow,
  TailwindInsetShadow,
  TailwindMixBlendMode,
  TailwindBgBlendMode,
  TailwindIsolation,
  TailwindDelay,
  TailwindTransitionBehavior,
  TailwindGradientPosition,
  TailwindGradientAngle,
  TailwindGradientOrigin,
  TailwindGradientInterpolation,
  TailwindPerspective,
  TailwindPerspectiveOrigin,
  TailwindTranslateZ,
  TailwindTransformStyle,
  TailwindBackfaceVisibility,
  TailwindGridLine,
  TailwindRowSpan,
  TailwindColumns,
  TailwindBreakBeforeAfter,
  TailwindBreakInside,
  TailwindBoxDecoration,
  TailwindSnapAxis,
  TailwindSnapStrictness,
  TailwindSnapAlign,
  TailwindSnapStop,
  TailwindScrollBehavior,
  TailwindFieldSizing,
  TailwindMaskEdge,
  TailwindMaskStop,
  TailwindMaskComposite,
  TailwindMaskType,
  TailwindAppearance,
  TailwindWrap,
  TailwindContent,
} from "./tailwind-types.js";
import type { CssPropertyName } from "./css-props.gen.js";
import type { Id } from "../ids.js";
import { extractId } from "../ids.js";

// ── Variant helper (local, not on prototype) ────────────────────────

function withVariant(tag: Tag, prefix: string, fn: (tag: Tag) => Tag): Tag {
  const outer = tag._variantPrefix;
  tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
  // try/finally so a throw inside the callback can't leak the variant prefix onto
  // later classes on a reused tag (e.g. `hover:` bleeding into subsequent .addClass).
  try {
    fn(tag);
  } finally {
    tag._variantPrefix = outer;
  }
  return tag;
}

// `DIR_MAP` (padding/margin/border directions) is imported from class-vocab.

// ── Declaration merging — adds types to Tag ─────────────────────────

declare module "./tag.js" {
  interface Tag {
    // Variant Proxy
    on(state: TailwindState, fn: (tag: this) => this): this;
    at(breakpoint: TailwindBreakpoint, fn: (tag: this) => this): this;

    // Spacing
    padding(value: TailwindSpacing): this;
    padding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
    padding(unit: TailwindUnit, amount: number): this;
    margin(value: TailwindSpacing | "auto"): this;
    margin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing | "auto"): this;
    margin(unit: TailwindUnit, amount: number): this;

    // Colors
    background(color: TailwindColor): this;
    textColor(color: TailwindColor): this;

    // Typography
    textSize(size: TailwindTextSize): this;
    textSize(unit: TailwindUnit, amount: number): this;
    textAlign(align: TailwindTextAlign): this;
    fontWeight(weight: TailwindFontWeight): this;
    bold(): this;
    italic(): this;
    uppercase(): this;
    lowercase(): this;
    capitalize(): this;
    underline(): this;
    noUnderline(): this;
    lineThrough(): this;
    truncate(): this;
    leading(value: TailwindLeading): this;
    leading(unit: TailwindUnit, amount: number): this;
    tracking(value: TailwindTracking): this;
    tracking(unit: TailwindUnit, amount: number): this;

    // Sizing
    w(value: TailwindWidth): this;
    w(unit: TailwindUnit, amount: number): this;
    h(value: TailwindHeight): this;
    h(unit: TailwindUnit, amount: number): this;
    maxW(value: TailwindMaxWidth): this;
    maxW(unit: TailwindUnit, amount: number): this;
    minW(value: TailwindMinWidth): this;
    minW(unit: TailwindUnit, amount: number): this;
    maxH(value: TailwindMaxHeight): this;
    maxH(unit: TailwindUnit, amount: number): this;
    minH(value: TailwindMinHeight): this;
    minH(unit: TailwindUnit, amount: number): this;

    // Flexbox
    flex(value?: TailwindFlex): this;
    /** `flex` shorthand — `flex-1` | `flex-auto` | `flex-initial` | `flex-none`. */
    flexShorthand(value: "1" | "auto" | "initial" | "none"): this;
    flexDirection(direction: TailwindFlexDirection): this;
    justifyContent(justify: TailwindJustifyContent): this;
    alignItems(align: TailwindAlignItems): this;
    gap(value: TailwindSpacing): this;
    gap(direction: "x" | "y", value: TailwindSpacing): this;
    gap(unit: TailwindUnit, amount: number): this;

    // Grid
    grid(): this;
    gridCols(cols: TailwindGridCols): this;
    gridRows(rows: TailwindGridRows): this;
    gridAutoFlow(value: TailwindGridAutoFlow): this;
    gridAutoRows(value: TailwindGridAuto): this;
    gridAutoCols(value: TailwindGridAuto): this;

    // Borders
    /** v4: a bare `.border()` uses `currentColor` — add an explicit `.borderColor(...)` for a specific color (v3's gray default is gone). */
    border(value?: TailwindBorderWidth | TailwindBorderStyle | "t" | "b" | "l" | "r" | "x" | "y" | "top" | "bottom" | "left" | "right"): this;
    border(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value?: TailwindBorderWidth): this;
    borderColor(color: TailwindColor): this;
    borderColor(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", color: TailwindColor): this;
    borderStyle(style: TailwindBorderStyle): this;
    rounded(value?: TailwindRounded): this;
    rounded(corner: TailwindRoundedCorner, value?: TailwindRounded): this;
    shadow(value?: TailwindShadow): this;

    // Effects & Appearance
    opacity(value: TailwindOpacity): this;
    cursor(value: TailwindCursor): this;
    // Position — dedicated shortcuts (mirror .flex()/.grid()/.hidden()).
    absolute(): this;
    relative(): this;
    fixed(): this;
    sticky(): this;
    static(): this;
    zIndex(value: TailwindZIndex): this;
    overflow(value: TailwindOverflow): this;
    overflow(direction: "x" | "y", value: TailwindOverflow): this;
    objectFit(value: TailwindObjectFit): this;

    // Layout & Display — dedicated shortcuts (`.flex()`/`.grid()`/`.hidden()` already cover flex/grid/none).
    block(): this;
    inlineBlock(): this;
    inline(): this;
    inlineFlex(): this;
    inlineGrid(): this;
    contents(): this;
    hidden(): this;
    inset(value: TailwindInset): this;
    inset(unit: TailwindUnit, amount: number): this;
    top(value: TailwindInset): this;
    top(unit: TailwindUnit, amount: number): this;
    right(value: TailwindInset): this;
    right(unit: TailwindUnit, amount: number): this;
    bottom(value: TailwindInset): this;
    bottom(unit: TailwindUnit, amount: number): this;
    left(value: TailwindInset): this;
    left(unit: TailwindUnit, amount: number): this;

    // Flexbox & Grid Extensions
    shrink(value?: 0 | "0"): this;
    grow(value?: 0 | "0"): this;
    flexWrap(value: TailwindFlexWrap): this;
    alignSelf(value: TailwindAlignSelf): this;
    colSpan(value: TailwindColSpan): this;
    aspect(value: TailwindAspect): this;
    order(value: TailwindOrder): this;

    // Place (Grid/Flex alignment)
    placeContent(value: TailwindPlaceContent): this;
    placeItems(value: TailwindPlaceItems): this;
    placeSelf(value: TailwindPlaceSelf): this;

    // Spacing Between Children
    spaceX(value: TailwindSpacing): this;
    spaceY(value: TailwindSpacing): this;
    divideX(value?: TailwindBorderWidth): this;
    divideY(value?: TailwindBorderWidth): this;

    // Transitions & Animation
    transition(value?: TailwindTransition): this;
    duration(value: TailwindDuration): this;
    animate(value: TailwindAnimate): this;

    // Ring (Focus Rings)
    /** v4: a bare `.ring()` is **1px** (was 3px in v3) and uses `currentColor` — pass a width and/or `.ringColor(...)` explicitly. */
    ring(value?: TailwindRingWidth): this;
    ringColor(color: TailwindColor): this;

    // Transforms
    scale(value: TailwindScale): this;
    rotate(value: TailwindRotate): this;
    translate(direction: "x" | "y", value: TailwindTranslate): this;
    translate(direction: "z", value: TailwindTranslateZ): this;
    skewX(value: TailwindSkew): this;
    skewY(value: TailwindSkew): this;

    // Interactivity
    select(value: TailwindSelect): this;
    pointerEvents(value: TailwindPointerEvents): this;
    appearance(value: TailwindAppearance): this;

    // Text & Whitespace
    whitespace(value: TailwindWhitespace): this;

    // List Style
    /** Sets list style type. Generates `list-{value}` — same prefix as `listStylePosition`, but type-safe via `TailwindListStyleType`. */
    listStyleType(value: TailwindListStyleType): this;
    /** Sets list style position. Generates `list-{value}` — same prefix as `listStyleType`, but type-safe via `TailwindListStylePosition`. */
    listStylePosition(value: TailwindListStylePosition): this;

    // Accessibility
    srOnly(): this;

    // Outline
    outline(value: TailwindOutline): this;
    /** v4 a11y-safe focus-hiding: `outline-hidden` (keeps a visible outline in forced-colors mode). Prefer over `.outline("none")`. */
    outlineHidden(): this;

    // Font Family
    fontFamily(family: TailwindFontFamily): this;

    // Gradients (v4: bg-linear-* / bg-radial-* / bg-conic-*)
    gradient(
      from: TailwindColor,
      to: TailwindColor,
      direction?: TailwindGradientDirection,
      interpolation?: TailwindGradientInterpolation,
    ): this;
    gradientTo(direction: TailwindGradientDirection, interpolation?: TailwindGradientInterpolation): this;
    gradientLinear(angle: TailwindGradientAngle): this;
    gradientRadial(origin?: TailwindGradientOrigin, interpolation?: TailwindGradientInterpolation): this;
    gradientConic(angle?: TailwindGradientAngle, interpolation?: TailwindGradientInterpolation): this;
    from(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
    via(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
    to(color: TailwindGradientStop, position?: TailwindGradientPosition): this;

    // Group / Peer markers
    group(name?: string): this;
    peer(name?: string): this;

    /** Mark this element a container-query container (v4): `@container` / `@container/{name}`. Children query it with `.at("@sm", …)`. */
    containerQuery(name?: string): this;

    // Shadow Color
    shadowColor(color: TailwindColor): this;

    // Filters
    blur(value?: TailwindBlur): this;
    backdropBlur(value?: TailwindBlur): this;
    brightness(value: TailwindBrightness): this;
    backdropBrightness(value: TailwindBrightness): this;
    contrast(value: TailwindContrast): this;
    backdropContrast(value: TailwindContrast): this;
    grayscale(value?: 0 | "0"): this;
    backdropGrayscale(value?: 0 | "0"): this;
    hueRotate(value: TailwindHueRotate): this;
    backdropHueRotate(value: TailwindHueRotate): this;
    invert(value?: 0 | "0"): this;
    backdropInvert(value?: 0 | "0"): this;
    saturate(value: TailwindSaturate): this;
    backdropSaturate(value: TailwindSaturate): this;
    sepia(value?: 0 | "0"): this;
    backdropSepia(value?: 0 | "0"): this;

    // Line Clamp
    lineClamp(value: TailwindLineClamp): this;

    // Typography extras
    antialiased(): this;
    tabularNums(): this;
    underlineOffset(value: TailwindUnderlineOffset): this;
    underlineOffset(unit: TailwindUnit, amount: number): this;
    breakAll(): this;

    // Timing function
    ease(value: TailwindEase): this;

    // Resize
    resize(value?: TailwindResize): this;

    // Performance hints
    willChange(value: TailwindWillChange): this;

    // Overscroll behavior
    overscroll(value: TailwindOverscroll): this;
    overscroll(direction: "x" | "y", value: TailwindOverscroll): this;

    /**
     * Negative-value escape hatch — prepends `-` to an arbitrary utility for cases
     * the typed setters don't cover. Prefer the typed negatives where they exist
     * (`.translate("y", "-1")`, `.rotate(-45)`).
     * @example
     * Div().neg("inset-px")   // -inset-px
     * Div().neg("mt-2")       // -mt-2
     */
    neg(cls: string): this;

    /**
     * Arbitrary-CSS escape hatch — emits Tailwind's arbitrary-property class
     * `[prop:value]` (spaces become `_`), so the style composes with variants
     * (`.on()`/`.at()`) and stays visible to the safelist extractor: a literal
     * call is safelisted, a non-literal argument is a build error. Decision
     * rule: static arbitrary CSS → `cssProp`; runtime-computed → `.setStyle()`;
     * non-Tailwind class hooks → `.cssClass()`.
     * @example
     * Div().cssProp("mask-repeat", "no-repeat")            // [mask-repeat:no-repeat]
     * Div().cssProp("border", "1px solid red")             // [border:1px_solid_red]
     * Div().on("hover", t => t.cssProp("--glow", "0 0 4px")) // hover:[--glow:0_0_4px]
     */
    cssProp(property: CssPropertyName, value: string): this;

    /**
     * Intent marker for a legitimately non-Tailwind class (JS/CSS hook,
     * third-party widget class). Appends the name verbatim — greppable, and
     * lint keeps Tailwind-shaped strings out of it. Tailwind styling belongs
     * on the typed methods; arbitrary CSS on `.cssProp()`.
     * @example
     * Div().cssClass("js-map-container")
     * Div().cssClass("shepherd-target")
     */
    cssClass(name: string): this;

    // CSS Anchor Positioning (B-010). `anchorName`/`positionAnchor` accept `string | Id`
    // (normalized via `extractId`). All three emitters write *inline style*, not a Tailwind
    // class: their values are arbitrary custom-idents / multi-keyword grammar — often a
    // per-instance variable — that the safelist extractor can't resolve and Tailwind v4 has
    // no native utility for. As inline style they're extractor-opaque and dynamic-safe, so a
    // runtime `Id` (or any value) just works.
    /** Register this element as an anchor: emits inline `anchor-name: --<name>`. */
    anchorName(name: string | Id): this;
    /** Position this element against a named anchor: emits inline `position-anchor: --<name>`. */
    positionAnchor(name: string | Id): this;
    /**
     * Place against the active anchor: emits inline `position-area: <area>`. The closed
     * tokens map to their space-separated CSS values (`"bottom-span-right"` → `bottom
     * span-right`); the `[${string}]` arm is unwrapped verbatim (`"[top span-left]"` → `top
     * span-left`), the same escape-hatch contract as `.textSize("[13px]")`.
     */
    positionArea(area: TailwindPositionArea): this;

    /**
     * Name this element for the View Transitions API — emits inline `view-transition-name:
     * <name>` style (extractor-opaque, so a dynamic name is safe) so a hero element morphs
     * across an HTMX `outerMorph` swap when `HtmxConfig({ transitions: true })` is on.
     * Accepts a raw name or an `Id`. The name is emitted verbatim (not validated).
     *
     * @example
     * Img().setSrc("/hero.avif").viewTransitionName("hero")
     * Div().viewTransitionName(ids.card)
     */
    viewTransitionName(name: string | Id): this;

    fillColor(color: TailwindColor | "none"): this;
    strokeColor(color: TailwindColor | "none"): this;
    strokeWidth(width: TailwindStrokeWidth): this;
    strokeWidth(unit: TailwindUnit, amount: number): this;
    accentColor(color: TailwindColor): this;
    caretColor(color: TailwindColor): this;
    decorationColor(color: TailwindColor): this;
    decorationStyle(style: TailwindDecorationStyle): this;
    decorationThickness(value: TailwindDecorationThickness): this;
    decorationThickness(unit: TailwindUnit, amount: number): this;
    scheme(value: TailwindColorScheme): this;

    insetX(value: TailwindInset): this;
    insetX(unit: TailwindUnit, amount: number): this;
    insetY(value: TailwindInset): this;
    insetY(unit: TailwindUnit, amount: number): this;
    insetS(value: TailwindInset): this;
    insetS(unit: TailwindUnit, amount: number): this;
    insetE(value: TailwindInset): this;
    insetE(unit: TailwindUnit, amount: number): this;

    textWrap(value: TailwindTextWrap): this;
    /** Overflow-wrap (v4 `wrap-*`): where long words may break. */
    wrap(value: TailwindWrap): this;
    hyphens(value: TailwindHyphens): this;
    textShadow(value: TailwindTextShadow): this;
    textShadowColor(color: TailwindColor): this;

    dropShadow(value: TailwindDropShadow): this;
    dropShadowColor(color: TailwindColor): this;
    insetShadow(value: TailwindInsetShadow): this;
    insetShadowColor(color: TailwindColor): this;
    insetRing(value?: TailwindRingWidth): this;
    insetRingColor(color: TailwindColor): this;
    mixBlend(mode: TailwindMixBlendMode): this;
    bgBlend(mode: TailwindBgBlendMode): this;
    isolate(): this;
    isolation(value: TailwindIsolation): this;

    delay(value: TailwindDelay): this;
    transitionBehavior(value: TailwindTransitionBehavior): this;

    perspective(value: TailwindPerspective): this;
    perspectiveOrigin(value: TailwindPerspectiveOrigin): this;
    transformStyle(value: TailwindTransformStyle): this;
    backfaceVisibility(value: TailwindBackfaceVisibility): this;
    rotateX(value: TailwindRotate): this;
    rotateY(value: TailwindRotate): this;
    rotateZ(value: TailwindRotate): this;
    scaleX(value: TailwindScale): this;
    scaleY(value: TailwindScale): this;
    scaleZ(value: TailwindScale): this;
    scale3d(): this;

    colStart(value: TailwindGridLine): this;
    colEnd(value: TailwindGridLine): this;
    rowStart(value: TailwindGridLine): this;
    rowEnd(value: TailwindGridLine): this;
    rowSpan(value: TailwindRowSpan): this;
    columns(value: TailwindColumns): this;
    breakBefore(value: TailwindBreakBeforeAfter): this;
    breakAfter(value: TailwindBreakBeforeAfter): this;
    breakInside(value: TailwindBreakInside): this;
    boxDecoration(value: TailwindBoxDecoration): this;
    snap(axis: TailwindSnapAxis): this;
    snap(axis: Exclude<TailwindSnapAxis, "none">, strictness: TailwindSnapStrictness): this;
    snapAlign(value: TailwindSnapAlign): this;
    snapStop(value: TailwindSnapStop): this;
    scrollBehavior(value: TailwindScrollBehavior): this;
    scrollMargin(value: TailwindSpacing): this;
    scrollMargin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
    scrollMargin(unit: TailwindUnit, amount: number): this;
    scrollPadding(value: TailwindSpacing): this;
    scrollPadding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
    scrollPadding(unit: TailwindUnit, amount: number): this;
    fieldSizing(value: TailwindFieldSizing): this;

    /**
     * Pseudo-element content. Bare `.content()` emits `content-['']` — the empty
     * string every `before:`/`after:` decoration needs to render.
     * @example
     * Span().on("before", t => t.content().w("2").h("2").background("red-500"))
     * Span().on("after", t => t.content("[attr(data-label)]"))
     */
    content(value?: TailwindContent): this;

    maskImage(value: "none" | `[${string}]`): this;
    maskFrom(edge: TailwindMaskEdge, stop: TailwindMaskStop): this;
    maskTo(edge: TailwindMaskEdge, stop: TailwindMaskStop): this;
    maskComposite(mode: TailwindMaskComposite): this;
    maskType(value: TailwindMaskType): this;
  }
}

// ── Prototype implementations ───────────────────────────────────────
/* eslint-disable fluent-html/no-known-modifiers-in-setclass */

const p = Tag.prototype;

// Variant Proxy

p.on = function (state: string, fn: (tag: Tag) => Tag) {
  return withVariant(this, state, fn);
};

p.at = function (breakpoint: string, fn: (tag: Tag) => Tag) {
  return withVariant(this, breakpoint, fn);
};

// Spacing

p.padding = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`p-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`p-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`p${dir}-${value}`);
};

p.margin = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`m-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`m-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`m${dir}-${value}`);
};

// Colors

p.background = function (color: string) { return this.addClass(`bg-${color}`); };
p.textColor = function (color: string) { return this.addClass(`text-${color}`); };

// Typography

p.textSize = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`text-[${amount}${unitOrValue}]`);
  return this.addClass(`text-${unitOrValue}`);
};
p.textAlign = function (align: string) { return this.addClass(`text-${align}`); };
p.fontWeight = function (weight: string) { return this.addClass(`font-${weight}`); };
p.bold = function () { return this.addClass("font-bold"); };
p.italic = function () { return this.addClass("italic"); };
p.uppercase = function () { return this.addClass("uppercase"); };
p.lowercase = function () { return this.addClass("lowercase"); };
p.capitalize = function () { return this.addClass("capitalize"); };
p.underline = function () { return this.addClass("underline"); };
p.noUnderline = function () { return this.addClass("no-underline"); };
p.lineThrough = function () { return this.addClass("line-through"); };
p.truncate = function () { return this.addClass("truncate"); };
p.leading = function (unitOrValue: string | number, amount?: number) {
  if (amount !== undefined) return this.addClass(`leading-[${amount}${unitOrValue}]`);
  return this.addClass(`leading-${unitOrValue}`);
};
p.tracking = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`tracking-[${amount}${unitOrValue}]`);
  return this.addClass(`tracking-${unitOrValue}`);
};

// Sizing

p.w = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`w-[${amount}${unitOrValue}]`);
  return this.addClass(`w-${unitOrValue}`);
};
p.h = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`h-[${amount}${unitOrValue}]`);
  return this.addClass(`h-${unitOrValue}`);
};
p.maxW = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`max-w-[${amount}${unitOrValue}]`);
  return this.addClass(`max-w-${unitOrValue}`);
};
p.minW = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`min-w-[${amount}${unitOrValue}]`);
  return this.addClass(`min-w-${unitOrValue}`);
};
p.maxH = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`max-h-[${amount}${unitOrValue}]`);
  return this.addClass(`max-h-${unitOrValue}`);
};
p.minH = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`min-h-[${amount}${unitOrValue}]`);
  return this.addClass(`min-h-${unitOrValue}`);
};

// Flexbox

p.flex = function (value?: string) {
  return value === undefined ? this.addClass("flex") : this.addClass(`flex-${value}`);
};
p.flexShorthand = function (value: string) { return this.addClass(`flex-${value}`); };
p.flexDirection = function (direction: string) { return this.addClass(`flex-${direction}`); };
p.justifyContent = function (justify: string) { return this.addClass(`justify-${justify}`); };
p.alignItems = function (align: string) { return this.addClass(`items-${align}`); };
p.gap = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`gap-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`gap-[${value}${directionOrValue}]`);
  return this.addClass(`gap-${directionOrValue}-${value}`);
};

// Grid

p.grid = function () { return this.addClass("grid"); };
p.gridCols = function (cols: string | number) { return this.addClass(`grid-cols-${cols}`); };
p.gridRows = function (rows: string | number) { return this.addClass(`grid-rows-${rows}`); };
p.gridAutoFlow = function (value: string) { return this.addClass(`grid-flow-${value}`); };
p.gridAutoRows = function (value: string) { return this.addClass(`auto-rows-${value}`); };
p.gridAutoCols = function (value: string) { return this.addClass(`auto-cols-${value}`); };

// Borders

p.border = function (directionOrValue?: string | number, value?: string | number) {
  if (directionOrValue === undefined) return this.addClass("border");
  const dir = DIR_MAP[directionOrValue as string];
  if (dir !== undefined) {
    return value === undefined
      ? this.addClass(`border-${dir}`)
      : this.addClass(`border-${dir}-${value}`);
  }
  return this.addClass(`border-${directionOrValue}`);
};
p.borderColor = function (directionOrColor: string, color?: string) {
  if (color === undefined) return this.addClass(`border-${directionOrColor}`);
  const dir = DIR_MAP[directionOrColor] || directionOrColor;
  return this.addClass(`border-${dir}-${color}`);
};
p.borderStyle = function (style: string) { return this.addClass(`border-${style}`); };
p.rounded = function (cornerOrValue?: string, value?: string) {
  if (cornerOrValue === undefined) return this.addClass("rounded");
  if (ROUNDED_CORNERS.has(cornerOrValue)) {
    return value === undefined
      ? this.addClass(`rounded-${cornerOrValue}`)
      : this.addClass(`rounded-${cornerOrValue}-${value}`);
  }
  return this.addClass(`rounded-${cornerOrValue}`);
};
p.shadow = function (value?: string) {
  return value === undefined ? this.addClass("shadow") : this.addClass(`shadow-${value}`);
};

// Effects & Appearance

p.opacity = function (value: string | number) { return this.addClass(`opacity-${value}`); };
p.cursor = function (value: string) { return this.addClass(`cursor-${value}`); };
p.absolute = function () { return this.addClass("absolute"); };
p.relative = function () { return this.addClass("relative"); };
p.fixed = function () { return this.addClass("fixed"); };
p.sticky = function () { return this.addClass("sticky"); };
p.static = function () { return this.addClass("static"); };
p.zIndex = function (value: string | number) { return this.addClass(`z-${value}`); };
p.overflow = function (directionOrValue: string, value?: string) {
  if (value === undefined) return this.addClass(`overflow-${directionOrValue}`);
  return this.addClass(`overflow-${directionOrValue}-${value}`);
};
p.objectFit = function (value: string) { return this.addClass(`object-${value}`); };

// Layout & Display

p.block = function () { return this.addClass("block"); };
p.inlineBlock = function () { return this.addClass("inline-block"); };
p.inline = function () { return this.addClass("inline"); };
p.inlineFlex = function () { return this.addClass("inline-flex"); };
p.inlineGrid = function () { return this.addClass("inline-grid"); };
p.contents = function () { return this.addClass("contents"); };
p.hidden = function () { return this.addClass("hidden"); };
p.inset = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`inset-[${amount}${unitOrValue}]`);
  return this.addClass(`inset-${unitOrValue}`);
};
p.top = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`top-[${amount}${unitOrValue}]`);
  return this.addClass(`top-${unitOrValue}`);
};
p.right = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`right-[${amount}${unitOrValue}]`);
  return this.addClass(`right-${unitOrValue}`);
};
p.bottom = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`bottom-[${amount}${unitOrValue}]`);
  return this.addClass(`bottom-${unitOrValue}`);
};
p.left = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`left-[${amount}${unitOrValue}]`);
  return this.addClass(`left-${unitOrValue}`);
};

// Flexbox & Grid Extensions

p.shrink = function (value?: string | number) {
  return value === undefined ? this.addClass("shrink") : this.addClass(`shrink-${value}`);
};
p.grow = function (value?: string | number) {
  return value === undefined ? this.addClass("grow") : this.addClass(`grow-${value}`);
};
p.flexWrap = function (value: string) { return this.addClass(`flex-${value}`); };
p.alignSelf = function (value: string) { return this.addClass(`self-${value}`); };
p.colSpan = function (value: string | number) { return this.addClass(`col-span-${value}`); };
p.aspect = function (value: string) { return this.addClass(`aspect-${value}`); };
p.order = function (value: string | number) { return this.addClass(`order-${value}`); };

// Place (Grid/Flex alignment)

p.placeContent = function (value: string) { return this.addClass(`place-content-${value}`); };
p.placeItems = function (value: string) { return this.addClass(`place-items-${value}`); };
p.placeSelf = function (value: string) { return this.addClass(`place-self-${value}`); };

// Spacing Between Children

p.spaceX = function (value: string) { return this.addClass(`space-x-${value}`); };
p.spaceY = function (value: string) { return this.addClass(`space-y-${value}`); };
p.divideX = function (value?: string | number) {
  return value === undefined ? this.addClass("divide-x") : this.addClass(`divide-x-${value}`);
};
p.divideY = function (value?: string | number) {
  return value === undefined ? this.addClass("divide-y") : this.addClass(`divide-y-${value}`);
};

// Transitions & Animation

p.transition = function (value?: string) {
  return value === undefined ? this.addClass("transition") : this.addClass(`transition-${value}`);
};
p.duration = function (value: string | number) { return this.addClass(`duration-${value}`); };
p.animate = function (value: string) { return this.addClass(`animate-${value}`); };

// Ring (Focus Rings)

p.ring = function (value?: string | number) {
  return value === undefined ? this.addClass("ring") : this.addClass(`ring-${value}`);
};
p.ringColor = function (color: string) { return this.addClass(`ring-${color}`); };

// Transforms

p.scale = function (value: string | number) { return this.addClass(`scale-${value}`); };
p.rotate = function (value: string | number) { return this.addClass(signNeg("rotate", String(value))); };
p.translate = function (direction: string, value: string | number) {
  return this.addClass(signNeg(`translate-${direction}`, String(value)));
};
p.skewX = function (value: string | number) { return this.addClass(signNeg("skew-x", String(value))); };
p.skewY = function (value: string | number) { return this.addClass(signNeg("skew-y", String(value))); };

// Interactivity

p.select = function (value: string) { return this.addClass(`select-${value}`); };
p.pointerEvents = function (value: string) { return this.addClass(`pointer-events-${value}`); };
p.appearance = function (value: string) { return this.addClass(`appearance-${value}`); };

// Text & Whitespace

p.whitespace = function (value: string) { return this.addClass(`whitespace-${value}`); };

// List Style

p.listStyleType = function (value: string) { return this.addClass(`list-${value}`); };
p.listStylePosition = function (value: string) { return this.addClass(`list-${value}`); };

// Accessibility

p.srOnly = function () { return this.addClass("sr-only"); };

// Outline

p.outline = function (value: string) { return this.addClass(`outline-${value}`); };
p.outlineHidden = function () { return this.addClass("outline-hidden"); };

// Font Family

p.fontFamily = function (family: string) { return this.addClass(`font-${family}`); };

// Gradients (v4-native: bg-linear-* replaces v3 bg-gradient-*; + radial/conic)

const interp = (cls: string, i?: string) => (i ? `${cls}/${i}` : cls);

p.gradient = function (from: string, to: string, direction: string = "to-r", interpolation?: string) {
  return this
    .addClass(interp(`bg-linear-${direction}`, interpolation))
    .addClass(`from-${from}`).addClass(`to-${to}`);
};
p.gradientTo = function (direction: string, interpolation?: string) { return this.addClass(interp(`bg-linear-${direction}`, interpolation)); };
p.gradientLinear = function (angle: string | number) { return this.addClass(signNeg("bg-linear", String(angle))); };
p.gradientRadial = function (origin?: string, interpolation?: string) {
  return this.addClass(radialGradientClass(origin, interpolation));
};
p.gradientConic = function (angle?: string | number, interpolation?: string) {
  return this.addClass(interp(angle === undefined ? "bg-conic" : signNeg("bg-conic", String(angle)), interpolation));
};
p.from = function (color: string, position?: string) { this.addClass(`from-${color}`); return position ? this.addClass(`from-${position}`) : this; };
p.via = function (color: string, position?: string) { this.addClass(`via-${color}`); return position ? this.addClass(`via-${position}`) : this; };
p.to = function (color: string, position?: string) { this.addClass(`to-${color}`); return position ? this.addClass(`to-${position}`) : this; };

// Group / Peer markers

p.group = function (name?: string) {
  return name === undefined ? this.addClass("group") : this.addClass(`group/${name}`);
};
p.peer = function (name?: string) {
  return name === undefined ? this.addClass("peer") : this.addClass(`peer/${name}`);
};
p.containerQuery = function (name?: string) {
  return name === undefined ? this.addClass("@container") : this.addClass(`@container/${name}`);
};

// Shadow Color

p.shadowColor = function (color: string) { return this.addClass(`shadow-${color}`); };

// Filters

p.blur = function (value?: string) {
  return value === undefined ? this.addClass("blur") : this.addClass(`blur-${value}`);
};
p.backdropBlur = function (value?: string) {
  return value === undefined ? this.addClass("backdrop-blur") : this.addClass(`backdrop-blur-${value}`);
};
p.brightness = function (value: string | number) { return this.addClass(`brightness-${value}`); };
p.backdropBrightness = function (value: string | number) { return this.addClass(`backdrop-brightness-${value}`); };
p.contrast = function (value: string | number) { return this.addClass(`contrast-${value}`); };
p.backdropContrast = function (value: string | number) { return this.addClass(`backdrop-contrast-${value}`); };
p.grayscale = function (value?: string | number) {
  return value === undefined ? this.addClass("grayscale") : this.addClass(`grayscale-${value}`);
};
p.backdropGrayscale = function (value?: string | number) {
  return value === undefined ? this.addClass("backdrop-grayscale") : this.addClass(`backdrop-grayscale-${value}`);
};
p.hueRotate = function (value: string | number) { return this.addClass(`hue-rotate-${value}`); };
p.backdropHueRotate = function (value: string | number) { return this.addClass(`backdrop-hue-rotate-${value}`); };
p.invert = function (value?: string | number) {
  return value === undefined ? this.addClass("invert") : this.addClass(`invert-${value}`);
};
p.backdropInvert = function (value?: string | number) {
  return value === undefined ? this.addClass("backdrop-invert") : this.addClass(`backdrop-invert-${value}`);
};
p.saturate = function (value: string | number) { return this.addClass(`saturate-${value}`); };
p.backdropSaturate = function (value: string | number) { return this.addClass(`backdrop-saturate-${value}`); };
p.sepia = function (value?: string | number) {
  return value === undefined ? this.addClass("sepia") : this.addClass(`sepia-${value}`);
};
p.backdropSepia = function (value?: string | number) {
  return value === undefined ? this.addClass("backdrop-sepia") : this.addClass(`backdrop-sepia-${value}`);
};

// Line Clamp

p.lineClamp = function (value: string | number) { return this.addClass(`line-clamp-${value}`); };

// Typography extras

p.antialiased = function () { return this.addClass("antialiased"); };
p.tabularNums = function () { return this.addClass("tabular-nums"); };
p.underlineOffset = function (unitOrValue: string | number, amount?: number) {
  if (amount !== undefined) return this.addClass(`underline-offset-[${amount}${unitOrValue}]`);
  return this.addClass(`underline-offset-${unitOrValue}`);
};
p.breakAll = function () { return this.addClass("break-all"); };

// Timing function

p.ease = function (value: string) { return this.addClass(`ease-${value}`); };

// Resize

p.resize = function (value?: string) {
  return value === undefined ? this.addClass("resize") : this.addClass(`resize-${value}`);
};

// Performance hints

p.willChange = function (value: string) { return this.addClass(`will-change-${value}`); };

// Overscroll behavior

p.overscroll = function (directionOrValue: string, value?: string) {
  if (value === undefined) return this.addClass(`overscroll-${directionOrValue}`);
  return this.addClass(`overscroll-${directionOrValue}-${value}`);
};

// Negative value prefix

p.neg = function (cls: string) { return this.addClass(`-${cls}`); };

// Typed escapes (llm-styling/escape-hatch)

p.cssProp = function (property: string, value: string) {
  return this.addClass(`[${property}:${value.replace(/\s+/g, "_")}]`);
};
p.cssClass = function (name: string) { return this.addClass(name); };

// CSS Anchor Positioning (B-010) — `anchorName`/`positionAnchor` accept `string | Id`
// (the public type narrows to `Id`; the parity harness drives the runtime with raw
// strings). `extractId` is the same `isId(x) ? x.id : x` bridge `setId` uses (tag.ts).
// All three anchor emitters (+ view-transition-name) write *inline style* (`escapeAttr`'d
// in the `style` attr), not a class: their values are arbitrary custom-idents / multi-keyword
// grammar the extractor can't resolve and Tailwind v4 has no native utility for. defineIds
// does NOT validate id chars, so authors must use ID-safe ids.

// Closed position-area tokens → their space-separated CSS values (the class form hyphenated
// what CSS spaces). The `Exclude<…, `[…]`>` key set forces a mapping for every named token —
// adding one to the union without a CSS value is a compile error. The `[…]` arm is unwrapped.
const POSITION_AREA_CSS: Record<Exclude<TailwindPositionArea, `[${string}]`>, string> = {
  top: "top", bottom: "bottom", left: "left", right: "right", center: "center",
  "top-left": "top left", "top-right": "top right",
  "bottom-left": "bottom left", "bottom-right": "bottom right",
  "top-span-left": "top span-left", "top-span-right": "top span-right",
  "bottom-span-left": "bottom span-left", "bottom-span-right": "bottom span-right",
};

p.anchorName = function (name: string | Id) { return this.addStyle(`anchor-name: --${extractId(name)}`); };
p.positionAnchor = function (name: string | Id) { return this.addStyle(`position-anchor: --${extractId(name)}`); };
p.positionArea = function (area: string) {
  const value = area.startsWith("[") && area.endsWith("]") ? area.slice(1, -1) : (POSITION_AREA_CSS as Record<string, string>)[area] ?? area;
  return this.addStyle(`position-area: ${value}`);
};
p.viewTransitionName = function (name: string | Id) { return this.addStyle(`view-transition-name: ${extractId(name)}`); };

p.fillColor = function (color: string) { return this.addClass(`fill-${color}`); };
p.strokeColor = function (color: string) { return this.addClass(`stroke-${color}`); };
p.strokeWidth = function (unitOrValue: string | number, amount?: number) {
  if (amount !== undefined) return this.addClass(`stroke-[${amount}${unitOrValue}]`);
  return this.addClass(`stroke-${unitOrValue}`);
};
p.accentColor = function (color: string) { return this.addClass(`accent-${color}`); };
p.caretColor = function (color: string) { return this.addClass(`caret-${color}`); };
p.scheme = function (value: string) { return this.addClass(`scheme-${value}`); };
p.decorationColor = function (color: string) { return this.addClass(`decoration-${color}`); };
p.decorationStyle = function (style: string) { return this.addClass(`decoration-${style}`); };
p.decorationThickness = function (unitOrValue: string | number, amount?: number) {
  if (amount !== undefined) return this.addClass(`decoration-[${amount}${unitOrValue}]`);
  return this.addClass(`decoration-${unitOrValue}`);
};

p.insetX = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`inset-x-[${amount}${unitOrValue}]`);
  return this.addClass(`inset-x-${unitOrValue}`);
};
p.insetY = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`inset-y-[${amount}${unitOrValue}]`);
  return this.addClass(`inset-y-${unitOrValue}`);
};
p.insetS = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`inset-s-[${amount}${unitOrValue}]`);
  return this.addClass(`inset-s-${unitOrValue}`);
};
p.insetE = function (unitOrValue: string, amount?: number) {
  if (amount !== undefined) return this.addClass(`inset-e-[${amount}${unitOrValue}]`);
  return this.addClass(`inset-e-${unitOrValue}`);
};

p.textWrap = function (value: string) { return this.addClass(`text-${value}`); };
p.wrap = function (value: string) { return this.addClass(`wrap-${value}`); };
p.hyphens = function (value: string) { return this.addClass(`hyphens-${value}`); };
p.textShadow = function (value: string) { return this.addClass(`text-shadow-${value}`); };
p.textShadowColor = function (color: string) { return this.addClass(`text-shadow-${color}`); };

p.dropShadow = function (value: string) { return this.addClass(`drop-shadow-${value}`); };
p.dropShadowColor = function (color: string) { return this.addClass(`drop-shadow-${color}`); };
p.insetShadow = function (value: string) { return this.addClass(`inset-shadow-${value}`); };
p.insetShadowColor = function (color: string) { return this.addClass(`inset-shadow-${color}`); };
p.insetRing = function (value?: string | number) {
  return value === undefined ? this.addClass("inset-ring") : this.addClass(`inset-ring-${value}`);
};
p.insetRingColor = function (color: string) { return this.addClass(`inset-ring-${color}`); };
p.mixBlend = function (mode: string) { return this.addClass(`mix-blend-${mode}`); };
p.bgBlend = function (mode: string) { return this.addClass(`bg-blend-${mode}`); };
p.isolate = function () { return this.addClass("isolate"); };
p.isolation = function (value: string) { return this.addClass(`isolation-${value}`); };

p.delay = function (value: string | number) { return this.addClass(`delay-${value}`); };
p.transitionBehavior = function (value: string) { return this.addClass(`transition-${value}`); };

p.perspective = function (value: string) { return this.addClass(`perspective-${value}`); };
p.perspectiveOrigin = function (value: string) { return this.addClass(`perspective-origin-${value}`); };
p.transformStyle = function (value: string) { return this.addClass(`transform-${value}`); };
p.backfaceVisibility = function (value: string) { return this.addClass(`backface-${value}`); };
p.rotateX = function (value: string | number) { return this.addClass(signNeg("rotate-x", String(value))); };
p.rotateY = function (value: string | number) { return this.addClass(signNeg("rotate-y", String(value))); };
p.rotateZ = function (value: string | number) { return this.addClass(signNeg("rotate-z", String(value))); };
p.scaleX = function (value: string | number) { return this.addClass(signNeg("scale-x", String(value))); };
p.scaleY = function (value: string | number) { return this.addClass(signNeg("scale-y", String(value))); };
p.scaleZ = function (value: string | number) { return this.addClass(signNeg("scale-z", String(value))); };
p.scale3d = function () { return this.addClass("scale-3d"); };

p.colStart = function (value: string | number) { return this.addClass(signNeg("col-start", String(value))); };
p.colEnd = function (value: string | number) { return this.addClass(signNeg("col-end", String(value))); };
p.rowStart = function (value: string | number) { return this.addClass(signNeg("row-start", String(value))); };
p.rowEnd = function (value: string | number) { return this.addClass(signNeg("row-end", String(value))); };
p.rowSpan = function (value: string | number) { return this.addClass(`row-span-${value}`); };
p.columns = function (value: string | number) { return this.addClass(`columns-${value}`); };
p.breakBefore = function (value: string) { return this.addClass(`break-before-${value}`); };
p.breakAfter = function (value: string) { return this.addClass(`break-after-${value}`); };
p.breakInside = function (value: string) { return this.addClass(`break-inside-${value}`); };
p.boxDecoration = function (value: string) { return this.addClass(`box-decoration-${value}`); };
p.snap = function (axis: string, strictness?: string) {
  if (strictness === undefined) return this.addClass(`snap-${axis}`);
  return this.addClass(`snap-${axis}`).addClass(`snap-${strictness}`);
};
p.snapAlign = function (value: string) {
  return this.addClass(value === "none" ? "snap-align-none" : `snap-${value}`);
};
p.snapStop = function (value: string) { return this.addClass(`snap-${value}`); };
p.scrollBehavior = function (value: string) { return this.addClass(`scroll-${value}`); };
p.scrollMargin = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`scroll-m-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`scroll-m-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`scroll-m${dir}-${value}`);
};
p.scrollPadding = function (directionOrValue: string, value?: string | number) {
  if (value === undefined) return this.addClass(`scroll-p-${directionOrValue}`);
  if (typeof value === "number") return this.addClass(`scroll-p-[${value}${directionOrValue}]`);
  const dir = DIR_MAP[directionOrValue] || directionOrValue;
  return this.addClass(`scroll-p${dir}-${value}`);
};
p.fieldSizing = function (value: string) { return this.addClass(`field-sizing-${value}`); };

p.content = function (value?: string) {
  return this.addClass(value === undefined ? "content-['']" : `content-${value}`);
};

p.maskImage = function (value: string) {
  return value === "none" ? this.addClass("mask-none") : this.addClass(`mask-${value}`);
};
p.maskFrom = function (edge: string, stop: string) { return this.addClass(`mask-${edge}-from-${stop}`); };
p.maskTo = function (edge: string, stop: string) { return this.addClass(`mask-${edge}-to-${stop}`); };
p.maskComposite = function (mode: string) { return this.addClass(`mask-${mode}`); };
p.maskType = function (value: string) { return this.addClass(`mask-type-${value}`); };
