// Backtick Tags: research prototype for the from-scratch round (token-economy lens).
// One file, types and runtime together, erasable TypeScript only (runs under Node's type stripping).
// Not a product: it renders the bench page and the three reference screens, nothing more.

// ───────────────────────── values ─────────────────────────

/** Finished, already-escaped markup. `I` is the id its root carries when it was built from a part's root wire. */
export class Html<I extends string | undefined = string | undefined> {
  declare readonly $id: I;
  h: string;
  id: string | undefined;
  constructor(h: string, id?: string) {
    this.h = h;
    this.id = id;
  }
  toString(): string {
    return this.h;
  }
}

/** A full document: what a page route answers. */
export class Page {
  declare readonly $page: true;
  h: string;
  constructor(h: string) {
    this.h = h;
  }
}

/** A checked class list. Only cls`…` and cls.token() make one. */
export class Cls {
  declare readonly $cls: true;
  c: string;
  constructor(c: string) {
    this.c = c;
  }
}

/** Attribute text produced by the framework (a route wire). Leading argument of any tag. */
export class Wire {
  declare readonly $wire: true;
  s: string;
  id: string | undefined;
  constructor(s: string, id?: string) {
    this.s = s;
    this.id = id;
  }
  on(_tag: string): string {
    return this.s;
  }
}
/** The wire that makes an element a part's root: it carries the part's id. */
export class Root<I extends string> extends Wire {
  declare readonly $root: I;
}

export type Hole = Cls | false | null | undefined;
export type Child = string | number | boolean | null | undefined | Html | AnyEl | readonly Child[];
type V = string | number | false | null | undefined;
type B = boolean | null | undefined;

// ───────────────────────── escaping ─────────────────────────

