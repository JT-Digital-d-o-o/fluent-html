import type { EmitShape } from "./types.js";
/**
 * Map an emit shape + parsed string arguments to the class string(s) it
 * produces. Total over {@link EmitShape}; returns `[]` for arg counts a shape
 * doesn't accept (e.g. a `prefix` row called with no args).
 */
export declare function emitClasses(shape: EmitShape, args?: readonly string[]): string[];
/**
 * The stable Tailwind class prefix for a styling method (`padding` → `p`,
 * `background` → `bg`, `bold` → `font-bold`). Throws for unknown methods or
 * shapes without a stable prefix (`value`/`custom`) — a loud failure that
 * catches typos at the call site.
 */
export declare function prefixOf(method: string): string;
//# sourceMappingURL=emit.d.ts.map