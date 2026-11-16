// fluent-html 9 prototype, the security half: the closers for the 18 escapes fluent-html 8 has on
// the XSS fixture set. Each is a small function over the fluent-html 8 tree; in fluent-html 9 they
// replace the unchecked sinks (setStyle(string), Style(string), Script(string), externalUrl,
// setSrcdoc, setDataAttrs) so the unchecked spelling does not exist.
import { Iframe, Script, Style } from "fluent-html";
import { externalUrl as externalUrl8, type ExternalHref } from "fluent-html/htmx";
import type { IframeTag, ScriptTag, StyleTag, Tag } from "fluent-html";

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);
const JS_UNSAFE = new RegExp("[<>&" + LS + PS + "]", "g");
const hex4 = (c: string) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");

/** JSON that is inert inside `<script>`: `<`, `>`, `&` and the two line separators as \uXXXX. */
export function scriptJson(data: unknown): string {
  return JSON.stringify(data).replace(JS_UNSAFE, hex4);
}

/** Data for the client. The only way to put a runtime value into a script element as data. */
export function JsonScript(data: unknown): ScriptTag {
  return Script(scriptJson(data)).setType("application/json");
}

declare const jsBrand: unique symbol;
export type TrustedJs = string & { readonly [jsBrand]: true };
/** Inline JS: the literal parts are code, every hole is data (script-safe JSON). */
export function js(parts: TemplateStringsArray, ...holes: unknown[]): TrustedJs {
  let out = parts[0] ?? "";
  for (let i = 0; i < holes.length; i++) out += scriptJson(holes[i]) + (parts[i + 1] ?? "");
  return out as TrustedJs;
}
export function InlineScript(code: TrustedJs): ScriptTag {
  return Script(code);
}

const CSS_BREAK = /[;{}\\<>"'`]|\/\*|\*\/|@|url\s*\(|image-set\s*\(|expression\s*\(/i;
/** One CSS value from data. Throws on anything that could end the declaration or fetch a URL. */
export function cssValue(value: string | number): string {
  const v = String(value).trim();
  if (v === "" || CSS_BREAK.test(v)) throw new Error(`fluent-html: not a single CSS value: ${JSON.stringify(v.slice(0, 40))}`);
  return v;
}

declare const cssBrand: unique symbol;
export type TrustedCss = string & { readonly [cssBrand]: true };
/** A stylesheet: the literal parts are CSS, every hole is one checked CSS value. */
export function css(parts: TemplateStringsArray, ...holes: (string | number)[]): TrustedCss {
  let out = parts[0] ?? "";
  for (let i = 0; i < holes.length; i++) out += cssValue(holes[i]!) + (parts[i + 1] ?? "");
  return out as TrustedCss;
}
export function StyleSheet(sheet: TrustedCss): StyleTag {
  return Style(sheet);
}

const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
/** `setStyles` with each value checked: a runtime value can only ever be one value of one property. */
export function styles<T extends Tag>(tag: T, map: Record<string, string | number>): T {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) out[k] = cssValue(v);
  return tag.setStyles(out);
}

/** `setDataAttrs` that refuses the keys htmx reads (`data-hx-*`), whatever the casing. */
export function dataAttrs<T extends Tag>(tag: T, map: Record<string, string>): T {
  for (const k of Object.keys(map)) {
    if (/^hx(-|:|$)/i.test(kebab(k).replace(/^-/, ""))) throw new Error(`fluent-html: data-${k} is an htmx attribute; use the htmx verbs`);
  }
  return tag.setDataAttrs(map);
}

const URL_OK = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|\?|#|\.\.?\/|data:(image\/(?!svg)[a-z0-9.+-]+|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|font\/[a-z0-9.+-]+)[;,])/i;
/** A runtime URL for an href or an htmx sink: http(s), mailto, tel, a same-origin path, or the non-SVG media data: types fluent-html 8 already allows. Else it throws. */
export function externalUrl(url: string): ExternalHref {
  const u = url.replace(/[\u0000- ]+/g, "");
  if (!URL_OK.test(u)) throw new Error(`fluent-html: refused URL ${JSON.stringify(url.slice(0, 40))}`);
  return externalUrl8(url);
}

const HTMX_JS = /^(js|javascript):/i;
const ZWSP = String.fromCharCode(0x200b);
/** htmx runs a confirm text that starts with `js:` as code. Text from data is made text again. */
export function confirmText(text: string): string {
  return HTMX_JS.test(text.trimStart()) ? ZWSP + text : text;
}

/** `srcdoc` is always sandboxed: with no tokens the frame runs no script and has a unique origin. */
export function SandboxedFrame(html: string, ...allow: Parameters<IframeTag["setSandbox"]>): IframeTag {
  return Iframe().setSrcdoc(html).setSandbox(...allow.filter((t) => t !== "allow-same-origin" || !allow.includes("allow-scripts")));
}
