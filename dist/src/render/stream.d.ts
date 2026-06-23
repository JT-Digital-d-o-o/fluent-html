import { Readable } from "node:stream";
import type { View } from "../core/types.js";
import { type RenderOptions } from "./serialize.js";
/**
 * Render one or more Views to a Node.js Readable stream.
 *
 * Variadic and symmetric with `render` — pass multiple views (e.g. `Partial`
 * elements) for a multi-swap response, or a single view plus `{ nonce }` for a
 * render-time CSP nonce. Routes through the same `emit()` serializer as `render`,
 * so the bytes are identical; chunks are pushed at tag boundaries.
 *
 * @example
 * renderToStream(PageView())
 * renderToStream(Partial(ids.list, L()), Partial(ids.count, C()))  // multi-swap
 * renderToStream(PageView(), { nonce })                            // streaming + CSP
 */
export declare function renderToStream(...views: View[]): Readable;
export declare function renderToStream(view: View, opts: RenderOptions): Readable;
/**
 * Streaming counterpart to `renderWithNonce` — applies a render-time CSP nonce to
 * every `<script>`/`<style>` without an author nonce. Non-mutating.
 */
export declare function renderToStreamWithNonce(nonce: string, view: View): Readable;
//# sourceMappingURL=stream.d.ts.map