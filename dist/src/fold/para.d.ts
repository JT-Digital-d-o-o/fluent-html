import type { View } from "../core/types.js";
import type { ParaAlgebra } from "./types.js";
/**
 * Paramorphism over View structures.
 * Like `foldView`, but the `tag` case receives both the folded children AND
 * the original View subtree — useful when you need to inspect the original
 * node while processing already-folded results.
 *
 * @param alg - The para-algebra defining how to fold each View component
 * @param view - The View to fold
 * @returns The result of folding the View
 *
 * @example
 * // Wrap every <a> in a tooltip showing its href
 * const result = paraView({
 *   text: (s) => s,
 *   raw: (html) => html,
 *   tag: (el, attrs, children, original) => { ... },
 *   list: (children) => children.join(""),
 * }, myView);
 */
export declare function paraView<A>(alg: ParaAlgebra<A>, view: View): A;
//# sourceMappingURL=para.d.ts.map