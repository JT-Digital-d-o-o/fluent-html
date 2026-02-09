import { HTMX, HxOptions } from "../htmx.js";
import { Id } from "../ids.js";
import type { View } from "./types.js";
import type { Autocomplete, TailwindSpacing, TailwindWidth, TailwindHeight, TailwindMaxWidth, TailwindMinWidth, TailwindMaxHeight, TailwindMinHeight, TailwindColor, TailwindTextSize, TailwindFontWeight, TailwindLeading, TailwindTracking, TailwindRounded, TailwindShadow, TailwindBorderWidth, TailwindOpacity, TailwindCursor, TailwindZIndex, TailwindGridCols, TailwindGridRows, TailwindFlex, TailwindOverflow, TailwindObjectFit } from "./tailwind-types.js";
/** @internal Shared empty attributes object — never mutate */
export declare const EMPTY_ATTRS: Record<string, string>;
export declare class Tag {
    el: string;
    child: View;
    id?: string;
    class?: string;
    style?: string;
    attributes: Record<string, string>;
    htmx?: HTMX;
    toggles?: string[];
    /** @internal type discriminant for fast render checks */
    readonly _t: 1;
    constructor(element: string, child?: View);
    setId(id?: string | Id): this;
    setClass(c?: string): this;
    addClass(c: string): this;
    setStyle(style?: string): this;
    addAttribute(key: string, value: string): this;
    setHtmx(htmx?: HTMX): this;
    setHtmx(endpoint: string, options?: HxOptions): this;
    hxGet(endpoint: string, options?: Omit<HxOptions, 'method'>): this;
    hxPost(endpoint: string, options?: Omit<HxOptions, 'method'>): this;
    hxPut(endpoint: string, options?: Omit<HxOptions, 'method'>): this;
    hxPatch(endpoint: string, options?: Omit<HxOptions, 'method'>): this;
    hxDelete(endpoint: string, options?: Omit<HxOptions, 'method'>): this;
    setToggles(toggles?: string[]): this;
    /**
     * Add a boolean HTML attribute (toggle). Conditionally add with the second parameter.
     *
     * @example
     * Input().toggle("required")                    // required
     * Input().toggle("required", isRequired)        // conditional
     * Input().toggle("disabled").toggle("readonly")  // chainable
     */
    toggle(name: string, condition?: boolean): this;
    /**
     * Set multiple CSS classes, filtering out falsy values.
     *
     * @param classes - Array of class names (falsy values are filtered out)
     * @returns this (for chaining)
     *
     * @example
     * Button("Save").setClasses([
     *   "btn",
     *   props.disabled && "btn-disabled",
     *   props.variant === "primary" ? "btn-primary" : "btn-secondary"
     * ])
     */
    setClasses(classes: (string | false | null | undefined)[]): this;
    /**
     * Set multiple inline styles from an object.
     *
     * @param styles - Object mapping CSS property names to values
     * @returns this (for chaining)
     *
     * @example
     * Div().setStyles({
     *   width: "100px",
     *   height: "50px",
     *   backgroundColor: "blue"
     * })
     */
    setStyles(styles: Record<string, string | number>): this;
    /**
     * Set multiple data-* attributes at once.
     *
     * @param attrs - Object mapping data attribute names (without 'data-' prefix) to values
     * @returns this (for chaining)
     *
     * @example
     * Button("Click").setDataAttrs({
     *   testid: "submit-btn",
     *   action: "save",
     *   userId: "123"
     * })
     * // Renders: <button data-testid="submit-btn" data-action="save" data-user-id="123">
     */
    setDataAttrs(attrs: Record<string, string>): this;
    /**
     * Set ARIA attributes for accessibility.
     *
     * @param attrs - Object with ARIA attribute names (without 'aria-' prefix)
     * @returns this (for chaining)
     *
     * @example
     * Button("Menu").setAria({
     *   label: "Open menu",
     *   expanded: "false",
     *   controls: "menu-panel"
     * })
     */
    setAria(attrs: Record<string, string | boolean>): this;
    /**
     * Add padding with Tailwind classes.
     *
     * @example
     * Div().padding("4")                 // p-4
     * Div().padding("x", "4")            // px-4
     * Div().padding("top", "4")          // pt-4
     */
    padding(value: Autocomplete<TailwindSpacing>): this;
    padding(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: Autocomplete<TailwindSpacing>): this;
    /**
     * Add margin with Tailwind classes.
     *
     * @example
     * Div().margin("4")                  // m-4
     * Div().margin("x", "auto")          // mx-auto
     * Div().margin("top", "8")           // mt-8
     */
    margin(value: Autocomplete<TailwindSpacing | "auto">): this;
    margin(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value: Autocomplete<TailwindSpacing | "auto">): this;
    /**
     * Add background color with Tailwind classes.
     *
     * @example
     * Div().background("red-500")        // bg-red-500
     * Div().background("blue-100")       // bg-blue-100
     */
    background(color: Autocomplete<TailwindColor>): this;
    /**
     * Add text color with Tailwind classes.
     *
     * @example
     * Span().textColor("gray-700")       // text-gray-700
     * Span().textColor("white")          // text-white
     */
    textColor(color: Autocomplete<TailwindColor>): this;
    /**
     * Add text size with Tailwind classes.
     *
     * @example
     * Span().textSize("xl")              // text-xl
     * Span().textSize("sm")              // text-sm
     */
    textSize(size: Autocomplete<TailwindTextSize>): this;
    /**
     * Add text alignment with Tailwind classes.
     *
     * @example
     * P().textAlign("center")            // text-center
     * P().textAlign("right")             // text-right
     */
    textAlign(align: "left" | "center" | "right" | "justify"): this;
    /**
     * Add font weight with Tailwind classes.
     *
     * @example
     * Span().fontWeight("bold")          // font-bold
     * Span().fontWeight("semibold")      // font-semibold
     */
    fontWeight(weight: Autocomplete<TailwindFontWeight>): this;
    /**
     * Make text bold (shorthand for fontWeight("bold")).
     *
     * @example
     * Span("Important").bold()           // font-bold
     */
    bold(): this;
    /**
     * Make text italic with Tailwind classes.
     *
     * @example
     * Span("Emphasis").italic()          // italic
     */
    italic(): this;
    /**
     * Transform text to uppercase with Tailwind classes.
     *
     * @example
     * Span("hello").uppercase()          // uppercase
     */
    uppercase(): this;
    /**
     * Transform text to lowercase with Tailwind classes.
     *
     * @example
     * Span("HELLO").lowercase()          // lowercase
     */
    lowercase(): this;
    /**
     * Capitalize first letter of each word with Tailwind classes.
     *
     * @example
     * Span("hello world").capitalize()   // capitalize
     */
    capitalize(): this;
    /**
     * Add underline to text with Tailwind classes.
     *
     * @example
     * Span("Link").underline()           // underline
     */
    underline(): this;
    /**
     * Add line-through to text with Tailwind classes.
     *
     * @example
     * Span("Deleted").lineThrough()      // line-through
     */
    lineThrough(): this;
    /**
     * Truncate text with ellipsis using Tailwind classes.
     *
     * @example
     * P("Very long text...").truncate()  // truncate
     */
    truncate(): this;
    /**
     * Add line height with Tailwind classes.
     *
     * @example
     * P().leading("tight")               // leading-tight
     * P().leading("relaxed")             // leading-relaxed
     */
    leading(value: Autocomplete<TailwindLeading>): this;
    /**
     * Add letter spacing with Tailwind classes.
     *
     * @example
     * Span().tracking("wide")            // tracking-wide
     * Span().tracking("tight")           // tracking-tight
     */
    tracking(value: Autocomplete<TailwindTracking>): this;
    /**
     * Add width with Tailwind classes.
     *
     * @example
     * Div().w("full")                    // w-full
     * Div().w("1/2")                     // w-1/2
     * Div().w("64")                      // w-64
     */
    w(value: Autocomplete<TailwindWidth>): this;
    /**
     * Add height with Tailwind classes.
     *
     * @example
     * Div().h("screen")                  // h-screen
     * Div().h("64")                      // h-64
     */
    h(value: Autocomplete<TailwindHeight>): this;
    /**
     * Add max-width with Tailwind classes.
     *
     * @example
     * Div().maxW("md")                   // max-w-md
     * Div().maxW("prose")                // max-w-prose
     */
    maxW(value: Autocomplete<TailwindMaxWidth>): this;
    /**
     * Add min-width with Tailwind classes.
     *
     * @example
     * Div().minW("0")                    // min-w-0
     * Div().minW("full")                 // min-w-full
     */
    minW(value: Autocomplete<TailwindMinWidth>): this;
    /**
     * Add max-height with Tailwind classes.
     *
     * @example
     * Div().maxH("screen")               // max-h-screen
     * Div().maxH("96")                   // max-h-96
     */
    maxH(value: Autocomplete<TailwindMaxHeight>): this;
    /**
     * Add min-height with Tailwind classes.
     *
     * @example
     * Div().minH("screen")               // min-h-screen
     * Div().minH("0")                    // min-h-0
     */
    minH(value: Autocomplete<TailwindMinHeight>): this;
    /**
     * Add flex display with Tailwind classes.
     *
     * @example
     * Div().flex()                       // flex
     * Div().flex("1")                    // flex-1
     */
    flex(value?: Autocomplete<TailwindFlex>): this;
    /**
     * Add flex direction with Tailwind classes.
     *
     * @example
     * Div().flexDirection("col")         // flex-col
     * Div().flexDirection("row-reverse") // flex-row-reverse
     */
    flexDirection(direction: "row" | "col" | "row-reverse" | "col-reverse"): this;
    /**
     * Add justify-content with Tailwind classes.
     *
     * @example
     * Div().justifyContent("center")     // justify-center
     * Div().justifyContent("between")    // justify-between
     */
    justifyContent(justify: "start" | "end" | "center" | "between" | "around" | "evenly"): this;
    /**
     * Add align-items with Tailwind classes.
     *
     * @example
     * Div().alignItems("center")         // items-center
     * Div().alignItems("start")          // items-start
     */
    alignItems(align: "start" | "end" | "center" | "baseline" | "stretch"): this;
    /**
     * Add gap with Tailwind classes.
     *
     * @example
     * Div().gap("4")                     // gap-4"
     * Div().gap("x", "2")                // gap-x-2
     */
    gap(value: Autocomplete<TailwindSpacing>): this;
    gap(direction: "x" | "y", value: Autocomplete<TailwindSpacing>): this;
    /**
     * Add grid display with Tailwind classes.
     *
     * @example
     * Div().grid()                       // grid
     */
    grid(): this;
    /**
     * Add grid columns with Tailwind classes.
     *
     * @example
     * Div().gridCols("3")                // grid-cols-3
     * Div().gridCols("1fr-2fr")          // grid-cols-1fr-2fr
     */
    gridCols(cols: Autocomplete<TailwindGridCols>): this;
    /**
     * Add grid rows with Tailwind classes.
     *
     * @example
     * Div().gridRows("2")                // grid-rows-2
     */
    gridRows(rows: Autocomplete<TailwindGridRows>): this;
    /**
     * Add border with Tailwind classes.
     *
     * @example
     * Div().border()                     // border
     * Div().border("2")                  // border-2
     * Div().border("t")                  // border-t
     * Div().border("bottom", "2")        // border-b-2
     */
    border(value?: Autocomplete<TailwindBorderWidth>): this;
    border(direction: "x" | "y" | "top" | "bottom" | "left" | "right" | "t" | "b" | "l" | "r", value?: Autocomplete<TailwindBorderWidth>): this;
    /**
     * Add border color with Tailwind classes.
     *
     * @example
     * Div().borderColor("gray-300")      // border-gray-300
     */
    borderColor(color: Autocomplete<TailwindColor>): this;
    /**
     * Add border radius with Tailwind classes.
     *
     * @example
     * Div().rounded()                    // rounded
     * Div().rounded("full")              // rounded-full
     * Div().rounded("lg")                // rounded-lg
     */
    rounded(value?: Autocomplete<TailwindRounded>): this;
    /**
     * Add shadow with Tailwind classes.
     *
     * @example
     * Div().shadow()                     // shadow
     * Div().shadow("lg")                 // shadow-lg
     */
    shadow(value?: Autocomplete<TailwindShadow>): this;
    /**
     * Add opacity with Tailwind classes.
     *
     * @example
     * Div().opacity("50")                // opacity-50
     */
    opacity(value: Autocomplete<TailwindOpacity>): this;
    /**
     * Add cursor with Tailwind classes.
     *
     * @example
     * Button().cursor("pointer")         // cursor-pointer
     */
    cursor(value: Autocomplete<TailwindCursor>): this;
    /**
     * Add position with Tailwind classes.
     *
     * @example
     * Div().position("relative")         // relative
     * Div().position("absolute")         // absolute
     */
    position(value: "static" | "fixed" | "absolute" | "relative" | "sticky"): this;
    /**
     * Add z-index with Tailwind classes.
     *
     * @example
     * Div().zIndex("10")                 // z-10
     */
    zIndex(value: Autocomplete<TailwindZIndex>): this;
    /**
     * Add overflow with Tailwind classes.
     *
     * @example
     * Div().overflow("hidden")           // overflow-hidden
     * Div().overflow("x", "auto")        // overflow-x-auto
     */
    overflow(value: Autocomplete<TailwindOverflow>): this;
    overflow(direction: "x" | "y", value: Autocomplete<TailwindOverflow>): this;
    /**
     * Add object-fit with Tailwind classes.
     *
     * @example
     * Img().objectFit("cover")             // object-cover
     * Img().objectFit("contain")           // object-contain
     */
    objectFit(value: Autocomplete<TailwindObjectFit>): this;
}
//# sourceMappingURL=tag.d.ts.map