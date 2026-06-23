import { EMPTY_ATTRS } from "../core/tag.js";
import { isTag, isRawString } from "../core/guards.js";
import { escapeHtml, escapeAttr } from "./escape.js";
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for HTML serialization.
//
// `render()` and `renderToStream()` are thin wrappers over `emit()` — one
// serializer, so they cannot drift (the old design had three: render, stream,
// and the fold renderAlgebra, which has been removed). The traversal is an
// explicit work-stack rather than recursion, so deeply nested trees no longer
// overflow the call stack. Output is byte-identical to the v5 recursive renderer.
// ─────────────────────────────────────────────────────────────────────────────
// HTML void elements — no closing tag, no children
export const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'source', 'track', 'wbr'
]);
/** Accumulates into a string via `+=` (the measured-fastest accumulator). @internal */
export class StringSink {
    constructor() {
        this.html = '';
    }
    append(s) {
        this.html += s;
        return true;
    }
}
/**
 * Pushes each chunk to a `node:stream` Readable; `append` forwards the stream's
 * real backpressure signal (`push()` returns `false` when the buffer is full).
 * The signal is not honored yet — `emit()` is still eager, matching the v5
 * stream — but it is plumbed for the future incremental-streaming path (D-02).
 * @internal
 */
export class StreamSink {
    constructor(stream) {
        this.stream = stream;
    }
    append(s) {
        return this.stream.push(s);
    }
}
// String attrs: escape the value, quote with "
const str = (key) => ({
    key,
    serialize: (v) => ` hx-${key}="${escapeAttr(v)}"`,
});
// Boolean-or-string attrs (pushUrl, replaceUrl, swapOob): pass booleans, escape strings
const boolOrStr = (key, hxKey) => ({
    key,
    serialize: (v) => ` hx-${hxKey ?? key}="${typeof v === 'string' ? escapeAttr(v) : v}"`,
});
// Boolean attrs that render just the value (validate, preserve, boost, ignore)
const boolVal = (key) => ({
    key,
    serialize: (v) => ` hx-${key}="${v}"`,
});
// JSON-or-string attrs (vals, config): stringify objects, escape strings
const jsonOrStr = (key) => ({
    key,
    serialize: (v) => ` hx-${key}="${escapeAttr(typeof v === 'string' ? v : JSON.stringify(v))}"`,
});
// JSON-only attrs (headers): always stringify
const json = (key) => ({
    key,
    serialize: (v) => ` hx-${key}="${escapeAttr(JSON.stringify(v))}"`,
});
const HTMX_ATTRS = [
    str('target'),
    str('swap'),
    boolOrStr('swapOob', 'swap-oob'),
    str('select'),
    str('trigger'),
    boolOrStr('pushUrl', 'push-url'),
    boolOrStr('replaceUrl', 'replace-url'),
    jsonOrStr('vals'),
    json('headers'),
    str('include'),
    str('encoding'),
    boolVal('validate'),
    str('confirm'),
    str('indicator'),
    str('disable'),
    str('sync'),
    boolVal('preserve'),
    boolVal('boost'),
    boolVal('ignore'),
    jsonOrStr('config'),
];
/** Serialize an HTMX config to its attribute string. @internal */
export function buildHtmx(htmx) {
    let result = 'hx-' + htmx.method + '="' + escapeAttr(htmx.endpoint) + '"';
    for (const attr of HTMX_ATTRS) {
        const value = htmx[attr.key];
        if (value !== undefined) {
            result += attr.serialize(value);
        }
    }
    // Special cases: boolean-only attrs
    if (htmx.optimistic !== undefined)
        result += ' hx-optimistic';
    if (htmx.preload !== undefined) {
        result += typeof htmx.preload === 'string'
            ? ' hx-preload="' + htmx.preload + '"'
            : ' hx-preload';
    }
    // Status-code-specific swap behavior
    if (htmx.status) {
        for (const code of Object.keys(htmx.status)) {
            const cfg = htmx.status[code];
            const value = typeof cfg === 'string' ? cfg : buildStatusConfig(cfg);
            result += ' hx-status:' + code + '="' + escapeAttr(value) + '"';
        }
    }
    return result;
}
function buildStatusConfig(cfg) {
    const parts = [];
    if (cfg.swap)
        parts.push('swap:' + cfg.swap);
    if (cfg.target)
        parts.push('target:' + cfg.target);
    if (cfg.select)
        parts.push('select:' + cfg.select);
    if (cfg.push !== undefined)
        parts.push('push:' + cfg.push);
    if (cfg.replace !== undefined)
        parts.push('replace:' + cfg.replace);
    if (cfg.transition !== undefined)
        parts.push('transition:' + cfg.transition);
    return parts.join(' ');
}
// Regex patterns for closing tags inside script/style (case-insensitive)
const SCRIPT_CLOSE_RE = /<\/script/gi;
const STYLE_CLOSE_RE = /<\/style/gi;
/** Sanitize raw context content by escaping closing tags that would break out. @internal */
export function sanitizeRawContent(content, element) {
    if (element === 'script') {
        return content.replace(SCRIPT_CLOSE_RE, '<\\/script');
    }
    return content.replace(STYLE_CLOSE_RE, '<\\/style');
}
/** Build the attribute string for a tag's open element. @internal */
export function buildAttrs(tag) {
    let attrs = '';
    const tid = tag.id;
    if (tid !== undefined)
        attrs += ' id="' + escapeAttr(tid) + '"';
    const tcls = tag.class;
    if (tcls !== undefined)
        attrs += ' class="' + escapeAttr(tcls) + '"';
    const tsty = tag.style;
    if (tsty !== undefined)
        attrs += ' style="' + escapeAttr(tsty) + '"';
    const sk = tag._sk;
    if (sk !== undefined) {
        for (let i = 0; i < sk.length; i++) {
            const value = tag[sk[i]];
            if (value !== undefined && value !== null) {
                attrs += ' ' + sk[i] + '="' + escapeAttr(typeof value === 'string' ? value : String(value)) + '"';
            }
        }
    }
    const extraAttrs = tag.attributes;
    if (extraAttrs !== EMPTY_ATTRS) {
        const extraKeys = Object.keys(extraAttrs);
        for (let i = 0; i < extraKeys.length; i++) {
            const key = extraKeys[i];
            const value = extraAttrs[key];
            if (value !== undefined && value !== null) {
                attrs += ' ' + key + '="' + escapeAttr(String(value)) + '"';
            }
        }
    }
    if (tag.htmx)
        attrs += ' ' + buildHtmx(tag.htmx);
    const toggles = tag.toggles;
    if (toggles !== undefined && toggles.length > 0) {
        attrs += ' ' + toggles.join(' ');
    }
    return attrs;
}
/**
 * Serialize a view tree into `sink`, iteratively (no recursion). Byte-identical
 * to the v5 recursive renderer for the same input. @internal
 */
