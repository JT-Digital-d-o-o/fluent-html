import { Readable } from "node:stream";
import { emitChunks, splitArgs, DEFAULT_CHUNK_SIZE, } from "./serialize.js";
export function renderToStream(...args) {
    const { view, opts } = splitArgs(args);
    return streamOf(view, opts?.nonce, opts?.chunkSize, opts?.highWaterMark);
}
/**
 * Streaming counterpart to `renderWithNonce` — applies a render-time CSP nonce to
 * every `<script>`/`<style>` without an author nonce. Non-mutating.
 */
export function renderToStreamWithNonce(nonce, view) {
    return streamOf(view, nonce, undefined, undefined);
}
/**
 * Render a view to an iterable of HTML chunks — sink-agnostic backpressure. The
 * generator suspends between chunks, so the caller pulls at its own pace (e.g. a
 * Web `ReadableStream`, an async iterator, or a test). Walks the tree once.
 *
 * @example
 * for (const chunk of renderToIterable(PageView())) socket.write(chunk);
 */
export function renderToIterable(view, options) {
    return emitChunks(view, 'escape', options?.nonce, options?.chunkSize ?? DEFAULT_CHUNK_SIZE);
}
function streamOf(view, nonce, chunkSize, highWaterMark) {
    const gen = emitChunks(view, 'escape', nonce, chunkSize ?? DEFAULT_CHUNK_SIZE);
    return new Readable({
        highWaterMark,
        read() {
            // Pull from the generator until the consumer signals "full" (push === false)
            // or the walk completes. On "full" we return; Node calls read() again when the
            // buffer drains, and the suspended generator resumes exactly where it stopped.
            try {
                let next = gen.next();
                while (!next.done) {
                    if (!this.push(next.value))
                        return;
                    next = gen.next();
                }
                this.push(null);
            }
            catch (err) {
                // A throw mid-walk (e.g. an invalid hx-status key) destroys the stream.
                this.destroy(err);
            }
        },
    });
}
//# sourceMappingURL=stream.js.map