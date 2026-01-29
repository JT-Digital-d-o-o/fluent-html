"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlEscapes = void 0;
exports.escapeHtml = escapeHtml;
exports.escapeAttr = escapeAttr;
// Escape map — kept as public API for consumers
exports.htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};
// HTML escape to prevent XSS — manual charCode scan for speed
function escapeHtml(unsafe) {
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
// For attribute values
function escapeAttr(unsafe) {
    return escapeHtml(unsafe);
}
//# sourceMappingURL=escape.js.map