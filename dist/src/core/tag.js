"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tag = exports.EMPTY_ATTRS = void 0;
const htmx_js_1 = require("../htmx.js");
const ids_js_1 = require("../ids.js");
/** @internal Shared empty attributes object — never mutate */
exports.EMPTY_ATTRS = Object.freeze({});
class Tag {
    constructor(element, child = "") {
        this.el = element;
        this.child = child;
    }
    setId(id) {
        this.id = id ? ((0, ids_js_1.isId)(id) ? id.id : id) : undefined;
        return this;
    }
    setClass(c) {
        this.class = c;
        return this;
    }
    addClass(c) {
        if (this.class) {
            this.class += ' ' + c;
        }
        else {
            this.class = c;
        }
        return this;
    }
    setStyle(style) {
        this.style = style;
        return this;
    }
    addAttribute(key, value) {
        if (this.attributes === exports.EMPTY_ATTRS) {
            this.attributes = { [key]: value };
        }
        else {
            this.attributes[key] = value;
        }
        return this;
    }
    setHtmx(endpointOrHtmx, options) {
        this.htmx = typeof endpointOrHtmx === 'string'
            ? (0, htmx_js_1.hx)(endpointOrHtmx, options)
            : endpointOrHtmx;
        return this;
    }
    hxGet(endpoint, options) {
        this.htmx = (0, htmx_js_1.hx)(endpoint, { ...options, method: 'get' });
        return this;
    }
    hxPost(endpoint, options) {
        this.htmx = (0, htmx_js_1.hx)(endpoint, { ...options, method: 'post' });
        return this;
    }
    hxPut(endpoint, options) {
        this.htmx = (0, htmx_js_1.hx)(endpoint, { ...options, method: 'put' });
        return this;
    }
    hxPatch(endpoint, options) {
        this.htmx = (0, htmx_js_1.hx)(endpoint, { ...options, method: 'patch' });
        return this;
    }
    hxDelete(endpoint, options) {
        this.htmx = (0, htmx_js_1.hx)(endpoint, { ...options, method: 'delete' });
        return this;
    }
    setToggles(toggles) {
        this.toggles = toggles;
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
        if (this.attributes === exports.EMPTY_ATTRS)
            this.attributes = {};
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
        if (this.attributes === exports.EMPTY_ATTRS)
            this.attributes = {};
        for (const [key, value] of Object.entries(attrs)) {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            this.attributes[`aria-${kebabKey}`] = String(value);
        }
        return this;
    }
    padding(directionOrValue, value) {
        if (value === undefined) {
            // Single parameter: all sides
            return this.addClass(`p-${directionOrValue}`);
        }
        else {
            // Two parameters: direction + value
            const dirMap = {
                x: "x", y: "y",
                top: "t", bottom: "b", left: "l", right: "r",
                t: "t", b: "b", l: "l", r: "r"
            };
            const dir = dirMap[directionOrValue] || directionOrValue;
            return this.addClass(`p${dir}-${value}`);
        }
    }
    margin(directionOrValue, value) {
        if (value === undefined) {
            return this.addClass(`m-${directionOrValue}`);
        }
        else {
            const dirMap = {
                x: "x", y: "y",
                top: "t", bottom: "b", left: "l", right: "r",
                t: "t", b: "b", l: "l", r: "r"
            };
            const dir = dirMap[directionOrValue] || directionOrValue;
            return this.addClass(`m${dir}-${value}`);
        }
    }
    /**
     * Add background color with Tailwind classes.
     *
     * @example
     * Div().background("red-500")        // bg-red-500
     * Div().background("blue-100")       // bg-blue-100
     */
    background(color) {
        return this.addClass(`bg-${color}`);
    }
    /**
     * Add text color with Tailwind classes.
     *
     * @example
     * Span().textColor("gray-700")       // text-gray-700
     * Span().textColor("white")          // text-white
     */
    textColor(color) {
        return this.addClass(`text-${color}`);
    }
    /**
     * Add text size with Tailwind classes.
     *
     * @example
     * Span().textSize("xl")              // text-xl
     * Span().textSize("sm")              // text-sm
     */
    textSize(size) {
        return this.addClass(`text-${size}`);
    }
    /**
     * Add text alignment with Tailwind classes.
     *
     * @example
     * P().textAlign("center")            // text-center
     * P().textAlign("right")             // text-right
     */
    textAlign(align) {
        return this.addClass(`text-${align}`);
    }
    /**
     * Add font weight with Tailwind classes.
     *
     * @example
     * Span().fontWeight("bold")          // font-bold
     * Span().fontWeight("semibold")      // font-semibold
     */
    fontWeight(weight) {
        return this.addClass(`font-${weight}`);
    }
    /**
     * Make text bold (shorthand for fontWeight("bold")).
     *
     * @example
     * Span("Important").bold()           // font-bold
     */
    bold() {
        return this.addClass("font-bold");
    }
    /**
     * Make text italic with Tailwind classes.
     *
     * @example
     * Span("Emphasis").italic()          // italic
     */
    italic() {
        return this.addClass("italic");
    }
    /**
     * Transform text to uppercase with Tailwind classes.
     *
     * @example
     * Span("hello").uppercase()          // uppercase
     */
    uppercase() {
        return this.addClass("uppercase");
    }
    /**
     * Transform text to lowercase with Tailwind classes.
     *
     * @example
     * Span("HELLO").lowercase()          // lowercase
     */
    lowercase() {
        return this.addClass("lowercase");
    }
    /**
     * Capitalize first letter of each word with Tailwind classes.
     *
     * @example
     * Span("hello world").capitalize()   // capitalize
     */
    capitalize() {
        return this.addClass("capitalize");
    }
    /**
     * Add underline to text with Tailwind classes.
     *
     * @example
     * Span("Link").underline()           // underline
     */
    underline() {
        return this.addClass("underline");
    }
    /**
     * Add line-through to text with Tailwind classes.
     *
     * @example
     * Span("Deleted").lineThrough()      // line-through
     */
    lineThrough() {
        return this.addClass("line-through");
    }
    /**
     * Truncate text with ellipsis using Tailwind classes.
     *
     * @example
     * P("Very long text...").truncate()  // truncate
     */
    truncate() {
        return this.addClass("truncate");
    }
    /**
     * Add line height with Tailwind classes.
     *
     * @example
     * P().leading("tight")               // leading-tight
     * P().leading("relaxed")             // leading-relaxed
     */
    leading(value) {
        return this.addClass(`leading-${value}`);
    }
    /**
     * Add letter spacing with Tailwind classes.
     *
     * @example
     * Span().tracking("wide")            // tracking-wide
     * Span().tracking("tight")           // tracking-tight
     */
    tracking(value) {
        return this.addClass(`tracking-${value}`);
    }
    /**
     * Add width with Tailwind classes.
     *
     * @example
     * Div().w("full")                    // w-full
     * Div().w("1/2")                     // w-1/2
     * Div().w("64")                      // w-64
     */
    w(value) {
        return this.addClass(`w-${value}`);
    }
    /**
     * Add height with Tailwind classes.
     *
     * @example
     * Div().h("screen")                  // h-screen
     * Div().h("64")                      // h-64
     */
    h(value) {
        return this.addClass(`h-${value}`);
    }
    /**
     * Add max-width with Tailwind classes.
     *
     * @example
     * Div().maxW("md")                   // max-w-md
     * Div().maxW("prose")                // max-w-prose
     */
    maxW(value) {
        return this.addClass(`max-w-${value}`);
    }
    /**
     * Add min-width with Tailwind classes.
     *
     * @example
     * Div().minW("0")                    // min-w-0
     * Div().minW("full")                 // min-w-full
     */
    minW(value) {
        return this.addClass(`min-w-${value}`);
    }
    /**
     * Add max-height with Tailwind classes.
     *
     * @example
     * Div().maxH("screen")               // max-h-screen
     * Div().maxH("96")                   // max-h-96
     */
    maxH(value) {
        return this.addClass(`max-h-${value}`);
    }
    /**
     * Add min-height with Tailwind classes.
     *
     * @example
     * Div().minH("screen")               // min-h-screen
     * Div().minH("0")                    // min-h-0
     */
    minH(value) {
        return this.addClass(`min-h-${value}`);
    }
    /**
     * Add flex display with Tailwind classes.
     *
     * @example
     * Div().flex()                       // flex
     * Div().flex("1")                    // flex-1
     */
    flex(value) {
        if (value === undefined) {
            return this.addClass("flex");
        }
        return this.addClass(`flex-${value}`);
    }
    /**
     * Add flex direction with Tailwind classes.
     *
     * @example
     * Div().flexDirection("col")         // flex-col
     * Div().flexDirection("row-reverse") // flex-row-reverse
     */
    flexDirection(direction) {
        return this.addClass(`flex-${direction}`);
    }
    /**
     * Add justify-content with Tailwind classes.
     *
     * @example
     * Div().justifyContent("center")     // justify-center
     * Div().justifyContent("between")    // justify-between
     */
    justifyContent(justify) {
        return this.addClass(`justify-${justify}`);
    }
    /**
     * Add align-items with Tailwind classes.
     *
     * @example
     * Div().alignItems("center")         // items-center
     * Div().alignItems("start")          // items-start
     */
    alignItems(align) {
        return this.addClass(`items-${align}`);
    }
    gap(directionOrValue, value) {
        if (value === undefined) {
            return this.addClass(`gap-${directionOrValue}`);
        }
        return this.addClass(`gap-${directionOrValue}-${value}`);
    }
    /**
     * Add grid display with Tailwind classes.
     *
     * @example
     * Div().grid()                       // grid
     */
    grid() {
        return this.addClass("grid");
    }
    /**
     * Add grid columns with Tailwind classes.
     *
     * @example
     * Div().gridCols("3")                // grid-cols-3
     * Div().gridCols("1fr-2fr")          // grid-cols-1fr-2fr
     */
    gridCols(cols) {
        return this.addClass(`grid-cols-${cols}`);
    }
    /**
     * Add grid rows with Tailwind classes.
     *
     * @example
     * Div().gridRows("2")                // grid-rows-2
     */
    gridRows(rows) {
        return this.addClass(`grid-rows-${rows}`);
    }
    border(directionOrValue, value) {
        if (directionOrValue === undefined) {
            return this.addClass("border");
        }
        const dirMap = {
            x: "x", y: "y",
            top: "t", bottom: "b", left: "l", right: "r",
            t: "t", b: "b", l: "l", r: "r"
        };
        const dir = dirMap[directionOrValue];
        if (dir !== undefined) {
            return value === undefined
                ? this.addClass(`border-${dir}`)
                : this.addClass(`border-${dir}-${value}`);
        }
        return this.addClass(`border-${directionOrValue}`);
    }
    /**
     * Add border color with Tailwind classes.
     *
     * @example
     * Div().borderColor("gray-300")      // border-gray-300
     */
    borderColor(color) {
        return this.addClass(`border-${color}`);
    }
    /**
     * Add border radius with Tailwind classes.
     *
     * @example
     * Div().rounded()                    // rounded
     * Div().rounded("full")              // rounded-full
     * Div().rounded("lg")                // rounded-lg
     */
    rounded(value) {
        if (value === undefined) {
            return this.addClass("rounded");
        }
        return this.addClass(`rounded-${value}`);
    }
    /**
     * Add shadow with Tailwind classes.
     *
     * @example
     * Div().shadow()                     // shadow
     * Div().shadow("lg")                 // shadow-lg
     */
    shadow(value) {
        if (value === undefined) {
            return this.addClass("shadow");
        }
        return this.addClass(`shadow-${value}`);
    }
    /**
     * Add opacity with Tailwind classes.
     *
     * @example
     * Div().opacity("50")                // opacity-50
     */
    opacity(value) {
        return this.addClass(`opacity-${value}`);
    }
    /**
     * Add cursor with Tailwind classes.
     *
     * @example
     * Button().cursor("pointer")         // cursor-pointer
     */
    cursor(value) {
        return this.addClass(`cursor-${value}`);
    }
    /**
     * Add position with Tailwind classes.
     *
     * @example
     * Div().position("relative")         // relative
     * Div().position("absolute")         // absolute
     */
    position(value) {
        return this.addClass(value);
    }
    /**
     * Add z-index with Tailwind classes.
     *
     * @example
     * Div().zIndex("10")                 // z-10
     */
    zIndex(value) {
        return this.addClass(`z-${value}`);
    }
    overflow(directionOrValue, value) {
        if (value === undefined) {
            return this.addClass(`overflow-${directionOrValue}`);
        }
        return this.addClass(`overflow-${directionOrValue}-${value}`);
    }
    /**
     * Add object-fit with Tailwind classes.
     *
     * @example
     * Img().objectFit("cover")             // object-cover
     * Img().objectFit("contain")           // object-contain
     */
    objectFit(value) {
        return this.addClass(`object-${value}`);
    }
}
exports.Tag = Tag;
/** @internal */
Tag.prototype._t = 1;
Tag.prototype.attributes = exports.EMPTY_ATTRS;
//# sourceMappingURL=tag.js.map