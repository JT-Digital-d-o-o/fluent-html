import { Tag } from "../core/tag.js";
import { RawString } from "../core/raw-string.js";
import type { View } from "../core/types.js";
import type { ViewAlgebra, TagAttrs } from "./types.js";

/**
 * Extract TagAttrs from a Tag instance.
 */
function extractAttrs(tag: Tag): TagAttrs {
  const attrs: TagAttrs = {
    id: tag.id,
    class: tag.class,
    style: tag.style,
    attributes: { ...tag.attributes },
    htmx: tag.htmx,
    toggles: tag.toggles,
  };

  // Copy element-specific properties (like href, src, etc.)
  // These are properties on specialized Tag subclasses
  for (const key of Object.keys(tag)) {
    if (!(key in attrs) && key !== 'el' && key !== 'child') {
      (attrs as any)[key] = (tag as any)[key];
    }
  }

  return attrs;
}

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
export function foldView<A>(alg: ViewAlgebra<A>, view: View): A {
  // Handle RawString
  if (view instanceof RawString) {
    return alg.raw(view.html);
  }

  // Handle plain strings
  if (typeof view === "string") {
    return alg.text(view);
  }

  // Handle Tag instances
  if (view instanceof Tag) {
    const attrs = extractAttrs(view);
    const foldedChildren = foldView(alg, view.child);
    return alg.tag(view.el, attrs, foldedChildren);
  }

  // Handle arrays
  if (Array.isArray(view)) {
    const foldedItems = view.map(item => foldView(alg, item));
    return alg.list(foldedItems);
  }

  // Fallback for empty/null
  return alg.text("");
}
