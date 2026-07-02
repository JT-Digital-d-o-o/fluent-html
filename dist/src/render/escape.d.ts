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
/**
 * Neutralize a URL that would execute script or load an attacker-authored
 * document when placed in a navigable/loadable attribute (`href`, `src`,
 * `action`, `formaction`, `data`, `poster`, `cite`). `javascript:` and
 * `vbscript:` are always blocked; `data:` is blocked except for non-scriptable
 * media types. Relative URLs, fragments, query refs, protocol-relative
 * `//host`, and ordinary `http(s)`/`mailto`/`tel` values pass through unchanged.
 *
 * Returns the original string when safe, or `"about:blank"` when blocked.
 *
 * Applied automatically by the typed URL setters (`setHref`/`setSrc`/…). The
 * untyped `addAttribute(...)` escape hatch is intentionally NOT sanitized — reach
 * for it deliberately in the rare case you need a `javascript:` URL.
 */
export declare function sanitizeUrl(url: string): string;
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
export declare function escapeJs(unsafe: string): string;
//# sourceMappingURL=escape.d.ts.map