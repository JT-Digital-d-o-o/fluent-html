import type { ParaAlgebra } from "../types.js";
/**
 * Para-algebra that generates aria descriptions from tag structure.
 * For each tag, produces a human-readable description based on
 * the element type and its attributes — useful for accessibility auditing.
 *
 * Uses paramorphism because it needs access to the original subtree
 * to inspect attributes while still composing folded child descriptions.
 *
 * @example
 * const desc = paraView(ariaDescribeAlgebra, Nav([
 *   A("Home").setHref("/"),
 *   A("About").setHref("/about"),
 * ]));
 * // "nav containing: link 'Home' (href: /), link 'About' (href: /about)"
 */
export declare const ariaDescribeAlgebra: ParaAlgebra<string>;
//# sourceMappingURL=aria-describe.d.ts.map