import { isId } from "../ids.js";
/** @internal Shared empty attributes object — never mutate */
export const EMPTY_ATTRS = Object.freeze(Object.create(null));
// Attribute key must be a valid HTML attribute name
const VALID_ATTR_KEY = /^[a-zA-Z_][a-zA-Z0-9\-_:.]*$/;
// Event handler attributes — blocked by default to prevent XSS
const EVENT_HANDLER_RE = /^on[a-z]/i;
// Prototype pollution keys
const PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
function validateAttributeKey(key) {
    if (PROTO_KEYS.has(key)) {
        throw new Error(`Attribute key "${key}" is blocked (prototype pollution)`);
    }
    if (!VALID_ATTR_KEY.test(key)) {
        throw new Error(`Invalid attribute key: "${key}"`);
    }
    if (EVENT_HANDLER_RE.test(key)) {
        throw new Error(`Event handler attribute "${key}" is blocked — use client-side JS or HTMX instead`);
    }
}
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
export class Tag {
    constructor(element, ...children) {
        /** @internal Variant prefix state — used by tailwind-methods mixin */
        this._variantPrefix = null;
        this.el = element;
        this.child = children.length === 0 ? "" : children.length === 1 ? children[0] : children;
    }
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
    setId(id) {
        this.id = id ? (isId(id) ? id.id : id) : undefined;
        return this;
    }
    /**
     * Set the element's `class` attribute, replacing any existing classes.
     *
     * @param c - The class string
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setClass("container mx-auto")
     */
    setClass(c) {
        this.class = c;
        return this;
    }
    /**
     * Append classes to the element's existing `class` attribute.
     *
     * @param c - Space-separated class names to add
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setClass("p-4").addClass("bg-white rounded")
     */
    addClass(c) {
        const classes = this._variantPrefix
            ? c.split(" ").map(cls => `${this._variantPrefix}:${cls}`).join(" ")
            : c;
        if (this.class) {
            this.class += ' ' + classes;
        }
        else {
            this.class = classes;
        }
        return this;
    }
    /**
     * Set the element's inline `style` attribute.
     *
     * @param style - CSS style string
     * @returns `this` for chaining
     *
     * @example
     * Div("Content").setStyle("color: red; font-size: 16px")
     */
    setStyle(style) {
        this.style = style;
        return this;
    }
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
    addAttribute(key, value) {
        validateAttributeKey(key);
        if (this.attributes === EMPTY_ATTRS) {
            this.attributes = Object.create(null);
        }
        this.attributes[key] = value;
        return this;
    }
    /**
     * Set a CSP nonce on this element (typically for inline script/style tags).
     *
     * @example
     * Script("console.log('hi')").setNonce(nonce)
     * Style(".cls { color: red }").setNonce(nonce)
     */
    setNonce(nonce) {
        if (this.attributes === EMPTY_ATTRS) {
            this.attributes = Object.create(null);
        }
        this.attributes['nonce'] = nonce;
        return this;
    }
    /**
     * Add a boolean HTML attribute (toggle). Conditionally add with the second parameter.
     *
     * @example
     * Input().toggle("required")                    // required
     * Input().toggle("required", isRequired)        // conditional
     * Input().toggle("disabled").toggle("readonly")  // chainable
     */
    toggle(name, condition = true) {
        if (condition) {
            if (this.toggles) {
                this.toggles.push(name);
            }
            else {
                this.toggles = [name];
            }
        }
        return this;
    }
    /**
     * Conditionally modify this tag. When condition is true, the modifier
     * function is called with the tag. Otherwise the tag is returned unchanged.
     *
     * @example
     * Button("Save")
     *   .when(isLoading, t => t.toggle("disabled").addClass("opacity-50"))
     *   .when(isPrimary, t => t.addClass("bg-blue-500 text-white"))
     */
    when(condition, fn) {
        return condition ? fn(this) : this;
    }
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
    apply(...fns) {
        for (const fn of fns)
            fn(this);
        return this;
    }
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
    setClasses(classes) {
        this.class = classes.filter(Boolean).join(" ");
        return this;
    }
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
    setStyles(styles) {
        const styleString = Object.entries(styles)
            .map(([key, value]) => {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            return `${kebabKey}: ${value}`;
        })
            .join("; ");
        this.style = styleString;
        return this;
    }
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
    setDataAttrs(attrs) {
        if (this.attributes === EMPTY_ATTRS)
            this.attributes = Object.create(null);
        for (const [key, value] of Object.entries(attrs)) {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            this.attributes[`data-${kebabKey}`] = value;
        }
        return this;
    }
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
    setAria(attrs) {
        if (this.attributes === EMPTY_ATTRS)
            this.attributes = Object.create(null);
        for (const [key, value] of Object.entries(attrs)) {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            this.attributes[`aria-${kebabKey}`] = String(value);
        }
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype manipulation
Tag.prototype._t = 1;
Tag.prototype.attributes = EMPTY_ATTRS;
//# sourceMappingURL=tag.js.map