import type { ParaAlgebra, TagAttrs } from "../types.js";
import type { View } from "../../core/types.js";

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
export const ariaDescribeAlgebra: ParaAlgebra<string> = {
  text: (s) => s.trim(),
  raw: () => "",
  tag: (element: string, attrs: TagAttrs, children: string, _original: View) => {
    const label = attrs.id ? `${element}#${attrs.id}` : element;

    if (element === "a" && attrs.href) {
      const text = children.trim();
      return text
        ? `link '${text}' (href: ${attrs.href})`
        : `link (href: ${attrs.href})`;
    }

    if (element === "img") {
      const alt = attrs.alt ?? attrs.attributes?.alt;
      return alt ? `image '${alt}'` : "image (no alt)";
    }

    if (element === "input") {
      const type = attrs.type ?? attrs.attributes?.type ?? "text";
      return `input[${type}]`;
    }

    const inner = children.trim();
    return inner ? `${label} containing: ${inner}` : label;
  },
  list: (items) => items.filter(Boolean).join(", "),
};
