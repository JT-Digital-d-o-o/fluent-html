// Escape map — kept as public API for consumers
export const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};
// HTML escape to prevent XSS — manual charCode scan for speed
export function escapeHtml(unsafe) {
    let result = '';
    let lastIdx = 0;
    for (let i = 0; i < unsafe.length; i++) {
        const ch = unsafe.charCodeAt(i);
        let escaped;
        if (ch === 38)
            escaped = '&amp;'; // &
        else if (ch === 60)
            escaped = '&lt;'; // <
        else if (ch === 62)
            escaped = '&gt;'; // >
        else if (ch === 34)
            escaped = '&quot;'; // "
        else if (ch === 39)
            escaped = '&#39;'; // '
        else
            continue;
        result += unsafe.substring(lastIdx, i) + escaped;
        lastIdx = i + 1;
    }
    if (lastIdx === 0)
        return unsafe; // No escaping needed — fast path
    return result + unsafe.substring(lastIdx);
}
/**
 * Escape a string for use in a double-quoted HTML attribute value.
 * Currently identical to `escapeHtml` — sufficient because the renderer
 * always emits double-quoted attributes. If unquoted or single-quoted
 * attributes are ever supported, this would need to also escape
 * backticks, equals signs, etc.
 */
export function escapeAttr(unsafe) {
    return escapeHtml(unsafe);
}
/**
 * Escape a string for embedding inside a SINGLE-QUOTED JavaScript string literal
 * — e.g. the JS the behavior system writes into `hx-on:*` attributes. Escapes the
 * backslash and single quote (which would close/break the literal) plus the line
 * terminators that are illegal inside a string literal (`\n`, `\r`, U+2028, U+2029).
 * The renderer HTML-attribute-escapes the result on top, so both layers are covered.
 *
 * Note: this is for the `hx-on:*` ATTRIBUTE path. Content destined for a raw
 * `<script>` body needs the `</script>` break-out guard (`sanitizeRawContent`) too.
 */
export function escapeJs(unsafe) {
    return unsafe
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
}
//# sourceMappingURL=escape.js.map