export function emit(sink, view, ctx) {
    const stack = [{ v: view, c: ctx }];
    while (stack.length > 0) {
        const item = stack.pop();
        // Literal: append verbatim (open tag, close tag, or array separator).
        if (typeof item === 'string') {
            sink.append(item);
            continue;
        }
        const v = item.v;
        const c = item.c;
        if (typeof v === 'string') {
            if (c === 'escape')
                sink.append(escapeHtml(v));
            else if (c === 'raw')
                sink.append(v);
            else
                sink.append(sanitizeRawContent(v, c));
            continue;
        }
        if (isRawString(v)) {
            sink.append(c === 'script' || c === 'style' ? sanitizeRawContent(v.html, c) : v.html);
            continue;
        }
        if (isTag(v)) {
            const el = v.el;
            const open = '<' + el + buildAttrs(v) + '>';
            if (VOID_ELEMENTS.has(el)) {
                sink.append(open);
                continue;
            }
            sink.append(open);
            const childCtx = el === 'script' ? 'script' : el === 'style' ? 'style' : c;
            // Push close first, child second — child pops (and fully expands) before close.
            stack.push('</' + el + '>');
            stack.push({ v: v.child, c: childCtx });
            continue;
        }
        if (Array.isArray(v)) {
            const len = v.length;
            if (len === 0)
                continue;
            if (len === 1) {
                stack.push({ v: v[0], c });
                continue;
            }
            // Emit v[0] '\n' v[1] '\n' … v[len-1]. Push reversed so v[0] pops first.
            for (let i = len - 1; i >= 0; i--) {
                stack.push({ v: v[i], c });
                if (i > 0)
                    stack.push('\n');
            }
            continue;
        }
        // Unknown view kind → emit nothing (matches the v5 `return ''`).
    }
}
//# sourceMappingURL=serialize.js.map