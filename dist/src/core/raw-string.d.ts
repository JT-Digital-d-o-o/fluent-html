/**
 * Wrapper for raw HTML strings that bypass XSS escaping.
 * WARNING: Only use with trusted content. Never use with user input.
 */
export declare class RawString {
    readonly html: string;
    constructor(html: string);
}
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
export declare function Raw(html: string): RawString;
//# sourceMappingURL=raw-string.d.ts.map