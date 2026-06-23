import type { View } from "../core/types.js";
import { StringSink, emit, splitArgs, type RenderOptions } from "./serialize.js";

/**
 * Render one or more Views to an HTML string.
 *
 * All text content and attributes are automatically HTML-escaped for XSS protection.
 * Pass multiple views (e.g. `Partial` elements) for multi-swap responses, or a
 * single view plus `{ nonce }` to stamp a render-time CSP nonce.
 *
 * @example
 * render(Div(H1("Hello"), P("World")))
 * // '<div><h1>Hello</h1>\n<p>World</p></div>'
 *
 * @example
 * // Multi-swap response
 * render(Partial(ids.list, UserList(users)), Partial(ids.count, Span(`${users.length}`)))
 *
 * @example
 * // Render-time CSP nonce (non-mutating)
 * render(PageView(), { nonce: reply.cspNonce.script })
 */
export function render(...views: View[]): string;
export function render(view: View, opts: RenderOptions): string;
export function render(...args: (View | RenderOptions)[]): string {
  const { view, opts } = splitArgs(args);
  const sink = new StringSink();
  emit(sink, view, 'escape', opts?.nonce);
  return sink.html;
}

/**
 * Render with a CSP nonce applied to every `<script>` and `<style>` that has no
 * author-set nonce. Render-time and **non-mutating** — the view tree is never
 * written to, so a shared layout is safe to reuse across requests.
 *
 * @example
 * renderWithNonce("abc123", Script().setSrc("/app.js"), Style("body { margin: 0 }"))
 */
export function renderWithNonce(nonce: string, ...views: View[]): string {
  const view = views.length === 1 ? views[0]! : views;
  const sink = new StringSink();
  emit(sink, view, 'escape', nonce);
  return sink.html;
}
