import type { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { ViewAlgebra, TagAttrs } from "./types.js";
import { isTag, isRawString } from "../core/guards.js";

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
    if (!(key in attrs) && key !== '_t' && key !== 'el' && key !== 'child') {
      (attrs as Record<string, unknown>)[key] = (tag as unknown as Record<string, unknown>)[key];
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
  if (isRawString(view)) {
    return alg.raw(view.html);
  }

  // Handle plain strings
  if (typeof view === "string") {
    return alg.text(view);
  }

  // Handle Tag instances
  if (isTag(view)) {
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
