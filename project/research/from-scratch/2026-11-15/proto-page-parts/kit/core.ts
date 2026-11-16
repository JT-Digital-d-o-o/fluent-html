// Core: the View value, escaping, raw elements (the escape hatch under the parts).
// A View holds finished, escaped HTML. Only this module constructs one.

export class View {
  readonly html: string;
  constructor(html: string) {
    this.html = html;
  }
}

export class KitError extends Error {}

export type Child = View | string | number | false | null | undefined | readonly Child[];

const NEEDS_ESC = /[&<>"']/;
export function esc(s: string): string {
  if (!NEEDS_ESC.test(s)) return s;
  let out = "";
  let last = 0;
  for (let i = 0; i < s.length; i++) {
    let r: string;
    switch (s.charCodeAt(i)) {
      case 38: r = "&amp;"; break;
      case 60: r = "&lt;"; break;
      case 62: r = "&gt;"; break;
      case 34: r = "&quot;"; break;
      case 39: r = "&#39;"; break;
      default: continue;
    }
    out += s.slice(last, i) + r;
    last = i + 1;
  }
  return out + s.slice(last);
}

export function kids(children: readonly unknown[], start = 0): string {
  let out = "";
  for (let i = start; i < children.length; i++) {
    const c = children[i];
    if (typeof c === "string") out += esc(c);
    else if (c instanceof View) out += c.html;
    else if (typeof c === "number") out += c;
    else if (Array.isArray(c)) out += kids(c);
    else if (c !== false && c !== null && c !== undefined) throw new KitError(`a ${typeof c} is not a child: pass a View, a string or a number`);
  }
  return out;
}

// ---------- URLs ----------

/** A checked URL. Made by a part's `.url()`, `asset()`, `external()` or `local()`. */
export class Href {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }
}

const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);
const SAFE_DATA = /^data:(image\/(?!svg)[a-z0-9.+-]+|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|font\/[a-z0-9.+-]+)[;,]/i;
const URL_CTRL = /^[\u0000- ]|[\t\n\r]/;
export const BLOCKED_URL = "#blocked-url";

export function safeUrl(u: string): string {
  if (URL_CTRL.test(u)) return BLOCKED_URL;
  const m = SCHEME.exec(u);
  if (m === null) return u;
  if (SAFE_SCHEMES.has(m[0].toLowerCase())) return u;
  if (SAFE_DATA.test(u)) return u;
  return BLOCKED_URL;
}

/** A URL that came from data (a user's website, a CDN). A scriptable scheme renders as "#blocked-url". */
export const external = (url: string): Href => new Href(safeUrl(url));
/** A static file of this app. */
export const asset = (path: string): Href => new Href(safeUrl(path));
/** A same-origin path for an htmx request. Anything else throws: an htmx URL never comes from user data. */
export function local(path: string): Href {
  if (!/^\/(?![/\\])/.test(path) || /[\u0000-\u001f\\]/.test(path)) throw new KitError(`local(): "${path.slice(0, 40)}" is not a same-origin path (it must start with one "/")`);
  return new Href(path);
}

const URL_ATTRS = new Set(["href", "src", "action", "formaction", "poster", "cite", "ping", "background", "data"]);

// ---------- CSS ----------

