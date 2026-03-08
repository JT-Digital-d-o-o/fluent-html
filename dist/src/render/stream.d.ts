import { Readable } from "node:stream";
import type { View } from "../core/types.js";
/**
 * Render a view tree to a Node.js Readable stream.
 *
 * Chunks are yielded at tag boundaries — open tag + attributes is one chunk,
 * children are yielded recursively, and close tag is another chunk.
 * This enables flushing early bytes to the client for large SSR responses.
 */
export declare function renderToStream(view: View): Readable;
//# sourceMappingURL=stream.d.ts.map