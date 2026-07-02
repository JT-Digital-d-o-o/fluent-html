/**
 * Built-in behavior system — type-safe client-side interactions via hx-on:* attributes.
 * No client-side runtime needed. The library owns the JS snippets.
 *
 * @module
 */
import { Tag, EMPTY_ATTRS } from "./tag.js";
import { isId } from "../ids.js";
import { escapeJs } from "../render/escape.js";
// A safe hx-on event name (it becomes part of the `hx-on:<event>` attribute NAME, so a
// malformed value would be attribute-name injection — the typed union guards typed callers).
const HX_ON_EVENT_RE = /^[a-zA-Z][a-zA-Z0-9:_-]*$/;
function resolveId(value) {
    return isId(value) ? value.id : String(value);
}
function el(value) {
    return `document.getElementById('${escapeJs(resolveId(value))}')`;
}
/** The trigger event for an option-widened behavior (`event?`), defaulting to `fallback`. */
function ev(opts, fallback) {
    return typeof opts.event === "string" ? opts.event : fallback;
}
/** The optional second `classList.toggle(cls, force)` argument (` , true`/` , false`), or empty. */
function forceArg(opts) {
    return opts.force !== undefined ? (opts.force ? ", true" : ", false") : "";
}
const renderers = {
    toggle: (opts) => [
        ev(opts, "click"),
        `${el(opts.target)}.classList.toggle('hidden'${forceArg(opts)})`,
    ],
    toggleClass: (opts) => [
        ev(opts, "click"),
        `${el(opts.target)}.classList.toggle('${escapeJs(String(opts.class))}'${forceArg(opts)})`,
    ],
    remove: (opts) => {
        const target = el(opts.target);
        if (opts.animateOut !== undefined) {
            const cls = escapeJs(String(opts.animateOut));
            return [ev(opts, "click"), `${target}.classList.add('${cls}');${target}.addEventListener('transitionend',()=>${target}.remove(),{once:true})`];
        }
        return [ev(opts, "click"), `${target}.remove()`];
    },
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
    back: () => [
        "click",
        "history.back()",
    ],
    formResetOnSwap: () => [
        // htmx 4 lifecycle events are colon-separated (htmx:after:swap); the htmx 1/2
        // kebab alias (htmx:after-swap) is never dispatched, so the listener no-ops.
        "htmx:after:swap",
        "this.reset()",
    ],
    dismissOnEscape: () => [
        "keyup",
        "if(event.key==='Escape')this.remove()",
    ],
    openDialog: (opts) => [
        "click",
        `${el(opts.target)}.showModal()`,
    ],
    closeDialog: (opts) => [
        "click",
        `${el(opts.target)}.close()`,
    ],
};
// ── Implementation ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
Tag.prototype.behavior = function (name, options) {
    if (this.attributes === EMPTY_ATTRS)
        this.attributes = Object.create(null);
    const renderer = renderers[name];
    const [event, js] = renderer(options ?? {});
    // `event` may now come from a user `event?` option, so it becomes part of the
    // attribute NAME — validate it the same way `.hxOn()` does.
    if (!HX_ON_EVENT_RE.test(event)) {
        throw new Error(`Invalid behavior event: "${event}" — expected an event name (letters, digits, ':' '-' '_').`);
    }
    const attr = `hx-on:${event}`;
    const existing = this.attributes[attr];
    this.attributes[attr] = existing ? existing + ";" + js : js;
    return this;
};
// ── .hxOn(event, js) ─────────────────────────────────────────────
// The js is author-authored and stored verbatim; the renderer HTML-attribute-escapes
// it, so it can't break out of the `hx-on:<event>="…"` attribute. The event name is
// validated (it becomes part of the attribute name).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime signature differs from typed overload
Tag.prototype.hxOn = function (event, js) {
    if (!HX_ON_EVENT_RE.test(event)) {
        throw new Error(`Invalid hx-on event: "${event}" — expected an event name (letters, digits, ':' '-' '_').`);
    }
    if (this.attributes === EMPTY_ATTRS)
        this.attributes = Object.create(null);
    const attr = `hx-on:${event}`;
    const existing = this.attributes[attr];
    this.attributes[attr] = existing ? existing + ";" + js : js;
    return this;
};
//# sourceMappingURL=behavior-methods.js.map