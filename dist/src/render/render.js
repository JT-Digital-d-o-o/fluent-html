"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.render = render;
const tag_js_1 = require("../core/tag.js");
const raw_string_js_1 = require("../core/raw-string.js");
const escape_js_1 = require("./escape.js");
// Elements whose content should NOT be escaped (they contain code, not text)
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);
function render(view) {
    return renderImpl(view, false);
}
function renderImpl(view, isRawContext) {
    function buildAttributes(attributes) {
        if (!attributes) {
            return "";
        }
        return Object.entries(attributes)
            .map(([key, value]) => {
            if (value === undefined || value === null)
                return "";
            return `${key}="${(0, escape_js_1.escapeAttr)(String(value))}"`;
        })
            .filter(s => s.length > 0)
            .join(" ");
    }
    function buildHtmx(htmx) {
        if (!htmx) {
            return '';
        }
        const attributes = [];
        // Method and endpoint (required)
        attributes.push(`hx-${htmx.method}="${(0, escape_js_1.escapeAttr)(htmx.endpoint)}"`);
        // Targeting & Swapping
        if (htmx.target)
            attributes.push(`hx-target="${(0, escape_js_1.escapeAttr)(htmx.target)}"`);
        if (htmx.swap)
            attributes.push(`hx-swap="${(0, escape_js_1.escapeAttr)(htmx.swap)}"`);
        if (htmx.swapOob !== undefined) {
            attributes.push(`hx-swap-oob="${typeof htmx.swapOob === 'string' ? (0, escape_js_1.escapeAttr)(htmx.swapOob) : htmx.swapOob}"`);
        }
        if (htmx.select)
            attributes.push(`hx-select="${(0, escape_js_1.escapeAttr)(htmx.select)}"`);
        if (htmx.selectOob)
            attributes.push(`hx-select-oob="${(0, escape_js_1.escapeAttr)(htmx.selectOob)}"`);
        // Triggering
        if (htmx.trigger)
            attributes.push(`hx-trigger="${(0, escape_js_1.escapeAttr)(htmx.trigger)}"`);
        // URL manipulation
        if (htmx.pushUrl !== undefined) {
            attributes.push(`hx-push-url="${typeof htmx.pushUrl === 'string' ? (0, escape_js_1.escapeAttr)(htmx.pushUrl) : htmx.pushUrl}"`);
        }
        if (htmx.replaceUrl !== undefined) {
            attributes.push(`hx-replace-url="${typeof htmx.replaceUrl === 'string' ? (0, escape_js_1.escapeAttr)(htmx.replaceUrl) : htmx.replaceUrl}"`);
        }
        // Data
        if (htmx.vals) {
            attributes.push(`hx-vals='${typeof htmx.vals === 'string' ? (0, escape_js_1.escapeAttr)(htmx.vals) : JSON.stringify(htmx.vals)}'`);
        }
        if (htmx.headers)
            attributes.push(`hx-headers='${JSON.stringify(htmx.headers)}'`);
        if (htmx.include)
            attributes.push(`hx-include="${(0, escape_js_1.escapeAttr)(htmx.include)}"`);
        if (htmx.params)
            attributes.push(`hx-params="${(0, escape_js_1.escapeAttr)(htmx.params)}"`);
        if (htmx.encoding)
            attributes.push(`hx-encoding="${(0, escape_js_1.escapeAttr)(htmx.encoding)}"`);
        // Validation & Confirmation
        if (htmx.validate !== undefined)
            attributes.push(`hx-validate="${htmx.validate}"`);
        if (htmx.confirm)
            attributes.push(`hx-confirm="${(0, escape_js_1.escapeAttr)(htmx.confirm)}"`);
        if (htmx.prompt)
            attributes.push(`hx-prompt="${(0, escape_js_1.escapeAttr)(htmx.prompt)}"`);
        // Loading states
        if (htmx.indicator)
            attributes.push(`hx-indicator="${(0, escape_js_1.escapeAttr)(htmx.indicator)}"`);
        if (htmx.disabledElt)
            attributes.push(`hx-disabled-elt="${(0, escape_js_1.escapeAttr)(htmx.disabledElt)}"`);
        // Synchronization
        if (htmx.sync)
            attributes.push(`hx-sync="${(0, escape_js_1.escapeAttr)(htmx.sync)}"`);
        // Extensions
        if (htmx.ext)
            attributes.push(`hx-ext="${(0, escape_js_1.escapeAttr)(htmx.ext)}"`);
        // Inheritance control
        if (htmx.disinherit)
            attributes.push(`hx-disinherit="${(0, escape_js_1.escapeAttr)(htmx.disinherit)}"`);
        if (htmx.inherit)
            attributes.push(`hx-inherit="${(0, escape_js_1.escapeAttr)(htmx.inherit)}"`);
        // History
        if (htmx.history !== undefined)
            attributes.push(`hx-history="${htmx.history}"`);
        if (htmx.historyElt !== undefined)
            attributes.push(`hx-history-elt="${htmx.historyElt}"`);
        // Preservation
        if (htmx.preserve !== undefined)
            attributes.push(`hx-preserve="${htmx.preserve}"`);
        // Request configuration
        if (htmx.request)
            attributes.push(`hx-request="${(0, escape_js_1.escapeAttr)(htmx.request)}"`);
        // Boosting
        if (htmx.boost !== undefined)
            attributes.push(`hx-boost="${htmx.boost}"`);
        // Disable htmx processing
        if (htmx.disable !== undefined)
            attributes.push(`hx-disable="${htmx.disable}"`);
        return attributes.join(' ');
    }
    // RawString bypasses escaping - used for trusted HTML content
    if (view instanceof raw_string_js_1.RawString) {
        return view.html;
    }
    if (typeof view === "string") {
        return isRawContext ? view : (0, escape_js_1.escapeHtml)(view);
    }
    if (view instanceof tag_js_1.Tag) {
        // Build base attributes, excluding internal properties
        const baseAttrs = {};
        Object.assign(baseAttrs, view);
        Object.assign(baseAttrs, view.attributes);
        // Exclude internal properties from rendering
        baseAttrs.el = undefined;
        baseAttrs.htmx = undefined;
        baseAttrs.child = undefined;
        baseAttrs.toggles = undefined;
        baseAttrs.attributes = undefined;
        const childIsRaw = RAW_TEXT_ELEMENTS.has(view.el);
        const renderedChild = renderImpl(view.child, childIsRaw);
        const parts = [];
        const renderedAttributes = buildAttributes(baseAttrs);
        if (renderedAttributes)
            parts.push(renderedAttributes);
        const renderedHtmx = buildHtmx(view.htmx);
        if (renderedHtmx)
            parts.push(renderedHtmx);
        if (view.toggles && view.toggles.length > 0) {
            parts.push(view.toggles.join(" "));
        }
        const attrsString = parts.length > 0 ? " " + parts.join(" ") : "";
        return `<${view.el}${attrsString}>${renderedChild}</${view.el}>`;
    }
    if (Array.isArray(view)) {
        return view.map(innerView => renderImpl(innerView, isRawContext)).join("\n");
    }
    return "";
}
//# sourceMappingURL=render.js.map