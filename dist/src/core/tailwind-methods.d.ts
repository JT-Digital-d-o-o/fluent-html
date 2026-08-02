import type { VariantStyleObject } from "./variant-object.js";
import type { TailwindSpacing, TailwindWidth, TailwindHeight, TailwindMaxWidth, TailwindMinWidth, TailwindMaxHeight, TailwindMinHeight, TailwindColor, TailwindTextSize, TailwindFontWeight, TailwindLeading, TailwindTracking, TailwindRounded, TailwindRoundedCorner, TailwindShadow, TailwindBorderWidth, TailwindBorderStyle, TailwindOpacity, TailwindCursor, TailwindZIndex, TailwindGridCols, TailwindGridRows, TailwindFlex, TailwindOverflow, TailwindObjectFit, TailwindInset, TailwindFlexWrap, TailwindAlignSelf, TailwindColSpan, TailwindAspect, TailwindTransition, TailwindDuration, TailwindAnimate, TailwindRingWidth, TailwindScale, TailwindRotate, TailwindTranslate, TailwindSelect, TailwindPointerEvents, TailwindWhitespace, TailwindListStyleType, TailwindListStylePosition, TailwindOutline, TailwindTextAlign, TailwindFlexDirection, TailwindJustifyContent, TailwindAlignItems, TailwindState, TailwindBreakpoint, TailwindUnit, TailwindFontFamily, TailwindGradientDirection, TailwindGradientStop, TailwindBlur, TailwindLineClamp, TailwindUnderlineOffset, TailwindEase, TailwindResize, TailwindBrightness, TailwindContrast, TailwindHueRotate, TailwindSaturate, TailwindPlaceContent, TailwindPlaceItems, TailwindPlaceSelf, TailwindGridAutoFlow, TailwindGridAuto, TailwindOrder, TailwindSkew, TailwindWillChange, TailwindOverscroll, TailwindPositionArea, TailwindStrokeWidth, TailwindDecorationStyle, TailwindDecorationThickness, TailwindColorScheme, TailwindTextWrap, TailwindHyphens, TailwindTextShadow, TailwindDropShadow, TailwindInsetShadow, TailwindMixBlendMode, TailwindBgBlendMode, TailwindIsolation, TailwindDelay, TailwindTransitionBehavior, TailwindGradientPosition, TailwindGradientAngle, TailwindGradientOrigin, TailwindGradientInterpolation, TailwindPerspective, TailwindPerspectiveOrigin, TailwindTranslateZ, TailwindTransformStyle, TailwindBackfaceVisibility, TailwindGridLine, TailwindRowSpan, TailwindColumns, TailwindBreakBeforeAfter, TailwindBreakInside, TailwindBoxDecoration, TailwindSnapAxis, TailwindSnapStrictness, TailwindSnapAlign, TailwindSnapStop, TailwindScrollBehavior, TailwindFieldSizing, TailwindMaskEdge, TailwindMaskStop, TailwindMaskComposite, TailwindMaskType, TailwindAppearance, TailwindWrap, TailwindContent } from "./tailwind-types.js";
import type { CssPropertyName } from "./css-props.gen.js";
import type { Id } from "../ids.js";
declare module "./tag.js" {
    interface Tag {
        /** `hover:` styles as a typed object: `.hover({ bg: "blue-600", scale: "105" })`. */
        hover(styles: VariantStyleObject): this;
        /** `focus:` styles as a typed object. */
        focus(styles: VariantStyleObject): this;
        /** `focus-visible:` styles as a typed object. */
        focusVisible(styles: VariantStyleObject): this;
        /** `focus-within:` styles as a typed object. */
        focusWithin(styles: VariantStyleObject): this;
        /** `active:` styles as a typed object. */
        active(styles: VariantStyleObject): this;
        /** `disabled:` styles as a typed object. */
        disabled(styles: VariantStyleObject): this;
        /** `checked:` styles as a typed object. */
        checked(styles: VariantStyleObject): this;
        /** `dark:` styles as a typed object. */
        dark(styles: VariantStyleObject): this;
        /** `first:` styles as a typed object. */
        first(styles: VariantStyleObject): this;
        /** `last:` styles as a typed object. */
        last(styles: VariantStyleObject): this;
        /** `odd:` styles as a typed object. */
        odd(styles: VariantStyleObject): this;
        /** `even:` styles as a typed object. */
        even(styles: VariantStyleObject): this;
        /** `group-hover:` styles as a typed object (pair with a `.group()` ancestor). */
        groupHover(styles: VariantStyleObject): this;
        /** `peer-checked:` styles as a typed object (pair with a `.peer()` sibling). */
        peerChecked(styles: VariantStyleObject): this;
        /** `before:` pseudo-element styles as a typed object (add `content: true` to render). */
        before(styles: VariantStyleObject): this;
        /** `after:` pseudo-element styles as a typed object (add `content: true` to render). */
        after(styles: VariantStyleObject): this;
        /** `sm:` (≥640px) styles as a typed object. */
        sm(styles: VariantStyleObject): this;
        /** `md:` (≥768px) styles as a typed object. */
        md(styles: VariantStyleObject): this;
        /** `lg:` (≥1024px) styles as a typed object. */
        lg(styles: VariantStyleObject): this;
        /** `xl:` (≥1280px) styles as a typed object. */
        xl(styles: VariantStyleObject): this;
        /** `2xl:` (≥1536px) styles as a typed object — spelled `xl2` (`2xl` is not an identifier); `.variant("2xl", …)` keeps the exact spelling. */
        xl2(styles: VariantStyleObject): this;
        /**
         * Generic variant — the long tail beyond the tier-1 methods: arbitrary
         * selectors and attribute states (`"data-[state=open]"`, `"aria-[busy]"`,
         * `"group-focus"`, `"not-first"`), container queries (`"@sm"`, `"@max-lg"`),
         * and the exact `"2xl"` spelling.
         * @example
         * Div().variant("data-[state=open]", { rounded: "lg" })
         * Div().variant("@sm", { flex: "row" })
         */
        variant(name: TailwindState | TailwindBreakpoint, styles: VariantStyleObject): this;
        p(value: TailwindSpacing): this;
        p(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
        p(unit: TailwindUnit, amount: number): this;
        m(value: TailwindSpacing | "auto"): this;
        m(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing | "auto"): this;
        m(unit: TailwindUnit, amount: number): this;
        px(value: TailwindSpacing): this;
        px(unit: TailwindUnit, amount: number): this;
        py(value: TailwindSpacing): this;
        py(unit: TailwindUnit, amount: number): this;
        pt(value: TailwindSpacing): this;
        pt(unit: TailwindUnit, amount: number): this;
        pb(value: TailwindSpacing): this;
        pb(unit: TailwindUnit, amount: number): this;
        pl(value: TailwindSpacing): this;
        pl(unit: TailwindUnit, amount: number): this;
        pr(value: TailwindSpacing): this;
        pr(unit: TailwindUnit, amount: number): this;
        mx(value: TailwindSpacing | "auto"): this;
        mx(unit: TailwindUnit, amount: number): this;
        my(value: TailwindSpacing | "auto"): this;
        my(unit: TailwindUnit, amount: number): this;
        mt(value: TailwindSpacing | "auto"): this;
        mt(unit: TailwindUnit, amount: number): this;
        mb(value: TailwindSpacing | "auto"): this;
        mb(unit: TailwindUnit, amount: number): this;
        ml(value: TailwindSpacing | "auto"): this;
        ml(unit: TailwindUnit, amount: number): this;
        mr(value: TailwindSpacing | "auto"): this;
        mr(unit: TailwindUnit, amount: number): this;
        bg(color: TailwindColor): this;
        /**
         * Merged `text-*` method — size, color, alignment, or wrapping (Tailwind's
         * own overload; the value unions are disjoint). Arbitrary size via the
         * `(unit, amount)` overload.
         * @example
         * Span("hi").text("lg").text("red-500").text("center").text("balance")
         */
        text(value: TailwindTextSize | TailwindColor | TailwindTextAlign | TailwindTextWrap): this;
        text(unit: TailwindUnit, amount: number): this;
        /** Merged `font-*` method — weight (`bold`, `medium`, …) or family (`sans`/`serif`/`mono` + theme tokens). */
        font(value: TailwindFontWeight | TailwindFontFamily): this;
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
        /**
         * Merged `flex-*` method — bare flex container, shorthand value (`"1"`,
         * `"auto"`, `"initial"`, `"none"`), main-axis direction, or wrapping.
         * @example
         * Div().flex().flex("col").flex("wrap")
         * Div().flex("1")
         */
        flex(value?: TailwindFlex | TailwindFlexDirection | TailwindFlexWrap): this;
        justify(value: TailwindJustifyContent): this;
        items(value: TailwindAlignItems): this;
        gap(value: TailwindSpacing): this;
        gap(direction: "x" | "y", value: TailwindSpacing): this;
        gap(unit: TailwindUnit, amount: number): this;
        grid(): this;
        gridCols(cols: TailwindGridCols): this;
        gridRows(rows: TailwindGridRows): this;
        gridFlow(value: TailwindGridAutoFlow): this;
        autoRows(value: TailwindGridAuto): this;
        autoCols(value: TailwindGridAuto): this;
        /**
         * Merged `border-*` method — width, style, or color (v4: a bare `.border()`
         * is 1px `currentColor`). One side via the side token or the 2-arg
         * side + width/color form; style is all-sides only.
         * @example
         * Div().border()                       // border
         * Div().border("2").border("dashed").border("red-500")
         * Div().border("t").border("top", "2").border("b", "red-500")
         */
        border(value?: TailwindBorderWidth | TailwindBorderStyle | TailwindColor | "t" | "b" | "l" | "r" | "x" | "y" | "top" | "bottom" | "left" | "right"): this;
        border(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value?: TailwindBorderWidth | TailwindColor): this;
        rounded(value?: TailwindRounded): this;
        rounded(corner: TailwindRoundedCorner, value?: TailwindRounded): this;
        /** Merged `shadow-*` method — bare default, theme size, or shadow color. */
        shadow(value?: TailwindShadow | TailwindColor): this;
        opacity(value: TailwindOpacity): this;
        cursor(value: TailwindCursor): this;
        absolute(): this;
        relative(): this;
        fixed(): this;
        sticky(): this;
        static(): this;
        z(value: TailwindZIndex): this;
        overflow(value: TailwindOverflow): this;
        overflow(direction: "x" | "y", value: TailwindOverflow): this;
        object(value: TailwindObjectFit): this;
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
        self(value: TailwindAlignSelf): this;
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
        /** Merged `transition-*` method — property group (bare = default set) or discrete-transition behavior (`"discrete"`/`"normal"`). */
        transition(value?: TailwindTransition | TailwindTransitionBehavior): this;
        duration(value: TailwindDuration): this;
        animate(value: TailwindAnimate): this;
        /** Merged `ring-*` method — width or color. v4: a bare `.ring()` is **1px** (was 3px in v3) and uses `currentColor`. */
        ring(value?: TailwindRingWidth | TailwindColor): this;
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
        /** Merged `list-*` method — marker type (`disc`/`decimal`/`none`) or position (`inside`/`outside`). */
        list(value: TailwindListStyleType | TailwindListStylePosition): this;
        srOnly(): this;
        /** Outline style. `"hidden"` is the v4 a11y-safe focus-hiding value (keeps a visible outline in forced-colors mode) — prefer it over `"none"`. */
        outline(value: TailwindOutline): this;
        gradient(from: TailwindColor, to: TailwindColor, direction?: TailwindGradientDirection, interpolation?: TailwindGradientInterpolation): this;
        /** Merged `bg-linear-*` method — direction keyword (`"to-r"`) or angle (negatives relocate the sign), with optional interpolation. */
        bgLinear(direction: TailwindGradientDirection | TailwindGradientAngle, interpolation?: TailwindGradientInterpolation): this;
        bgRadial(origin?: TailwindGradientOrigin, interpolation?: TailwindGradientInterpolation): this;
        bgConic(angle?: TailwindGradientAngle, interpolation?: TailwindGradientInterpolation): this;
        from(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
        via(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
        to(color: TailwindGradientStop, position?: TailwindGradientPosition): this;
        group(name?: string): this;
        peer(name?: string): this;
        /** Mark this element a container-query container (v4): `@container` / `@container/{name}`. Children query it with `.variant("@sm", {…})`. */
        containerQuery(name?: string): this;
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
         * (`.hover({…})`/`.variant()`) and stays visible to the safelist extractor:
         * a literal call is safelisted, a non-literal argument is a build error.
         * Decision rule: static arbitrary CSS → `cssProp`; runtime-computed →
         * `.setStyle()`; non-Tailwind class hooks → `.cssClass()`.
         * @example
         * Div().cssProp("mask-repeat", "no-repeat")             // [mask-repeat:no-repeat]
         * Div().cssProp("border", "1px solid red")              // [border:1px_solid_red]
         * Div().hover({ cssProp: ["--glow", "0 0 4px"] })       // hover:[--glow:0_0_4px]
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
         * span-left`), the same escape-hatch contract as `.text("[13px]")`.
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
        /** SVG fill color (`fill-*` utility). Distinct from the SVG presentation-attribute setter `setFill` — this styles via a class, that sets the `fill` attribute. */
        fill(color: TailwindColor | "none"): this;
        /**
         * Merged `stroke-*` method — SVG stroke color or width (widths are bare
         * numerals; arbitrary width via the unit overload). Distinct from the SVG
         * presentation-attribute setter `setStroke` — this styles via a class.
         */
        stroke(value: TailwindColor | "none" | TailwindStrokeWidth): this;
        stroke(unit: TailwindUnit, amount: number): this;
        accent(color: TailwindColor): this;
        caret(color: TailwindColor): this;
        /** Merged `decoration-*` method — text-decoration color, style, or thickness (arbitrary thickness via the unit overload). */
        decoration(value: TailwindColor | TailwindDecorationStyle | TailwindDecorationThickness): this;
        decoration(unit: TailwindUnit, amount: number): this;
        scheme(value: TailwindColorScheme): this;
        insetX(value: TailwindInset): this;
        insetX(unit: TailwindUnit, amount: number): this;
        insetY(value: TailwindInset): this;
        insetY(unit: TailwindUnit, amount: number): this;
        insetS(value: TailwindInset): this;
        insetS(unit: TailwindUnit, amount: number): this;
        insetE(value: TailwindInset): this;
        insetE(unit: TailwindUnit, amount: number): this;
        /** Overflow-wrap (v4 `wrap-*`): where long words may break. Text wrapping (`text-balance`, …) merged into `.text()`. */
        wrap(value: TailwindWrap): this;
        hyphens(value: TailwindHyphens): this;
        /** Merged `text-shadow-*` method — theme size or shadow color (value required). */
        textShadow(value: TailwindTextShadow | TailwindColor): this;
        /** Merged `drop-shadow-*` method — theme size or shadow color (value required). */
        dropShadow(value: TailwindDropShadow | TailwindColor): this;
        /** Merged `inset-shadow-*` method — theme size or shadow color (value required). */
        insetShadow(value: TailwindInsetShadow | TailwindColor): this;
        /** Merged `inset-ring-*` method — width (bare = 1px) or color. */
        insetRing(value?: TailwindRingWidth | TailwindColor): this;
        mixBlend(mode: TailwindMixBlendMode): this;
        bgBlend(mode: TailwindBgBlendMode): this;
        isolate(): this;
        isolation(value: TailwindIsolation): this;
        delay(value: TailwindDelay): this;
        perspective(value: TailwindPerspective): this;
        perspectiveOrigin(value: TailwindPerspectiveOrigin): this;
        /** `transform-style` (`transform-3d`/`transform-flat`). Distinct from the SVG presentation-attribute setter `setTransform` — this styles via a class. */
        transform(value: TailwindTransformStyle): this;
        backface(value: TailwindBackfaceVisibility): this;
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
        scroll(value: TailwindScrollBehavior): this;
        scrollM(value: TailwindSpacing): this;
        scrollM(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
        scrollM(unit: TailwindUnit, amount: number): this;
        scrollP(value: TailwindSpacing): this;
        scrollP(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: TailwindSpacing): this;
        scrollP(unit: TailwindUnit, amount: number): this;
        fieldSizing(value: TailwindFieldSizing): this;
        /**
         * Pseudo-element content. Bare `.content()` emits `content-['']` — the empty
         * string every `before:`/`after:` decoration needs to render (`content: true`
         * in a variant object).
         * @example
         * Span().before({ content: true, w: "2", h: "2", bg: "red-500" })
         * Span().after({ content: "[attr(data-label)]" })
         */
        content(value?: TailwindContent): this;
        /** Merged `mask-*` method — mask image (`"none"` or an arbitrary `[url(…)]` source) or mask-composite mode. */
        mask(value: "none" | `[${string}]` | TailwindMaskComposite): this;
        maskFrom(edge: TailwindMaskEdge, stop: TailwindMaskStop): this;
        maskTo(edge: TailwindMaskEdge, stop: TailwindMaskStop): this;
        maskType(value: TailwindMaskType): this;
    }
}
//# sourceMappingURL=tailwind-methods.d.ts.map