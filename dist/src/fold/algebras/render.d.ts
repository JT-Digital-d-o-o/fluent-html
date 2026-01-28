import type { ViewAlgebra } from "../types.js";
/**
 * Algebra that renders a View to an HTML string.
 * This provides an alternative implementation to the render() function
 * using the fold pattern.
 *
 * Note: For production use, the optimized render() function is recommended.
 * This algebra is useful for understanding the structure and for custom
 * rendering scenarios.
 *
 * @example
 * const html = foldView(renderAlgebra, myView);
 */
export declare const renderAlgebra: ViewAlgebra<string>;
//# sourceMappingURL=render.d.ts.map