export type Style = { readonly [property: string]: string | number | null | undefined };
const CSS_NAME = /^(--[a-zA-Z0-9_-]+|[a-z][a-z-]*)$/;
const CSS_BAD = /[;{}<>\\"'@`\u0000-\u001f]|\/\*|\*\/|url\s*\(|expression\s*\(|image-set\s*\(/i;

/** One declaration per key. A value that could open a second declaration, a rule, a comment or a fetch is dropped. */
export function cssDecls(style: Style): string {
  let out = "";
  for (const k in style) {
    const v = style[k];
    if (v === null || v === undefined) continue;
    if (!CSS_NAME.test(k)) throw new KitError(`style: "${k}" is not a CSS property name`);
    const s = String(v);
    if (CSS_BAD.test(s)) continue;
    out += (out ? "; " : "") + k + ": " + s;
  }
  return out;
}

// ---------- htmx wiring (built by parts only) ----------

/** htmx attributes, already serialized. Only parts and `hx()` make one, always from a checked Href. */
export class Wire {
  readonly attrs: string;
  constructor(attrs: string) {
    this.attrs = attrs;
  }
}

// ---------- attributes ----------

const NAME_RE = /^[a-z][a-z0-9-]*$/;
const NAME_OK = new Set<string>();
function attrName(k: string): string {
  if (NAME_OK.has(k)) return k;
  if (!NAME_RE.test(k) || k.startsWith("on") || k.startsWith("hx-") || k.startsWith("data-") || k === "srcdoc" || k === "srcset") {
    throw new KitError(
      k.startsWith("on") ? `"${k}": no inline event handlers; use a part or a behavior`
      : k.startsWith("hx-") ? `"${k}": htmx attributes come from a part (region, form, action) or hx()`
      : k.startsWith("data-") ? `"${k}": data attributes go in the data object: data: { ${k.slice(5)}: … }`
      : `"${k}" is not an attribute a raw element takes`,
    );
  }
  if (NAME_OK.size < 512) NAME_OK.add(k);
  return k;
}

const DATA_KEY = /^[a-z][a-z0-9-]*$/;

export function attrs(a: Record<string, unknown>): string {
  let s = "";
  for (const k in a) {
    let v = a[k];
    if (v === false || v === null || v === undefined) {
      if (v === false && k.charCodeAt(4) === 45 && k.startsWith("aria-")) s += " " + k + '="false"';
      continue;
    }
    if (k === "class") {
      s += ' class="' + esc(v as string) + '"';
    } else if (k === "style") {
      const css = cssDecls(v as Style);
      if (css) s += ' style="' + esc(css) + '"';
    } else if (k === "wire") {
      if (!(v instanceof Wire)) throw new KitError("wire: takes what a part's .on() or hx() returns");
      s += " " + v.attrs;
    } else if (k === "data") {
      const d = v as Record<string, unknown>;
      for (const dk in d) {
        if (!DATA_KEY.test(dk) || dk.startsWith("hx")) throw new KitError(`data: "${dk.slice(0, 40)}" is not a data attribute name (lowercase letters, digits and dashes; "hx-" is htmx's)`);
        const dv = d[dk];
        if (dv !== null && dv !== undefined && dv !== false) s += " data-" + dk + '="' + esc(String(dv)) + '"';
      }
    } else {
      attrName(k);
      if (v === true) {
        s += k.startsWith("aria-") ? " " + k + '="true"' : " " + k;
      } else {
        if (URL_ATTRS.has(k)) v = v instanceof Href ? v.value : safeUrl(String(v));
        s += " " + k + '="' + esc(String(v)) + '"';
      }
    }
  }
  return s;
}

// ---------- elements ----------

// Interfaces, not type aliases: tsc prints an interface by name, so a diagnostic says
// "does not exist in type 'ButtonAttrs'" instead of spelling the whole shape out.
export interface Global {
  class?: string | false | null;
  id?: string;
  title?: string;
  hidden?: boolean;
  lang?: string;
  role?: string;
  tabindex?: number;
  style?: Style;
  data?: Readonly<Record<string, string | number | boolean | null | undefined>>;
  wire?: Wire;
  popover?: "auto" | "manual";
  readonly [aria: `aria-${string}`]: string | number | boolean | undefined;
}
export interface AAttrs extends Global { href?: Href; target?: "_blank"; rel?: string; download?: boolean | string }
export interface ImgAttrs extends Global { src: Href; alt: string; width?: number; height?: number; loading?: "lazy" | "eager" }
export interface ButtonAttrs extends Global {
  type?: "button" | "submit" | "reset"; disabled?: boolean; name?: string; value?: string; form?: string; formaction?: Href;
  command?: "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover" | `--${string}`;
  commandfor?: string; popovertarget?: string;
}
export interface LabelAttrs extends Global { for?: string }
export interface FormAttrs extends Global { action: Href; method: "get" | "post"; enctype?: "multipart/form-data" }
export interface InputAttrs extends Global {
  type?: "text" | "email" | "password" | "number" | "search" | "url" | "tel" | "date" | "checkbox" | "radio" | "hidden" | "file";
  name?: string; value?: string | number; placeholder?: string; required?: boolean; disabled?: boolean; checked?: boolean;
  autocomplete?: string; min?: number; max?: number; minlength?: number; maxlength?: number; form?: string;
}
export interface TextareaAttrs extends Global { name?: string; rows?: number; placeholder?: string; required?: boolean; maxlength?: number; disabled?: boolean }
export interface SelectAttrs extends Global { name?: string; required?: boolean; disabled?: boolean }
export interface OptionAttrs extends Global { value: string; selected?: boolean }
export interface IframeAttrs extends Global { src: Href; title: string; loading?: "lazy" | "eager" }
export interface CellAttrs extends Global { scope?: "col" | "row"; colspan?: number; rowspan?: number }
export interface TimeAttrs extends Global { datetime?: string }
export interface OlAttrs extends Global { start?: number; reversed?: boolean }

export type Tags = {
  a: AAttrs; img: ImgAttrs; button: ButtonAttrs; label: LabelAttrs; th: CellAttrs; td: CellAttrs; time: TimeAttrs; ol: OlAttrs;
  form: FormAttrs; input: InputAttrs; textarea: TextareaAttrs; select: SelectAttrs; option: OptionAttrs; iframe: IframeAttrs;
};

type AttrsOf<K extends string> = K extends keyof Tags ? Tags[K] : Global;
type RequiredKeys<T> = { [K in keyof T]-?: string extends K ? never : {} extends Pick<T, K> ? never : K }[keyof T];

// One signature, not two overloads: an overload failure reports "No overload matches this call"
// and buries the fact two lines down.
type ElementFn<K extends string> = [RequiredKeys<AttrsOf<K>>] extends [never]
  ? (first?: AttrsOf<K> | Child, ...children: Child[]) => View
  : (attrs: AttrsOf<K>, ...children: Child[]) => View;

function element<const K extends string>(tag: K, kind: "normal" | "void" = "normal"): ElementFn<K> {
  const open = "<" + tag;
  const close = "</" + tag + ">";
  const isButton = tag === "button";
  const fn = (...args: unknown[]): View => {
    const a = args[0];
    let s = open;
    let start = 0;
    if (typeof a === "object" && a !== null && !(a instanceof View) && !Array.isArray(a)) {
      s += attrs(a as Record<string, unknown>);
      start = 1;
      if (isButton && (a as { type?: unknown }).type === undefined) s += ' type="button"';
    } else if (isButton) s += ' type="button"';
    if (kind === "void") return new View(s + ">");
    return new View(s + ">" + kids(args, start) + close);
  };
  return fn as ElementFn<K>;
}

export const Div = element("div");
export const Span = element("span");
export const P = element("p");
export const H1 = element("h1");
export const H2 = element("h2");
export const H3 = element("h3");
export const Header = element("header");
export const Footer = element("footer");
export const Nav = element("nav");
export const Section = element("section");
export const Article = element("article");
export const Aside = element("aside");
export const Ul = element("ul");
export const Ol = element("ol");
export const Li = element("li");
export const A = element("a");
export const Button = element("button");
export const Img = element("img", "void");
export const Table = element("table");
export const Thead = element("thead");
export const Tbody = element("tbody");
export const Tr = element("tr");
export const Th = element("th");
export const Td = element("td");
export const Strong = element("strong");
export const Em = element("em");
export const Small = element("small");
export const Time = element("time");
export const Label = element("label");
export const Dl = element("dl");
export const Dt = element("dt");
export const Dd = element("dd");
export const Pre = element("pre");
export const Code = element("code");
export const Blockquote = element("blockquote");
export const Figure = element("figure");
export const Figcaption = element("figcaption");
export const Fieldset = element("fieldset");
export const Legend = element("legend");
export const Hr = element("hr", "void");
export const Br = element("br", "void");
/** Raw form controls: a form part writes these for you; use them only where no part fits. */
export const Form = element("form");
export const Input = element("input", "void");
export const Textarea = element("textarea");
export const Select = element("select");
export const Option = element("option");
export const Iframe = element("iframe");
/** Main belongs to Page(); it is exported for a document the kit does not own (the bench page). */
export const Main = element("main");

/** Class text from parts: `cx("px-3 py-2", active && "bg-surface-2")`. Append-only, nothing is merged. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  let out = "";
  for (const p of parts) if (p) out += out ? " " + p : p;
  return out;
}

// ---------- declared bypasses ----------

declare const trusted: unique symbol;
export type TrustedHtml = string & { readonly [trusted]: true };
/** Markup written in the source. An interpolation does not compile: `trustedHtml` takes a literal only. */
export const trustedHtml = (strings: TemplateStringsArray): TrustedHtml => strings.join("") as TrustedHtml;
export const Raw = (html: TrustedHtml): View => new View(html);

const jsonSafe = (value: unknown): string =>
  JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));

