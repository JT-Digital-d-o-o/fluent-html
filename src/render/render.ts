import type { View } from "../core/types.js";
import { isTag } from "../core/guards.js";
import { StringSink, emit } from "./serialize.js";

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
export function render(...views: View[]): string {
  const sink = new StringSink();
  emit(sink, views.length === 1 ? views[0]! : views, 'escape');
  return sink.html;
}

const NONCE_ELEMENTS = new Set(['script', 'style']);

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
export function renderWithNonce(nonce: string, ...views: View[]): string {
  const view = views.length === 1 ? views[0]! : views;
  applyNonce(view, nonce);
  const sink = new StringSink();
  emit(sink, view, 'escape');
  return sink.html;
}

// NOTE: the mutating pre-pass is replaced by render-time nonce threading in D-04
// (non-mutating, single-pass). Kept here unchanged for the D-01 byte-identical step.
function applyNonce(view: View, nonce: string): void {
  if (isTag(view)) {
    if (NONCE_ELEMENTS.has(view.el)) {
      view.setNonce(nonce);
    }
    applyNonce(view.child, nonce);
  } else if (Array.isArray(view)) {
    for (let i = 0; i < view.length; i++) {
      applyNonce(view[i]!, nonce);
    }
  }
}
