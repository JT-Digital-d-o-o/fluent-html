import { Readable } from "node:stream";
import type { View } from "../core/types.js";
import {
  emitChunks, splitArgs, DEFAULT_CHUNK_SIZE,
  type RenderStreamOptions,
} from "./serialize.js";

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
export function renderToStream(...views: View[]): Readable;
export function renderToStream(view: View, opts: RenderStreamOptions): Readable;
export function renderToStream(...args: (View | RenderStreamOptions)[]): Readable {
  const { view, opts } = splitArgs(args);
  return streamOf(view, opts?.nonce, opts?.chunkSize, opts?.highWaterMark);
}

/**
 * Streaming counterpart to `renderWithNonce` — applies a render-time CSP nonce to
 * every `<script>`/`<style>` without an author nonce. Non-mutating.
 */
export function renderToStreamWithNonce(nonce: string, view: View): Readable {
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
export function renderToIterable(view: View, options?: RenderStreamOptions): Generator<string, void, undefined> {
  return emitChunks(view, 'escape', options?.nonce, options?.chunkSize ?? DEFAULT_CHUNK_SIZE);
}

function streamOf(view: View, nonce: string | undefined, chunkSize: number | undefined, highWaterMark: number | undefined): Readable {
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
          if (!this.push(next.value)) return;
          next = gen.next();
        }
        this.push(null);
      } catch (err) {
        // A throw mid-walk (e.g. an invalid hx-status key) destroys the stream.
        this.destroy(err as Error);
      }
    },
  });
}
