import { Readable } from "node:stream";
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

// Reuse the same HTMX serialization helpers from render.ts
// (duplicated here to avoid circular deps and keep streaming self-contained)

type AttrConfig = {
  key: string;
  serialize: (value: unknown) => string;
};

const str = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${escapeAttr(v as string)}"`,
});

const boolOrStr = (key: string, hxKey?: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${hxKey ?? key}="${typeof v === 'string' ? escapeAttr(v) : v}"`,
});

const boolVal = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${v}"`,
});

const jsonOrStr = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${escapeAttr(typeof v === 'string' ? v : JSON.stringify(v))}"`,
});

const json = (key: string): AttrConfig => ({
  key,
  serialize: (v) => ` hx-${key}="${escapeAttr(JSON.stringify(v))}"`,
});

const HTMX_ATTRS: AttrConfig[] = [
  str('target'), str('swap'), boolOrStr('swapOob', 'swap-oob'),
  str('select'), str('trigger'), boolOrStr('pushUrl', 'push-url'),
  boolOrStr('replaceUrl', 'replace-url'), jsonOrStr('vals'), json('headers'),
  str('include'), str('encoding'), boolVal('validate'), str('confirm'),
  str('indicator'), str('disable'), str('sync'), boolVal('preserve'),
  boolVal('boost'), boolVal('ignore'), jsonOrStr('config'),
];

function buildHtmx(htmx: HTMX): string {
  let result = 'hx-' + htmx.method + '="' + escapeAttr(htmx.endpoint) + '"';
  for (const attr of HTMX_ATTRS) {
    const value = htmx[attr.key as keyof HTMX];
    if (value !== undefined) result += attr.serialize(value);
  }
  if (htmx.optimistic !== undefined) result += ' hx-optimistic';
  if (htmx.preload !== undefined) {
    result += typeof htmx.preload === 'string'
      ? ' hx-preload="' + htmx.preload + '"'
      : ' hx-preload';
  }
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

// Regex patterns for closing tags inside script/style (case-insensitive)
const SCRIPT_CLOSE_RE = /<\/script/gi;
const STYLE_CLOSE_RE = /<\/style/gi;

/** Sanitize raw context content by escaping closing tags that would break out */
function sanitizeRawContent(content: string, element: string): string {
  if (element === 'script') {
    return content.replace(SCRIPT_CLOSE_RE, '<\\/script');
  }
  if (element === 'style') {
    return content.replace(STYLE_CLOSE_RE, '<\\/style');
  }
  return content;
}

/**
 * Render a view tree to a Node.js Readable stream.
 *
 * Chunks are yielded at tag boundaries — open tag + attributes is one chunk,
 * children are yielded recursively, and close tag is another chunk.
 * This enables flushing early bytes to the client for large SSR responses.
 */
export function renderToStream(view: View): Readable {
  return new Readable({
    read() {
      streamImpl(this, view, false);
      this.push(null);
    },
  });
}

function streamImpl(stream: Readable, view: View, isRawContext: boolean | string): void {
  if (typeof view === "string") {
    if (isRawContext === false) { stream.push(escapeHtml(view)); return; }
    if (typeof isRawContext === 'string') { stream.push(sanitizeRawContent(view, isRawContext)); return; }
    stream.push(view);
    return;
  }

  if (isRawString(view)) {
    if (typeof isRawContext === 'string') { stream.push(sanitizeRawContent(view.html, isRawContext)); return; }
    stream.push(view.html);
    return;
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

    if (VOID_ELEMENTS.has(el)) {
      stream.push('<' + el + attrs + '>');
      return;
    }

    const childCtx = el === 'script' ? 'script' : el === 'style' ? 'style' : isRawContext;
    stream.push('<' + el + attrs + '>');
    streamImpl(stream, tag.child, childCtx);
    stream.push('</' + el + '>');
    return;
  }

  if (Array.isArray(view)) {
    for (let i = 0; i < view.length; i++) {
      if (i > 0) stream.push('\n');
      streamImpl(stream, view[i], isRawContext);
    }
    return;
  }
}
