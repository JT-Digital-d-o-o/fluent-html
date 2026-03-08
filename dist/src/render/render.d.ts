import type { View } from "../core/types.js";
/**
 * Render one or more Views to an HTML string.
 *
 * All text content and attributes are automatically HTML-escaped for XSS protection.
 * Pass multiple views (e.g. `Partial` elements) for multi-swap responses.
 *
 * @param views - One or more View trees to render
 * @returns The rendered HTML string
 *
 * @example
 * render(Div(H1("Hello"), P("World")))
 * // '<div><h1>Hello</h1>\n<p>World</p></div>'
 *
 * @example
 * // Multi-swap response
 * render(
 *   Partial(ids.list, UserList(users)),
 *   Partial(ids.count, Span(`${users.length}`)),
 * )
 */
export declare function render(...views: View[]): string;
/**
 * Apply a CSP nonce to all `<script>` and `<style>` tags in the view tree, then render.
 *
 * @param nonce - The CSP nonce string to inject
 * @param views - One or more View trees to render
 * @returns The rendered HTML string with nonce attributes applied
 *
 * @example
 * renderWithNonce("abc123", Script().setSrc("/app.js"), Style("body { margin: 0 }"))
 */
export declare function renderWithNonce(nonce: string, ...views: View[]): string;
//# sourceMappingURL=render.d.ts.map