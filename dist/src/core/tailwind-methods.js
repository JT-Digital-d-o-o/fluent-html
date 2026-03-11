/**
 * Tailwind CSS utility methods for Tag — extracted as a mixin.
 * This file adds all Tailwind styling methods, variant proxy (.on/.at),
 * and layout helpers to Tag.prototype via declaration merging.
 *
 * @module
 */
import { Tag } from "./tag.js";
// ── Variant helper (local, not on prototype) ────────────────────────
function withVariant(tag, prefix, fn) {
    const outer = tag._variantPrefix;
    tag._variantPrefix = outer ? `${outer}:${prefix}` : prefix;
    fn(tag);
    tag._variantPrefix = outer;
    return tag;
}
// ── Direction map (shared by padding/margin/border) ─────────────────
const DIR_MAP = {
    x: "x", y: "y",
    top: "t", bottom: "b", left: "l", right: "r",
    t: "t", b: "b", l: "l", r: "r",
};
// ── Prototype implementations ───────────────────────────────────────
/* eslint-disable fluent-html/no-known-modifiers-in-setclass */
const p = Tag.prototype;
// Variant Proxy
p.on = function (state, fn) {
    return withVariant(this, state, fn);
};
p.at = function (breakpoint, fn) {
    return withVariant(this, breakpoint, fn);
};
// Spacing
p.padding = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`p-${directionOrValue}`);
    if (typeof value === "number")
        return this.addClass(`p-[${value}${directionOrValue}]`);
    const dir = DIR_MAP[directionOrValue] || directionOrValue;
    return this.addClass(`p${dir}-${value}`);
};
p.margin = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`m-${directionOrValue}`);
    if (typeof value === "number")
        return this.addClass(`m-[${value}${directionOrValue}]`);
    const dir = DIR_MAP[directionOrValue] || directionOrValue;
    return this.addClass(`m${dir}-${value}`);
};
// Colors
p.background = function (color) { return this.addClass(`bg-${color}`); };
p.textColor = function (color) { return this.addClass(`text-${color}`); };
// Typography
p.textSize = function (size) { return this.addClass(`text-${size}`); };
p.textAlign = function (align) { return this.addClass(`text-${align}`); };
p.fontWeight = function (weight) { return this.addClass(`font-${weight}`); };
p.bold = function () { return this.addClass("font-bold"); };
p.italic = function () { return this.addClass("italic"); };
p.uppercase = function () { return this.addClass("uppercase"); };
p.lowercase = function () { return this.addClass("lowercase"); };
p.capitalize = function () { return this.addClass("capitalize"); };
p.underline = function () { return this.addClass("underline"); };
p.noUnderline = function () { return this.addClass("no-underline"); };
p.lineThrough = function () { return this.addClass("line-through"); };
p.truncate = function () { return this.addClass("truncate"); };
p.leading = function (value) { return this.addClass(`leading-${value}`); };
p.tracking = function (value) { return this.addClass(`tracking-${value}`); };
// Sizing
p.w = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`w-[${amount}${unitOrValue}]`);
    return this.addClass(`w-${unitOrValue}`);
};
p.h = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`h-[${amount}${unitOrValue}]`);
    return this.addClass(`h-${unitOrValue}`);
};
p.maxW = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`max-w-[${amount}${unitOrValue}]`);
    return this.addClass(`max-w-${unitOrValue}`);
};
p.minW = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`min-w-[${amount}${unitOrValue}]`);
    return this.addClass(`min-w-${unitOrValue}`);
};
p.maxH = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`max-h-[${amount}${unitOrValue}]`);
    return this.addClass(`max-h-${unitOrValue}`);
};
p.minH = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`min-h-[${amount}${unitOrValue}]`);
    return this.addClass(`min-h-${unitOrValue}`);
};
// Flexbox
p.flex = function (value) {
    return value === undefined ? this.addClass("flex") : this.addClass(`flex-${value}`);
};
p.flexDirection = function (direction) { return this.addClass(`flex-${direction}`); };
p.justifyContent = function (justify) { return this.addClass(`justify-${justify}`); };
p.alignItems = function (align) { return this.addClass(`items-${align}`); };
p.gap = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`gap-${directionOrValue}`);
    if (typeof value === "number")
        return this.addClass(`gap-[${value}${directionOrValue}]`);
    return this.addClass(`gap-${directionOrValue}-${value}`);
};
// Grid
p.grid = function () { return this.addClass("grid"); };
p.gridCols = function (cols) { return this.addClass(`grid-cols-${cols}`); };
p.gridRows = function (rows) { return this.addClass(`grid-rows-${rows}`); };
// Borders
p.border = function (directionOrValue, value) {
    if (directionOrValue === undefined)
        return this.addClass("border");
    const dir = DIR_MAP[directionOrValue];
    if (dir !== undefined) {
        return value === undefined
            ? this.addClass(`border-${dir}`)
            : this.addClass(`border-${dir}-${value}`);
    }
    return this.addClass(`border-${directionOrValue}`);
};
p.borderColor = function (color) { return this.addClass(`border-${color}`); };
const ROUNDED_CORNERS = new Set(["t", "r", "b", "l", "tl", "tr", "br", "bl", "s", "e", "ss", "se", "es", "ee"]);
p.rounded = function (cornerOrValue, value) {
    if (cornerOrValue === undefined)
        return this.addClass("rounded");
    if (ROUNDED_CORNERS.has(cornerOrValue)) {
        return value === undefined
            ? this.addClass(`rounded-${cornerOrValue}`)
            : this.addClass(`rounded-${cornerOrValue}-${value}`);
    }
    return this.addClass(`rounded-${cornerOrValue}`);
};
p.shadow = function (value) {
    return value === undefined ? this.addClass("shadow") : this.addClass(`shadow-${value}`);
};
// Effects & Appearance
p.opacity = function (value) { return this.addClass(`opacity-${value}`); };
p.cursor = function (value) { return this.addClass(`cursor-${value}`); };
p.position = function (value) { return this.addClass(value); };
p.zIndex = function (value) { return this.addClass(`z-${value}`); };
p.overflow = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`overflow-${directionOrValue}`);
    return this.addClass(`overflow-${directionOrValue}-${value}`);
};
p.objectFit = function (value) { return this.addClass(`object-${value}`); };
// Layout & Display
p.display = function (value) { return this.addClass(value); };
p.hidden = function () { return this.addClass("hidden"); };
p.inset = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`inset-[${amount}${unitOrValue}]`);
    return this.addClass(`inset-${unitOrValue}`);
};
p.top = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`top-[${amount}${unitOrValue}]`);
    return this.addClass(`top-${unitOrValue}`);
};
p.right = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`right-[${amount}${unitOrValue}]`);
    return this.addClass(`right-${unitOrValue}`);
};
p.bottom = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`bottom-[${amount}${unitOrValue}]`);
    return this.addClass(`bottom-${unitOrValue}`);
};
p.left = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`left-[${amount}${unitOrValue}]`);
    return this.addClass(`left-${unitOrValue}`);
};
// Flexbox & Grid Extensions
p.shrink = function (value) {
    return value === undefined ? this.addClass("shrink") : this.addClass(`shrink-${value}`);
};
p.grow = function (value) {
    return value === undefined ? this.addClass("grow") : this.addClass(`grow-${value}`);
};
p.flexWrap = function (value) { return this.addClass(`flex-${value}`); };
p.alignSelf = function (value) { return this.addClass(`self-${value}`); };
p.colSpan = function (value) { return this.addClass(`col-span-${value}`); };
p.aspect = function (value) { return this.addClass(`aspect-${value}`); };
// Spacing Between Children
p.spaceX = function (value) { return this.addClass(`space-x-${value}`); };
p.spaceY = function (value) { return this.addClass(`space-y-${value}`); };
p.divideX = function (value) {
    return value === undefined ? this.addClass("divide-x") : this.addClass(`divide-x-${value}`);
};
p.divideY = function (value) {
    return value === undefined ? this.addClass("divide-y") : this.addClass(`divide-y-${value}`);
};
// Transitions & Animation
p.transition = function (value) {
    return value === undefined ? this.addClass("transition") : this.addClass(`transition-${value}`);
};
p.duration = function (value) { return this.addClass(`duration-${value}`); };
p.animate = function (value) { return this.addClass(`animate-${value}`); };
// Ring (Focus Rings)
p.ring = function (value) {
    return value === undefined ? this.addClass("ring") : this.addClass(`ring-${value}`);
};
p.ringColor = function (color) { return this.addClass(`ring-${color}`); };
// Transforms
p.scale = function (value) { return this.addClass(`scale-${value}`); };
p.rotate = function (value) { return this.addClass(`rotate-${value}`); };
p.translate = function (direction, value) {
    return this.addClass(`translate-${direction}-${value}`);
};
// Interactivity
p.select = function (value) { return this.addClass(`select-${value}`); };
p.pointerEvents = function (value) { return this.addClass(`pointer-events-${value}`); };
// Text & Whitespace
p.whitespace = function (value) { return this.addClass(`whitespace-${value}`); };
// List Style
p.listStyleType = function (value) { return this.addClass(`list-${value}`); };
p.listStylePosition = function (value) { return this.addClass(`list-${value}`); };
// Accessibility
p.srOnly = function () { return this.addClass("sr-only"); };
// Outline
p.outline = function (value) { return this.addClass(`outline-${value}`); };
//# sourceMappingURL=tailwind-methods.js.map