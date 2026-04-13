import type { View } from "../core/types.js";
import type { ViewCoalgebra } from "./types.js";
/**
 * Anamorphism over View structures.
 * Builds a View tree by repeatedly unfolding a seed value using the coalgebra.
 * The dual of `foldView` — instead of collapsing a tree into a value,
 * it grows a tree from a seed.
 *
 * @param coalg - The coalgebra defining how to expand each seed into a View layer
 * @param seed - The initial seed value
 * @returns The unfolded View tree
 *
 * @example
 * // Build a nested <ul> from a flat heading list
 * const toc = unfoldView(tocCoalgebra, headings);
 */
export declare function unfoldView<S>(coalg: ViewCoalgebra<S>, seed: S): View;
//# sourceMappingURL=unfold.d.ts.map