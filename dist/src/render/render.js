"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
const tag_js_1 = require("../core/tag.js");
const escape_js_1 = require("./escape.js");
// HTML void elements — no closing tag, no children
const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'source', 'track', 'wbr'
]);
function render(view) {
    return renderImpl(view, false);
}
function buildHtmx(htmx) {
    let result = 'hx-' + htmx.method + '="' + (0, escape_js_1.escapeAttr)(htmx.endpoint) + '"';
    if (htmx.target)
        result += ' hx-target="' + (0, escape_js_1.escapeAttr)(htmx.target) + '"';
    if (htmx.swap)
        result += ' hx-swap="' + (0, escape_js_1.escapeAttr)(htmx.swap) + '"';
    if (htmx.swapOob !== undefined) {
        result += ' hx-swap-oob="' + (typeof htmx.swapOob === 'string' ? (0, escape_js_1.escapeAttr)(htmx.swapOob) : htmx.swapOob) + '"';
    }
    if (htmx.select)
        result += ' hx-select="' + (0, escape_js_1.escapeAttr)(htmx.select) + '"';
    if (htmx.selectOob)
        result += ' hx-select-oob="' + (0, escape_js_1.escapeAttr)(htmx.selectOob) + '"';
    if (htmx.trigger)
        result += ' hx-trigger="' + (0, escape_js_1.escapeAttr)(htmx.trigger) + '"';
    if (htmx.pushUrl !== undefined) {
        result += ' hx-push-url="' + (typeof htmx.pushUrl === 'string' ? (0, escape_js_1.escapeAttr)(htmx.pushUrl) : htmx.pushUrl) + '"';
    }
    if (htmx.replaceUrl !== undefined) {
        result += ' hx-replace-url="' + (typeof htmx.replaceUrl === 'string' ? (0, escape_js_1.escapeAttr)(htmx.replaceUrl) : htmx.replaceUrl) + '"';
    }
    if (htmx.vals) {
        result += " hx-vals='" + (typeof htmx.vals === 'string' ? (0, escape_js_1.escapeAttr)(htmx.vals) : JSON.stringify(htmx.vals)) + "'";
    }
    if (htmx.headers)
        result += " hx-headers='" + JSON.stringify(htmx.headers) + "'";
    if (htmx.include)
        result += ' hx-include="' + (0, escape_js_1.escapeAttr)(htmx.include) + '"';
    if (htmx.params)
        result += ' hx-params="' + (0, escape_js_1.escapeAttr)(htmx.params) + '"';
    if (htmx.encoding)
        result += ' hx-encoding="' + (0, escape_js_1.escapeAttr)(htmx.encoding) + '"';
    if (htmx.validate !== undefined)
        result += ' hx-validate="' + htmx.validate + '"';
    if (htmx.confirm)
        result += ' hx-confirm="' + (0, escape_js_1.escapeAttr)(htmx.confirm) + '"';
    if (htmx.prompt)
        result += ' hx-prompt="' + (0, escape_js_1.escapeAttr)(htmx.prompt) + '"';
    if (htmx.indicator)
        result += ' hx-indicator="' + (0, escape_js_1.escapeAttr)(htmx.indicator) + '"';
    if (htmx.disabledElt)
        result += ' hx-disabled-elt="' + (0, escape_js_1.escapeAttr)(htmx.disabledElt) + '"';
    if (htmx.sync)
        result += ' hx-sync="' + (0, escape_js_1.escapeAttr)(htmx.sync) + '"';
    if (htmx.ext)
        result += ' hx-ext="' + (0, escape_js_1.escapeAttr)(htmx.ext) + '"';
    if (htmx.disinherit)
        result += ' hx-disinherit="' + (0, escape_js_1.escapeAttr)(htmx.disinherit) + '"';
    if (htmx.inherit)
        result += ' hx-inherit="' + (0, escape_js_1.escapeAttr)(htmx.inherit) + '"';
    if (htmx.history !== undefined)
        result += ' hx-history="' + htmx.history + '"';
    if (htmx.historyElt !== undefined)
        result += ' hx-history-elt="' + htmx.historyElt + '"';
    if (htmx.preserve !== undefined)
        result += ' hx-preserve="' + htmx.preserve + '"';
    if (htmx.request)
        result += ' hx-request="' + (0, escape_js_1.escapeAttr)(htmx.request) + '"';
    if (htmx.boost !== undefined)
        result += ' hx-boost="' + htmx.boost + '"';
    if (htmx.disable !== undefined)
        result += ' hx-disable="' + htmx.disable + '"';
    return result;
}
function renderImpl(view, isRawContext) {
    if (typeof view === "string") {
        return isRawContext ? view : (0, escape_js_1.escapeHtml)(view);
    }
    const vt = view._t;
    if (vt === 2) {
        return view.html;
    }
    if (vt === 1) {
        const tag = view;
        const el = tag.el;
        let attrs = '';
        const tid = tag.id;
        if (tid !== undefined)
            attrs += ' id="' + (0, escape_js_1.escapeAttr)(tid) + '"';
        const tcls = tag.class;
        if (tcls !== undefined)
            attrs += ' class="' + (0, escape_js_1.escapeAttr)(tcls) + '"';
        const tsty = tag.style;
        if (tsty !== undefined)
            attrs += ' style="' + (0, escape_js_1.escapeAttr)(tsty) + '"';
        const sk = tag._sk;
        if (sk !== undefined) {
            for (let i = 0; i < sk.length; i++) {
                const value = tag[sk[i]];
                if (value !== undefined && value !== null) {
                    attrs += ' ' + sk[i] + '="' + (0, escape_js_1.escapeAttr)(typeof value === 'string' ? value : String(value)) + '"';
                }
            }
        }
        const extraAttrs = tag.attributes;
        if (extraAttrs !== tag_js_1.EMPTY_ATTRS) {
            const extraKeys = Object.keys(extraAttrs);
            for (let i = 0; i < extraKeys.length; i++) {
                const key = extraKeys[i];
                const value = extraAttrs[key];
                if (value !== undefined && value !== null) {
                    attrs += ' ' + key + '="' + (0, escape_js_1.escapeAttr)(String(value)) + '"';
                }
            }
        }
        if (tag.htmx)
            attrs += ' ' + buildHtmx(tag.htmx);
        const toggles = tag.toggles;
        if (toggles !== undefined && toggles.length > 0) {
            attrs += ' ' + toggles.join(' ');
        }
        if (VOID_ELEMENTS.has(el))
            return '<' + el + attrs + '>';
        return '<' + el + attrs + '>' + renderImpl(tag.child, el === 'script' || el === 'style') + '</' + el + '>';
    }
    if (Array.isArray(view)) {
        const len = view.length;
        if (len === 0)
            return '';
        let result = renderImpl(view[0], isRawContext);
        for (let i = 1; i < len; i++) {
            result += '\n' + renderImpl(view[i], isRawContext);
        }
        return result;
    }
    return '';
}
//# sourceMappingURL=render.js.map