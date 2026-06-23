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
/** Serialize an HTMX config to its attribute string. @internal */
export declare function buildHtmx(htmx: HTMX): string;
/** Sanitize raw context content by escaping closing tags that would break out. @internal */
export declare function sanitizeRawContent(content: string, element: 'script' | 'style'): string;
/** Build the attribute string for a tag's open element. @internal */
export declare function buildAttrs(tag: Tag): string;
/**
 * Serialize a view tree into `sink`, iteratively (no recursion). Byte-identical
 * to the v5 recursive renderer for the same input. @internal
 */
export declare function emit(sink: Sink, view: View, ctx: RenderCtx): void;
//# sourceMappingURL=serialize.d.ts.map