export declare const htmlEscapes: Record<string, string>;
export declare function escapeHtml(unsafe: string): string;
/**
 * Escape a string for use in a double-quoted HTML attribute value.
 * Currently identical to `escapeHtml` — sufficient because the renderer
 * always emits double-quoted attributes. If unquoted or single-quoted
 * attributes are ever supported, this would need to also escape
 * backticks, equals signs, etc.
 */
export declare function escapeAttr(unsafe: string): string;
//# sourceMappingURL=escape.d.ts.map