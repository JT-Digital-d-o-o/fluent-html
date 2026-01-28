import { HTMX } from "../htmx.js";
import { Tag } from "../core/tag.js";
import { RawString } from "../core/raw-string.js";
import type { View } from "../core/types.js";
import { escapeHtml, escapeAttr } from "./escape.js";

// Elements whose content should NOT be escaped (they contain code, not text)
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

export function render(view: View): string {
  return renderImpl(view, false);
}

function renderImpl(view: View, isRawContext: boolean): string {
  function buildAttributes(attributes: Record<string, string | number | boolean | undefined> | undefined): string {
    if (!attributes) { return ""; }
    return Object.entries(attributes)
      .map(([key, value]) => {
        if (value === undefined || value === null) return "";
        return `${key}="${escapeAttr(String(value))}"`;
      })
      .filter(s => s.length > 0)
      .join(" ");
  }
  function buildHtmx(htmx?: HTMX): string {
    if (!htmx) {
      return '';
    }

    const attributes: string[] = [];

    // Method and endpoint (required)
    attributes.push(`hx-${htmx.method}="${escapeAttr(htmx.endpoint)}"`);

    // Targeting & Swapping
    if (htmx.target) attributes.push(`hx-target="${escapeAttr(htmx.target)}"`);
    if (htmx.swap) attributes.push(`hx-swap="${escapeAttr(htmx.swap)}"`);
    if (htmx.swapOob !== undefined) {
      attributes.push(`hx-swap-oob="${typeof htmx.swapOob === 'string' ? escapeAttr(htmx.swapOob) : htmx.swapOob}"`);
    }
    if (htmx.select) attributes.push(`hx-select="${escapeAttr(htmx.select)}"`);
    if (htmx.selectOob) attributes.push(`hx-select-oob="${escapeAttr(htmx.selectOob)}"`);

    // Triggering
    if (htmx.trigger) attributes.push(`hx-trigger="${escapeAttr(htmx.trigger)}"`);

    // URL manipulation
    if (htmx.pushUrl !== undefined) {
      attributes.push(`hx-push-url="${typeof htmx.pushUrl === 'string' ? escapeAttr(htmx.pushUrl) : htmx.pushUrl}"`);
    }
    if (htmx.replaceUrl !== undefined) {
      attributes.push(`hx-replace-url="${typeof htmx.replaceUrl === 'string' ? escapeAttr(htmx.replaceUrl) : htmx.replaceUrl}"`);
    }

    // Data
    if (htmx.vals) {
      attributes.push(`hx-vals='${typeof htmx.vals === 'string' ? escapeAttr(htmx.vals) : JSON.stringify(htmx.vals)}'`);
    }
    if (htmx.headers) attributes.push(`hx-headers='${JSON.stringify(htmx.headers)}'`);
    if (htmx.include) attributes.push(`hx-include="${escapeAttr(htmx.include)}"`);
    if (htmx.params) attributes.push(`hx-params="${escapeAttr(htmx.params)}"`);
    if (htmx.encoding) attributes.push(`hx-encoding="${escapeAttr(htmx.encoding)}"`);

    // Validation & Confirmation
    if (htmx.validate !== undefined) attributes.push(`hx-validate="${htmx.validate}"`);
    if (htmx.confirm) attributes.push(`hx-confirm="${escapeAttr(htmx.confirm)}"`);
    if (htmx.prompt) attributes.push(`hx-prompt="${escapeAttr(htmx.prompt)}"`);

    // Loading states
    if (htmx.indicator) attributes.push(`hx-indicator="${escapeAttr(htmx.indicator)}"`);
    if (htmx.disabledElt) attributes.push(`hx-disabled-elt="${escapeAttr(htmx.disabledElt)}"`);

    // Synchronization
    if (htmx.sync) attributes.push(`hx-sync="${escapeAttr(htmx.sync)}"`);

    // Extensions
    if (htmx.ext) attributes.push(`hx-ext="${escapeAttr(htmx.ext)}"`);

    // Inheritance control
    if (htmx.disinherit) attributes.push(`hx-disinherit="${escapeAttr(htmx.disinherit)}"`);
    if (htmx.inherit) attributes.push(`hx-inherit="${escapeAttr(htmx.inherit)}"`);

    // History
    if (htmx.history !== undefined) attributes.push(`hx-history="${htmx.history}"`);
    if (htmx.historyElt !== undefined) attributes.push(`hx-history-elt="${htmx.historyElt}"`);

    // Preservation
    if (htmx.preserve !== undefined) attributes.push(`hx-preserve="${htmx.preserve}"`);

    // Request configuration
    if (htmx.request) attributes.push(`hx-request="${escapeAttr(htmx.request)}"`);

    // Boosting
    if (htmx.boost !== undefined) attributes.push(`hx-boost="${htmx.boost}"`);

    // Disable htmx processing
    if (htmx.disable !== undefined) attributes.push(`hx-disable="${htmx.disable}"`);

    return attributes.join(' ');
  }

  // RawString bypasses escaping - used for trusted HTML content
  if (view instanceof RawString) {
    return view.html;
  }

  if (typeof view === "string") {
    return isRawContext ? view : escapeHtml(view);
  }

  if (view instanceof Tag) {
    // Build base attributes, excluding internal properties
    const baseAttrs: any = {};
    Object.assign(baseAttrs, view);
    Object.assign(baseAttrs, view.attributes);

    // Exclude internal properties from rendering
    baseAttrs.el = undefined;
    baseAttrs.htmx = undefined;
    baseAttrs.child = undefined;
    baseAttrs.toggles = undefined;
    baseAttrs.attributes = undefined;

    const childIsRaw = RAW_TEXT_ELEMENTS.has(view.el);
    const renderedChild = renderImpl(view.child, childIsRaw);

    const parts: string[] = [];

    const renderedAttributes = buildAttributes(baseAttrs);
    if (renderedAttributes) parts.push(renderedAttributes);

    const renderedHtmx = buildHtmx(view.htmx);
    if (renderedHtmx) parts.push(renderedHtmx);

    if (view.toggles && view.toggles.length > 0) {
      parts.push(view.toggles.join(" "));
    }

    const attrsString = parts.length > 0 ? " " + parts.join(" ") : "";

    return `<${view.el}${attrsString}>${renderedChild}</${view.el}>`;
  }

  if (Array.isArray(view)) {
    return view.map(innerView => renderImpl(innerView, isRawContext)).join("\n");
  }

  return "";
}
