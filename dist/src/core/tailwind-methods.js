/**
 * Tailwind CSS utility methods for Tag — extracted as a mixin.
 * This file adds all Tailwind styling methods, the object-form variant
 * surface (`.hover({…})`/`.md({…})`/`.variant(name, {…})`), and layout
 * helpers to Tag.prototype via declaration merging.
 *
 * @module
 */
import { Tag } from "./tag.js";
import { DIRECT_VARIANTS } from "../class-vocab/index.js";
import { applyVariantObject } from "./variant-object.js";
// Shared with the class-vocab source of truth (C-05) — one home for these
// constants (the extractor + ESLint maps derive from the same module).
import { DIR_MAP, ROUNDED_CORNERS, signNeg, cssPropValue, radialGradientClass } from "../class-vocab/types.js";
import { extractId } from "../ids.js";
// ── Prototype implementations ───────────────────────────────────────
/* eslint-disable fluent-html/no-known-modifiers-in-setclass */
const p = Tag.prototype;
// Object-form variants — every tier-1 method is the same one-liner over its
// DIRECT_VARIANTS prefix, so the map stays the single source of the tier-1 set
// (a parity test asserts each declared method exists and emits its prefix).
for (const [method, prefix] of Object.entries(DIRECT_VARIANTS)) {
    p[method] =
        function (styles) { return applyVariantObject(this, prefix, styles); };
}
p.variant = function (name, styles) {
    return applyVariantObject(this, name, styles);
};
// Spacing
p.p = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`p-${directionOrValue}`);
    if (typeof value === "number")
        return this.addClass(`p-[${value}${directionOrValue}]`);
    const dir = DIR_MAP[directionOrValue] || directionOrValue;
    return this.addClass(`p${dir}-${value}`);
};
p.m = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`m-${directionOrValue}`);
    if (typeof value === "number")
        return this.addClass(`m-[${value}${directionOrValue}]`);
    const dir = DIR_MAP[directionOrValue] || directionOrValue;
    return this.addClass(`m${dir}-${value}`);
};
// Directional shorthands (canonical-names)
p.px = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`px-[${amount}${unitOrValue}]`);
    return this.addClass(`px-${unitOrValue}`);
};
p.py = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`py-[${amount}${unitOrValue}]`);
    return this.addClass(`py-${unitOrValue}`);
};
p.pt = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`pt-[${amount}${unitOrValue}]`);
    return this.addClass(`pt-${unitOrValue}`);
};
p.pb = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`pb-[${amount}${unitOrValue}]`);
    return this.addClass(`pb-${unitOrValue}`);
};
p.pl = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`pl-[${amount}${unitOrValue}]`);
    return this.addClass(`pl-${unitOrValue}`);
};
p.pr = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`pr-[${amount}${unitOrValue}]`);
    return this.addClass(`pr-${unitOrValue}`);
};
p.mx = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`mx-[${amount}${unitOrValue}]`);
    return this.addClass(`mx-${unitOrValue}`);
};
p.my = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`my-[${amount}${unitOrValue}]`);
    return this.addClass(`my-${unitOrValue}`);
};
p.mt = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`mt-[${amount}${unitOrValue}]`);
    return this.addClass(`mt-${unitOrValue}`);
};
p.mb = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`mb-[${amount}${unitOrValue}]`);
    return this.addClass(`mb-${unitOrValue}`);
};
p.ml = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`ml-[${amount}${unitOrValue}]`);
    return this.addClass(`ml-${unitOrValue}`);
};
p.mr = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`mr-[${amount}${unitOrValue}]`);
    return this.addClass(`mr-${unitOrValue}`);
};
// Colors
p.bg = function (color) { return this.addClass(`bg-${color}`); };
// Typography
p.text = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`text-[${amount}${unitOrValue}]`);
    return this.addClass(`text-${unitOrValue}`);
};
p.font = function (value) { return this.addClass(`font-${value}`); };
p.italic = function () { return this.addClass("italic"); };
p.uppercase = function () { return this.addClass("uppercase"); };
p.lowercase = function () { return this.addClass("lowercase"); };
p.capitalize = function () { return this.addClass("capitalize"); };
p.underline = function () { return this.addClass("underline"); };
p.noUnderline = function () { return this.addClass("no-underline"); };
p.lineThrough = function () { return this.addClass("line-through"); };
p.truncate = function () { return this.addClass("truncate"); };
p.leading = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`leading-[${amount}${unitOrValue}]`);
    return this.addClass(`leading-${unitOrValue}`);
};
p.tracking = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`tracking-[${amount}${unitOrValue}]`);
    return this.addClass(`tracking-${unitOrValue}`);
};
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
p.justify = function (justify) { return this.addClass(`justify-${justify}`); };
p.items = function (align) { return this.addClass(`items-${align}`); };
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
p.gridFlow = function (value) { return this.addClass(`grid-flow-${value}`); };
p.autoRows = function (value) { return this.addClass(`auto-rows-${value}`); };
p.autoCols = function (value) { return this.addClass(`auto-cols-${value}`); };
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
p.absolute = function () { return this.addClass("absolute"); };
p.relative = function () { return this.addClass("relative"); };
p.fixed = function () { return this.addClass("fixed"); };
p.sticky = function () { return this.addClass("sticky"); };
p.static = function () { return this.addClass("static"); };
p.z = function (value) { return this.addClass(`z-${value}`); };
p.overflow = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`overflow-${directionOrValue}`);
    return this.addClass(`overflow-${directionOrValue}-${value}`);
};
p.object = function (value) { return this.addClass(`object-${value}`); };
// Layout & Display
p.block = function () { return this.addClass("block"); };
p.inlineBlock = function () { return this.addClass("inline-block"); };
p.inline = function () { return this.addClass("inline"); };
p.inlineFlex = function () { return this.addClass("inline-flex"); };
p.inlineGrid = function () { return this.addClass("inline-grid"); };
p.contents = function () { return this.addClass("contents"); };
p.hidden = function () { return this.addClass("hidden"); };
p.invisible = function () { return this.addClass("invisible"); };
p.table = function (value) {
    return value === undefined ? this.addClass("table") : this.addClass(`table-${value}`);
};
p.tableCell = function () { return this.addClass("table-cell"); };
p.tableRow = function () { return this.addClass("table-row"); };
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
p.self = function (value) { return this.addClass(`self-${value}`); };
p.colSpan = function (value) { return this.addClass(`col-span-${value}`); };
p.aspect = function (value) { return this.addClass(`aspect-${value}`); };
p.order = function (value) { return this.addClass(`order-${value}`); };
// Place (Grid/Flex alignment)
p.placeContent = function (value) { return this.addClass(`place-content-${value}`); };
p.placeItems = function (value) { return this.addClass(`place-items-${value}`); };
p.placeSelf = function (value) { return this.addClass(`place-self-${value}`); };
// Spacing Between Children
p.spaceX = function (value) { return this.addClass(`space-x-${value}`); };
p.spaceY = function (value) { return this.addClass(`space-y-${value}`); };
p.divideX = function (value) {
    return value === undefined ? this.addClass("divide-x") : this.addClass(`divide-x-${value}`);
};
p.divideY = function (value) {
    return value === undefined ? this.addClass("divide-y") : this.addClass(`divide-y-${value}`);
};
p.divide = function (color) { return this.addClass(`divide-${color}`); };
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
// Transforms
p.scale = function (value) { return this.addClass(`scale-${value}`); };
p.rotate = function (value) { return this.addClass(signNeg("rotate", String(value))); };
p.translate = function (direction, value) {
    return this.addClass(signNeg(`translate-${direction}`, String(value)));
};
p.skewX = function (value) { return this.addClass(signNeg("skew-x", String(value))); };
p.skewY = function (value) { return this.addClass(signNeg("skew-y", String(value))); };
// Interactivity
p.select = function (value) { return this.addClass(`select-${value}`); };
p.pointerEvents = function (value) { return this.addClass(`pointer-events-${value}`); };
p.appearance = function (value) { return this.addClass(`appearance-${value}`); };
// Text & Whitespace
p.whitespace = function (value) { return this.addClass(`whitespace-${value}`); };
// List Style
p.list = function (value) { return this.addClass(`list-${value}`); };
// Accessibility
p.srOnly = function () { return this.addClass("sr-only"); };
// Outline
p.outline = function (value) { return this.addClass(`outline-${value}`); };
// Gradients (v4-native: bg-linear-* replaces v3 bg-gradient-*; + radial/conic)
const interp = (cls, i) => (i ? `${cls}/${i}` : cls);
p.gradient = function (from, to, direction = "to-r", interpolation) {
    return this
        .addClass(interp(`bg-linear-${direction}`, interpolation))
        .addClass(`from-${from}`).addClass(`to-${to}`);
};
p.bgLinear = function (directionOrAngle, interpolation) {
    return this.addClass(interp(signNeg("bg-linear", String(directionOrAngle)), interpolation));
};
p.bgRadial = function (origin, interpolation) {
    return this.addClass(radialGradientClass(origin, interpolation));
};
p.bgConic = function (angle, interpolation) {
    return this.addClass(interp(angle === undefined ? "bg-conic" : signNeg("bg-conic", String(angle)), interpolation));
};
p.from = function (color, position) { this.addClass(`from-${color}`); return position ? this.addClass(`from-${position}`) : this; };
p.via = function (color, position) { this.addClass(`via-${color}`); return position ? this.addClass(`via-${position}`) : this; };
p.to = function (color, position) { this.addClass(`to-${color}`); return position ? this.addClass(`to-${position}`) : this; };
// Group / Peer markers
p.group = function (name) {
    return name === undefined ? this.addClass("group") : this.addClass(`group/${name}`);
};
p.peer = function (name) {
    return name === undefined ? this.addClass("peer") : this.addClass(`peer/${name}`);
};
p.containerQuery = function (name) {
    return name === undefined ? this.addClass("@container") : this.addClass(`@container/${name}`);
};
// Filters
p.blur = function (value) {
    return value === undefined ? this.addClass("blur") : this.addClass(`blur-${value}`);
};
p.backdropBlur = function (value) {
    return value === undefined ? this.addClass("backdrop-blur") : this.addClass(`backdrop-blur-${value}`);
};
p.brightness = function (value) { return this.addClass(`brightness-${value}`); };
p.backdropBrightness = function (value) { return this.addClass(`backdrop-brightness-${value}`); };
p.contrast = function (value) { return this.addClass(`contrast-${value}`); };
p.backdropContrast = function (value) { return this.addClass(`backdrop-contrast-${value}`); };
p.grayscale = function (value) {
    return value === undefined ? this.addClass("grayscale") : this.addClass(`grayscale-${value}`);
};
p.backdropGrayscale = function (value) {
    return value === undefined ? this.addClass("backdrop-grayscale") : this.addClass(`backdrop-grayscale-${value}`);
};
p.hueRotate = function (value) { return this.addClass(`hue-rotate-${value}`); };
p.backdropHueRotate = function (value) { return this.addClass(`backdrop-hue-rotate-${value}`); };
p.invert = function (value) {
    return value === undefined ? this.addClass("invert") : this.addClass(`invert-${value}`);
};
p.backdropInvert = function (value) {
    return value === undefined ? this.addClass("backdrop-invert") : this.addClass(`backdrop-invert-${value}`);
};
p.saturate = function (value) { return this.addClass(`saturate-${value}`); };
p.backdropSaturate = function (value) { return this.addClass(`backdrop-saturate-${value}`); };
p.sepia = function (value) {
    return value === undefined ? this.addClass("sepia") : this.addClass(`sepia-${value}`);
};
p.backdropSepia = function (value) {
    return value === undefined ? this.addClass("backdrop-sepia") : this.addClass(`backdrop-sepia-${value}`);
};
// Line Clamp
p.lineClamp = function (value) { return this.addClass(`line-clamp-${value}`); };
// Typography extras
p.antialiased = function () { return this.addClass("antialiased"); };
p.tabularNums = function () { return this.addClass("tabular-nums"); };
p.underlineOffset = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`underline-offset-[${amount}${unitOrValue}]`);
    return this.addClass(`underline-offset-${unitOrValue}`);
};
p.breakAll = function () { return this.addClass("break-all"); };
// Timing function
p.ease = function (value) { return this.addClass(`ease-${value}`); };
// Resize
p.resize = function (value) {
    return value === undefined ? this.addClass("resize") : this.addClass(`resize-${value}`);
};
// Performance hints
p.willChange = function (value) { return this.addClass(`will-change-${value}`); };
// Overscroll behavior
p.overscroll = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`overscroll-${directionOrValue}`);
    return this.addClass(`overscroll-${directionOrValue}-${value}`);
};
// Negative value prefix
p.neg = function (cls) { return this.addClass(`-${cls}`); };
// Typed escapes (llm-styling/escape-hatch)
p.cssProp = function (property, value) {
    return this.addClass(`[${property}:${cssPropValue(value)}]`);
};
p.cssClass = function (name) { return this.addClass(name); };
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
const POSITION_AREA_CSS = {
    top: "top", bottom: "bottom", left: "left", right: "right", center: "center",
    "top-left": "top left", "top-right": "top right",
    "bottom-left": "bottom left", "bottom-right": "bottom right",
    "top-span-left": "top span-left", "top-span-right": "top span-right",
    "bottom-span-left": "bottom span-left", "bottom-span-right": "bottom span-right",
};
p.anchorName = function (name) { return this.addStyle(`anchor-name: --${extractId(name)}`); };
p.positionAnchor = function (name) { return this.addStyle(`position-anchor: --${extractId(name)}`); };
p.positionArea = function (area) {
    const value = area.startsWith("[") && area.endsWith("]") ? area.slice(1, -1) : POSITION_AREA_CSS[area] ?? area;
    return this.addStyle(`position-area: ${value}`);
};
p.viewTransitionName = function (name) { return this.addStyle(`view-transition-name: ${extractId(name)}`); };
p.fill = function (color) { return this.addClass(`fill-${color}`); };
p.stroke = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`stroke-[${amount}${unitOrValue}]`);
    return this.addClass(`stroke-${unitOrValue}`);
};
p.accent = function (color) { return this.addClass(`accent-${color}`); };
p.caret = function (color) { return this.addClass(`caret-${color}`); };
p.scheme = function (value) { return this.addClass(`scheme-${value}`); };
p.decoration = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`decoration-[${amount}${unitOrValue}]`);
    return this.addClass(`decoration-${unitOrValue}`);
};
p.insetX = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`inset-x-[${amount}${unitOrValue}]`);
    return this.addClass(`inset-x-${unitOrValue}`);
};
p.insetY = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`inset-y-[${amount}${unitOrValue}]`);
    return this.addClass(`inset-y-${unitOrValue}`);
};
p.insetS = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`inset-s-[${amount}${unitOrValue}]`);
    return this.addClass(`inset-s-${unitOrValue}`);
};
p.insetE = function (unitOrValue, amount) {
    if (amount !== undefined)
        return this.addClass(`inset-e-[${amount}${unitOrValue}]`);
    return this.addClass(`inset-e-${unitOrValue}`);
};
p.wrap = function (value) { return this.addClass(`wrap-${value}`); };
p.hyphens = function (value) { return this.addClass(`hyphens-${value}`); };
p.textShadow = function (value) { return this.addClass(`text-shadow-${value}`); };
p.dropShadow = function (value) { return this.addClass(`drop-shadow-${value}`); };
p.insetShadow = function (value) { return this.addClass(`inset-shadow-${value}`); };
p.insetRing = function (value) {
    return value === undefined ? this.addClass("inset-ring") : this.addClass(`inset-ring-${value}`);
};
p.mixBlend = function (mode) { return this.addClass(`mix-blend-${mode}`); };
p.bgBlend = function (mode) { return this.addClass(`bg-blend-${mode}`); };
p.isolate = function () { return this.addClass("isolate"); };
p.isolation = function (value) { return this.addClass(`isolation-${value}`); };
p.delay = function (value) { return this.addClass(`delay-${value}`); };
p.perspective = function (value) { return this.addClass(`perspective-${value}`); };
p.perspectiveOrigin = function (value) { return this.addClass(`perspective-origin-${value}`); };
p.transform = function (value) { return this.addClass(`transform-${value}`); };
p.backface = function (value) { return this.addClass(`backface-${value}`); };
p.rotateX = function (value) { return this.addClass(signNeg("rotate-x", String(value))); };
p.rotateY = function (value) { return this.addClass(signNeg("rotate-y", String(value))); };
p.rotateZ = function (value) { return this.addClass(signNeg("rotate-z", String(value))); };
p.scaleX = function (value) { return this.addClass(signNeg("scale-x", String(value))); };
p.scaleY = function (value) { return this.addClass(signNeg("scale-y", String(value))); };
p.scaleZ = function (value) { return this.addClass(signNeg("scale-z", String(value))); };
p.scale3d = function () { return this.addClass("scale-3d"); };
p.colStart = function (value) { return this.addClass(signNeg("col-start", String(value))); };
p.colEnd = function (value) { return this.addClass(signNeg("col-end", String(value))); };
p.rowStart = function (value) { return this.addClass(signNeg("row-start", String(value))); };
p.rowEnd = function (value) { return this.addClass(signNeg("row-end", String(value))); };
p.rowSpan = function (value) { return this.addClass(`row-span-${value}`); };
p.columns = function (value) { return this.addClass(`columns-${value}`); };
p.breakBefore = function (value) { return this.addClass(`break-before-${value}`); };
p.breakAfter = function (value) { return this.addClass(`break-after-${value}`); };
p.breakInside = function (value) { return this.addClass(`break-inside-${value}`); };
p.boxDecoration = function (value) { return this.addClass(`box-decoration-${value}`); };
p.snap = function (axis, strictness) {
    if (strictness === undefined)
        return this.addClass(`snap-${axis}`);
    return this.addClass(`snap-${axis}`).addClass(`snap-${strictness}`);
};
p.snapAlign = function (value) {
    return this.addClass(value === "none" ? "snap-align-none" : `snap-${value}`);
};
p.snapStop = function (value) { return this.addClass(`snap-${value}`); };
p.scroll = function (value) { return this.addClass(`scroll-${value}`); };
p.scrollM = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`scroll-m-${directionOrValue}`);
    if (typeof value === "number")
        return this.addClass(`scroll-m-[${value}${directionOrValue}]`);
    const dir = DIR_MAP[directionOrValue] || directionOrValue;
    return this.addClass(`scroll-m${dir}-${value}`);
};
p.scrollP = function (directionOrValue, value) {
    if (value === undefined)
        return this.addClass(`scroll-p-${directionOrValue}`);
    if (typeof value === "number")
        return this.addClass(`scroll-p-[${value}${directionOrValue}]`);
    const dir = DIR_MAP[directionOrValue] || directionOrValue;
    return this.addClass(`scroll-p${dir}-${value}`);
};
p.fieldSizing = function (value) { return this.addClass(`field-sizing-${value}`); };
p.content = function (value) {
    return this.addClass(value === undefined ? "content-['']" : `content-${value}`);
};
p.mask = function (value) {
    return value === "none" ? this.addClass("mask-none") : this.addClass(`mask-${value}`);
};
p.maskFrom = function (edge, stop) { return this.addClass(`mask-${edge}-from-${stop}`); };
p.maskTo = function (edge, stop) { return this.addClass(`mask-${edge}-to-${stop}`); };
p.maskType = function (value) { return this.addClass(`mask-type-${value}`); };
//# sourceMappingURL=tailwind-methods.js.map