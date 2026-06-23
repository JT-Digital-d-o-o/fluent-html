import { StringSink, emit, splitArgs } from "./serialize.js";
export function render(...args) {
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
export function renderWithNonce(nonce, ...views) {
    const view = views.length === 1 ? views[0] : views;
    const sink = new StringSink();
    emit(sink, view, 'escape', nonce);
    return sink.html;
}
//# sourceMappingURL=render.js.map