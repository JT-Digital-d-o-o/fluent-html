import type { HTMX } from "../htmx.js";
import type { View } from "../core/types.js";
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
/**
 * Para-algebra for View paramorphism.
 * Like `ViewAlgebra`, but `tag` also receives the original View subtree,
 * so you can inspect the original node while processing folded results.
 */
export interface ParaAlgebra<A> {
    /** Handle plain text strings */
    text: (s: string) => A;
    /** Handle raw HTML strings */
    raw: (html: string) => A;
    /** Handle tag elements — receives folded children AND the original subtree */
    tag: (element: string, attrs: TagAttrs, children: A, original: View) => A;
    /** Handle arrays by combining folded children */
    list: (children: A[]) => A;
}
/**
 * One layer of a View produced by a coalgebra.
 * The seed type S appears where children would be — these are
 * the seeds that will be recursively unfolded.
 */
export type ViewLayer<S> = {
    type: "text";
    value: string;
} | {
    type: "raw";
    html: string;
} | {
    type: "tag";
    element: string;
    attrs?: Partial<TagAttrs>;
    children: S[];
} | {
    type: "list";
    items: S[];
};
/**
 * Coalgebra for View anamorphism (unfold).
 * Given a seed S, produces one layer of the View tree with new seeds as children.
 * The dual of ViewAlgebra.
 */
export type ViewCoalgebra<S> = (seed: S) => ViewLayer<S>;
//# sourceMappingURL=types.d.ts.map