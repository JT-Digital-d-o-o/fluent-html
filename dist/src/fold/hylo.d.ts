import type { ViewAlgebra } from "./types.js";
import type { ViewCoalgebra } from "./types.js";
/**
 * Hylomorphism — fused unfold-then-fold in a single pass.
 * Expands a seed via the coalgebra and immediately folds each layer
 * via the algebra, without allocating an intermediate View tree.
 *
 * @param coalg - The coalgebra defining how to expand each seed
 * @param alg - The algebra defining how to fold each layer
 * @param seed - The initial seed value
 * @returns The result of unfolding and folding in one pass
 *
 * @example
 * // Convert flat data directly to HTML without materializing the tree
 * const html = hyloView(tocCoalgebra, renderAlgebra, headings);
 */
export declare function hyloView<S, A>(coalg: ViewCoalgebra<S>, alg: ViewAlgebra<A>, seed: S): A;
//# sourceMappingURL=hylo.d.ts.map