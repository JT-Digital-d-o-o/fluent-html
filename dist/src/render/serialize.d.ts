import type { Readable } from "node:stream";
import type { HTMX } from "../htmx.js";
import type { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare const VOID_ELEMENTS: Set<string>;
/**
 * Render context — replaces the old tri-typed `boolean | string` flag.
 * `escape` HTML-escapes text (the default); `raw` passes text through
 * untouched; `script`/`style` sanitize closing tags that would break out.
 * @internal
 */
export type RenderCtx = 'escape' | 'raw' | 'script' | 'style';
/**
 * Output sink. `append` returns a backpressure signal (`false` ⇒ the consumer
 * is full). `StringSink` always returns `true`; a stream sink forwards the real
 * signal. The boolean is structurally present for the future incremental-
 * streaming path; `emit()` does not honor it yet (eager, like the v5 renderer).
 * @internal
 */
export interface Sink {
    append(s: string): boolean;
}
/** Accumulates into a string via `+=` (the measured-fastest accumulator). @internal */
export declare class StringSink implements Sink {
    html: string;
    append(s: string): boolean;
}
/**
 * Pushes each chunk to a `node:stream` Readable; `append` forwards the stream's
 * real backpressure signal (`push()` returns `false` when the buffer is full).
 * The signal is not honored yet — `emit()` is still eager, matching the v5
 * stream — but it is plumbed for the future incremental-streaming path (D-02).
 * @internal
 */
export declare class StreamSink implements Sink {
    private readonly stream;
    constructor(stream: Readable);
    append(s: string): boolean;
}
/** Per-render options bag. Re-exported publicly from the render barrel. */
export type RenderOptions = {
    /**
     * CSP nonce stamped on every `<script>` and `<style>` that has no author-set
     * nonce. Applied at RENDER time — the view tree is never mutated, so a shared
     * layout is safe to reuse across requests. An author `.setNonce(...)` wins.
     */
    readonly nonce?: string;
};
/** Options for the streaming render paths (`renderToStream` / `renderToIterable`). */
export type RenderStreamOptions = RenderOptions & {
    /** Minimum size (chars) of each streamed chunk; smaller writes are batched. Default 16384. */
    readonly chunkSize?: number;
    /** Readable `highWaterMark` (bytes) — the buffer level that triggers backpressure. */
    readonly highWaterMark?: number;
};
/** Default streamed-chunk size (~16 KB) — batches tiny tag writes into useful TCP payloads. */
export declare const DEFAULT_CHUNK_SIZE = 16384;
/**
 * Split variadic render args into the view + render options. The trailing arg is
 * treated as `RenderOptions` iff it is a plain object — i.e. NOT a View (Tag,
 * RawString, array, or string). Views are never plain objects, so this is
 * unambiguous. @internal
 */
export declare function splitArgs(args: readonly unknown[]): {
    view: View;
    opts: RenderStreamOptions | undefined;
};
/** Serialize an HTMX config to its attribute string. @internal */
export declare function buildHtmx(htmx: HTMX): string;
/** Sanitize raw context content by escaping the closing tag that would break out. @internal */
export declare function sanitizeRawContent(content: string, element: 'script' | 'style'): string;
/** Build the attribute string for a tag's open element. @internal */
export declare function buildAttrs(tag: Tag): string;
/**
 * The single serializer, as a generator. Yields HTML in chunks of at least
 * `chunkSize` characters; the explicit work-stack means the tree is walked exactly
 * once (no recursion, no double-render), and the stack state is preserved between
 * yields — so a stream driver can stop pulling when the consumer is full (true
 * backpressure) and resume on the next `.next()`. Joined output is byte-identical
 * to the v5 recursive renderer. @internal
 */
export declare function emitChunks(view: View, ctx: RenderCtx, nonce: string | undefined, chunkSize: number): Generator<string, void, undefined>;
/**
 * Serialize a view tree into `sink` eagerly (whole tree, one pass) — the in-memory
 * string path used by `render()`.
 *
 * This deliberately duplicates the `emitChunks` work-stack rather than draining the
 * generator: a generator forces its locals onto the heap (to survive suspension),
 * which measured ~2–3× slower on this hot path. The two loops share all the volatile
 * serialization logic (`buildAttrs`, escaping, nonce, `sanitizeRawContent`); only the
 * low-churn traversal skeleton is repeated, and the `render` ≡ `renderToIterable`
 * fuzz test guards against drift. @internal
 */
export declare function emit(sink: Sink, view: View, ctx: RenderCtx, nonce?: string): void;
//# sourceMappingURL=serialize.d.ts.map