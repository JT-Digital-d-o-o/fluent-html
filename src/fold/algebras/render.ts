import type { ViewAlgebra, TagAttrs } from "../types.js";
import { escapeHtml, escapeAttr } from "../../render/escape.js";

// Elements whose content should NOT be escaped (they contain code, not text)
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

/**
 * Build HTML attribute string from TagAttrs.
 */
function buildAttributes(attrs: TagAttrs): string {
  const parts: string[] = [];

  // Standard attributes
  if (attrs.id) parts.push(`id="${escapeAttr(attrs.id)}"`);
  if (attrs.class) parts.push(`class="${escapeAttr(attrs.class)}"`);
  if (attrs.style) parts.push(`style="${escapeAttr(attrs.style)}"`);

  // Custom attributes
  for (const [key, value] of Object.entries(attrs.attributes)) {
    if (value !== undefined && value !== null) {
      parts.push(`${key}="${escapeAttr(String(value))}"`);
    }
  }

  // Element-specific attributes (href, src, etc.)
  for (const [key, value] of Object.entries(attrs)) {
    if (
      key !== 'id' && key !== 'class' && key !== 'style' &&
      key !== 'attributes' && key !== 'htmx' && key !== 'toggles' &&
      value !== undefined && value !== null
    ) {
      parts.push(`${key}="${escapeAttr(String(value))}"`);
    }
  }

  // HTMX attributes
  if (attrs.htmx) {
    const htmx = attrs.htmx;
    parts.push(`hx-${htmx.method}="${escapeAttr(htmx.endpoint)}"`);
    if (htmx.target) parts.push(`hx-target="${escapeAttr(htmx.target)}"`);
    if (htmx.swap) parts.push(`hx-swap="${escapeAttr(htmx.swap)}"`);
    if (htmx.trigger) parts.push(`hx-trigger="${escapeAttr(htmx.trigger)}"`);
    // Add other HTMX attributes as needed...
  }

  // Toggles (boolean attributes)
  if (attrs.toggles) {
    parts.push(...attrs.toggles);
  }

  return parts.length > 0 ? " " + parts.join(" ") : "";
}

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
export const renderAlgebra: ViewAlgebra<string> = {
  text: (s) => escapeHtml(s),
  raw: (html) => html, // Raw HTML bypasses escaping
  tag: (element, attrs, childHtml) => {
    const attrString = buildAttributes(attrs);
    // Note: For raw text elements (script, style), children should not be escaped
    // This simplified version doesn't handle that - use render() for production
    return `<${element}${attrString}>${childHtml}</${element}>`;
  },
  list: (htmls) => htmls.join("\n"),
};
