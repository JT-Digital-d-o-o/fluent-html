// Sealed Sinks prototype runtime. Research prototype: renders the bench page, the XSS
// fixture contexts and the three reference screens, nothing more.
//
// One rule: a value reaches the output only through the encoder of the sink it sits in.
// Sinks are picked by (element, attribute) at the jsx() call, never by the author.
// Trusted values are class instances (instanceof), never shapes: parsed JSON cannot forge one.

const KEY = Symbol("sealed");

// ---------------------------------------------------------------- escaping
const ESC_RE = /[&<>"']/;
const ESC_G = /[&<>"']/g;
const ESC_MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const rep = (c: string) => ESC_MAP[c]!;
const esc = (s: string): string => (ESC_RE.test(s) ? s.replace(ESC_G, rep) : s);

function fail(msg: string): never {
  throw new TypeError(`sealed: ${msg}`);
}
const show = (v: unknown) => (typeof v === "string" ? JSON.stringify(v.slice(0, 40)) : Object.prototype.toString.call(v));

// ---------------------------------------------------------------- brands
export class Html {
  declare private readonly __html: true;
  readonly s: string;
  readonly id: string | undefined;
  constructor(key: symbol, s: string, id?: string) {
    if (key !== KEY) fail("Html comes from JSX, html`...` or sanitize(); there is no constructor from a string");
    this.s = s;
    this.id = id;
  }
  toString(): never {
    return fail("an Html value was stringified; pass it as a JSX child, or call render(view, ctx) at the response");
  }
}
const EMPTY = new Html(KEY, "");

export class Id<N extends string = string> {
  declare private readonly __id: true;
  constructor(key: symbol, readonly name: N) {
    if (key !== KEY) fail("ids come from defineIds()");
  }
}

export type Method = "get" | "post" | "put" | "patch" | "delete";
export type RouteKind = "page" | "fragment" | "none";

export class Route<K extends RouteKind = RouteKind, M extends Method = Method, B = unknown> {
  declare readonly __body: B;
  constructor(
    key: symbol,
    readonly kind: K,
    readonly method: M,
    readonly url: string,
    readonly region: string | undefined,
    readonly invalid: string | undefined,
  ) {
    if (key !== KEY) fail("routes come from defineRoutes() or localUrl()");
  }
}

export class Css {
  declare private readonly __css: true;
  constructor(key: symbol, readonly s: string) {
    if (key !== KEY) fail("Css comes from css`...`");
  }
}
export class Json {
  declare private readonly __json: true;
  constructor(key: symbol, readonly s: string) {
    if (key !== KEY) fail("Json comes from json(data)");
  }
}
export class Js {
  declare private readonly __js: true;
  constructor(key: symbol, readonly s: string) {
    if (key !== KEY) fail("Js comes from js`...`");
  }
}
export class Verb {
  declare private readonly __verb: true;
  constructor(key: symbol, readonly attrs: string, readonly selfId: string | undefined) {
    if (key !== KEY) fail("hx verbs come from search(), poll(), swap(), fire(), load()");
  }
}

export type Child = string | number | bigint | boolean | null | undefined | Html | readonly Child[];
export type ScriptBody = Json | Js;

// ---------------------------------------------------------------- ids and routes
type Kebab<S extends string> = S extends `${infer H}${infer T}`
  ? T extends Uncapitalize<T> ? `${Lowercase<H>}${Kebab<T>}` : `${Lowercase<H>}-${Kebab<T>}`
  : S;
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const ID_RE = /^[a-z][a-z0-9-]*$/;

export function defineIds<const T extends readonly string[]>(names: T): { [K in T[number]]: Id<Kebab<K>> } {
  const out: Record<string, Id> = {};
  for (const n of names) {
    const k = kebab(n);
    if (!ID_RE.test(k)) fail(`defineIds: ${show(n)} is not an identifier`);
    out[n] = new Id(KEY, k);
  }
  return out as never;
}

export type ParamKind = "string" | "number" | "uuid";
type KindOf<K> = K extends "number" ? number : string;
export type Schema<T = unknown> = { readonly static: T };
export type RouteDef = {
  readonly method?: Method;
  readonly path: string;
  readonly params?: Readonly<Record<string, ParamKind>>;
  readonly query?: Readonly<Record<string, ParamKind>>;
  readonly body?: Schema;
  /** A fragment route: answers exactly this region. */
  readonly region?: Id;
  /** A form route: a 422 answer re-renders this region. */
  readonly invalid?: Id;
  /** A machine route: JSON, bytes, an off-origin redirect. */
  readonly render?: "none";
};
type ParamsOf<D> = D extends { params: infer P } ? { [K in keyof P]: KindOf<P[K]> } : {};
type QueryOf<D> = D extends { query: infer Q } ? { [K in keyof Q]?: KindOf<Q[K]> | null } : {};
type BodyOf<D> = D extends { body: Schema<infer B> } ? B : never;
type KindFor<D> = D extends { region: Id } ? "fragment" : D extends { render: "none" } ? "none" : "page";
type MethodOf<D> = D extends { method: infer M extends Method } ? M : "get";
export type RouteOf<D> = Route<KindFor<D>, MethodOf<D>, BodyOf<D>>;
type Simplify<T> = { [K in keyof T]: T[K] } & {};
export type RouteFn<D> = ({} extends ParamsOf<D>
  ? (args?: Simplify<ParamsOf<D> & QueryOf<D>>) => RouteOf<D>
  : (args: Simplify<ParamsOf<D> & QueryOf<D>>) => RouteOf<D>) & { readonly def: D; readonly __body: BodyOf<D> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function defineRoutes<const T extends Record<string, RouteDef>>(prefix: string, defs: T): { [K in keyof T]: RouteFn<T[K]> } {
  const out: Record<string, unknown> = {};
  for (const name of Object.keys(defs)) {
    const d = defs[name]!;
    const full = (prefix + (d.path === "/" ? "" : d.path)) || "/";
    const parts = full.split(/(:[A-Za-z_]\w*)/);
    const params = d.params ?? {};
    const query = d.query ?? {};
    for (let i = 1; i < parts.length; i += 2) {
      if (!(parts[i]!.slice(1) in params)) fail(`route ${name}: path param ${parts[i]} has no entry in params`);
    }
    const kind: RouteKind = d.region ? "fragment" : d.render === "none" ? "none" : "page";
    const method = d.method ?? "get";
    const region = d.region?.name;
    const invalid = d.invalid?.name;
    const isStatic = parts.length === 1;
    const staticRoute = isStatic ? new Route(KEY, kind, method, full, region, invalid) : undefined;
    const fn = (args?: Record<string, unknown>) => {
      if (args === undefined && staticRoute) return staticRoute;
      let url = parts[0]!;
      for (let i = 1; i < parts.length; i += 2) {
        const key = parts[i]!.slice(1);
        const v = args?.[key];
        const want = params[key];
        if (want === "number" ? typeof v !== "number" || !Number.isFinite(v) : typeof v !== "string" || v === "" || (want === "uuid" && !UUID_RE.test(v))) {
          fail(`route ${name}: param ${key} must be a ${want}, got ${show(v)}`);
        }
        url += encodeURIComponent(String(v)) + parts[i + 1]!;
      }
      let sep = "?";
      if (args) {
        for (const k in args) {
          if (k in params) continue;
          if (!(k in query)) fail(`route ${name}: ${show(k)} is neither a path param nor a declared query key`);
          const v = args[k];
          if (v == null || v === "") continue;
          url += sep + encodeURIComponent(k) + "=" + encodeURIComponent(String(v));
          sep = "&";
        }
      }
      return new Route(KEY, kind, method, url, region, invalid);
    };
    (fn as unknown as { def: RouteDef }).def = d;
    out[name] = fn;
  }
  return out as never;
}

/** A same-origin path that arrives as data (a stored return path). Returns null when it is not one. */
export function localUrl(path: string, opts: { region?: Id; method?: Method } = {}): Route<"fragment" | "none", Method> | null {
  if (typeof path !== "string" || path.charCodeAt(0) !== 47) return null;
  const c1 = path.charCodeAt(1);
  if (c1 === 47 || c1 === 92 || /[\u0000-\u001f\\]/.test(path)) return null;
  return new Route(KEY, opts.region ? "fragment" : "none", opts.method ?? "get", path, opts.region?.name, undefined);
}

// ---------------------------------------------------------------- htmx verbs
// htmx 4 evaluates a value that starts with js: or javascript: (hx-get/post/..., hx-confirm,
// string hx-vals/hx-headers), every hx-on*, and hx-trigger filters. None of these is
// writable: URLs are Route objects, vals/headers are objects serialised here, triggers are a
// closed set, and hx-* attribute names are refused at the attribute sink.
export type Every = `${number}s` | `${number}ms`;
export type VerbOpts = { vals?: Record<string, unknown>; headers?: Record<string, string>; confirm?: string; include?: Id };
const EVERY_RE = /^\d+(ms|s)$/;
const WORD_JOINER = "\u2060";

function reqAttr(route: Route): string {
  if (!(route instanceof Route)) fail(`an hx verb takes a route, got ${show(route)}. Routes come from defineRoutes(); a path stored as data goes through localUrl()`);
  return " hx-" + route.method + '="' + esc(route.url) + '"';
}
function optAttrs(o: VerbOpts | undefined): string {
  if (!o) return "";
  let s = "";
  if (o.vals !== undefined) s += ' hx-vals="' + esc(jsonObject(o.vals, "vals")) + '"';
  if (o.headers !== undefined) s += ' hx-headers="' + esc(jsonObject(o.headers, "headers")) + '"';
  if (o.confirm !== undefined) s += ' hx-confirm="' + esc(htmxText(String(o.confirm))) + '"';
  if (o.include !== undefined) s += ' hx-include="#' + idOf(o.include, "include") + '"';
  return s;
}
function jsonObject(v: unknown, what: string): string {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(`hx ${what} must be an object, got ${show(v)}`);
  return JSON.stringify(v);
}
// A message that htmx would run is shown instead: a word joiner in front defeats startsWith.
const htmxText = (s: string) => (/^(js|javascript):/.test(s) ? WORD_JOINER + s : s);

function regionOf(route: Route, verb: string): string {
  if (route.region === undefined) fail(`${verb}() needs a fragment route (one that declares region: ids.x); ${route.url} answers a ${route.kind}`);
  return route.region;
}

/** Debounced input: swaps the route's region after the user stops typing. */
export function search(route: Route<"fragment", "get">, delay: Every = "300ms", opts?: VerbOpts): Verb {
  if (!EVERY_RE.test(delay)) fail(`search delay ${show(delay)}`);
  return new Verb(KEY, reqAttr(route) + ' hx-trigger="input changed delay:' + delay + ', search" hx-target="#' + regionOf(route, "search") + '" hx-swap="outerMorph" hx-sync="this:replace"' + optAttrs(opts), undefined);
}
/** Self-refresh: the element is the route's region; it stops when it re-renders without the verb. */
export function poll(route: Route<"fragment", "get">, every: Every = "2s"): Verb {
  if (!EVERY_RE.test(every)) fail(`poll interval ${show(every)}`);
  return new Verb(KEY, reqAttr(route) + ' hx-trigger="every ' + every + '" hx-target="this" hx-swap="outerHTML"', regionOf(route, "poll"));
}
/** Region loaded after the page. */
export function load(route: Route<"fragment", "get">): Verb {
  return new Verb(KEY, reqAttr(route) + ' hx-trigger="load" hx-target="this" hx-swap="outerHTML"', regionOf(route, "load"));
}
/** Click or submit: swaps the route's region. */
export function swap(route: Route<"fragment", Method>, opts?: VerbOpts): Verb {
  return new Verb(KEY, reqAttr(route) + ' hx-target="#' + regionOf(route, "swap") + '" hx-swap="outerMorph"' + optAttrs(opts), undefined);
}
/** Click or submit with no swap (a machine route), or one whose answer is a redirect. */
export function fire(route: Route<"none" | "page", Method>, opts?: VerbOpts): Verb {
  const nav = route.kind === "page" ? ' hx-target="#main-content" hx-swap="outerMorph show:top" hx-push-url="true"' : ' hx-swap="none"';
  return new Verb(KEY, reqAttr(route) + nav + optAttrs(opts), undefined);
}

// ---------------------------------------------------------------- script and style bodies
const JSON_UNSAFE = /[<>&\u2028\u2029]/g;
const JSON_MAP: Record<string, string> = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" };
const safeJson = (v: unknown): string => {
  const s = JSON.stringify(v);
  if (s === undefined) fail(`json(): ${show(v)} has no JSON form`);
  return s.replace(JSON_UNSAFE, (c) => JSON_MAP[c]!);
};
/** Data for a <script>: the element becomes type="application/json" and never executes. */
export const json = (data: unknown): Json => new Json(KEY, safeJson(data));

const checked = new WeakSet<TemplateStringsArray>();
function literal(strings: TemplateStringsArray, what: string, bad: RegExp) {
  if (checked.has(strings)) return;
  if (!Array.isArray(strings) || !Object.isFrozen(strings) || !Array.isArray(strings.raw)) fail(`${what} is a template tag: ${what}\`...\``);
  for (const s of strings) if (bad.test(s)) fail(`${what}\`...\`: the literal text contains ${show(bad.exec(s)![0])}`);
  checked.add(strings);
}
/** Inline script: literal source text, every hole is serialised as JSON. Carries the CSP nonce. */
export function js(strings: TemplateStringsArray, ...holes: unknown[]): Js {
  literal(strings, "js", /<\/script|<!--|<script/i);
  let s = strings[0]!;
  for (let i = 0; i < holes.length; i++) s += safeJson(holes[i]) + strings[i + 1]!;
  return new Js(KEY, s);
}

// A CSS value from data: one token run. No ; : { } quotes, backslash, comment, url(), @.
const CSS_VALUE_OK = /^[A-Za-z0-9 #%.,()\/+\-_]*$/;
const CSS_VALUE_BAD = /\/\*|\*\/|url\s*\(|image-set\s*\(|expression\s*\(|image\s*\(/i;
function cssValue(v: unknown): string | null {
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (t === "" || !CSS_VALUE_OK.test(t) || CSS_VALUE_BAD.test(t)) return null;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c === 40) depth++;
    else if (c === 41 && --depth < 0) return null;
  }
  return depth === 0 ? v : null;
}
/** A stylesheet: literal CSS, a hole only where a declaration's value goes. A refused value empties its declaration. */
export function css(strings: TemplateStringsArray, ...holes: unknown[]): Css {
  literal(strings, "css", /<\/style|<!--|@import|\\/i);
  let s = strings[0]!;
  for (let i = 0; i < holes.length; i++) {
    const before = strings[i]!;
    const cut = Math.max(before.lastIndexOf("{"), before.lastIndexOf(";"), before.lastIndexOf("}"));
    if (!/^\s*[a-z-]+\s*:[^:;{}]*$/i.test(before.slice(cut + 1)) || before.charAt(cut) === "}") {
      fail("css`...`: a hole goes only where a declaration's value goes (after `property:`)");
    }
    s += (cssValue(holes[i]) ?? "") + strings[i + 1]!;
  }
  return new Css(KEY, s);
}

/** Literal markup with no holes (an inline SVG icon). Data never enters it. */
export function html(strings: TemplateStringsArray, ...holes: never[]): Html {
  literal(strings, "html", /<script|\son[a-z]+\s*=|javascript:/i);
  if (holes.length) fail("html`...` takes no holes; compose with JSX");
  return new Html(KEY, strings[0]!);
}

// ---------------------------------------------------------------- the sink table
const K_NORMAL = 1, K_VOID = 2, K_RCDATA = 3, K_SCRIPT = 4, K_STYLE = 5, K_NOKIDS = 6;
const ELEMENTS: Record<string, number> = Object.create(null);
for (const t of "html head body main header footer nav section article aside div span p a h1 h2 h3 h4 h5 h6 ul ol li dl dt dd table thead tbody tfoot tr th td caption colgroup form label button select option optgroup fieldset legend output dialog details summary figure figcaption blockquote pre code em strong small b i u s sub sup mark time abbr address picture video audio canvas progress meter datalist template search hgroup menu q cite kbd samp var del ins bdi bdo ruby rt rp data".split(" ")) ELEMENTS[t] = K_NORMAL;
for (const t of "br hr img input meta link col source track wbr area embed".split(" ")) ELEMENTS[t] = K_VOID;
ELEMENTS.textarea = K_RCDATA;
ELEMENTS.title = K_RCDATA;
ELEMENTS.script = K_SCRIPT;
ELEMENTS.style = K_STYLE;
ELEMENTS.iframe = K_NOKIDS;
// Not in the table, so not writable: noscript, noembed, noframes, xmp, plaintext, listing,
// object, base, frame, frameset, applet, marquee, svg and math (foreign content: html`...`).

const A_TEXT = 1, A_URL = 2, A_IDREF = 3, A_SRCDOC = 4, A_SANDBOX = 5, A_SRCSET = 6;
const ATTR: Record<string, number> = Object.create(null);
for (const a of "title lang dir role tabindex hidden draggable inert popover name value type placeholder required disabled readonly checked selected multiple autofocus autocomplete min max step minlength maxlength pattern rows cols wrap accept alt width height loading decoding rel target download method enctype novalidate colspan rowspan scope open datetime label span start reversed charset content media sizes as crossorigin integrity referrerpolicy allow allowfullscreen controls autoplay loop muted playsinline preload kind srclang default command closedby inputmode enterkeyhint spellcheck translate contenteditable accesskey high low optimum async defer nomodule fetchpriority property itemprop".split(" ")) ATTR[a] = A_TEXT;
for (const a of "href src action formaction poster cite".split(" ")) ATTR[a] = A_URL;
for (const a of "for form list commandfor popovertarget headers".split(" ")) ATTR[a] = A_IDREF;
ATTR.srcdoc = A_SRCDOC;
ATTR.sandbox = A_SANDBOX;
ATTR.srcset = A_SRCSET;
const ALIAS: Record<string, string> = Object.assign(Object.create(null), { htmlFor: "for" });
// Refused by name wherever they come from: on*, hx-*, data-hx-*, http-equiv, ping, background,
// manifest, codebase, xlink:href, formtarget on untyped paths, is, nonce (set by the runtime).

const DYN_OK = /^(data|aria)-[a-z0-9][a-z0-9_.-]*$/;
const DYN_BAD = /^data-(hx|on)/;
const dynCache = new Map<string, true>();
function dynAttr(tag: string, k: string): number {
  if (dynCache.has(k)) return A_TEXT;
  if (!DYN_OK.test(k) || DYN_BAD.test(k)) {
    if (/^on/i.test(k)) fail(`<${tag} ${k}>: inline handlers are not writable. Use command/commandfor, popovertarget, or the hx prop`);
    if (/^(data-)?hx-/i.test(k)) fail(`<${tag} ${k}>: hx-* attributes are not writable. Use the hx prop: hx={swap(route)}, search(route), poll(route, "2s"), fire(route), load(route)`);
    fail(`<${tag}>: ${show(k)} is not an attribute of this element (known attributes, data-* and aria-* only)`);
  }
  if (dynCache.size < 4096) dynCache.set(k, true);
  return A_TEXT;
}

// URL policy. The check mirrors the URL parser: leading C0/space is stripped, tab and
// newline are removed anywhere, then the scheme is read. The original string is emitted.
const P_LINK = 0, P_MEDIA = 1, P_FRAME = 2, P_CODE = 3;
const SCHEME = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/;
const SAFE_DATA = /^data:(image\/(?!svg)[a-z0-9.+-]+|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|font\/[a-z0-9.+-]+)[;,]/i;
const BLOCKED = "about:invalid#blocked";
function urlOk(u: string, policy: number): boolean {
  const c0 = u.charCodeAt(0);
  if (policy === P_CODE) return c0 === 47 && u.charCodeAt(1) !== 47 && u.charCodeAt(1) !== 92 && !/[\u0000- \\]/.test(u);
  if (c0 === 47 || c0 === 35 || c0 === 63 || c0 === 46) return true;
  const n = /[\u0000- ]/.test(u) ? u.replace(/[\t\n\r]/g, "").replace(/^[\u0000- ]+/, "") : u;
  const m = SCHEME.exec(n);
  if (m === null) return true;
  const s = m[1]!.toLowerCase();
  if (s === "https" || s === "http") return true;
  if (policy === P_FRAME) return false;
  if (s === "data") return SAFE_DATA.test(n);
  return policy === P_LINK && (s === "mailto" || s === "tel");
}
function policyFor(tag: string, k: string): number {
  if (k === "poster") return P_MEDIA;
  if (k === "src") return tag === "script" ? P_CODE : tag === "iframe" || tag === "embed" ? P_FRAME : P_MEDIA;
  if (k === "href") return tag === "link" ? P_CODE : P_LINK;
  return P_LINK;
}

const idOf = (v: unknown, what: string): string => (v instanceof Id ? v.name : fail(`${what} takes an id from defineIds(), got ${show(v)}`));

function classValue(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null || v === false || v === true) return "";
  if (Array.isArray(v)) {
    let s = "";
    for (let i = 0; i < v.length; i++) {
      const c = classValue(v[i]);
      if (c !== "") s += s === "" ? c : " " + c;
    }
    return s;
  }
  return fail(`class takes a string or an array of strings and falsy values, got ${show(v)}`);
}

const propCache = new Map<string, string>();
function cssProp(k: string): string {
  let p = propCache.get(k);
  if (p === undefined) {
    p = k.startsWith("--") ? k : kebab(k);
    if (!/^(--)?[a-z][a-z0-9-]*$/.test(p)) fail(`style: ${show(k)} is not a CSS property name`);
    if (propCache.size < 1024) propCache.set(k, p);
  }
  return p;
}
function styleValue(v: unknown): string {
  if (v instanceof Css) return v.s;
  if (v === null || typeof v !== "object" || Array.isArray(v)) {
    return fail(`style takes an object ({ color: value }), got ${show(v)}. A style string cannot be made safe`);
  }
  let s = "";
  for (const k in v as Record<string, unknown>) {
    const raw = (v as Record<string, unknown>)[k];
    if (raw == null || raw === false) continue;
    const val = cssValue(raw);
    if (val === null) continue;
    s += (s === "" ? "" : ";") + cssProp(k) + ":" + val;
  }
  return s;
}

const SANDBOX_TOKENS = new Set(["allow-forms", "allow-modals", "allow-popups", "allow-downloads", "allow-scripts", "allow-same-origin", "allow-presentation"]);

let nonceSlotUsed = false;
const NONCE_SLOT = "sealed-nonce-" + crypto.randomUUID() + crypto.randomUUID();

type Props = Record<string, unknown>;

function attr(tag: string, k: string, v: unknown): string {
  let a = ATTR[k];
  if (a === undefined) {
    const alias = ALIAS[k];
    if (alias !== undefined) {
      k = alias;
      a = ATTR[k]!;
    } else a = dynAttr(tag, k);
  }
  switch (a) {
    case A_TEXT:
      if (typeof v === "string") return " " + k + '="' + esc(v) + '"';
      if (v === true) return k.charCodeAt(0) === 97 && k.startsWith("aria-") ? " " + k + '="true"' : " " + k;
      if (typeof v === "number") return " " + k + '="' + v + '"';
      if (v instanceof Id && k.startsWith("aria-")) return " " + k + '="' + v.name + '"';
      return fail(`<${tag} ${k}> takes a string, number or boolean, got ${show(v)}`);
    case A_URL: {
      if (v instanceof Route) {
        if (v.method !== "get" && k !== "action" && k !== "formaction") fail(`<${tag} ${k}>: ${v.url} is a ${v.method} route; a link is a GET`);
        const u = esc(v.url);
        if (tag === "a" && v.kind === "page") {
          return ' href="' + u + '" hx-get="' + u + '" hx-target="#main-content" hx-swap="outerMorph show:top" hx-push-url="true"';
        }
        if (v.kind === "fragment" && tag === "a") fail(`<a href>: ${v.url} answers a fragment, not a page. Use hx={swap(route)}`);
        if (k === "action") return formAction(v, u);
        return " " + k + '="' + u + '"';
      }
      if (typeof v !== "string") return fail(`<${tag} ${k}> takes a route or a string, got ${show(v)}`);
      return " " + k + '="' + (urlOk(v, policyFor(tag, k)) ? esc(v) : BLOCKED) + '"';
    }
    case A_IDREF:
      if (k === "for" && typeof v === "string") return ' for="' + esc(v) + '"';
      if (Array.isArray(v)) return " " + k + '="' + v.map((x) => idOf(x, k)).join(" ") + '"';
      return " " + k + '="' + idOf(v, `<${tag} ${k}>`) + '"';
    case A_SRCSET: {
      if (typeof v !== "string") return fail(`<${tag} srcset> takes a string`);
      for (const part of v.split(",")) if (!urlOk(part.trim().split(/\s+/)[0] ?? "", P_MEDIA)) return "";
      return ' srcset="' + esc(v) + '"';
    }
    default:
      return fail(`<${tag} ${k}> is set by the element, not as a plain attribute`);
  }
}

function formAction(r: Route, u: string): string {
  let s = ' action="' + u + '" method="' + (r.method === "get" ? "get" : "post") + '" hx-' + r.method + '="' + u + '"';
  if (r.region !== undefined) s += ' hx-target="#' + r.region + '" hx-swap="outerMorph"';
  else if (r.kind === "none") s += ' hx-swap="none"';
  else s += ' hx-target="#main-content" hx-swap="outerMorph show:top" hx-push-url="true"';
  if (r.invalid !== undefined) s += ' hx-status:422="target:#' + r.invalid + ' swap:outerMorph push:false"';
  return s;
}

function kids(c: unknown): string {
  if (typeof c === "string") return esc(c);
  if (c instanceof Html) return c.s;
  if (c == null || c === false || c === true) return "";
  if (typeof c === "number" || typeof c === "bigint") return String(c);
  if (Array.isArray(c)) {
    let s = "";
    for (let i = 0; i < c.length; i++) s += kids(c[i]);
    return s;
  }
  return fail(`${show(c)} is not renderable. A child is text, a number, JSX, or an array of those`);
}

function textOnly(tag: string, c: unknown): string {
  if (typeof c === "string") return esc(c);
  if (typeof c === "number") return String(c);
  if (c == null || c === false) return "";
  if (Array.isArray(c)) {
    let s = "";
    for (const x of c) s += textOnly(tag, x);
    return s;
  }
  return fail(`<${tag}> holds text only, got ${show(c)}`);
}

export type Component<P = any> = (props: P) => Html | null;

export function jsx(tag: string | Component, props: Props | null, _key?: unknown): Html {
  if (typeof tag === "function") {
    const r = tag(props ?? {});
    if (r instanceof Html) return r;
    if (r === null) return EMPTY;
    return fail(`component ${tag.name || "(anonymous)"} returned ${show(r)}; a component returns JSX or null`);
  }
  const kind = ELEMENTS[tag];
  if (kind === undefined) fail(`<${String(tag)}> is not a writable element`);
  let out = "<" + tag;
  let children: unknown;
  let id: string | undefined;
  let verb: Verb | undefined;
  let hasType = false;
  let invoker = false;
  let srcdoc: unknown;
  let sandbox: unknown;
  for (const k in props) {
    const v = props[k];
    if (k === "children") {
      children = v;
      continue;
    }
    if (v == null || v === false) continue;
    switch (k) {
      case "class":
      case "className": {
        const c = classValue(v);
        if (c !== "") out += ' class="' + esc(c) + '"';
        break;
      }
      case "id": {
        const name: string = v instanceof Id ? v.name : typeof v === "string" ? v : fail(`<${tag} id> takes an id or a string, got ${show(v)}`);
        id = name;
        out += ' id="' + esc(name) + '"';
        break;
      }
      case "hx":
        if (!(v instanceof Verb)) fail(`<${tag} hx> takes a verb: search(route), poll(route, "2s"), swap(route), fire(route), load(route). Got ${show(v)}`);
        verb = v;
        break;
      case "style": {
        const s = styleValue(v);
        if (s !== "") out += ' style="' + esc(s) + '"';
        break;
      }
      case "srcdoc":
        if (tag !== "iframe") fail(`<${tag} srcdoc>: srcdoc belongs to <iframe>`);
        srcdoc = v;
        break;
      case "sandbox":
        sandbox = v;
        break;
      case "nonce":
        fail(`<${tag} nonce> is set by the runtime from render(view, { nonce })`);
      case "type":
        hasType = true;
        out += attr(tag, k, v);
        break;
      case "command":
      case "popovertarget":
        invoker = true;
        out += attr(tag, k, v);
        break;
      default:
        out += attr(tag, k, v);
    }
  }
  if (verb !== undefined) {
    if (verb.selfId !== undefined) {
      if (id === undefined) out += ' id="' + (id = verb.selfId) + '"';
      else if (id !== verb.selfId) fail(`<${tag} id="${id}"> polls a route whose region is "${verb.selfId}"`);
    }
    out += verb.attrs;
  }
  if (tag === "button" && !hasType) out += verb !== undefined || invoker ? ' type="button"' : ' type="submit"';

  switch (kind) {
    case K_NORMAL:
      out += ">" + kids(children) + "</" + tag + ">";
      if (tag === "html") out = "<!DOCTYPE html>" + out;
      break;
    case K_VOID:
      if (children != null) fail(`<${tag}> is a void element and takes no children`);
      out += ">";
      break;
    case K_RCDATA:
      out += ">" + textOnly(tag, children) + "</" + tag + ">";
      break;
    case K_SCRIPT: {
      const body = Array.isArray(children) && children.length === 1 ? children[0] : children;
      if (body instanceof Json) {
        const t = props?.type;
        if (t !== undefined && t !== "application/json" && t !== "application/ld+json") fail(`<script type=${show(t)}> cannot hold json(data)`);
        out += (t === undefined ? ' type="application/json"' : "") + ">" + body.s + "</script>";
      } else if (body instanceof Js || (body == null && props?.src !== undefined)) {
        nonceSlotUsed = true;
        out += ' nonce="' + NONCE_SLOT + '">' + (body instanceof Js ? body.s : "") + "</script>";
      } else fail(`<script> holds json(data) or js\`...\`, or has a src. Got ${show(body)}`);
      break;
    }
    case K_STYLE: {
      const body = Array.isArray(children) && children.length === 1 ? children[0] : children;
      if (!(body instanceof Css)) fail(`<style> holds css\`...\`, got ${show(body)}`);
      nonceSlotUsed = true;
      out += ' nonce="' + NONCE_SLOT + '">' + body.s + "</style>";
      break;
    }
    default: {
      if (children != null) fail(`<${tag}> takes no children`);
      let tokens = "";
      if (sandbox !== undefined && sandbox !== true) {
        if (typeof sandbox !== "string") fail("<iframe sandbox> takes a string of allow-* tokens");
        tokens = sandbox.trim();
        for (const t of tokens === "" ? [] : tokens.split(/\s+/)) if (!SANDBOX_TOKENS.has(t)) fail(`<iframe sandbox>: unknown token ${show(t)}`);
      }
      if (srcdoc !== undefined) {
        const scripts = /\ballow-scripts\b/.test(tokens);
        if (srcdoc instanceof Html) out += ' srcdoc="' + esc(srcdoc.s) + '"';
        else if (typeof srcdoc === "string") {
          if (scripts) fail("<iframe srcdoc>: a string runs with no scripts; allow-scripts needs srcdoc to be JSX");
          out += ' srcdoc="' + esc(srcdoc) + '"';
        } else fail(`<iframe srcdoc> takes a string or JSX, got ${show(srcdoc)}`);
        if (scripts && /\ballow-same-origin\b/.test(tokens)) fail("<iframe srcdoc>: allow-scripts with allow-same-origin removes the sandbox");
        out += ' sandbox="' + tokens + '"';
      } else if (sandbox !== undefined) out += ' sandbox="' + tokens + '"';
      out += "></" + tag + ">";
    }
  }
  return new Html(KEY, out, id);
}
export const jsxs = jsx;
export const jsxDEV = jsx;

export function Fragment(props: { children?: Child }): Html {
  return new Html(KEY, kids(props.children));
}

// ---------------------------------------------------------------- forms
export type FormState<B> = { values?: { [K in keyof B]?: unknown }; errors?: { [K in keyof B]?: string } };
type InputType = "text" | "email" | "password" | "number" | "search" | "url" | "tel" | "date" | "hidden";
export type Binder<B> = {
  /** Props for an <input>: name, id, type, value, and the error wiring when the field is invalid. */
  input(name: keyof B & string, type?: InputType): { name: string; id: string; type: InputType; value: string; "aria-invalid"?: true; "aria-describedby"?: string };
  /** Props for a <textarea> or <select>, and the current value. */
  field(name: keyof B & string): { name: string; id: string; "aria-invalid"?: true; "aria-describedby"?: string };
  value(name: keyof B & string): string;
  /** The field's error as a <p> wired to its control, or null. */
  error(name: keyof B & string, cls?: string): Html | null;
  /** The label's `for`. */
  id(name: keyof B & string): string;
};
export function bind<D extends RouteDef>(route: RouteFn<D>, state: FormState<BodyOf<D>> = {}): Binder<BodyOf<D>> {
  const prefix = route.def.invalid?.name ?? "form";
  const values = (state.values ?? {}) as Record<string, unknown>;
  const errors = (state.errors ?? {}) as Record<string, string | undefined>;
  const fid = (n: string) => prefix + "-" + n;
  const val = (n: string) => (values[n] == null ? "" : String(values[n]));
  const wiring = (n: string) => (errors[n] ? { "aria-invalid": true as const, "aria-describedby": fid(n) + "-error" } : {});
  return {
    input: (n, type = "text") => ({ name: n, id: fid(n), type, value: type === "password" ? "" : val(n), ...wiring(n) }),
    field: (n) => ({ name: n, id: fid(n), ...wiring(n) }),
    value: val,
    id: fid,
    error: (n, cls) => (errors[n] ? jsx("p", { id: fid(n) + "-error", class: cls, children: errors[n] }) : null),
  } as Binder<BodyOf<D>>;
}

// ---------------------------------------------------------------- the response edge
export function render(view: Html, ctx: { nonce?: string } = {}): string {
  if (!(view instanceof Html)) fail(`render() takes JSX, got ${show(view)}`);
  const s = view.s;
  if (!nonceSlotUsed || !s.includes(NONCE_SLOT)) return s;
  const nonce = ctx.nonce;
  if (nonce === undefined || !/^[A-Za-z0-9+\/_-]+=*$/.test(nonce)) return fail("this view has a <script> or <style>: render(view, { nonce }) needs the response's CSP nonce");
  return s.replaceAll(NONCE_SLOT, nonce);
}
/** The id of the view's root element, for the fragment answer to check against its route. */
export const rootId = (view: Html): string | undefined => view.id;
