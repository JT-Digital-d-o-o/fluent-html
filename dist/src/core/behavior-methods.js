/**
 * Built-in behavior system — type-safe client-side interactions via hx-on:* attributes.
 * No client-side runtime needed. The library owns the JS snippets.
 *
 * @module
 */
import { Tag, EMPTY_ATTRS } from "./tag.js";
import { isId } from "../ids.js";
function resolveId(value) {
    return isId(value) ? value.id : String(value);
}
function el(value) {
    return `document.getElementById('${resolveId(value)}')`;
}
const renderers = {
    toggle: (opts) => [
        "click",
        `${el(opts.target)}.classList.toggle('hidden')`,
    ],
    toggleClass: (opts) => [
        "click",
        `${el(opts.target)}.classList.toggle('${String(opts.class)}')`,
    ],
    remove: (opts) => [
        "click",
        `${el(opts.target)}.remove()`,
    ],
    clipboard: (opts) => [
        "click",
        `navigator.clipboard.writeText('${escapeJs(String(opts.value))}')`,
    ],
    disable: () => [
        "click",
        "this.disabled=true",
    ],
    focus: (opts) => [
        "click",
        `${el(opts.target)}.focus()`,
    ],
    scrollTo: (opts) => [
        "click",
        `${el(opts.target)}.scrollIntoView({behavior:'smooth'})`,
    ],
    selectAll: () => [
        "focus",
        "this.select()",
    ],
};
function escapeJs(str) {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}
// ── Implementation ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
Tag.prototype.behavior = function (name, options) {
    if (this.attributes === EMPTY_ATTRS)
        this.attributes = Object.create(null);
    const renderer = renderers[name];
    const [event, js] = renderer(options ?? {});
    const attr = `hx-on:${event}`;
    const existing = this.attributes[attr];
    this.attributes[attr] = existing ? existing + ";" + js : js;
    return this;
};
//# sourceMappingURL=behavior-methods.js.map