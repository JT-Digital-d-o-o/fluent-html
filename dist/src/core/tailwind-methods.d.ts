import type { TailwindSpacing, TailwindWidth, TailwindHeight, TailwindMaxWidth, TailwindMinWidth, TailwindMaxHeight, TailwindMinHeight, TailwindColor, TailwindTextSize, TailwindFontWeight, TailwindLeading, TailwindTracking, TailwindRounded, TailwindRoundedCorner, TailwindShadow, TailwindBorderWidth, TailwindBorderStyle, TailwindOpacity, TailwindCursor, TailwindZIndex, TailwindGridCols, TailwindGridRows, TailwindFlex, TailwindOverflow, TailwindObjectFit, TailwindInset, TailwindFlexWrap, TailwindAlignSelf, TailwindColSpan, TailwindAspect, TailwindTransition, TailwindDuration, TailwindAnimate, TailwindRingWidth, TailwindScale, TailwindRotate, TailwindTranslate, TailwindSelect, TailwindPointerEvents, TailwindWhitespace, TailwindListStyleType, TailwindListStylePosition, TailwindOutline, TailwindTextAlign, TailwindFlexDirection, TailwindJustifyContent, TailwindAlignItems, TailwindState, TailwindBreakpoint, TailwindUnit, TailwindFontFamily, TailwindGradientDirection, TailwindGradientStop, TailwindBlur, TailwindLineClamp, TailwindUnderlineOffset, TailwindEase, TailwindResize, TailwindBrightness, TailwindContrast, TailwindHueRotate, TailwindSaturate, TailwindPlaceContent, TailwindPlaceItems, TailwindPlaceSelf, TailwindGridAutoFlow, TailwindGridAuto, TailwindOrder, TailwindSkew, TailwindWillChange, TailwindOverscroll, TailwindPositionArea } from "./tailwind-types.js";
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
        skewX(value: TailwindSkew): this;
        skewY(value: TailwindSkew): this;
        select(value: TailwindSelect): this;
        pointerEvents(value: TailwindPointerEvents): this;
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
        gradient(from: TailwindColor, to: TailwindColor, direction?: TailwindGradientDirection): this;
        gradientTo(direction: TailwindGradientDirection): this;
        gradientRadial(): this;
        gradientConic(): this;
        from(color: TailwindGradientStop): this;
        via(color: TailwindGradientStop): this;
        to(color: TailwindGradientStop): this;
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
        /** Register this element as an anchor: emits `[anchor-name:--<id>]`. */
        anchorName(name: Id): this;
        /** Position this element against a named anchor: emits `[position-anchor:--<id>]`. */
        positionAnchor(name: Id): this;
        /**
         * Place against the active anchor: emits `position-area-<area>`. The `[${string}]`
         * arm is emitted verbatim and `escapeAttr`'d but NOT validated as position-area
         * grammar — same contract as `.textSize("[13px]")`.
         */
        positionArea(area: TailwindPositionArea): this;
        /**
         * Name this element for the View Transitions API — emits the v4 arbitrary-property
         * class `[view-transition-name:<name>]` (purge-safe, single class) so a hero element
         * morphs across an HTMX `outerMorph` swap when `HtmxConfig({ transitions: true })` is on.
         * Accepts a raw name or an `Id`. The name is emitted verbatim (not validated).
         *
         * @example
         * Img().setSrc("/hero.avif").viewTransitionName("hero")
         * Div().viewTransitionName(ids.card)
         */
        viewTransitionName(name: string | Id): this;
    }
}
//# sourceMappingURL=tailwind-methods.d.ts.map