const ESC = /[&<>"']/;
export function esc(s: string): string {
  if (!ESC.test(s)) return s;
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

const SAFE_SCHEME = /^(https?|mailto|tel|sms):/i;
const SAFE_DATA = /^data:(image\/(png|jpe?g|gif|webp|avif|bmp|x-icon)|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|font\/[a-z0-9.+-]+)[;,]/i;
const HAS_SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
/** One URL policy for every URL-valued attribute, keyed on the attribute name (there is no untyped side door). */
export function safeUrl(u: string): string {
  const c = u.charCodeAt(0);
  if ((c === 47 || c === 35 || c === 63) && !/[\t\n\r]/.test(u)) return u;
  // WHATWG URL parsing: leading C0/space stripped, tab and newline removed anywhere.
  const t = u.replace(/^[\u0000-\u0020]+/, "").replace(/[\t\n\r]/g, "");
  if (!HAS_SCHEME.test(t)) return u;
  if (SAFE_SCHEME.test(t) || SAFE_DATA.test(t)) return u;
  return "#";
}

const CSS_OK = /^[a-zA-Z0-9 #%.,()+\-/_]*$/;
const CSS_BAD = /\/\*|url\s*\(|expression\s*\(|image-set\s*\(/i;
/** A CSS value from data: one value, never a second declaration, a rule, a comment or a fetch. */
export function cssValue(v: string | number): string {
  const s = String(v);
  if (!CSS_OK.test(s) || CSS_BAD.test(s)) throw new TypeError(`bt: refused CSS value ${JSON.stringify(s.slice(0, 40))}: a value from data is one plain CSS value`);
  return s;
}

const HTMX_JS = /^\s*(js|javascript):/i;

// ───────────────────────── attributes ─────────────────────────

const PLAIN = 0, URL_ = 1, STYLE = 2, DATA = 3, SRCDOC = 4;
const KIND = new Map<string, number>();
const URL_ATTRS = new Set(["href", "src", "action", "formaction", "poster", "cite", "ping", "background", "xlink:href", "codebase", "manifest", "srcset"]);
const DATA_KEY = /^[a-z][a-z0-9-]*$/;

function classify(k: string): number {
  if (k === "class") throw new TypeError("bt: classes go in the tag template: div`flex gap-4`(…), not in a class attribute");
  if (/^on/i.test(k)) throw new TypeError(`bt: refused attribute ${k}: inline event handlers are not rendered`);
  if (/^(data-)?hx-/i.test(k)) throw new TypeError(`bt: refused attribute ${k}: htmx attributes come from a route wire (route(...), .search(), .poll(), wire({…}))`);
  let kind = PLAIN;
  if (k === "style") kind = STYLE;
  else if (k === "data") kind = DATA;
  else if (k === "srcdoc") kind = SRCDOC;
  else if (URL_ATTRS.has(k)) kind = URL_;
  else if (!/^[a-zA-Z_][a-zA-Z0-9_.:-]*$/.test(k)) throw new TypeError(`bt: refused attribute name ${JSON.stringify(k.slice(0, 40))}`);
  KIND.set(k, kind);
  return kind;
}

function dataKey(k: string): string {
  if (!DATA_KEY.test(k) || k.startsWith("hx-") || k.startsWith("on")) throw new TypeError(`bt: refused data attribute name ${JSON.stringify(k.slice(0, 40))}`);
  return k;
}

function attrs(o: Record<string, any>): string {
  let s = "";
  for (const k in o) {
    const v = o[k];
    if (v == null || v === false) continue;
    let kind = KIND.get(k);
    if (kind === undefined) kind = classify(k);
    if (kind === PLAIN) {
      s += v === true ? " " + k : " " + k + '="' + esc(typeof v === "string" ? v : String(v)) + '"';
    } else if (kind === URL_) {
      s += " " + k + '="' + esc(safeUrl(String(v))) + '"';
    } else if (kind === STYLE) {
      let d = "";
      for (const p in v) {
        if (v[p] == null || v[p] === false) continue;
        if (!/^(--)?[a-zA-Z][a-zA-Z0-9-]*$/.test(p)) throw new TypeError(`bt: refused CSS property ${JSON.stringify(p.slice(0, 40))}`);
        d += (d ? "; " : "") + p + ": " + cssValue(v[p]);
      }
      if (d) s += ' style="' + esc(d) + '"';
    } else if (kind === DATA) {
      for (const dk in v) {
        const dv = v[dk];
        if (dv == null || dv === false) continue;
        s += " data-" + dataKey(dk) + (dv === true ? "" : '="' + esc(String(dv)) + '"');
      }
    } else {
      const sb = o.sandbox;
      if (typeof sb === "string" && /\ballow-scripts\b/.test(sb)) throw new TypeError("bt: srcdoc with sandbox allow-scripts runs the content in a scriptable frame; pass trusted markup through a src URL instead");
      s += ' srcdoc="' + esc(String(v)) + '"' + (sb == null ? ' sandbox=""' : "");
    }
  }
  return s;
}

// ───────────────────────── elements ─────────────────────────

function kid(c: any): string {
  if (typeof c === "string") return esc(c);
  if (c instanceof Html) return c.h;
  if (c == null || c === false || c === true) return "";
  if (typeof c === "number") return String(c);
  if (Array.isArray(c)) {
    let s = "";
    for (let i = 0; i < c.length; i++) s += kid(c[i]);
    return s;
  }
  if (typeof c === "function" && c.$bt === true) return c().h;
  if (c instanceof Wire || (typeof c === "object" && !(c instanceof Page))) throw new TypeError("bt: attributes and wires come before children: tag({…}, child, child)");
  throw new TypeError(`bt: cannot render a ${c instanceof Page ? "Page inside an element" : typeof c} as a child`);
}

function build(tag: string, open: string, close: string, args: any[], start: number): Html<any> {
  let s = open;
  let id: string | undefined;
  let typed = tag !== "button";
  const n = args.length;
  let i = start;
  for (; i < n; i++) {
    const a = args[i];
    if (typeof a !== "object" || a === null || a instanceof Html || Array.isArray(a)) break;
    if (a instanceof Wire) {
      s += a.on(tag);
      if (a.id !== undefined) id = a.id;
    } else {
      s += attrs(a);
      if (!typed && a.type != null) typed = true;
      if (typeof a.id === "string") id = a.id;
    }
  }
  if (!typed) s += ' type="button"';
  s += ">";
  if (close === "") {
    if (i < n) throw new TypeError(`bt: <${tag}> is a void element and takes no children`);
    return new Html(s, id);
  }
  for (; i < n; i++) s += kid(args[i]);
  return new Html(s + close, id);
}

const SITE = new WeakMap<TemplateStringsArray, any>();
const CHECKED = new WeakSet<TemplateStringsArray>();
const squash = (c: string): string => (/\s\s|^\s|\s$|[\n\t]/.test(c) ? c.replace(/\s+/g, " ").trim() : c);

function checkSite(strings: TemplateStringsArray): void {
  for (let i = 0; i < strings.length - 1; i++) {
    if (strings[i].endsWith(":")) throw new TypeError(`bt: a variant prefix applies to one class, not to a hole: write the prefix on each class inside the preset (…${strings[i].slice(-16)}\${…})`);
  }
  CHECKED.add(strings);
}

function classText(strings: TemplateStringsArray, holes: any[], from: number): string {
  if (strings.length === 1) return squash(strings[0]);
  if (!CHECKED.has(strings)) checkSite(strings);
  let c = strings[0];
  for (let i = 1; i < strings.length; i++) {
    const h = holes[from + i - 1];
    if (h) {
      if (!(h instanceof Cls)) throw new TypeError("bt: a class hole takes a cls`…` value (or false/null); a raw string is unchecked. Use cls.token(value) for one token from data");
      c += h.c;
    }
    c += strings[i];
  }
  return squash(c);
}

function make(tag: string, isVoid = false): any {
  const open = "<" + tag;
  const close = isVoid ? "" : "</" + tag + ">";
  const classed = (o: string) => {
    const f: any = (...args: any[]) => build(tag, o, close, args, 0);
    f.$bt = true;
    return f;
  };
  const el: any = function (...args: any[]) {
    const a0 = args[0];
    if (a0 != null && a0.raw !== undefined && Array.isArray(a0)) {
      if (a0.length === 1) {
        let f = SITE.get(a0 as any);
        if (f === undefined) {
          f = classed(open + ' class="' + esc(squash(a0[0])) + '"');
          SITE.set(a0 as any, f);
        }
        return f;
      }
      return classed(open + ' class="' + esc(classText(a0 as any, args, 1)) + '"');
    }
    return build(tag, open, close, args, 0);
  };
  el.$bt = true;
  return el;
}

/** A class preset: cls`p-6 bg-surface rounded-card`. Holes take other presets. */
export const cls: {
  (strings: TemplateStringsArray, ...holes: Hole[]): Cls;
  /** One class token from data (a state name, a slug). Refuses anything that is not a single token. */
  token(value: string): Cls;
} = Object.assign(
  (strings: TemplateStringsArray, ...holes: Hole[]) => new Cls(classText(strings, holes, 0)),
  {
    token(value: string) {
      if (!/^[A-Za-z0-9_:\-./[\]%#]+$/.test(value)) throw new TypeError(`bt: refused class token ${JSON.stringify(value.slice(0, 40))}`);
      return new Cls(value);
    },
  },
);

// ───────────────────────── element types ─────────────────────────

type Style = Record<string, string | number | false | null | undefined>;
type NoClass = "classes go in the tag template: div`flex gap-4`(…)";
type NoHandler = "inline event handlers are not rendered: use a route wire or a native command";
type NoHx = "htmx attributes come from a route wire: route(...), .search(), .poll(), wire({…})";

export interface Global {
  id?: string;
  title?: V;
  hidden?: B | "until-found";
  role?: V;
  tabindex?: number;
  lang?: V;
  dir?: "ltr" | "rtl" | "auto";
  inert?: B;
  popover?: B | "auto" | "manual";
  style?: Style;
  data?: Record<string, V | true>;
  [k: `data-${string}`]: V | true;
  [k: `aria-${string}`]: V | boolean;
  class?: NoClass;
  onclick?: NoHandler;
  [k: `hx-${string}`]: NoHx;
}
type Cmd = { command?: "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover"; commandfor?: string; popovertarget?: string };
export interface Attrs {
  a: Global & { href?: string; target?: "_blank" | "_self" | "_top"; rel?: V; download?: V | true };
  button: Global & Cmd & { type?: "button" | "submit" | "reset"; name?: string; value?: V; disabled?: B; form?: string; formaction?: string; autofocus?: B };
  input: Global & {
    type?: "text" | "search" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "time" | "checkbox" | "radio" | "hidden" | "file" | "range" | "color";
    name?: string; value?: V; placeholder?: V; required?: B; disabled?: B; readonly?: B; checked?: B; autofocus?: B;
    min?: V; max?: V; step?: V; minlength?: number; maxlength?: number; pattern?: V; autocomplete?: V; list?: V; multiple?: B; accept?: V;
  };
  textarea: Global & { name?: string; rows?: number; cols?: number; placeholder?: V; required?: B; disabled?: B; readonly?: B; minlength?: number; maxlength?: number };
  select: Global & { name?: string; required?: B; disabled?: B; multiple?: B };
  option: Global & { value?: V; selected?: B; disabled?: B };
  label: Global & { for?: string };
  form: Global & { action?: string; method?: "get" | "post" | "dialog"; enctype?: "multipart/form-data"; novalidate?: B; autocomplete?: "on" | "off" };
  img: Global & { src: string; alt: string; width?: number; height?: number; loading?: "lazy" | "eager"; decoding?: "async" | "sync" | "auto"; srcset?: string; sizes?: V };
  iframe: Global & { src?: string; srcdoc?: string; sandbox?: string; title?: V; loading?: "lazy" | "eager"; allow?: V; width?: number; height?: number };
  dialog: Global & { open?: B; closedby?: "any" | "closerequest" | "none" };
  td: Global & { colspan?: number; rowspan?: number; headers?: V };
  th: Global & { colspan?: number; rowspan?: number; scope?: "col" | "row" | "colgroup" | "rowgroup" };
  time: Global & { datetime?: V };
  meta: Global & { name?: V; content?: V; charset?: "utf-8"; property?: V };
  link: Global & { rel: string; href: string; type?: V; as?: V; crossorigin?: V };
  script: Global & { src: string; type?: "module"; defer?: B; async?: B };
  details: Global & { open?: B; name?: V };
}

export interface El<A = Global, R = never> {
  /** tag`classes` is the same tag with a class attribute; it is also a valid child on its own (an empty element). */
  (classes: TemplateStringsArray, ...holes: Hole[]): El<A, R>;
  <I extends string>(root: Root<I>, ...rest: (A | R | Wire | Child)[]): Html<I>;
  (...args: (A | R | Wire | Child)[]): Html<undefined>;
  readonly $bt: true;
}
export interface VoidEl<A = Global, R = never> {
  (classes: TemplateStringsArray, ...holes: Hole[]): VoidEl<A, R>;
  <I extends string>(root: Root<I>, ...rest: (A | R | Wire)[]): Html<I>;
  (...args: (A | R | Wire)[]): Html<undefined>;
  readonly $bt: true;
}
type AnyEl = { readonly $bt: true };

const e = <A = Global, R = never>(tag: string): El<A, R> => make(tag);
const v = <A = Global, R = never>(tag: string): VoidEl<A, R> => make(tag, true);

export const div = e("div"), span = e("span"), p = e("p"), main = e("main"), section = e("section"), article = e("article");
export const header = e("header"), footer = e("footer"), nav = e("nav"), aside = e("aside");
export const h1 = e("h1"), h2 = e("h2"), h3 = e("h3"), h4 = e("h4");
export const ul = e("ul"), ol = e("ol"), li = e("li"), dl = e("dl"), dt = e("dt"), dd = e("dd");
export const table = e("table"), thead = e("thead"), tbody = e("tbody"), tr = e("tr");
export const td = e<Attrs["td"]>("td"), th = e<Attrs["th"]>("th");
export const strong = e("strong"), em = e("em"), small = e("small"), code = e("code"), pre = e("pre");
export const time = e<Attrs["time"]>("time");
export const a = e<Attrs["a"], PageRef>("a");
export const button = e<Attrs["button"], ActionRef<any>>("button");
export const form = e<Attrs["form"], PageRef>("form");
export const label = e<Attrs["label"]>("label");
export const select = e<Attrs["select"]>("select"), option = e<Attrs["option"]>("option");
export const textarea = e<Attrs["textarea"]>("textarea");
export const dialog = e<Attrs["dialog"]>("dialog");
export const details = e<Attrs["details"]>("details"), summary = e("summary");
export const iframe = e<Attrs["iframe"]>("iframe");
export const title = e("title");
export const input = v<Attrs["input"]>("input"), img = v<Attrs["img"]>("img"), hr = v("hr"), br = v("br");
export const meta = v<Attrs["meta"]>("meta"), link = v<Attrs["link"]>("link");
/** External script only. Data for scripts goes through json() or jsVar(). */
export const script: (a: Attrs["script"]) => Html<undefined> = (a) => new Html("<script" + attrs(a) + "></script>");

// ───────────────────────── safe sinks ─────────────────────────

const JSON_ESC: Record<string, string> = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" };
const jsonText = (data: unknown): string => JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => JSON_ESC[c]);
/** Data for client code: <script type="application/json">. */
export const json = (data: unknown, a?: { id?: string }): Html<undefined> =>
  new Html('<script type="application/json"' + (a ? attrs(a) : "") + ">" + jsonText(data) + "</script>");
/** Data handed to inline JS as one global: <script>window.NAME = …</script>. */
export function jsVar(name: string, data: unknown): Html<undefined> {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) throw new TypeError(`bt: refused global name ${JSON.stringify(name.slice(0, 40))}`);
  return new Html("<script>window." + name + " = " + jsonText(data) + "</script>");
}
export class Css {
  declare readonly $css: true;
  t: string;
  constructor(t: string) {
    this.t = t;
  }
}
/** A stylesheet: the literal text is yours, each hole is one CSS value from data. */
export function css(strings: TemplateStringsArray, ...holes: (string | number)[]): Css {
  let t = strings[0];
  for (let i = 1; i < strings.length; i++) t += cssValue(holes[i - 1]) + strings[i];
  if (/<\/style/i.test(t)) throw new TypeError("bt: refused </style in a stylesheet");
  return new Css(t);
}
export const style = (sheet: Css): Html<undefined> => new Html("<style>" + sheet.t + "</style>");

export class Trusted {
  declare readonly $trusted: true;
  h: string;
  constructor(h: string) {
    this.h = h;
  }
}
/** Markup you wrote: a template with no holes. The only other source of Trusted is a sanitizer you register. */
export function trusted(strings: TemplateStringsArray): Trusted {
  if (strings.length !== 1) throw new TypeError("bt: trusted`…` takes no holes");
  return new Trusted(strings[0]);
}
export const raw = (t: Trusted): Html<undefined> => {
  if (!(t instanceof Trusted)) throw new TypeError("bt: raw() takes trusted`…` markup, never a string");
  return new Html(t.h);
};

// ───────────────────────── routes and wires ─────────────────────────

type Kind = "string" | "string?" | "number" | "number?" | "boolean?";
type Shape = Record<string, Kind>;
type TypeOf<K> = K extends `number${string}` ? number : K extends `boolean${string}` ? boolean : string;
type Params<P extends string> = P extends `${string}:${infer N}/${infer R}` ? N | Params<`/${R}`> : P extends `${string}:${infer N}` ? N : never;
type Flat<T> = { [K in keyof T]: T[K] } & {};
export type Input<P extends string, S extends Shape> = Flat<
  { [K in Params<P>]: K extends keyof S ? TypeOf<S[K]> : string }
  & { [K in Exclude<keyof S, Params<P>> as S[K] extends `${string}?` ? never : K]: TypeOf<S[K]> }
  & { [K in Exclude<keyof S, Params<P>> as S[K] extends `${string}?` ? K : never]?: TypeOf<S[K]> }
>;

/** Any Standard Schema (zod, valibot, arktype). */
export interface Schema<T> {
  readonly "~standard": {
    validate(value: unknown): { value: T; issues?: undefined } | { issues: readonly { message: string; path?: readonly (PropertyKey | { key: PropertyKey })[] }[] } | Promise<any>;
    readonly types?: { input: unknown; output: T };
  };
}

interface PageDef<P extends string, S extends Shape> { k: "page"; path: P; shape: S }
interface PartDef<I extends string, P extends string, S extends Shape> { k: "part"; id: I; path: P; shape: S }
interface ActionDef<P extends string, Bd, S extends Shape> { k: "post"; path: P; body: Schema<Bd> | undefined; shape: S }
type AnyDef = PageDef<any, any> | PartDef<any, any, any> | ActionDef<any, any, any>;

/** A GET route that answers a page. Inputs named in the path are path parameters; the rest are the query. */
export function page<const P extends string = "/", const S extends Shape = {}>(path?: P, inputs?: S): PageDef<P, S> {
  return { k: "page", path: (path ?? "/") as P, shape: (inputs ?? {}) as S };
}
/** A GET route that answers one fragment: the element whose root carries `id`. */
export function part<const I extends string, const P extends string, const S extends Shape = {}>(id: I, path: P, inputs?: S): PartDef<I, P, S> {
  return { k: "part", id, path, shape: (inputs ?? {}) as S };
}
/** A POST route. With a body schema it owns a form: invalid input answers 422 into the form. */
export function post<const P extends string, const S extends Shape = {}>(path: P, inputs?: S): ActionDef<P, undefined, S>;
export function post<const P extends string, Bd, const S extends Shape = {}>(path: P, body: Schema<Bd>, inputs?: S): ActionDef<P, Bd, S>;
export function post(path: string, a?: any, b?: any): any {
  const hasBody = a != null && a["~standard"] !== undefined;
  return { k: "post", path, body: hasBody ? a : undefined, shape: (hasBody ? b : a) ?? {} };
}

type Call<In, R> = {} extends In ? (input?: In) => R : (input: In) => R;
export type PageRoute<In> = Call<In, PageRef> & { readonly $k: "page"; readonly $in: In };
export type PartRoute<I extends string, In> = Call<In, PartRef<I, In>> & { readonly $k: "part"; readonly $in: In; readonly $i: I };
export type ActionRoute<In, Bd> = Call<In, ActionRef<Bd>> & { readonly $k: "post"; readonly $in: In; readonly $b: Bd };
type RouteOf<D> = D extends PageDef<infer P, infer S> ? PageRoute<Input<P, S>>
  : D extends PartDef<infer I, infer P, infer S> ? PartRoute<I, Input<P, S>>
  : D extends ActionDef<infer P, infer Bd, infer S> ? ActionRoute<Input<P, S>, Bd>
  : never;

const MAIN = "main";
const NAV = ` hx-target="#${MAIN}" hx-swap="outerMorph show:top" hx-push-url="true"`;

/** A page address. As a leading argument: a(ref, …) links to it, form(ref, …) is a GET form to it. */
export class PageRef extends Wire {
  declare readonly $ref: "page";
  url: string;
  constructor(url: string) {
    super("");
    this.url = url;
  }
  on(tag: string): string {
    if (tag === "a") return ' href="' + esc(this.url) + '"';
    if (tag === "form") return ' action="' + esc(this.url) + '" method="get"';
    throw new TypeError(`bt: a page route goes on a(…) or form(…), not <${tag}>`);
  }
}

type Every = `${number}s` | `${number}ms`;
/** A fragment address plus the wires that load it. */
export class PartRef<I extends string, In = {}> {
  declare readonly $ref: "part";
  declare readonly $in: In;
  url: string;
  id: I;
  constructor(url: string, id: I) {
    this.url = url;
    this.id = id;
  }
  /** Marks the element as this part's root (it carries the id). */
  get root(): Root<I> {
    return new Root<I>(' id="' + this.id + '"', this.id);
  }
  /** Root that refreshes itself while `every` is set; pass false to render the settled root, which stops the poll. */
  poll(every: Every | false | null | undefined): Root<I> {
    if (!every) return this.root;
    return new Root<I>(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="every ${every}" hx-target="this" hx-swap="outerHTML"`, this.id);
  }
  /** Root that loads itself once after the page arrives. */
  defer(): Root<I> {
    return new Root<I>(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="load" hx-target="this" hx-swap="outerHTML" hx-sync="this:replace"`, this.id);
  }
  /** On an input: names the field and reloads the part after typing stops. */
  search(name: keyof In & string): Wire {
    return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="input changed delay:300ms, search" hx-target="#${this.id}" hx-swap="outerMorph" hx-sync="this:replace"`);
  }
  /** On a select or checkbox: names the field and reloads the part when it changes. */
  change(name: keyof In & string): Wire {
    return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="change" hx-target="#${this.id}" hx-swap="outerMorph" hx-include="closest form"`);
  }
  /** On a button or link: reloads the part on click. */
  load(): Wire {
    return new Wire(` hx-get="${esc(this.url)}" hx-target="#${this.id}" hx-swap="outerMorph"`);
  }
}

export type FormState<R> = R extends { readonly $b: infer Bd } ? State<Bd> : never;
type State<Bd> = { values?: { [K in keyof Bd]?: unknown }; errors?: { [K in keyof Bd]?: string } };
type Named<K, A, Out> = {
  (name: K, attrs?: A): Out;
  (classes: TemplateStringsArray, ...holes: Hole[]): (name: K, attrs?: A) => Out;
};
export interface Fields<Bd> {
  /** <input> bound to a schema field: name, id, value, aria-invalid and aria-describedby are filled in. */
  input: Named<keyof Bd & string, Omit<Attrs["input"], "name" | "value" | "id">, Html<undefined>>;
  textarea: Named<keyof Bd & string, Omit<Attrs["textarea"], "name" | "id">, Html<undefined>>;
  /** <select> whose options are a record of value to label; the record must cover the field's values. */
  select: {
    <K extends keyof Bd & string>(name: K, options: Record<Extract<Bd[K], string>, string>, attrs?: Omit<Attrs["select"], "name" | "id">): Html<undefined>;
    (classes: TemplateStringsArray, ...holes: Hole[]): <K extends keyof Bd & string>(name: K, options: Record<Extract<Bd[K], string>, string>, attrs?: Omit<Attrs["select"], "name" | "id">) => Html<undefined>;
  };
  checkbox: Named<keyof Bd & string, Omit<Attrs["input"], "name" | "type" | "checked" | "id">, Html<undefined>>;
  hidden(name: keyof Bd & string, value: V): Html<undefined>;
  /** The field's error message, wired to its control; renders nothing when the field is valid. */
  error: Named<keyof Bd & string, Global, Html<undefined> | null>;
}
type FormCall<Bd> = (state: State<Bd>, body: (f: Fields<Bd>) => Child) => Html<undefined>;

/** A POST address. As a leading argument of button(…) it posts on click. `.form` builds its schema-bound form. */
export class ActionRef<Bd> extends Wire {
  declare readonly $ref: "post";
  declare readonly $b: Bd;
  url: string;
  formId: string;
  constructor(url: string, formId: string) {
    super("");
    this.url = url;
    this.formId = formId;
  }
  on(tag: string): string {
    if (tag === "button") return ` hx-post="${esc(this.url)}"${NAV}`;
    throw new TypeError(`bt: an action route goes on button(…) or through .form, not <${tag}>`);
  }
  /** Posts with no swap (a counter, a like). */
  fire(): Wire {
    return new Wire(` hx-post="${esc(this.url)}" hx-swap="none"`);
  }
  get form(): FormCall<Bd> & ((classes: TemplateStringsArray, ...holes: Hole[]) => FormCall<Bd>) {
    const run = (klass: string) => (state: State<Bd>, body: (f: Fields<Bd>) => Child) => {
      const id = this.formId;
      const u = esc(this.url);
      const open = `<form${klass} id="${id}" action="${u}" method="post" hx-post="${u}"${NAV} hx-status:422="target:#${id} swap:outerMorph push:false">`;
      return new Html<undefined>(open + kid(body(fields(id, state))) + "</form>", id);
    };
    const f: any = (a0: any, ...rest: any[]) =>
      a0 != null && a0.raw !== undefined ? run(' class="' + esc(classText(a0, rest, 0)) + '"') : run("")(a0, rest[0]);
    return f;
  }
}

function fields(formId: string, state: State<any>): Fields<any> {
  const values: Record<string, unknown> = state.values ?? {};
  const errors: Record<string, string | undefined> = state.errors ?? {};
  const base = formId.replace(/-form$/, "");
  const wired = (name: string) => ` name="${esc(name)}" id="${base}-${esc(name)}"` + (errors[name] ? ` aria-invalid="true" aria-describedby="${base}-${esc(name)}-error"` : "");
  const named = (render: (klass: string, name: string, a?: any, b?: any) => any) => {
    const f: any = (a0: any, ...rest: any[]) =>
      a0 != null && a0.raw !== undefined
        ? (name: string, a?: any, b?: any) => render(' class="' + esc(classText(a0, rest, 0)) + '"', name, a, b)
        : render("", a0, rest[0], rest[1]);
    return f;
  };
  const val = (name: string) => (values[name] == null ? "" : String(values[name]));
  return {
    input: named((k, name, a) => {
      const type = a?.type ?? "text";
      const value = type === "password" || val(name) === "" ? "" : ` value="${esc(val(name))}"`;
      return new Html(`<input${k}${wired(name)}${a?.type ? "" : ' type="text"'}${value}${a ? attrs(a) : ""}>`);
    }),
    textarea: named((k, name, a) => new Html(`<textarea${k}${wired(name)}${a ? attrs(a) : ""}>${esc(val(name))}</textarea>`)),
    select: named((k, name, options, a) => {
      let o = "";
      for (const value in options) o += `<option value="${esc(value)}"${val(name) === value ? " selected" : ""}>${esc(options[value])}</option>`;
      return new Html(`<select${k}${wired(name)}${a ? attrs(a) : ""}>${o}</select>`);
    }),
    checkbox: named((k, name, a) => new Html(`<input${k}${wired(name)} type="checkbox"${values[name] ? " checked" : ""}${a ? attrs(a) : ""}>`)),
    hidden: (name, value) => new Html(`<input type="hidden" name="${esc(name)}" value="${esc(String(value ?? ""))}">`),
    error: named((k, name, a) => (errors[name] ? new Html(`<span${k} id="${base}-${esc(name)}-error"${a ? attrs(a) : ""}>${esc(errors[name]!)}</span>`) : null)),
  };
}

export function routes<const D extends Record<string, AnyDef>>(prefix: string, defs: D): { [K in keyof D]: RouteOf<D[K]> } {
  const out: any = {};
  const group = prefix.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  for (const key in defs) {
    const def: AnyDef = defs[key];
    const full = (prefix + (def.path === "/" ? "" : def.path)) || "/";
    const segs = full.split(/:([A-Za-z_][A-Za-z0-9_]*)/);
    const pathKeys = new Set<string>();
    for (let i = 1; i < segs.length; i += 2) pathKeys.add(segs[i]);
    const hasQuery = Object.keys(def.shape).some((k) => !pathKeys.has(k));
    const url = (input: any): string => {
      let u = segs[0];
      for (let i = 1; i < segs.length; i += 2) {
        const pv = input?.[segs[i]];
        if (pv == null || pv === "") throw new TypeError(`bt: route ${group}.${key} needs ${segs[i]}`);
        u += encodeURIComponent(String(pv)) + segs[i + 1];
      }
      if (hasQuery && input) {
        let q = "";
        for (const k in input) {
          if (pathKeys.has(k)) continue;
          const qv = input[k];
          if (qv == null || qv === "" || qv === false) continue;
          q += (q ? "&" : "?") + encodeURIComponent(k) + "=" + encodeURIComponent(String(qv));
        }
        u += q;
      }
      return u;
    };
    const formId = `${group}-${key}-form`;
    const fn: any =
      def.k === "page" ? (input: any) => new PageRef(url(input))
      : def.k === "part" ? (input: any) => new PartRef(url(input), def.id)
      : (input: any) => new ActionRef(url(input), formId);
    fn.def = def;
    fn.key = key;
    fn.pattern = full;
    out[key] = fn;
  }
  return out;
}

/** The escape hatch for htmx: a request the route wires do not cover. Every value is checked. */
export function wire(o: {
  get?: string; post?: string; put?: string; delete?: string;
  target?: string; swap?: "outerMorph" | "innerMorph" | "outerHTML" | "innerHTML" | "none" | "beforeend" | "afterbegin";
  trigger?: "click" | "change" | "load" | "revealed" | "submit" | Every;
  confirm?: string; vals?: Record<string, unknown>; headers?: Record<string, string>; push?: boolean;
}): Wire {
  let s = "";
  for (const m of ["get", "post", "put", "delete"] as const) {
    const u = o[m];
    if (u == null) continue;
    if (HTMX_JS.test(u) || safeUrl(u) !== u) throw new TypeError(`bt: refused htmx URL ${JSON.stringify(u.slice(0, 40))}`);
    s += ` hx-${m}="${esc(u)}"`;
  }
  if (o.target != null) {
    if (!/^(this|#[A-Za-z][\w-]*|closest [a-z][\w-]*)$/.test(o.target)) throw new TypeError(`bt: refused htmx target ${JSON.stringify(o.target.slice(0, 40))}`);
    s += ` hx-target="${o.target}"`;
  }
  if (o.swap != null) s += ` hx-swap="${esc(o.swap)}"`;
  if (o.trigger != null) {
    if (!/^(click|change|load|revealed|submit|\d+(ms|s))$/.test(o.trigger)) throw new TypeError(`bt: refused htmx trigger ${JSON.stringify(String(o.trigger).slice(0, 40))}`);
    s += ` hx-trigger="${/^\d/.test(o.trigger) ? "every " + o.trigger : o.trigger}"`;
  }
  if (o.confirm != null) {
    if (HTMX_JS.test(o.confirm)) throw new TypeError("bt: refused confirm text that htmx would run as JavaScript (js: prefix)");
    s += ` hx-confirm="${esc(o.confirm)}"`;
  }
  if (o.vals != null) s += ` hx-vals="${esc(JSON.stringify(o.vals))}"`;
  if (o.headers != null) s += ` hx-headers="${esc(JSON.stringify(o.headers))}"`;
  if (o.push) s += ' hx-push-url="true"';
  return new Wire(s);
}

/** A native modal dialog: three attribute sets that cannot drift apart. */
export function modal(id: string): { open: Attrs["button"]; root: Attrs["dialog"]; close: Attrs["button"] } {
  return { open: { command: "show-modal", commandfor: id }, root: { id, closedby: "any" }, close: { command: "close", commandfor: id } };
}

// ───────────────────────── control flow ─────────────────────────

/** Exhaustive dispatch: on a value, or on an object's discriminant. A missing case is a compile error. */
export function match<K extends PropertyKey, R>(value: K, cases: { [P in K]: (value: P) => R }): R;
export function match<T, D extends keyof T, R>(value: T, key: D, cases: { [P in T[D] & PropertyKey]: (value: Extract<T, Record<D, P>>) => R }): R;
export function match(value: any, a: any, b?: any): any {
  return b === undefined ? a[value](value) : b[value[a]](value);
}

// ───────────────────────── documents and handlers ─────────────────────────

/** The document shell. An app wraps this once in its own Layout({ title }, …children). */
export function doc(o: { title: string; lang?: string; description?: string; head?: Child }, ...body: Child[]): Page {
  return new Page(
    `<!DOCTYPE html><html lang="${esc(o.lang ?? "en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(o.title)}</title>` +
      (o.description ? `<meta name="description" content="${esc(o.description)}">` : "") + kid(o.head) +
      `</head><body hx-boost:inherited="true" hx-target:inherited="#${MAIN}" hx-swap:inherited="outerMorph show:top">${kid(body)}</body></html>`,
  );
}

export class Redirect { declare readonly $redirect: true; to: string; constructor(to: string) { this.to = to; } }
export class NotFound { declare readonly $notFound: true; }
export class Invalid<Bd> { declare readonly $invalid: Bd; errors: Record<string, string | undefined>; constructor(errors: any) { this.errors = errors; } }
type Awaitable<T> = T | Promise<T>;
export interface Ctx<In, Bd = undefined> {
  input: In;
  body: Bd;
  redirect(to: PageRef): Redirect;
  notFound(): NotFound;
  /** Answers 422 with the route's form re-rendered with these errors. */
  invalid(errors: { [K in keyof Bd]?: string }): Invalid<Bd>;
  request: unknown;
}
export type Entry<R> = R extends { readonly $k: "page"; readonly $in: infer In } ? (ctx: Ctx<In>) => Awaitable<Page | Redirect | NotFound>
  : R extends { readonly $k: "part"; readonly $in: infer In; readonly $i: infer I extends string } ? (ctx: Ctx<In>) => Awaitable<Html<I> | NotFound>
  : R extends { readonly $k: "post"; readonly $in: infer In; readonly $b: infer Bd } ? (undefined extends Bd ? (ctx: Ctx<In>) => Awaitable<Redirect | Page | NotFound>
    : { form: (state: State<Bd>) => Html; ok: (ctx: Ctx<In, Bd>) => Awaitable<Redirect | Invalid<Bd> | Page | NotFound> })
  : never;

export type Answer = { status: number; body?: string; location?: string };
/** One entry per route; a missing or extra key is a compile error. Returns a dispatcher the server adapter mounts. */
export function handlers<R extends Record<string, { readonly $k: string }>>(table: R, entries: { [K in keyof R]: Entry<R[K]> }) {
  const reply = (out: any, def: AnyDef, key: string): Answer => {
    if (out instanceof Redirect) return { status: 303, location: out.to };
    if (out instanceof NotFound) return { status: 404 };
    if (def.k === "part") {
      if (!(out instanceof Html) || out.id !== def.id) throw new TypeError(`bt: ${key} must answer the element whose root is ${key}().root (id ${def.id})`);
      return { status: 200, body: out.h };
    }
    if (!(out instanceof Page)) throw new TypeError(`bt: ${key} must answer a page (the app Layout) or a redirect`);
    return { status: 200, body: out.h };
  };
  return async function dispatch(key: keyof R & string, req: { input?: any; body?: any; request?: unknown } = {}): Promise<Answer> {
    const def: AnyDef = (table[key] as any).def;
    const entry: any = entries[key];
    const base = {
      input: req.input ?? {},
      body: undefined as any,
      request: req.request,
      redirect: (to: PageRef) => new Redirect(to.url),
      notFound: () => new NotFound(),
      invalid: (errors: any) => new Invalid(errors),
    };
    if (def.k !== "post" || def.body === undefined) return reply(await entry(base), def, key);
    const res = await def.body["~standard"].validate(req.body);
    const values = req.body ?? {};
    if (res.issues) {
      const errors: Record<string, string> = {};
      for (const issue of res.issues) {
        const seg = issue.path?.[0];
        const name = String(typeof seg === "object" && seg !== null ? (seg as any).key : seg);
        errors[name] ??= issue.message;
      }
      return { status: 422, body: entry.form({ values, errors }).h };
    }
    const out = await entry.ok({ ...base, body: res.value });
    if (out instanceof Invalid) return { status: 422, body: entry.form({ values, errors: out.errors }).h };
    return reply(out, def, key);
  };
}
