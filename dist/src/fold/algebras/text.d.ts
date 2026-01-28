import type { ViewAlgebra } from "../types.js";
/**
 * Algebra that extracts all plain text content from a View.
 * Block-level elements add newlines for readability.
 *
 * @example
 * const heading = H1("Welcome to my site");
 * const text = foldView(textAlgebra, heading);  // "Welcome to my site\n"
 */
export declare const textAlgebra: ViewAlgebra<string>;
//# sourceMappingURL=text.d.ts.map