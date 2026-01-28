import type { View } from "../core/types.js";
import type { ViewAlgebra } from "./types.js";
/**
 * Catamorphism over View structures.
 * Recursively folds a View into a result type A using the provided algebra.
 *
 * @param alg - The algebra defining how to fold each View component
 * @param view - The View to fold
 * @returns The result of folding the View
 *
 * @example
 * // Count all elements
 * const count = foldView(countAlgebra, myView);
 *
 * @example
 * // Extract all text
 * const text = foldView(textAlgebra, myView);
 *
 * @example
 * // Custom algebra
 * const elementNames = foldView({
 *   text: () => [],
 *   raw: () => [],
 *   tag: (el, _, childNames) => [el, ...childNames],
 *   list: (arrays) => arrays.flat(),
 * }, myView);
 */
export declare function foldView<A>(alg: ViewAlgebra<A>, view: View): A;
//# sourceMappingURL=fold.d.ts.map