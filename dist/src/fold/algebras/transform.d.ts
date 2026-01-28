import type { View } from "../../core/types.js";
import type { ViewAlgebra, TagAttrs } from "../types.js";
/**
 * Create an algebra that transforms Views.
 * The transform function receives each element and can modify or replace it.
 *
 * @param transform - Function that receives element name and attrs, returns modified values or null to keep unchanged
 * @returns ViewAlgebra that produces transformed Views
 *
 * @example
 * // Add a class to all divs
 * const addClassToDivs = createTransformAlgebra((el, attrs) => {
 *   if (el === 'div') {
 *     return {
 *       element: el,
 *       attrs: { ...attrs, class: (attrs.class || '') + ' my-class' }
 *     };
 *   }
 *   return null; // keep unchanged
 * });
 */
export declare function createTransformAlgebra(transform: (element: string, attrs: TagAttrs) => {
    element: string;
    attrs: Partial<TagAttrs>;
} | null): ViewAlgebra<View>;
/**
 * Create an algebra that adds a class to elements matching a predicate.
 *
 * @param predicate - Function that returns true for elements that should receive the class
 * @param className - The class name to add
 * @returns ViewAlgebra that produces transformed Views
 *
 * @example
 * // Add 'highlight' class to all paragraphs
 * const highlightParagraphs = addClassToMatching(
 *   (el) => el === 'p',
 *   'highlight'
 * );
 * const highlighted = foldView(highlightParagraphs, myView);
 */
export declare function addClassToMatching(predicate: (element: string, attrs: TagAttrs) => boolean, className: string): ViewAlgebra<View>;
//# sourceMappingURL=transform.d.ts.map