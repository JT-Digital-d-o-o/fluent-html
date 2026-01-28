import type { HTMX } from "../htmx.js";
/**
 * Attributes extracted from a Tag for fold operations.
 */
export interface TagAttrs {
    id?: string;
    class?: string;
    style?: string;
    attributes: Record<string, string>;
    htmx?: HTMX;
    toggles?: string[];
    [key: string]: unknown;
}
/**
 * F-algebra for View catamorphism.
 * Defines how to combine View components into a result type A.
 */
export interface ViewAlgebra<A> {
    /** Handle plain text strings */
    text: (s: string) => A;
    /** Handle raw HTML strings */
    raw: (html: string) => A;
    /** Handle tag elements with their already-folded children */
    tag: (element: string, attrs: TagAttrs, children: A) => A;
    /** Handle arrays by combining folded children */
    list: (children: A[]) => A;
}
//# sourceMappingURL=types.d.ts.map