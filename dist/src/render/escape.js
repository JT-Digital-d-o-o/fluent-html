"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.htmlEscapes = void 0;
exports.escapeHtml = escapeHtml;
exports.escapeAttr = escapeAttr;
// HTML escape to prevent XSS
exports.htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"']/g, (char) => exports.htmlEscapes[char]);
}
// For attribute values
function escapeAttr(unsafe) {
    return escapeHtml(unsafe);
}
//# sourceMappingURL=escape.js.map