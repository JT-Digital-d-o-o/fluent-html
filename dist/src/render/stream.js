import { Readable } from "node:stream";
import { StreamSink, emit, splitArgs } from "./serialize.js";
export function renderToStream(...args) {
    const { view, nonce } = splitArgs(args);
    return new Readable({
        read() {
            emit(new StreamSink(this), view, 'escape', nonce);
            this.push(null);
        },
    });
}
/**
 * Streaming counterpart to `renderWithNonce` — applies a render-time CSP nonce to
 * every `<script>`/`<style>` without an author nonce. Non-mutating.
 */
export function renderToStreamWithNonce(nonce, view) {
    return new Readable({
        read() {
            emit(new StreamSink(this), view, 'escape', nonce);
            this.push(null);
        },
    });
}
//# sourceMappingURL=stream.js.map