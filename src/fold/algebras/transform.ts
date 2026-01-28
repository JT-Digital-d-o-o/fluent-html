import type { View } from "../../core/types.js";
import { Tag } from "../../core/tag.js";
import { RawString, Raw } from "../../core/raw-string.js";
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
export function createTransformAlgebra(
  transform: (element: string, attrs: TagAttrs) => { element: string; attrs: Partial<TagAttrs> } | null
): ViewAlgebra<View> {
  return {
    text: (s) => s,
    raw: (html) => Raw(html),
    tag: (element, attrs, children) => {
      const result = transform(element, attrs);
      const finalEl = result?.element ?? element;
      const finalAttrs = result?.attrs ?? attrs;

      // Reconstruct the Tag with potentially modified attributes
      const tag = new Tag(finalEl, children);
      if (finalAttrs.id) tag.id = finalAttrs.id;
      if (finalAttrs.class) tag.class = finalAttrs.class;
      if (finalAttrs.style) tag.style = finalAttrs.style;
      if (finalAttrs.attributes) tag.attributes = { ...finalAttrs.attributes };
      if (finalAttrs.htmx) tag.htmx = finalAttrs.htmx;
      if (finalAttrs.toggles) tag.toggles = finalAttrs.toggles;

      return tag;
    },
    list: (items) => items,
  };
}

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
export function addClassToMatching(
  predicate: (element: string, attrs: TagAttrs) => boolean,
  className: string
): ViewAlgebra<View> {
  return createTransformAlgebra((element, attrs) => {
    if (predicate(element, attrs)) {
      const existingClass = attrs.class || '';
      const newClass = existingClass ? `${existingClass} ${className}` : className;
      return {
        element,
        attrs: { ...attrs, class: newClass }
      };
    }
    return null;
  });
}
