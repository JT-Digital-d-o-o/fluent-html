import type { HTMX, HxStatusConfig } from "../htmx.js";
import { EMPTY_ATTRS } from "../core/tag.js";
import type { View } from "../core/types.js";
import { isTag, isRawString } from "../core/guards.js";
import { escapeHtml, escapeAttr } from "./escape.js";

// HTML void elements — no closing tag, no children
const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr'
]);

export function render(...views: View[]): string {
  return renderImpl(views.length === 1 ? views[0] : views, false);
}

// Attribute serialization config for data-driven buildHtmx
type AttrConfig = {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serialize: (value: any) => string;
};

// String attrs: escape the value, quote with "
const str = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${escapeAttr(v)}"`,
});

// Boolean-or-string attrs (pushUrl, replaceUrl, swapOob): pass through booleans, escape strings
const boolOrStr = (key: string, hxKey?: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${hxKey ?? key}="${typeof v === 'string' ? escapeAttr(v) : v}"`,
});

// Boolean attrs that render just the value (validate, preserve, boost, ignore)
const boolVal = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${v}"`,
});

// JSON-or-string attrs (vals, config): stringify objects, escape strings
const jsonOrStr = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${escapeAttr(typeof v === 'string' ? v : JSON.stringify(v))}"`,
});

// JSON-only attrs (headers): always stringify
const json = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${escapeAttr(JSON.stringify(v))}"`,
});

const HTMX_ATTRS: AttrConfig[] = [
  str('target'),
  str('swap'),
  boolOrStr('swapOob', 'swap-oob'),
  str('select'),
  str('trigger'),
  boolOrStr('pushUrl', 'push-url'),
  boolOrStr('replaceUrl', 'replace-url'),
  jsonOrStr('vals'),
  json('headers'),
  str('include'),
  str('encoding'),
  boolVal('validate'),
  str('confirm'),
  str('indicator'),
  str('disable'),
  str('sync'),
  boolVal('preserve'),
  boolVal('boost'),
  boolVal('ignore'),
  jsonOrStr('config'),
];

function buildHtmx(htmx: HTMX): string {
  let result = 'hx-' + htmx.method + '="' + escapeAttr(htmx.endpoint) + '"';

  for (const attr of HTMX_ATTRS) {
    const value = htmx[attr.key as keyof HTMX];
    if (value !== undefined) {
      result += attr.serialize(value);
    }
  }

  // Special cases: boolean-only attrs
  if (htmx.optimistic !== undefined) result += ' hx-optimistic';
  if (htmx.preload !== undefined) {
    result += typeof htmx.preload === 'string'
      ? ' hx-preload="' + htmx.preload + '"'
      : ' hx-preload';
  }

  // Status-code-specific swap behavior
  if (htmx.status) {
    for (const code of Object.keys(htmx.status)) {
      const cfg = htmx.status[code];
      const value = typeof cfg === 'string' ? cfg : buildStatusConfig(cfg);
      result += ' hx-status:' + code + '="' + escapeAttr(value) + '"';
    }
  }

  return result;
}

function buildStatusConfig(cfg: HxStatusConfig): string {
  const parts: string[] = [];
  if (cfg.swap) parts.push('swap:' + cfg.swap);
  if (cfg.target) parts.push('target:' + cfg.target);
  if (cfg.select) parts.push('select:' + cfg.select);
  if (cfg.push !== undefined) parts.push('push:' + cfg.push);
  if (cfg.replace !== undefined) parts.push('replace:' + cfg.replace);
  if (cfg.transition !== undefined) parts.push('transition:' + cfg.transition);
  return parts.join(' ');
}

function renderImpl(view: View, isRawContext: boolean): string {
  if (typeof view === "string") {
    return isRawContext ? view : escapeHtml(view);
  }

  if (isRawString(view)) {
    return view.html;
  }

  if (isTag(view)) {
    const tag = view;
    const el = tag.el;
    let attrs = '';

    const tid = tag.id;
    if (tid !== undefined) attrs += ' id="' + escapeAttr(tid) + '"';
    const tcls = tag.class;
    if (tcls !== undefined) attrs += ' class="' + escapeAttr(tcls) + '"';
    const tsty = tag.style;
    if (tsty !== undefined) attrs += ' style="' + escapeAttr(tsty) + '"';

    const sk = tag._sk;
    if (sk !== undefined) {
      for (let i = 0; i < sk.length; i++) {
        const value = (tag as unknown as Record<string, unknown>)[sk[i]];
        if (value !== undefined && value !== null) {
          attrs += ' ' + sk[i] + '="' + escapeAttr(typeof value === 'string' ? value : String(value)) + '"';
        }
      }
    }

    const extraAttrs = tag.attributes;
    if (extraAttrs !== EMPTY_ATTRS) {
      const extraKeys = Object.keys(extraAttrs);
      for (let i = 0; i < extraKeys.length; i++) {
        const key = extraKeys[i];
        const value = extraAttrs[key];
        if (value !== undefined && value !== null) {
          attrs += ' ' + key + '="' + escapeAttr(String(value)) + '"';
        }
      }
    }

    if (tag.htmx) attrs += ' ' + buildHtmx(tag.htmx);

    const toggles = tag.toggles;
    if (toggles !== undefined && toggles.length > 0) {
      attrs += ' ' + toggles.join(' ');
    }

    if (VOID_ELEMENTS.has(el)) return '<' + el + attrs + '>';

    return '<' + el + attrs + '>' + renderImpl(tag.child, el === 'script' || el === 'style') + '</' + el + '>';
  }

  if (Array.isArray(view)) {
    const len = view.length;
    if (len === 0) return '';
    let result = renderImpl(view[0], isRawContext);
    for (let i = 1; i < len; i++) {
      result += '\n' + renderImpl(view[i], isRawContext);
    }
    return result;
  }

  return '';
}
