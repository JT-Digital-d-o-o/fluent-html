import type { TailwindSpacing, TailwindWidth, TailwindHeight, TailwindMaxWidth, TailwindMinWidth, TailwindMaxHeight, TailwindMinHeight, TailwindColor, TailwindTextSize, TailwindFontWeight, TailwindLeading, TailwindTracking, TailwindRounded, TailwindRoundedCorner, TailwindShadow, TailwindBorderWidth, TailwindBorderStyle, TailwindOpacity, TailwindCursor, TailwindZIndex, TailwindGridCols, TailwindGridRows, TailwindFlex, TailwindOverflow, TailwindObjectFit, TailwindInset, TailwindFlexWrap, TailwindAlignSelf, TailwindColSpan, TailwindAspect, TailwindTransition, TailwindDuration, TailwindAnimate, TailwindRingWidth, TailwindScale, TailwindRotate, TailwindTranslate, TailwindSelect, TailwindPointerEvents, TailwindWhitespace, TailwindListStyleType, TailwindListStylePosition, TailwindOutline, TailwindTextAlign, TailwindFlexDirection, TailwindJustifyContent, TailwindAlignItems, TailwindState, TailwindBreakpoint, TailwindUnit, TailwindFontFamily, TailwindGradientDirection, TailwindGradientStop, TailwindBlur, TailwindLineClamp, TailwindUnderlineOffset, TailwindEase, TailwindResize, TailwindBrightness, TailwindContrast, TailwindHueRotate, TailwindSaturate, TailwindPlaceContent, TailwindPlaceItems, TailwindPlaceSelf, TailwindGridAutoFlow, TailwindGridAuto, TailwindOrder, TailwindSkew, TailwindWillChange, TailwindOverscroll, TailwindPositionArea, TailwindStrokeWidth, TailwindDecorationStyle, TailwindDecorationThickness, TailwindColorScheme, TailwindTextWrap, TailwindHyphens, TailwindTextShadow, TailwindDropShadow, TailwindInsetShadow, TailwindMixBlendMode, TailwindBgBlendMode, TailwindIsolation, TailwindDelay, TailwindTransitionBehavior, TailwindGradientPosition, TailwindGradientAngle, TailwindGradientOrigin, TailwindGradientInterpolation, TailwindPerspective, TailwindPerspectiveOrigin, TailwindTranslateZ, TailwindTransformStyle, TailwindBackfaceVisibility, TailwindGridLine, TailwindRowSpan, TailwindColumns, TailwindBreakBeforeAfter, TailwindBreakInside, TailwindBoxDecoration, TailwindSnapAxis, TailwindSnapStrictness, TailwindSnapAlign, TailwindSnapStop, TailwindScrollBehavior, TailwindFieldSizing, TailwindMaskEdge, TailwindMaskStop, TailwindMaskComposite, TailwindMaskType, TailwindAppearance, TailwindWrap, TailwindContent } from "./tailwind-types.js";
import type { CssPropertyName } from "./css-props.gen.js";
import type { Id } from "../ids.js";
declare module "./tag.js" {
    interface Tag {
        on(state: TailwindState, fn: (tag: this) => this): this;
        at(breakpoint: TailwindBreakpoint, fn: (tag: this) => this): this;
        padding(value: TailwindSpacing): this;
        padding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
        padding(unit: TailwindUnit, amount: number): this;
        margin(value: TailwindSpacing | "auto"): this;
        margin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing | "auto"): this;
        margin(unit: TailwindUnit, amount: number): this;
        background(color: TailwindColor): this;
        textColor(color: TailwindColor): this;
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
        flex(value?: TailwindFlex): this;
        /** `flex` shorthand — `flex-1` | `flex-auto` | `flex-initial` | `flex-none`. */
        flexShorthand(value: "1" | "auto" | "initial" | "none"): this;
        flexDirection(direction: TailwindFlexDirection): this;
        justifyContent(justify: TailwindJustifyContent): this;
        alignItems(align: TailwindAlignItems): this;
        gap(value: TailwindSpacing): this;
        gap(direction: "x" | "y", value: TailwindSpacing): this;
        gap(unit: TailwindUnit, amount: number): this;
        grid(): this;
        gridCols(cols: TailwindGridCols): this;
        gridRows(rows: TailwindGridRows): this;
        gridAutoFlow(value: TailwindGridAutoFlow): this;
        gridAutoRows(value: TailwindGridAuto): this;
        gridAutoCols(value: TailwindGridAuto): this;
        /** v4: a bare `.border()` uses `currentColor` — add an explicit `.borderColor(...)` for a specific color (v3's gray default is gone). */
        border(value?: TailwindBorderWidth | TailwindBorderStyle | "t" | "b" | "l" | "r" | "x" | "y" | "top" | "bottom" | "left" | "right"): this;
        border(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value?: TailwindBorderWidth): this;
        borderColor(color: TailwindColor): this;
        borderColor(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", color: TailwindColor): this;
        borderStyle(style: TailwindBorderStyle): this;
        rounded(value?: TailwindRounded): this;
        rounded(corner: TailwindRoundedCorner, value?: TailwindRounded): this;
        shadow(value?: TailwindShadow): this;
        opacity(value: TailwindOpacity): this;
        cursor(value: TailwindCursor): this;
        absolute(): this;
        relative(): this;
        fixed(): this;
        sticky(): this;
        static(): this;
        zIndex(value: TailwindZIndex): this;
        overflow(value: TailwindOverflow): this;
        overflow(direction: "x" | "y", value: TailwindOverflow): this;
        objectFit(value: TailwindObjectFit): this;
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
        shrink(value?: 0 | "0"): this;
        grow(value?: 0 | "0"): this;
        flexWrap(value: TailwindFlexWrap): this;
        alignSelf(value: TailwindAlignSelf): this;
        colSpan(value: TailwindColSpan): this;
        aspect(value: TailwindAspect): this;
        order(value: TailwindOrder): this;
        placeContent(value: TailwindPlaceContent): this;
        placeItems(value: TailwindPlaceItems): this;
        placeSelf(value: TailwindPlaceSelf): this;
        spaceX(value: TailwindSpacing): this;
        spaceY(value: TailwindSpacing): this;
        divideX(value?: TailwindBorderWidth): this;
        divideY(value?: TailwindBorderWidth): this;
        transition(value?: TailwindTransition): this;
        duration(value: TailwindDuration): this;
        animate(value: TailwindAnimate): this;
        /** v4: a bare `.ring()` is **1px** (was 3px in v3) and uses `currentColor` — pass a width and/or `.ringColor(...)` explicitly. */
        ring(value?: TailwindRingWidth): this;
        ringColor(color: TailwindColor): this;
        scale(value: TailwindScale): this;
        rotate(value: TailwindRotate): this;
        translate(direction: "x" | "y", value: TailwindTranslate): this;
        translate(direction: "z", value: TailwindTranslateZ): this;
        skewX(value: TailwindSkew): this;
        skewY(value: TailwindSkew): this;
        select(value: TailwindSelect): this;
        pointerEvents(value: TailwindPointerEvents): this;
        appearance(value: TailwindAppearance): this;
        whitespace(value: TailwindWhitespace): this;
        /** Sets list style type. Generates `list-{value}` — same prefix as `listStylePosition`, but type-safe via `TailwindListStyleType`. */
        listStyleType(value: TailwindListStyleType): this;
        /** Sets list style position. Generates `list-{value}` — same prefix as `listStyleType`, but type-safe via `TailwindListStylePosition`. */
        listStylePosition(value: TailwindListStylePosition): this;
        srOnly(): this;
        outline(value: TailwindOutline): this;
        /** v4 a11y-safe focus-hiding: `outline-hidden` (keeps a visible outline in forced-colors mode). Prefer over `.outline("none")`. */
        outlineHidden(): this;
        fontFamily(family: TailwindFontFamily): this;
        gradient(from: TailwindColor, to: TailwindColor, direction?: TailwindGradientDirection, interpolation?: TailwindGradientInterpolation): this;
        gradientTo(direction: TailwindGradientDirection, interpolation?: TailwindGradientInterpolation): this;
        gradientLinear(angle: TailwindGradientAngle): this;
        gradientRadial(origin?: TailwindGradientOrigin, interpolation?: TailwindGradientInterpolation): this;
        gradientConic(angle?: TailwindGradientAngle, interpolation?: TailwindGradientInterpolation): this;
        from(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
        via(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
        to(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
        group(name?: string): this;
        peer(name?: string): this;
        /** Mark this element a container-query container (v4): `@container` / `@container/{name}`. Children query it with `.at("@sm", …)`. */
        containerQuery(name?: string): this;
        shadowColor(color: TailwindColor): this;
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
        lineClamp(value: TailwindLineClamp): this;
        antialiased(): this;
        tabularNums(): this;
        underlineOffset(value: TailwindUnderlineOffset): this;
        underlineOffset(unit: TailwindUnit, amount: number): this;
        breakAll(): this;
        ease(value: TailwindEase): this;
        resize(value?: TailwindResize): this;
        willChange(value: TailwindWillChange): this;
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
//# sourceMappingURL=tailwind-methods.d.ts.map