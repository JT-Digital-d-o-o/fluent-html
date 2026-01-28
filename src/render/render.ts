import { HTMX } from "../htmx.js";
import { Tag, EMPTY_ATTRS } from "../core/tag.js";
import { RawString } from "../core/raw-string.js";
import type { View } from "../core/types.js";
import { escapeHtml, escapeAttr } from "./escape.js";

// Elements whose content should NOT be escaped (they contain code, not text)
const RAW_TEXT_ELEMENTS = new Set(['script', 'style']);

// HTML void elements — no closing tag, no children
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr'
]);

export function render(view: View): string {
  return renderImpl(view, false);
}

function buildHtmx(htmx: HTMX): string {
  let result = `hx-${htmx.method}="${escapeAttr(htmx.endpoint)}"`;

  if (htmx.target) result += ` hx-target="${escapeAttr(htmx.target)}"`;
  if (htmx.swap) result += ` hx-swap="${escapeAttr(htmx.swap)}"`;
  if (htmx.swapOob !== undefined) {
    result += ` hx-swap-oob="${typeof htmx.swapOob === 'string' ? escapeAttr(htmx.swapOob) : htmx.swapOob}"`;
  }
  if (htmx.select) result += ` hx-select="${escapeAttr(htmx.select)}"`;
  if (htmx.selectOob) result += ` hx-select-oob="${escapeAttr(htmx.selectOob)}"`;
  if (htmx.trigger) result += ` hx-trigger="${escapeAttr(htmx.trigger)}"`;
  if (htmx.pushUrl !== undefined) {
    result += ` hx-push-url="${typeof htmx.pushUrl === 'string' ? escapeAttr(htmx.pushUrl) : htmx.pushUrl}"`;
  }
  if (htmx.replaceUrl !== undefined) {
    result += ` hx-replace-url="${typeof htmx.replaceUrl === 'string' ? escapeAttr(htmx.replaceUrl) : htmx.replaceUrl}"`;
  }
  if (htmx.vals) {
    result += ` hx-vals='${typeof htmx.vals === 'string' ? escapeAttr(htmx.vals) : JSON.stringify(htmx.vals)}'`;
  }
  if (htmx.headers) result += ` hx-headers='${JSON.stringify(htmx.headers)}'`;
  if (htmx.include) result += ` hx-include="${escapeAttr(htmx.include)}"`;
  if (htmx.params) result += ` hx-params="${escapeAttr(htmx.params)}"`;
  if (htmx.encoding) result += ` hx-encoding="${escapeAttr(htmx.encoding)}"`;
  if (htmx.validate !== undefined) result += ` hx-validate="${htmx.validate}"`;
  if (htmx.confirm) result += ` hx-confirm="${escapeAttr(htmx.confirm)}"`;
  if (htmx.prompt) result += ` hx-prompt="${escapeAttr(htmx.prompt)}"`;
  if (htmx.indicator) result += ` hx-indicator="${escapeAttr(htmx.indicator)}"`;
  if (htmx.disabledElt) result += ` hx-disabled-elt="${escapeAttr(htmx.disabledElt)}"`;
  if (htmx.sync) result += ` hx-sync="${escapeAttr(htmx.sync)}"`;
  if (htmx.ext) result += ` hx-ext="${escapeAttr(htmx.ext)}"`;
  if (htmx.disinherit) result += ` hx-disinherit="${escapeAttr(htmx.disinherit)}"`;
  if (htmx.inherit) result += ` hx-inherit="${escapeAttr(htmx.inherit)}"`;
  if (htmx.history !== undefined) result += ` hx-history="${htmx.history}"`;
  if (htmx.historyElt !== undefined) result += ` hx-history-elt="${htmx.historyElt}"`;
  if (htmx.preserve !== undefined) result += ` hx-preserve="${htmx.preserve}"`;
  if (htmx.request) result += ` hx-request="${escapeAttr(htmx.request)}"`;
  if (htmx.boost !== undefined) result += ` hx-boost="${htmx.boost}"`;
  if (htmx.disable !== undefined) result += ` hx-disable="${htmx.disable}"`;

  return result;
}

function renderImpl(view: View, isRawContext: boolean): string {
  if (typeof view === "string") {
    return isRawContext ? view : escapeHtml(view);
  }

  // Type discriminant check — faster than instanceof prototype walk
  const vt = (view as any)._t;

  if (vt === 2) { // RawString
    return (view as RawString).html;
  }

  if (vt === 1) { // Tag
    const tag = view as Tag;
    const el = tag.el;
    const isVoid = VOID_ELEMENTS.has(el);

    // Build attribute string directly — avoid object copy + Object.entries
    let attrs = "";

    // Render own properties of the Tag (id, class, style, etc.)
    // Inline key checks instead of Set.has() — V8 interns short strings
    const keys = Object.keys(tag);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === '_t' || key === 'el' || key === 'child' || key === 'htmx' || key === 'toggles' || key === 'attributes') continue;
      const value = (tag as any)[key];
      if (value === undefined || value === null) continue;
      attrs += ` ${key}="${escapeAttr(String(value))}"`;
    }

    // Render extra attributes from .attributes record (skip if empty sentinel)
    const extraAttrs = tag.attributes;
    if (extraAttrs !== EMPTY_ATTRS) {
      const extraKeys = Object.keys(extraAttrs);
      for (let i = 0; i < extraKeys.length; i++) {
        const key = extraKeys[i];
        const value = extraAttrs[key];
        if (value === undefined || value === null) continue;
        attrs += ` ${key}="${escapeAttr(String(value))}"`;
      }
    }

    // HTMX attributes
    if (tag.htmx) {
      attrs += " " + buildHtmx(tag.htmx);
    }

    // Boolean toggle attributes
    if (tag.toggles && tag.toggles.length > 0) {
      attrs += " " + tag.toggles.join(" ");
    }

    if (isVoid) {
      return `<${el}${attrs}>`;
    }

    const renderedChild = renderImpl(tag.child, RAW_TEXT_ELEMENTS.has(el));
    return `<${el}${attrs}>${renderedChild}</${el}>`;
  }

  if (Array.isArray(view)) {
    const len = view.length;
    if (len === 0) return "";
    let result = renderImpl(view[0], isRawContext);
    for (let i = 1; i < len; i++) {
      result += "\n" + renderImpl(view[i], isRawContext);
    }
    return result;
  }

  return "";
}
