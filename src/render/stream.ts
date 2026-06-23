import { Readable } from "node:stream";
import type { View } from "../core/types.js";
import { StreamSink, emit, splitArgs, type RenderOptions } from "./serialize.js";

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
export function renderToStream(...views: View[]): Readable;
export function renderToStream(view: View, opts: RenderOptions): Readable;
export function renderToStream(...args: (View | RenderOptions)[]): Readable {
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
export function renderToStreamWithNonce(nonce: string, view: View): Readable {
  return new Readable({
    read() {
      emit(new StreamSink(this), view, 'escape', nonce);
      this.push(null);
    },
  });
}
