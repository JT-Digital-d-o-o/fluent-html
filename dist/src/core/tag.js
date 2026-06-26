import { setDiscriminant } from "./proto.js";
import { isId, extractId } from "../ids.js";
/** @internal Shared empty attributes object — never mutate */
export const EMPTY_ATTRS = Object.freeze(Object.create(null));
// Attribute key must be a valid HTML attribute name
const VALID_ATTR_KEY = /^[a-zA-Z_][a-zA-Z0-9\-_:.]*$/;
// Event handler attributes — blocked by default to prevent XSS
const EVENT_HANDLER_RE = /^on[a-z]/i;
// Prototype pollution keys
const PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
// camelCase → kebab-case for style / data-* / aria-* keys.
// Module-level regex + callback so no closure is allocated per call.
const KEBAB_RE = /[A-Z]/g;
const kebabReplacer = (letter) => '-' + letter.toLowerCase();
function kebabCase(key) {
    return key.replace(KEBAB_RE, kebabReplacer);
}
function validateAttributeKey(key) {
    if (PROTO_KEYS.has(key)) {
        throw new Error(`Attribute key "${key}" is blocked (prototype pollution)`);
    }
    if (!VALID_ATTR_KEY.test(key)) {
        throw new Error(`Invalid attribute key: "${key}"`);
    }
    if (EVENT_HANDLER_RE.test(key)) {
        throw new Error(`Event handler attribute "${key}" is blocked — use .behavior() or .hxOn() instead of an inline on* handler`);
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
            ? (c.indexOf(' ') === -1
                ? this._variantPrefix + ':' + c
                : c.split(" ").map(cls => `${this._variantPrefix}:${cls}`).join(" "))
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
     * Set the element's inline `style` attribute, **replacing** any existing style.
     *
     * Per the library convention, `set*` methods override and `add*` methods
     * accumulate — so `setStyle(...).setStyles(...)` keeps only the last call.
     * (Class names are the opposite: `setClass` replaces, `addClass` appends.)
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
    when(condition, fn) {
        return condition ? fn(this, condition) : this;
    }
    whenElse(condition, thenFn, elseFn) {
        if (typeof condition === "boolean")
            return condition ? thenFn(this) : elseFn(this);
        return condition != null ? thenFn(this, condition) : elseFn(this);
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
     * Set multiple inline styles from an object, **replacing** any existing style
     * (`set*` overrides; it does not merge). Build the full style in one call.
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
            .map(([key, value]) => `${kebabCase(key)}: ${value}`)
            .join("; ");
        this.style = styleString;
        return this;
    }
    /**
     * Set multiple data-* attributes at once. Each computed `data-*` key is validated:
     * a markup-breaking key (quotes, spaces, `=`) throws, like `setAria`/`addAttribute`.
     * (The `data-` prefix makes `__proto__`/`on*` keys valid-but-inert, so those don't throw.)
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
            const attrKey = `data-${kebabCase(key)}`;
            validateAttributeKey(attrKey);
            this.attributes[attrKey] = value;
        }
        return this;
    }
    /**
     * Set the ARIA `role` attribute (the role goes on `role=`, not `aria-role`).
     *
     * @example
     * Div("Alert").setRole("alert")
     * Ul().setRole("menu")
     */
    setRole(role) {
        return this.addAttribute("role", role);
    }
    /**
     * Set the `tabindex` attribute (focus order). `0` makes a non-interactive
     * element focusable; `-1` makes it programmatically focusable but not tabbable.
     *
     * @example
     * Div("Focusable").setTabindex(0)
     */
    setTabindex(index) {
        return this.addAttribute("tabindex", String(index));
    }
    /**
     * Set the `title` **attribute** (the native tooltip) — NOT the `<title>` element.
     *
     * @example
     * Button("?").setTitle("Show help")
     */
    setTitle(title) {
        return this.addAttribute("title", title);
    }
    /**
     * Set ARIA state/property attributes for accessibility. Keys are the bare ARIA
     * names (`label`, `haspopup`, `labelledby`) and are prefixed with `aria-` — they
     * are NOT kebab-cased, so single-token names stay correct (`aria-haspopup`, not
     * `aria-has-popup`). State values accept a real `boolean` or the tristate
     * `"mixed"`. A full `aria-*` key may be passed verbatim for non-standard attributes.
     *
     * @example
     * Button("Menu").setAria({
     *   label: "Open menu",
     *   expanded: false,
     *   haspopup: true,
     *   controls: "menu-panel"
     * })
     */
    setAria(attrs) {
        if (this.attributes === EMPTY_ATTRS)
            this.attributes = Object.create(null);
        for (const [key, value] of Object.entries(attrs)) {
            if (value === undefined)
                continue;
            const attrKey = key.startsWith("aria-") ? key : `aria-${key}`;
            validateAttributeKey(attrKey);
            this.attributes[attrKey] = String(value);
        }
        return this;
    }
    /**
     * Mark this element a popover (native Popover API — top-layer, zero JS). A bare
     * call defaults to `"auto"` (light-dismiss: click-outside + Esc, one-open-per-group);
     * `"manual"` requires an explicit invoker to dismiss.
     *
     * @example
     * Div(...).setId(ids.menu).setPopover()          // popover="auto"
     * Div(...).setPopover("manual")                  // popover="manual"
     */
    setPopover(state = "auto") {
        return this.addAttribute("popover", state);
    }
    /**
     * Wire this element (any invoker — `<button>`/`<a>`/…) to a popover by `Id`,
     * rendering `popovertarget="<id>"`. Reuse the popover's own `Id` so the link is
     * provable. The id is `escapeAttr`'d at render like every attribute value.
     *
     * @example
     * Button("Account").setPopovertarget(ids.userMenu)
     */
    setPopovertarget(target) {
        return this.addAttribute("popovertarget", extractId(target));
    }
    /**
     * Set the invoker action (`"show"` | `"hide"` | `"toggle"`). Omit the argument to
     * emit no attribute and rely on the native default (`toggle`) — never a `=""`.
     *
     * @example
     * Button("Open").setPopovertarget(ids.menu).setPopovertargetaction("show")
     */
    setPopovertargetaction(action) {
        return action === undefined ? this : this.addAttribute("popovertargetaction", action);
    }
}
setDiscriminant(Tag, 1);
Tag.prototype.attributes = EMPTY_ATTRS;
//# sourceMappingURL=tag.js.map