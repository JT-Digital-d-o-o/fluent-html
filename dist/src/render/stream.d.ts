import { Readable } from "node:stream";
import type { View } from "../core/types.js";
import { type RenderStreamOptions } from "./serialize.js";
/**
 * Render one or more Views to a Node.js Readable stream with **true backpressure**.
 *
 * Variadic and symmetric with `render`. The view is walked by a generator that
 * suspends mid-tree when the consumer's buffer is full (`push()` returns `false`)
 * and resumes when it drains — so memory stays bounded under slow clients, and the
 * tree is walked exactly once. Pass `{ nonce }`, `{ chunkSize }`, or
 * `{ highWaterMark }` to tune CSP and chunking.
 *
 * @example
 * renderToStream(PageView())
 * renderToStream(Partial(ids.list, L()), Partial(ids.count, C()))  // multi-swap
 * renderToStream(PageView(), { nonce, chunkSize: 8192 })
 */
export declare function renderToStream(...views: View[]): Readable;
export declare function renderToStream(view: View, opts: RenderStreamOptions): Readable;
/**
 * Streaming counterpart to `renderWithNonce` — applies a render-time CSP nonce to
 * every `<script>`/`<style>` without an author nonce. Non-mutating.
 */
export declare function renderToStreamWithNonce(nonce: string, view: View): Readable;
/**
 * Render a view to an iterable of HTML chunks — sink-agnostic backpressure. The
 * generator suspends between chunks, so the caller pulls at its own pace (e.g. a
 * Web `ReadableStream`, an async iterator, or a test). Walks the tree once.
 *
 * @example
 * for (const chunk of renderToIterable(PageView())) socket.write(chunk);
 */
export declare function renderToIterable(view: View, options?: RenderStreamOptions): Generator<string, void, undefined>;
//# sourceMappingURL=stream.d.ts.map