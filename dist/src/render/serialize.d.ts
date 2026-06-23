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
/**
 * Split variadic render args into the view + render options. The trailing arg is
 * treated as `RenderOptions` iff it is a plain object — i.e. NOT a View (Tag,
 * RawString, array, or string). Views are never plain objects, so this is
 * unambiguous. @internal
 */
export declare function splitArgs(args: readonly unknown[]): {
    view: View;
    nonce: string | undefined;
};
/** Serialize an HTMX config to its attribute string. @internal */
export declare function buildHtmx(htmx: HTMX): string;
/** Sanitize raw context content by escaping closing tags that would break out. @internal */
export declare function sanitizeRawContent(content: string, element: 'script' | 'style'): string;
/** Build the attribute string for a tag's open element. @internal */
export declare function buildAttrs(tag: Tag): string;
/**
 * Serialize a view tree into `sink`, iteratively (no recursion). Byte-identical
 * to the v5 recursive renderer for the same input.
 *
 * `nonce`, when set, is stamped on every `<script>`/`<style>` that has no
 * author-set nonce — at render time, without mutating the tree. @internal
 */
export declare function emit(sink: Sink, view: View, ctx: RenderCtx, nonce?: string): void;
//# sourceMappingURL=serialize.d.ts.map