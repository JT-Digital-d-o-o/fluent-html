import type { HTMX } from "../htmx.js";
import type { Id } from "../ids.js";
import type { View } from "./types.js";
import type { BooleanAttribute } from "../elements/html-types.js";
/** @internal Shared empty attributes object — never mutate */
export declare const EMPTY_ATTRS: Record<string, string>;
/**
 * The core HTML element builder. All element factories (`Div`, `Button`, `Input`, etc.)
 * create `Tag` instances. Provides chainable methods for attributes, classes, styles,
 * HTMX integration, and Tailwind CSS styling.
 *
 * @example
 * Div(H1("Hello"), P("World"))
 *   .setId(ids.main)
 *   .padding("4")
 *   .background("white")
 *   .setHtmx("/api/content")
 */
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
    /** @internal Schema keys for element-specific attributes */
    readonly _sk?: readonly string[];
    constructor(element: string, ...children: View[]);
    /**
     * Set the element's `id` attribute. Accepts a string or a type-safe `Id` object.
     *
     * @param id - The ID string or Id object (from `defineIds` / `createId`)
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setId(ids.mainContent)
     * Div("Content").setId("main-content")
     */
    setId(id?: string | Id): this;
    /**
     * Set the element's `class` attribute, replacing any existing classes.
     *
     * @param c - The class string
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setClass("container mx-auto")
     */
    setClass(c?: string): this;
    /**
     * Append classes to the element's existing `class` attribute.
     *
     * @param c - Space-separated class names to add
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setClass("p-4").addClass("bg-white rounded")
     */
    addClass(c: string): this;
    /**
     * Set the element's inline `style` attribute.
     *
     * @param style - CSS style string
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setStyle("color: red; font-size: 16px")
     */
    setStyle(style?: string): this;
    /**
     * Add a custom HTML attribute. Validates the key against XSS and prototype pollution.
     * Prefer typed setter methods (e.g. `.setType()`, `.setPlaceholder()`) over this.
     *
     * @param key - The attribute name
     * @param value - The attribute value
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").addAttribute("data-testid", "my-div")
     */
    addAttribute(key: string, value: string): this;
    /**
     * Set a CSP nonce on this element (typically for inline script/style tags).
     *
     * @example
     * Script("console.log('hi')").setNonce(nonce)
     * Style(".cls { color: red }").setNonce(nonce)
     */
    setNonce(nonce: string): this;
    setToggles(toggles?: string[]): this;
    /**
     * Add a boolean HTML attribute (toggle). Conditionally add with the second parameter.
     *
     * @example
     * Input().toggle("required")                    // required
     * Input().toggle("required", isRequired)        // conditional
     * Input().toggle("disabled").toggle("readonly")  // chainable
     */
    toggle(name: BooleanAttribute, condition?: boolean): this;
    /**
     * Conditionally modify this tag. When condition is true, the modifier
     * function is called with the tag. Otherwise the tag is returned unchanged.
     *
     * @example
     * Button("Save")
     *   .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
     *   .when(isPrimary, t => t.addClass("bg-blue-500 text-white"))
     */
    when(condition: boolean, fn: (tag: this) => this): this;
    /**
     * Apply one or more modifier functions to this tag. Enables reusable,
     * composable styling and behavior.
     *
     * @example
     * const card = (t: Tag) => t.setClass("rounded shadow p-4 bg-white");
     * const danger = (t: Tag) => t.addClass("border-red-500 text-red-700");
     *
     * Div("Warning").apply(card, danger)
     */
    apply(...fns: ((tag: this) => this)[]): this;
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
    /** @internal Variant prefix state — used by tailwind-methods mixin */
    _variantPrefix: string | null;
}
//# sourceMappingURL=tag.d.ts.map