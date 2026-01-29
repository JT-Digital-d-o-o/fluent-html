"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawString = void 0;
exports.Raw = Raw;
/**
 * Wrapper for raw HTML strings that bypass XSS escaping.
 * WARNING: Only use with trusted content. Never use with user input.
 */
class RawString {
    constructor(html) {
        this.html = html;
    }
}
exports.RawString = RawString;
/** @internal */
RawString.prototype._t = 2;
/**
 * Creates a raw HTML string that will NOT be escaped during rendering.
 * WARNING: This bypasses XSS protection. Only use with trusted content.
 * Never use with user-provided input.
 *
 * @example
 * // Render pre-sanitized markdown HTML
 * Div(Raw(markdownToHtml(trustedContent)))
 *
 * // Render trusted SVG
 * Div(Raw('<svg>...</svg>'))
 */
function Raw(html) {
    return new RawString(html);
}
//# sourceMappingURL=raw-string.js.map