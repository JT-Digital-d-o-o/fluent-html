import type { ViewAlgebra } from "../types.js";
/**
 * Algebra that counts all elements in a View.
 *
 * @example
 * const view = Div([P("Hello"), P("World")]);
 * const count = foldView(countAlgebra, view);  // 3
 */
export declare const countAlgebra: ViewAlgebra<number>;
//# sourceMappingURL=count.d.ts.map