/** Data for a script to read: `<script type="application/json" id=…>`. No sequence in it can end the element. */
export const JsonData = (id: string, value: unknown): View =>
  new View('<script type="application/json" id="' + esc(id) + '">' + jsonSafe(value) + "</script>");
/** `window[name] = value` for a script that expects a global. */
export function ScriptData(name: string, value: unknown): View {
  if (!/^[A-Za-z_$][\w$]*$/.test(name)) throw new KitError(`ScriptData: "${name}" is not an identifier`);
  return new View("<script>window." + name + " = " + jsonSafe(value) + "</script>");
}

const CSS_SELECTOR = /^[\w .#:>+~*,()[\]=-]+$/;
/** A rule whose values come from data (a tenant colour). Static CSS is Tailwind's. */
export function CssRule(selector: string, style: Style): View {
  if (!CSS_SELECTOR.test(selector)) throw new KitError(`CssRule: "${selector}" is not a selector this takes`);
  return new View("<style>" + selector + "{" + cssDecls(style) + "}</style>");
}

/** User HTML, shown in an iframe that can run nothing: sandboxed, no scripts, no same origin. */
export const Sandbox = (props: { html: string; title: string; class?: string }): View =>
  new View('<iframe sandbox=""' + attrs({ title: props.title, class: props.class }) + ' srcdoc="' + esc(props.html) + '"></iframe>');

type HxMethod = "get" | "post";
/** The raw htmx hatch, for what no part covers. The URL is a checked Href; values and headers are objects. */
export function hx(spec: {
  [M in HxMethod]?: Href;
} & { target?: string; swap?: "outerMorph" | "innerMorph" | "outerHTML" | "innerHTML" | "none"; trigger?: string; vals?: Record<string, unknown>; headers?: Record<string, string> }): Wire {
  const method = spec.get !== undefined ? "get" : "post";
  const url = spec[method];
  if (!(url instanceof Href)) throw new KitError("hx(): get or post takes a part's .url() or local(path)");
  if (!url.value.startsWith("/") || url.value.startsWith("//")) throw new KitError("hx(): htmx requests stay on this origin");
  let s = "hx-" + method + '="' + esc(url.value) + '"';
  if (spec.target !== undefined) s += ' hx-target="' + esc(spec.target) + '"';
  if (spec.swap !== undefined) s += ' hx-swap="' + spec.swap + '"';
  if (spec.trigger !== undefined) {
    if (/[[\]]/.test(spec.trigger)) throw new KitError("hx(): a trigger filter ([…]) is JavaScript; filter on the server");
    s += ' hx-trigger="' + esc(spec.trigger) + '"';
  }
  if (spec.vals !== undefined) s += ' hx-vals="' + esc(JSON.stringify(spec.vals)) + '"';
  if (spec.headers !== undefined) s += ' hx-headers="' + esc(JSON.stringify(spec.headers)) + '"';
  return new Wire(s);
}
