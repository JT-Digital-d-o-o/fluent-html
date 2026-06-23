import { Readable } from "node:stream";
import type { View } from "../core/types.js";
/**
 * Render one or more Views to a Node.js Readable stream.
 *
 * Variadic and symmetric with `render` — pass multiple views (e.g. `Partial`
 * elements) for a multi-swap response, no array wrapper needed. Routes through
 * the same `emit()` serializer as `render`, so the bytes are identical; chunks
 * are pushed at tag boundaries to flush early bytes for large SSR responses.
 *
 * @example
 * renderToStream(PageView())
 * renderToStream(Partial(ids.list, L()), Partial(ids.count, C()))  // multi-swap
 */
export declare function renderToStream(...views: View[]): Readable;
//# sourceMappingURL=stream.d.ts.map