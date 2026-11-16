// Strict Tags: a research prototype for the from-scratch round (the "correct by construction" design).
// Erasable TypeScript only. The runtime below the types started from Lean Tags' prototype
// (../proto-lean-tags/lean-tags/src/index.ts); the type layer is new.
import type { Tw, TwBracket, TwColorList, TwColorRoot, TwFreeVariant, TwSlash, TwVariantFns } from "./tw.gen.ts";

// ───────────────────────── values: one class per output context ─────────────────────────

/** A mark is a fact about a subtree that some ancestor forbids or requires. */
export type Mark = "text" | "interactive" | "form" | "label" | "main" | "banner" | "unlabelled";

/**
 * Finished, already-escaped markup (the HTML context).
 * `S` is the slot it fits, `M` what its subtree holds, `R` the part id its root carries.
 */
export class El<out S extends string = string, out M extends Mark = Mark, out R extends string | undefined = string | undefined> {
  declare readonly $s: S;
  declare readonly $m: M;
  declare readonly $r: R;
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

/** A whole document: what a page route answers. */
export class Page {
  declare readonly $page: true;
  h: string;
  constructor(h: string) {
    this.h = h;
  }
}

/** A class list (the class-attribute context). Only cls(), a variant function and cls.token() make one. */
export class Cls<out T extends string = string> {
  declare readonly $c: T;
  c: string;
  constructor(c: string) {
    this.c = c;
  }
}

/** A URL (the URL-attribute context). Only url(), asset() and a route make one. */
export class Url {
  declare readonly $url: true;
  u: string;
  constructor(u: string) {
    this.u = u;
  }
}

/** Attribute text written by the framework. `I` is set when the wire makes its element a part's root; `On` is the tag it belongs on. */
export class Wire<out I extends string = never, out On extends string = string> {
  declare readonly $root: I;
  declare readonly $on: On;
  s: string;
  id: string | undefined;
  constructor(s: string, id?: string) {
    this.s = s;
    this.id = id;
  }
}

export type Falsy = false | null | undefined;
type V = string | number | false | null | undefined;
type B = boolean | null | undefined;

// ───────────────────────── classes, checked by tsc ─────────────────────────

type PrefixFix<Vr extends string, R extends string> = Vr extends keyof TwVariantFns ? `✗ a variant is a function, not a prefix: ${TwVariantFns[Vr]}("${R}")`
  : Vr extends `${TwFreeVariant}-${string}` | `[${string}]` ? `✗ a variant is a function, not a prefix: variant("${Vr}", "${R}")`
  : `✗ "${Vr}" is not a variant of this design system (and a variant is a function: hover("…"), md("…"))`;
type UnknownClass<T extends string> = T extends `${TwColorRoot}-${infer C}`
  ? `✗ "${T}": "${C}" is not a colour of this theme. Colours: ${TwColorList}`
  : `✗ "${T}" is not a class of this design system`;
type Token<T extends string> = T extends Tw ? 1
  : string extends T ? "✗ class text is a literal: put a cls(…) value in its own argument, or use cls.token(value) for one class from data"
  : T extends `${infer Vr}:${infer R}` ? PrefixFix<Vr, R>
  : T extends `${infer Bs}/${infer Md}` ? (Bs extends TwSlash ? (Md extends `${number}` | `[${string}]` ? 1 : `✗ "${T}": the modifier after / is a number`) : UnknownClass<T>)
  : T extends `${infer Rt}-[${string}]` ? (Rt extends TwBracket ? 1 : `✗ "${T}": ${Rt}-[…] is not open to bracket values in this theme; use a theme token`)
  : T extends `${infer Im}!` ? Token<Im>
  : UnknownClass<T>;
type Text<P extends string, W = P> = P extends `${infer H} ${infer R}` ? (H extends "" ? Text<R, W> : Token<H> extends 1 ? Text<R, W> : Token<H>)
  : P extends "" ? W
  : Token<P> extends 1 ? W : Token<P>;
type ClsPart<X> = X extends string ? Text<X> : X extends Cls | Falsy ? X : "✗ a class part is class text, a cls(…) value or false";
type ClsArgs<T extends readonly unknown[]> = { [I in keyof T]: ClsPart<T[I]> };
type TextOf<X> = X extends string ? X : X extends Cls<infer C> ? C : "";
type Join<T extends readonly unknown[]> = T extends readonly [infer H, ...infer R] ? (R extends readonly [] ? TextOf<H> : `${TextOf<H>} ${Join<R>}`) : "";
type Prefix<Vr extends string, S extends string> = string extends S ? string
  : S extends `${infer H} ${infer R}` ? `${H extends "" ? "" : `${Vr}:${H}`} ${Prefix<Vr, R>}`
  : S extends "" ? "" : `${Vr}:${S}`;
type VariantName<Vr extends string> = Vr extends keyof TwVariantFns | `${TwFreeVariant}-${string}` | `[${string}]` ? Vr : `✗ "${Vr}" is not a variant of this design system`;

const ATTR_UNSAFE = /[&<>"']/;
const CLS = new Map<string, Cls<any>>();
const squash = (c: string): string => (/\s\s|^\s|\s$|[\n\t]/.test(c) ? c.replace(/\s+/g, " ").trim() : c);
function joinParts(parts: readonly any[]): string {
  let c = "";
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    const t = typeof p === "string" ? squash(p) : p instanceof Cls ? p.c : null;
    if (t === null) throw new TypeError("strict-tags: a class part is class text, a cls(…) value or false");
    if (t !== "") c = c === "" ? t : c + " " + t;
  }
  return ATTR_UNSAFE.test(c) ? esc(c) : c;
}

/**
 * The class list of an element: div(cls("flex gap-4", hover("bg-surface-2")), …). Also a preset: const card = cls("p-6 bg-surface").
 * Every class is checked by tsc against the design system. Parts are class text, other cls values, or false.
 */
export const cls: {
  <const T extends readonly unknown[]>(...parts: ClsArgs<T>): Cls<Join<T>>;
  /** One class from data (a state name, a slug). Anything that is not one plain token renders no class. */
  token(value: string): Cls<string>;
} = Object.assign(
  (...parts: any[]): Cls<any> => {
    if (parts.length === 1 && typeof parts[0] === "string") {
      let hit = CLS.get(parts[0]);
      if (hit === undefined) CLS.set(parts[0], (hit = new Cls(joinParts(parts))));
      return hit;
    }
    return new Cls(joinParts(parts));
  },
  { token: (value: string): Cls<string> => new Cls(/^[A-Za-z0-9_-]+$/.test(value) ? value : "") },
);

export type VariantFn<Vr extends string> = <const T extends readonly unknown[]>(...parts: ClsArgs<T>) => Cls<Prefix<Vr, Join<T>>>;
const prefixed = (name: string, parts: readonly any[]): Cls<any> => {
  const c = joinParts(parts);
  return new Cls(c === "" ? "" : esc(name) + ":" + c.replaceAll(" ", " " + esc(name) + ":"));
};
/** Used by the generated file: one function per variant of the design system. */
export const variantFn = <const Vr extends string>(name: Vr): VariantFn<Vr> => {
  const cache = new Map<string, Cls<any>>();
  return ((...parts: any[]) => {
    if (parts.length === 1 && typeof parts[0] === "string") {
      let hit = cache.get(parts[0]);
      if (hit === undefined) cache.set(parts[0], (hit = prefixed(name, parts)));
      return hit;
    }
    return prefixed(name, parts);
  }) as VariantFn<Vr>;
};
/** A variant that needs a value: variant("data-[state=open]", "bg-surface-2"), variant("group-data-[open]", …). */
export function variant<const Vr extends string, const T extends readonly unknown[]>(name: VariantName<Vr>, ...parts: ClsArgs<T>): Cls<Prefix<Vr, Join<T>>> {
  if (!/^[@a-z0-9[][^\s:"'<>&]*$/i.test(name)) throw new TypeError(`strict-tags: refused variant ${JSON.stringify(String(name).slice(0, 40))}`);
  return prefixed(name, parts);
}

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
const BLOCKED = "#blocked";
/** One URL policy for every URL attribute. A refused value is neutralised, never thrown on: stored data cannot take a page down. */
export function safeUrl(u: string): string {
  const c = u.charCodeAt(0);
  if ((c === 47 || c === 35 || c === 63) && !/[\t\n\r]/.test(u)) return u;
  // WHATWG URL parsing: leading C0/space stripped, tab and newline removed anywhere.
  const t = u.replace(/^[\u0000-\u0020]+/, "").replace(/[\t\n\r]/g, "");
  if (!HAS_SCHEME.test(t)) return u;
  if (SAFE_SCHEME.test(t) || SAFE_DATA.test(t)) return u;
  return BLOCKED;
}
type InApp = "✗ an in-app address comes from a route: a(projects.detail({ id }), …). asset(\"/img/x.png\") is for static files";
/** A URL from data or an external address: scheme-checked where it is rendered. */
export const url = <const T extends string>(value: T extends `/${string}` ? (string extends T ? T : InApp) : T): Url => new Url(String(value));
/** A static file of this app: a path that starts with one slash. */
export const asset = (path: `/${string}`): Url => new Url(/^\/(?![/\\])/.test(path) ? path : BLOCKED);

const CSS_OK = /^[a-zA-Z0-9 #%.,()+\-/_]*$/;
const CSS_BAD = /\/\*|url\s*\(|expression\s*\(|image-set\s*\(/i;
/** A CSS value from data is one plain value. Anything else is dropped. */
const cssValue = (v: string | number): string | null => {
  const s = String(v);
  return !CSS_OK.test(s) || CSS_BAD.test(s) ? null : s;
};
const HTMX_JS = /^\s*(js|javascript):/i;

// ───────────────────────── attributes ─────────────────────────

const PLAIN = 0, URL_ = 1, STYLE = 2, DATA = 3, SRCDOC = 4, ARIA = 5;
const KIND = new Map<string, number>();
const URL_ATTRS = new Set(["href", "src", "action", "formaction", "poster", "cite", "ping", "background", "xlink:href", "codebase", "manifest", "srcset"]);
const DATA_KEY = /^[a-z][a-z0-9-]*$/;

function classify(k: string): number {
  if (k === "class") throw new TypeError("strict-tags: classes are a cls(…) argument: div(cls(\"flex gap-4\"), …), not a class attribute");
  if (/^on/i.test(k)) throw new TypeError(`strict-tags: refused attribute ${k}: inline event handlers are not rendered`);
  if (/^(data-)?hx-/i.test(k)) throw new TypeError(`strict-tags: refused attribute ${k}: htmx attributes come from a route`);
  let kind = PLAIN;
  if (k === "style") kind = STYLE;
  else if (k === "data") kind = DATA;
  else if (k === "srcdoc") kind = SRCDOC;
  else if (k.startsWith("aria-")) kind = ARIA;
  else if (URL_ATTRS.has(k)) kind = URL_;
  else if (!/^[a-zA-Z_][a-zA-Z0-9_.:-]*$/.test(k)) throw new TypeError(`strict-tags: refused attribute name ${JSON.stringify(k.slice(0, 40))}`);
  KIND.set(k, kind);
  return kind;
}

function dataKey(k: string): string {
  if (!DATA_KEY.test(k) || k.startsWith("hx-") || k.startsWith("on")) throw new TypeError(`strict-tags: refused data attribute name ${JSON.stringify(k.slice(0, 40))}`);
  return k;
}

function attrs(o: Record<string, any>): string {
  let s = "";
  for (const k in o) {
    const v = o[k];
    if (v == null) continue;
    let kind = KIND.get(k);
    if (kind === undefined) kind = classify(k);
    if (kind === ARIA) {
      s += " " + k + '="' + esc(String(v)) + '"';
      continue;
    }
    if (v === false) continue;
    if (kind === PLAIN) {
      s += v === true ? " " + k : " " + k + '="' + esc(typeof v === "string" ? v : String(v)) + '"';
    } else if (kind === URL_) {
      s += " " + k + '="' + esc(safeUrl(v instanceof Url ? v.u : String(v))) + '"';
    } else if (kind === STYLE) {
      let d = "";
      for (const p in v) {
        if (v[p] == null || v[p] === false) continue;
        if (!/^(--)?[a-zA-Z][a-zA-Z0-9-]*$/.test(p)) throw new TypeError(`strict-tags: refused CSS property ${JSON.stringify(p.slice(0, 40))}`);
        const value = cssValue(v[p]);
        if (value !== null) d += (d ? "; " : "") + p + ": " + value;
      }
      if (d) s += ' style="' + esc(d) + '"';
    } else if (kind === DATA) {
      for (const dk in v) {
        const dv = v[dk];
        if (dv == null || dv === false) continue;
        s += " data-" + dataKey(dk) + (dv === true ? "" : '="' + esc(String(dv)) + '"');
      }
    } else {
      // srcdoc is user markup: it always runs sandboxed with no permissions.
      s += ' srcdoc="' + esc(String(v)) + '" sandbox=""';
    }
  }
  return s;
}

// ───────────────────────── the content model, as types ─────────────────────────

type Flow = "flow" | "phrasing";
/** in: the slot the tag fits. kids: the slots it takes. no: marks its subtree may not hold. adds / drops: marks it changes. */
interface Rule<In extends string, Kids extends string, No extends Mark = never, Adds extends Mark = never, Drops extends Mark = never> { in: In; kids: Kids; no: No; adds: Adds; drops: Drops }
export interface Model {
  div: Rule<"flow", Flow>; section: Rule<"flow", Flow, "main">; article: Rule<"flow", Flow, "main">; aside: Rule<"flow", Flow, "main">; nav: Rule<"flow", Flow, "main">;
  main: Rule<"flow", Flow, "main", "main">; header: Rule<"flow", Flow, "main" | "banner", "banner">; footer: Rule<"flow", Flow, "main" | "banner", "banner">;
  p: Rule<"flow", "phrasing">; h1: Rule<"flow", "phrasing">; h2: Rule<"flow", "phrasing">; h3: Rule<"flow", "phrasing">; h4: Rule<"flow", "phrasing">; pre: Rule<"flow", "phrasing">;
  ul: Rule<"flow", "li">; ol: Rule<"flow", "li">; li: Rule<"li", Flow, "main">;
  dl: Rule<"flow", "dl">; dt: Rule<"dl", "phrasing">; dd: Rule<"dl", Flow, "main">;
  table: Rule<"flow", "rows" | "rowgroup" | "caption">; caption: Rule<"caption", Flow, "main">; thead: Rule<"rowgroup", "rows">; tbody: Rule<"rowgroup", "rows">; tfoot: Rule<"rowgroup", "rows">;
  tr: Rule<"rows", "cells">; td: Rule<"cells", Flow, "main">; th: Rule<"cells", Flow, "main" | "banner">;
  span: Rule<"phrasing", "phrasing">; strong: Rule<"phrasing", "phrasing">; em: Rule<"phrasing", "phrasing">; small: Rule<"phrasing", "phrasing">; code: Rule<"phrasing", "phrasing">; time: Rule<"phrasing", "phrasing">;
  a: Rule<"transparent", Flow, "interactive" | "main", "interactive">;
  button: Rule<"phrasing", "phrasing", "interactive", "interactive">;
  label: Rule<"phrasing", "phrasing", "label", "label" | "interactive", "unlabelled">;
  form: Rule<"flow", Flow, "form", "form">;
  select: Rule<"phrasing", "option", never, "interactive">; option: Rule<"option", "text">;
  textarea: Rule<"phrasing", "text", never, "interactive">; input: Rule<"phrasing", never, never, "interactive">;
  dialog: Rule<"flow", Flow, "main">; details: Rule<"flow", Flow | "summary", "main", "interactive">; summary: Rule<"summary", "phrasing", "interactive">;
  iframe: Rule<"phrasing", never, never, "interactive">; img: Rule<"phrasing", never>; br: Rule<"phrasing", never>; hr: Rule<"flow", never>;
  title: Rule<"head", "text">; meta: Rule<"head", never>; link: Rule<"head", never>;
}
export type Tag = keyof Model;

type Takes<T extends Tag> = Model[T]["kids"] extends infer K ? (
  [K] extends [never] ? `✗ <${T}> takes no children`
  : [K] extends ["phrasing"] ? `✗ <${T}> takes text and inline elements only, not a block such as div, p, ul or form`
  : [K] extends ["text"] ? `✗ <${T}> takes text only`
  : [K] extends ["li"] ? `✗ <${T}> takes only li(…) children`
  : [K] extends ["dl"] ? `✗ <${T}> takes only dt(…) and dd(…) children`
  : [K] extends ["option"] ? `✗ <${T}> takes only option(…) children`
  : [K] extends ["rows"] ? `✗ <${T}> takes only tr(…) children`
  : [K] extends ["cells"] ? `✗ <${T}> takes only td(…) and th(…) children`
  : [K] extends ["rows" | "rowgroup" | "caption"] ? `✗ <${T}> takes caption, thead, tbody, tfoot or tr children`
  : `✗ <${T}> cannot hold this element`) : never;
interface Home { li: "✗ li(…) goes inside ul(…) or ol(…)"; dl: "✗ dt(…) and dd(…) go inside dl(…)"; rows: "✗ tr(…) goes inside table, thead, tbody or tfoot"; rowgroup: "✗ thead, tbody and tfoot go inside table(…)"; cells: "✗ td(…) and th(…) go inside tr(…)"; option: "✗ option(…) goes inside select(…)"; summary: "✗ summary(…) goes inside details(…)"; caption: "✗ caption(…) goes inside table(…)"; head: "✗ title, meta and link belong to doc({ … })" }
interface Forbidden { interactive: "cannot contain a link, a button or a form control"; form: "cannot contain another form"; label: "cannot contain another label"; main: "cannot contain main: main sits directly under the document body"; banner: "cannot contain header or footer"; text: never; unlabelled: never }
type Unlabelled = "✗ a form control needs a label: wrap it in label(\"Name\", …) or give it { \"aria-label\": \"…\" }";
type Banned<T extends Tag> = Model[T]["no"] | (T extends "label" ? never : "unlabelled");
/** What a tag takes as a child, as one plain type: use it for a component's children. */
export type Kid<T extends Tag> = number | Falsy | El<Model[T]["kids"], Exclude<Mark, Banned<T>>, any> | readonly (Kid<T> | TextIf<T>)[];
type TextIf<T extends Tag> = "phrasing" extends Model[T]["kids"] ? string : "text" extends Model[T]["kids"] ? string : never;
/** Every mark a finished child may carry. */
export type AnyMark = Exclude<Mark, "unlabelled">;
/** Ordinary content: text, links, buttons and labelled controls, but no form, main, header or footer. */
export type Content = "text" | "interactive" | "label";
/**
 * Children of a block container (div, section, li, td, …) and of an inline one (p, span, h1, …), for a component's own signature.
 * A component says what its children may hold, because that decides where the component may go:
 * `FlowKid[]` takes anything, so its result is refused inside a, button, label, form, header and footer;
 * `FlowKid<Content>[]` may sit in a form or a header; `PhrasingKid<"text">[]` may sit in a link or a button.
 */
export type FlowKid<M extends AnyMark = AnyMark> = string | number | Falsy | El<Flow, M, any> | readonly FlowKid<M>[];
export type PhrasingKid<M extends AnyMark = AnyMark> = string | number | Falsy | El<"phrasing", M, any> | readonly PhrasingKid<M>[];
/** The control a field helper wraps in its label: (name: string, control: ControlKid) => label(name, control). */
export type ControlKid = El<"phrasing", "text" | "interactive" | "unlabelled", any>;

type Why<T extends Tag, X> = X extends El<infer S, infer M, any>
  ? string extends S ? "✗ this element's type was widened, likely by a \": El\" return type: leave a component's return type to inference"
  : (S extends Model[T]["kids"]
    ? ("unlabelled" extends M & Banned<T> ? Unlabelled
      : [AnyMark] extends [M] ? `✗ this may hold anything (a component whose children are plain FlowKid[] or PhrasingKid[]), so it cannot go inside <${T}>: type its children FlowKid<Content>[], or PhrasingKid<"text">[] inside a link or button`
      : `✗ <${T}> ${Forbidden[M & Model[T]["no"]]}`)
    : S extends keyof Home ? ([S] extends [Model[T]["kids"]] ? Takes<T> : Home[S]) : Takes<T>)
  : X extends readonly (infer Y)[] ? readonly Why<T, Exclude<Y, Kid<T> | TextIf<T>>>[]
  : Takes<T>;
type AllTw<X extends string> = X extends `${infer H} ${infer R}` ? (H extends Tw | "" ? AllTw<R> : false) : X extends Tw | "" ? true : false;
type TextArg<T extends Tag, X extends string> = [TextIf<T>] extends [never] ? Takes<T>
  : string extends X ? X
  : X extends "" ? X
  : AllTw<X> extends true ? `✗ "${X}" is class text: write cls("${X}"). For the word as content, write text("${X}")` : X;
type Arg<T extends Tag, X> = X extends Cls ? X
  : X extends string ? TextArg<T, X>
  : X extends Kid<T> ? X
  : X extends El<any, any, any> | readonly unknown[] ? Why<T, X>
  : X extends Wire<any, infer On> ? (T extends On ? X : `✗ this wire belongs on ${On}(…)`)
  : X extends PageRef ? (T extends "a" | "form" ? X : "✗ a page route goes on a(…) or form(…); a button needs an action route")
  : X extends ActionRef<any> ? (T extends "button" ? X : "✗ an action route goes on button(…), or use route.form(…)")
  : X extends PartRef<any, any> ? "✗ a part is not an address: use its .root, .poll(), .search(), .load() or .defer() wire"
  : X extends PromiseLike<unknown> ? "✗ a view is synchronous: await the data in the route handler and pass it in"
  : X extends (...a: never[]) => unknown ? "✗ call the tag to make a child: hr(), not hr"
  : X extends boolean ? X
  : Attrs[T & keyof Attrs] extends never ? Global : T extends keyof Attrs ? Attrs[T] : Global;

type Marks1<X> = X extends string | number ? "text" : X extends El<any, infer M, any> ? M : never;
type MarksIn<X> = X extends readonly (infer Y)[] ? (Y extends readonly (infer Z)[] ? Marks1<Z> : Marks1<Y>) : Marks1<X>;
type HasAttr<A extends readonly unknown[], K extends string> = true extends (A[number] extends infer X ? (X extends El<any, any, any> | Cls | Wire<any, any> | Ref | readonly unknown[] | string | number | Falsy | boolean ? false : keyof X & K extends never ? false : true) : never) ? true : false;
type HasRef<A extends readonly unknown[]> = true extends (A[number] extends infer X ? (X extends Ref | PartRef<any, any> ? true : false) : never) ? true : false;
type Named<A extends readonly unknown[]> = "text" extends MarksIn<A[number]> ? true : HasAttr<A, "aria-label" | "aria-labelledby">;
type NoLabelNeeded<A extends readonly unknown[]> = true extends (A[number] extends infer X ? (X extends { type: "hidden" | "submit" | "button" | "reset" } ? true : false) : never) ? true : HasAttr<A, "aria-label" | "aria-labelledby">;

/** What the whole call is missing, as a message. never when nothing is. */
type Missing<T extends Tag, A extends readonly unknown[]> =
  T extends "a" ? (HasRef<A> extends true ? never : HasAttr<A, "href"> extends true ? never : "✗ a link needs a destination: a(projects.detail({ id }), …) or { href: url(value) }") | (Named<A> extends true ? never : "✗ a link needs a name: text content or { \"aria-label\": \"…\" }")
  : T extends "button" ? (Named<A> extends true ? never : "✗ a button needs a name: text content or { \"aria-label\": \"…\" }")
  : T extends "h1" | "h2" | "h3" | "h4" | "summary" ? (Named<A> extends true ? never : `✗ <${T}> needs text content`)
  : T extends "img" ? (HasAttr<A, "alt"> extends true ? never : "✗ an image needs { src, alt }: alt: \"\" marks a decorative image")
  : T extends "iframe" ? (HasAttr<A, "title"> extends true ? never : "✗ an iframe needs { title }: screen readers announce it")
  : T extends "dialog" ? (HasAttr<A, "aria-label" | "aria-labelledby"> extends true ? never : "✗ a dialog needs a name: spread modal(id).root, or give it { \"aria-label\": \"…\" }")
  : never;
// Inference of A runs backwards through this mapped type, so its shape is load-bearing: wrapping Arg in `extends infer R` loses A.
type Args<T extends Tag, A extends readonly unknown[]> = { [I in keyof A]: [Missing<T, A>] extends [never] ? Arg<T, A[I]> : Missing<T, A> };

type HasFlow<A extends readonly unknown[]> = true extends (A[number] extends infer X ? (X extends El<"flow", any, any> ? true : X extends readonly El<"flow", any, any>[] ? true : false) : never) ? true : false;
type SlotOf<T extends Tag, A extends readonly unknown[]> = Model[T]["in"] extends "transparent" ? (HasFlow<A> extends true ? "flow" : "phrasing") : Model[T]["in"];
type Control = "input" | "select" | "textarea";
type MarksOf<T extends Tag, A extends readonly unknown[]> =
  | Exclude<MarksIn<A[number]>, Model[T]["drops"]>
  | Model[T]["adds"]
  | (T extends Control ? (NoLabelNeeded<A> extends true ? never : "unlabelled") : never)
  | (T extends "img" ? (A[number] extends infer X ? (X extends { alt: "" } ? never : X extends { alt: string } ? "text" : never) : never) : never);
type RootIds<A extends readonly unknown[]> = A[number] extends infer X ? (X extends Wire<infer I extends string, any> ? I : never) : never;
type RootOf<A extends readonly unknown[]> = [RootIds<A>] extends [never] ? undefined : RootIds<A>;

/**
 * A tag. Arguments in any order: cls(…) is its class list, { … } its attributes, a route or wire connects it, everything else is a child.
 * One signature, so a mistake is one diagnostic, and the diagnostic is the fix.
 */
export type TagFn<T extends Tag> = <const A extends readonly unknown[]>(...args: Args<T, A>) => El<SlotOf<T, A>, MarksOf<T, A>, RootOf<A>>;
type NeedsArg = "a" | "button" | "h1" | "h2" | "h3" | "h4" | "summary" | "img" | "iframe" | "dialog";
export type TagFn1<T extends Tag> = <const A extends readonly [unknown, ...unknown[]]>(...args: Args<T, A>) => El<SlotOf<T, A>, MarksOf<T, A>, RootOf<A>>;

// ───────────────────────── attribute types ─────────────────────────

type Style = Record<string, string | number | false | null | undefined>;
type NoClass = "✗ classes are a cls(…) argument: div(cls(\"flex gap-4\"), …)";
type NoHandler = "✗ inline event handlers are not rendered: use a route wire or a native command";
type NoHx = "✗ htmx attributes come from a route: route(…), .search(), .poll(), .load()";
type NoStyleText = "✗ style is an object: { style: { width: value } }";
type NeedUrl = "✗ a URL attribute takes url(value) or asset(\"/file\"); an in-app link takes a route: a(projects.list(), …)";

export interface Global {
  id?: string;
  title?: V;
  hidden?: B | "until-found";
  role?: "alert" | "status" | "presentation" | "none" | "group" | "region" | "search" | "tablist" | "tab" | "tabpanel" | "list" | "listitem" | "img" | "separator" | "toolbar" | "menu" | "menuitem" | "navigation" | "note";
  tabindex?: 0 | -1;
  lang?: V;
  dir?: "ltr" | "rtl" | "auto";
  inert?: B;
  popover?: B | "auto" | "manual";
  style?: Style | NoStyleText;
  data?: Record<string, V | true>;
  [k: `data-${string}`]: V | true;
  [k: `aria-${string}`]: V | boolean;
  class?: NoClass;
  className?: NoClass;
  onclick?: NoHandler; onchange?: NoHandler; oninput?: NoHandler; onsubmit?: NoHandler; onkeydown?: NoHandler; onload?: NoHandler;
  [k: `hx-${string}`]: NoHx;
}
type Cmd = { command?: "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover"; commandfor?: string; popovertarget?: string };
type InputType = "text" | "search" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "time" | "checkbox" | "radio" | "hidden" | "file" | "range" | "color";
export interface Attrs {
  a: Global & { href?: Url | NeedUrl; target?: "_blank" | "_self" | "_top"; rel?: V; download?: V | true };
  button: Global & Cmd & { type?: "button" | "submit" | "reset"; name?: string; value?: V; disabled?: B; form?: string; formaction?: Url | NeedUrl; autofocus?: B };
  input: Global & { type?: InputType; name?: string; value?: V; placeholder?: V; required?: B; disabled?: B; readonly?: B; checked?: B; autofocus?: B; min?: V; max?: V; step?: V; minlength?: number; maxlength?: number; pattern?: V; autocomplete?: V; list?: V; multiple?: B; accept?: V };
  textarea: Global & { name?: string; rows?: number; cols?: number; placeholder?: V; required?: B; disabled?: B; readonly?: B; minlength?: number; maxlength?: number };
  select: Global & { name?: string; required?: B; disabled?: B; multiple?: B };
  option: Global & { value?: V; selected?: B; disabled?: B };
  label: Global & { for?: string };
  form: Global & { action?: Url | NeedUrl; method?: "get" | "post" | "dialog"; enctype?: "multipart/form-data"; novalidate?: B; autocomplete?: "on" | "off" };
  img: Global & { src: Url | NeedUrl; alt: string; width?: number; height?: number; loading?: "lazy" | "eager"; decoding?: "async" | "sync" | "auto"; sizes?: V };
  iframe: Global & { src?: Url | NeedUrl; srcdoc?: string; title: string; loading?: "lazy" | "eager"; allow?: V; width?: number; height?: number };
  dialog: Global & { open?: B; closedby?: "any" | "closerequest" | "none" };
  td: Global & { colspan?: number; rowspan?: number; headers?: V };
  th: Global & { colspan?: number; rowspan?: number; scope?: "col" | "row" | "colgroup" | "rowgroup" };
  time: Global & { datetime?: V };
  meta: Global & { name?: V; content?: V; property?: V };
  link: Global & { rel: string; href: Url | NeedUrl; type?: V; as?: V; crossorigin?: V };
  details: Global & { open?: B; name?: V };
  ol: Global & { start?: number; reversed?: B };
}

// ───────────────────────── elements at run time ─────────────────────────

function kids(c: any): string {
  if (typeof c === "string") return esc(c);
  if (c instanceof El) return c.h;
  if (c == null || c === false || c === true) return "";
  if (typeof c === "number") return String(c);
  if (Array.isArray(c)) {
    let s = "";
    for (let i = 0; i < c.length; i++) s += kids(c[i]);
    return s;
  }
  if (c instanceof Page) throw new TypeError("strict-tags: a page cannot be rendered inside an element");
  if (typeof c === "function") throw new TypeError("strict-tags: call the tag to make a child: hr(), not hr");
  throw new TypeError("strict-tags: not a child: " + Object.prototype.toString.call(c));
}

function make(tag: string, isVoid = false): any {
  const open = "<" + tag;
  const close = isVoid ? "" : "</" + tag + ">";
  const isButton = tag === "button";
  return function (...args: any[]): El<any, any, any> {
    let klass = "";
    let rest = "";
    let body = "";
    let id: string | undefined;
    let typed = !isButton;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (typeof a === "string") body += esc(a);
      else if (a == null || a === false || a === true) continue;
      else if (a instanceof El) body += a.h;
      else if (a instanceof Cls) {
        if (a.c !== "") klass = klass === "" ? a.c : klass + " " + a.c;
      } else if (typeof a === "number") body += a;
      else if (Array.isArray(a)) body += kids(a);
      else if (a instanceof Wire) {
        rest += a.s;
        if (a.id !== undefined) id = a.id;
      } else if (a instanceof Ref) rest += a.on(tag);
      else if (typeof a === "object" && !(a instanceof Page) && !(a instanceof PartRef) && !(a instanceof Url)) {
        rest += attrs(a);
        if (!typed && a.type != null) typed = true;
        if (typeof a.id === "string") id = a.id;
      } else body += kids(a);
    }
    let s = klass === "" ? open : open + ' class="' + klass + '"';
    s += rest;
    if (!typed) s += ' type="button"';
    if (isVoid) {
      if (body !== "") throw new TypeError(`strict-tags: <${tag}> takes no children`);
      return new El(s + ">", id);
    }
    return new El(s + ">" + body + close, id);
  };
}

const e = <T extends Tag>(tag: T): TagFn<T> => make(tag);
const e1 = <T extends Tag & NeedsArg>(tag: T, isVoid = false): TagFn1<T> => make(tag, isVoid);
const v = <T extends Tag>(tag: T): TagFn<T> => make(tag, true);

export const div = e("div"), section = e("section"), article = e("article"), aside = e("aside"), nav = e("nav"), main = e("main"), header = e("header"), footer = e("footer");
export const p = e("p"), pre = e("pre"), span = e("span"), strong = e("strong"), em = e("em"), small = e("small"), code = e("code"), time = e("time");
export const h1 = e1("h1"), h2 = e1("h2"), h3 = e1("h3"), h4 = e1("h4");
export const ul = e("ul"), ol = e("ol"), li = e("li"), dl = e("dl"), dt = e("dt"), dd = e("dd");
export const table = e("table"), caption = e("caption"), thead = e("thead"), tbody = e("tbody"), tfoot = e("tfoot"), tr = e("tr"), td = e("td"), th = e("th");
export const a = e1("a"), button = e1("button"), label = e("label"), form = e("form");
export const select = e("select"), option = e("option"), textarea = e("textarea"), input = v("input");
export const dialog = e1("dialog"), details = e("details"), summary = e1("summary"), iframe = e1("iframe");
export const img = e1("img", true), br = v("br"), hr = v("hr");
/** A word that is also a class name, as content: text("hidden"). */
export const text = (value: string | number): El<"phrasing", "text", undefined> => new El(esc(String(value)));

// ───────────────────────── script, style and raw contexts ─────────────────────────

const JSON_ESC: Record<string, string> = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" };
const jsonText = (data: unknown): string => JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => JSON_ESC[c]);
/** Data for client code: <script type="application/json">. */
export const json = (data: unknown, a?: { id?: string }): El<"phrasing", never, undefined> =>
  new El('<script type="application/json"' + (a ? attrs(a) : "") + ">" + jsonText(data) + "</script>");
/** Data handed to inline JS as one global: <script>window.NAME = …</script>. */
export function jsVar(name: string, data: unknown): El<"phrasing", never, undefined> {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) throw new TypeError(`strict-tags: refused global name ${JSON.stringify(name.slice(0, 40))}`);
  return new El("<script>window." + name + " = " + jsonText(data) + "</script>");
}
/** A stylesheet (the CSS context). */
export class Css {
  declare readonly $css: true;
  t: string;
  constructor(t: string) {
    this.t = t;
  }
}
/** The literal text is yours; each hole is one CSS value from data. A hole that is anything else renders empty. */
export function css(strings: TemplateStringsArray, ...holes: (string | number)[]): Css {
  let t = strings[0];
  for (let i = 1; i < strings.length; i++) t += (cssValue(holes[i - 1]) ?? "") + strings[i];
  if (/<\/style/i.test(t)) throw new TypeError("strict-tags: refused </style in a stylesheet");
  return new Css(t);
}
/** A <style> element. It belongs to the document head: doc({ head: [style(css`…`)] }). */
export const style = (sheet: Css): El<"head", never, undefined> => new El("<style>" + sheet.t + "</style>");
/** Markup you wrote (the raw context): a template with no holes. */
export class Trusted {
  declare readonly $trusted: true;
  h: string;
  constructor(h: string) {
    this.h = h;
  }
}
export function trusted(strings: TemplateStringsArray): Trusted {
  if (strings.length !== 1) throw new TypeError("strict-tags: trusted`…` takes no holes");
  return new Trusted(strings[0]);
}
/** Trusted markup as a child. The content model cannot see inside it: what it holds is yours to get right. */
export const raw = (t: Trusted): El<"phrasing", never, undefined> => {
  if (!(t instanceof Trusted)) throw new TypeError("strict-tags: raw() takes trusted`…` markup, never a string");
  return new El(t.h);
};

// ───────────────────────── routes: the owner of every address, id and form ─────────────────────────

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
interface ActionDef<P extends string, Bd, S extends Shape> { k: "action"; path: P; body: Schema<Bd> | undefined; shape: S }
type AnyDef = PageDef<any, any> | PartDef<any, any, any> | ActionDef<any, any, any>;

/** GET, answers a document. Inputs named in the path are path parameters; the rest are the query. */
export function page<const P extends string = "/", const S extends Shape = {}>(path?: P, inputs?: S): PageDef<P, S> {
  return { k: "page", path: (path ?? "/") as P, shape: (inputs ?? {}) as S };
}
/** GET, answers one element: the one whose root carries this part's id. The part owns that id; no view types it. */
export function part<const I extends string, const P extends string, const S extends Shape = {}>(id: I, path: P, inputs?: S): PartDef<I, P, S> {
  return { k: "part", id, path, shape: (inputs ?? {}) as S };
}
/** POST: the only kind of route that changes anything. With a body schema it owns a form, and invalid input answers 422 into that form. */
export function action<const P extends string, const S extends Shape = {}>(path: P, inputs?: S): ActionDef<P, undefined, S>;
export function action<const P extends string, Bd, const S extends Shape = {}>(path: P, body: Schema<Bd>, inputs?: S): ActionDef<P, Bd, S>;
export function action(path: string, a?: any, b?: any): any {
  const hasBody = a != null && a["~standard"] !== undefined;
  return { k: "action", path, body: hasBody ? a : undefined, shape: (hasBody ? b : a) ?? {} };
}

type Call<In, R> = {} extends In ? (input?: In) => R : (input: In) => R;
export type PageRoute<In> = Call<In, PageRef> & { readonly $k: "page"; readonly $in: In };
export type PartRoute<I extends string, In> = Call<In, PartRef<I, In>> & { readonly $k: "part"; readonly $in: In; readonly $i: I };
export type ActionRoute<In, Bd> = Call<In, ActionRef<Bd>> & { readonly $k: "action"; readonly $in: In; readonly $b: Bd };
type RouteOf<D> = D extends PageDef<infer P, infer S> ? PageRoute<Input<P, S>>
  : D extends PartDef<infer I, infer P, infer S> ? PartRoute<I, Input<P, S>>
  : D extends ActionDef<infer P, infer Bd, infer S> ? ActionRoute<Input<P, S>, Bd>
  : never;

const MAIN = "main";
const NAV = ` hx-target="#${MAIN}" hx-swap="outerMorph show:top" hx-push-url="true"`;

/** A route address used as an argument of a tag. What it writes depends on the tag. */
export abstract class Ref {
  url: string;
  constructor(url: string) {
    this.url = url;
  }
  abstract on(tag: string): string;
}

/** A page address: a(ref, …) links to it, form(ref, …) is a GET form to it. */
export class PageRef extends Ref {
  declare readonly $ref: "page";
  on(tag: string): string {
    if (tag === "a") return ' href="' + esc(this.url) + '"';
    if (tag === "form") return ' action="' + esc(this.url) + '" method="get"';
    throw new TypeError(`strict-tags: a page route goes on a(…) or form(…), not <${tag}>`);
  }
}

type Every = `${number}s` | `${number}ms`;
/** A part's address plus the wires that load it. The target of every wire is the part's own id. */
export class PartRef<I extends string, In = {}> {
  declare readonly $ref: "part";
  declare readonly $in: In;
  url: string;
  id: string;
  constructor(url: string, id: string) {
    this.url = url;
    this.id = id;
  }
  /** Makes the element this part's root. */
  get root(): Wire<I> {
    return new Wire<I>(' id="' + this.id + '"', this.id);
  }
  /** Root that refreshes itself while `every` is set. Pass false for the settled root, which ends the poll. */
  poll(every: Every | Falsy): Wire<I> {
    if (!every) return this.root;
    return new Wire<I>(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="every ${every}" hx-target="this" hx-swap="outerHTML"`, this.id);
  }
  /** Root that loads itself once after the page arrives. */
  defer(): Wire<I> {
    return new Wire<I>(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="load" hx-target="this" hx-swap="outerHTML" hx-sync="this:replace"`, this.id);
  }
  /** On an input: names the field and reloads the part after typing stops. */
  search(name: keyof In & string): Wire<never, "input"> {
    return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="input changed delay:300ms, search" hx-target="#${this.id}" hx-swap="outerMorph" hx-sync="this:replace"`);
  }
  /** On a select or an input: names the field and reloads the part when it changes. */
  change(name: keyof In & string): Wire<never, "select" | "input"> {
    return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="change" hx-target="#${this.id}" hx-swap="outerMorph" hx-include="closest form"`);
  }
  /** On a link or a button: reloads the part on click (a sort link, a pager). */
  load(): Wire<never, "a" | "button"> {
    return new Wire(` hx-get="${esc(this.url)}" hx-target="#${this.id}" hx-swap="outerMorph" hx-push-url="false"`);
  }
}

export type FormState<R> = R extends { readonly $b: infer Bd } ? State<Bd> : never;
type State<Bd> = { values?: { [K in keyof Bd]?: unknown }; errors?: { [K in keyof Bd]?: string }; /** Tells two copies of one form in one document apart. */ scope?: string };
type Bound<A> = Omit<A, "name" | "value" | "id" | "checked" | "aria-label" | "aria-labelledby">;
type Field = El<"phrasing", "interactive" | "unlabelled", undefined>;
export interface Fields<Bd> {
  /** <input> bound to a schema field: name, id, value, aria-invalid and aria-describedby are filled in. It still needs its label(…). */
  input(name: keyof Bd & string, ...rest: (Cls | Bound<Attrs["input"]>)[]): Field;
  textarea(name: keyof Bd & string, ...rest: (Cls | Bound<Attrs["textarea"]>)[]): Field;
  /** <select> whose options are a record of value to label; the record must cover the field's values. */
  select<K extends keyof Bd & string>(name: K, options: Record<Extract<Bd[K], string>, string>, ...rest: (Cls | Bound<Attrs["select"]>)[]): Field;
  checkbox(name: keyof Bd & string, ...rest: (Cls | Bound<Attrs["input"]>)[]): Field;
  hidden(name: keyof Bd & string, value: V): El<"phrasing", never, undefined>;
  /** The field's error message, wired to its control. Renders nothing while the field is valid. */
  error(name: keyof Bd & string, ...rest: Cls[]): El<"phrasing", "text", undefined> | null;
}

type FormLook = Omit<Attrs["form"], "action" | "method" | "id">;
/** An action's address. button(ref, …) posts on click; ref.form(…) builds its schema-bound form. */
export class ActionRef<Bd> extends Ref {
  declare readonly $ref: "action";
  declare readonly $b: Bd;
  formId: string;
  constructor(url: string, formId: string) {
    super(url);
    this.formId = formId;
  }
  on(tag: string): string {
    if (tag === "button") return ` hx-post="${esc(this.url)}"${NAV}`;
    throw new TypeError(`strict-tags: an action route goes on button(…) or through .form(…), not <${tag}>`);
  }
  /** Posts with no swap (a counter, a like). */
  fire(): Wire<never, "button"> {
    return new Wire(` hx-post="${esc(this.url)}" hx-swap="none"`);
  }
  /** The route's form: it carries the form region's id, and a 422 answer lands back in it. */
  form<const K>(state: State<Bd>, look: Cls | FormLook | readonly (Cls | FormLook)[], body: (f: Fields<Bd>) => K extends Kid<"form"> | string ? K : Why<"form", K>): El<"flow", "form" | "interactive" | "text", undefined> {
    const id = state.scope ? `${this.formId}-${slug(state.scope)}` : this.formId;
    const u = esc(this.url);
    const looks = Array.isArray(look) ? look : [look];
    return new El(
      `<form${lead(looks, looks.length)} id="${id}" action="${u}" method="post" hx-post="${u}"${NAV} hx-status:422="target:#${id} swap:outerMorph push:false">` + kids((body as (f: Fields<Bd>) => unknown)(fields(id, state))) + "</form>",
      id,
    );
  }
}

const slug = (s: string): string => s.replace(/[^A-Za-z0-9_-]+/g, "-");
function lead(args: readonly any[], to: number): string {
  let klass = "";
  let rest = "";
  for (let i = 0; i < to; i++) {
    const a = args[i];
    if (a instanceof Cls) klass = klass === "" ? a.c : klass + " " + a.c;
    else if (a) rest += attrs(a);
  }
  return (klass === "" ? "" : ' class="' + klass + '"') + rest;
}

function fields(formId: string, state: State<any>): Fields<any> {
  const values: Record<string, unknown> = state.values ?? {};
  const errors: Record<string, string | undefined> = state.errors ?? {};
  const base = formId.replace(/-form(?=$|-)/, "");
  const wired = (name: string) => ` name="${esc(name)}" id="${base}-${esc(name)}"` + (errors[name] ? ` aria-invalid="true" aria-describedby="${base}-${esc(name)}-error"` : "");
  const val = (name: string) => (values[name] == null ? "" : String(values[name]));
  const typeOf = (rest: any[]) => rest.find((a) => a && !(a instanceof Cls) && a.type != null)?.type;
  return {
    input(name, ...rest) {
      const type = typeOf(rest);
      const value = type === "password" || val(name) === "" ? "" : ` value="${esc(val(name))}"`;
      return new El(`<input${lead(rest, rest.length)}${wired(name)}${type ? "" : ' type="text"'}${value}>`);
    },
    textarea: (name, ...rest) => new El(`<textarea${lead(rest, rest.length)}${wired(name)}>${esc(val(name))}</textarea>`),
    select(name, options: Record<string, string>, ...rest) {
      let o = "";
      for (const value in options) o += `<option value="${esc(value)}"${val(name) === value ? " selected" : ""}>${esc(options[value])}</option>`;
      return new El(`<select${lead(rest, rest.length)}${wired(name)}>${o}</select>`);
    },
    checkbox: (name, ...rest) => new El(`<input${lead(rest, rest.length)}${wired(name)} type="checkbox"${values[name] ? " checked" : ""}>`),
    hidden: (name, value) => new El(`<input type="hidden" name="${esc(name)}" value="${esc(String(value ?? ""))}">`),
    error: (name, ...rest) => (errors[name] ? new El(`<span${lead(rest, rest.length)} id="${base}-${esc(name)}-error">${esc(errors[name]!)}</span>`) : null),
  };
}

export function routes<const D extends Record<string, AnyDef>>(prefix: string, defs: D): { [K in keyof D]: RouteOf<D[K]> } {
  const out: any = {};
  const group = prefix.replace(/^\/|\/$/g, "").replace(/\//g, "-");
  for (const key in defs) {
    const def: AnyDef = defs[key];
    const full = (prefix + (def.path === "/" ? "" : def.path)) || "/";
    const segs = full.split(/:([A-Za-z_][A-Za-z0-9_]*)/);
    const pathKeys: string[] = [];
    for (let i = 1; i < segs.length; i += 2) pathKeys.push(segs[i]);
    const hasQuery = Object.keys(def.shape).some((k) => !pathKeys.includes(k));
    const url = (input: any): string => {
      let u = segs[0];
      for (let i = 1; i < segs.length; i += 2) {
        const pv = input?.[segs[i]];
        if (pv == null || pv === "") throw new TypeError(`strict-tags: route ${group}.${key} needs ${segs[i]}`);
        u += encodeURIComponent(String(pv)) + segs[i + 1];
      }
      if (hasQuery && input) {
        let q = "";
        for (const k in input) {
          if (pathKeys.includes(k)) continue;
          const qv = input[k];
          if (qv == null || qv === "" || qv === false) continue;
          q += (q ? "&" : "?") + encodeURIComponent(k) + "=" + encodeURIComponent(String(qv));
        }
        u += q;
      }
      return u;
    };
    // A derived id carries the path parameters, so two instances of one part or form in a document never share an id.
    const scoped = (base: string, input: any): string => {
      let id = base;
      for (const k of pathKeys) id += "-" + slug(String(input?.[k] ?? ""));
      return id;
    };
    const fn: any =
      def.k === "page" ? (input: any) => new PageRef(url(input))
      : def.k === "part" ? (input: any) => new PartRef(url(input), scoped(def.id, input))
      : (input: any) => new ActionRef(url(input), scoped(`${group}-${key}-form`, input));
    fn.def = def;
    fn.key = key;
    fn.pattern = full;
    out[key] = fn;
  }
  return out;
}

/** A same-origin path stored as data. Anything else is null, and a wire given null writes no request. */
export class Local {
  declare readonly $local: true;
  u: string | null;
  constructor(u: string | null) {
    this.u = u;
  }
}
export const local = (path: string): Local => new Local(/^\/(?![/\\])[^\u0000-\u0020]*$/.test(path) ? path : null);

/** The escape hatch for htmx: a request the route wires do not cover. Addresses are routes or local(path); every value is encoded for its place. */
export function wire(o: {
  get?: PartRef<any, any> | PageRef | Local; post?: ActionRef<any> | Local;
  target?: PartRef<any, any> | "this"; swap?: "outerMorph" | "innerMorph" | "outerHTML" | "innerHTML" | "none" | "beforeend" | "afterbegin";
  trigger?: "click" | "change" | "load" | "revealed" | "submit" | Every;
  confirm?: string; vals?: Record<string, unknown>; headers?: Record<string, string>; push?: boolean;
}): Wire {
  let s = "";
  for (const m of ["get", "post"] as const) {
    const u = o[m];
    if (u == null) continue;
    const address = u instanceof Local ? u.u : u.url;
    if (address === null || HTMX_JS.test(address) || safeUrl(address) !== address) continue;
    s += ` hx-${m}="${esc(address)}"`;
  }
  if (o.target != null) s += ` hx-target="${o.target === "this" ? "this" : "#" + o.target.id}"`;
  if (o.swap != null) s += ` hx-swap="${esc(o.swap)}"`;
  if (o.trigger != null) {
    if (!/^(click|change|load|revealed|submit|\d+(ms|s))$/.test(o.trigger)) throw new TypeError(`strict-tags: refused htmx trigger ${JSON.stringify(String(o.trigger).slice(0, 40))}`);
    s += ` hx-trigger="${/^\d/.test(o.trigger) ? "every " + o.trigger : o.trigger}"`;
  }
  // htmx runs a confirm text that starts with js: as code. A word joiner in front keeps it text.
  if (o.confirm != null) s += ` hx-confirm="${esc(HTMX_JS.test(o.confirm) ? "\u2060" + o.confirm : o.confirm)}"`;
  if (o.vals != null) s += ` hx-vals="${esc(JSON.stringify(o.vals))}"`;
  if (o.headers != null) s += ` hx-headers="${esc(JSON.stringify(o.headers))}"`;
  if (o.push) s += ' hx-push-url="true"';
  return new Wire(s);
}

/** A native modal dialog: four attribute sets that cannot drift apart. The dialog is named by its title. */
export function modal<const I extends string>(id: I): { open: Attrs["button"]; root: Attrs["dialog"] & { "aria-labelledby": string }; title: { id: string }; close: Attrs["button"] } {
  return { open: { command: "show-modal", commandfor: id }, root: { id, closedby: "any", "aria-labelledby": `${id}-title` }, title: { id: `${id}-title` }, close: { command: "close", commandfor: id } };
}

// ───────────────────────── control flow ─────────────────────────

/**
 * Exhaustive dispatch on a value: match(status, { active: () => …, paused: () => … }). A missing case is a compile error.
 * match.on(state, "kind", { ok: (s) => …, error: (s) => … }) dispatches on an object's discriminant and narrows it.
 * Two names, one signature each: the result type comes from the cases, so a match can be a child directly.
 */
export const match: {
  <K extends PropertyKey, C extends { [P in K]: (value: P) => unknown }>(value: K, cases: C): ReturnType<C[keyof C]>;
  on<T, D extends keyof T, C extends { [P in T[D] & PropertyKey]: (value: Extract<T, Record<D, P>>) => unknown }>(value: T, key: D, cases: C): ReturnType<C[keyof C]>;
} = Object.assign((value: any, cases: any) => cases[value](value), { on: (value: any, key: any, cases: any) => cases[value[key]](value) });

// ───────────────────────── documents and handlers ─────────────────────────

const DEV = process.env.NODE_ENV !== "production";
/**
 * The document shell. It writes the one <main id="main"> every link and form swaps into, so no view writes main.
 * `header` and `footer` sit outside main. In development a repeated id in the document throws.
 */
export function doc(o: { title: string; lang?: string; description?: string; head?: El<"head", any, any>[]; header?: El<Flow, Exclude<Mark, "unlabelled" | "main">, any>; footer?: El<Flow, Exclude<Mark, "unlabelled" | "main">, any> }, ...content: (Cls | FlowKid)[]): Page {
  let klass = "";
  let body = "";
  for (const c of content) {
    if (c instanceof Cls) klass = klass === "" ? c.c : klass + " " + c.c;
    else body += kids(c);
  }
  const h =
    `<!DOCTYPE html><html lang="${esc(o.lang ?? "en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(o.title)}</title>` +
    (o.description ? `<meta name="description" content="${esc(o.description)}">` : "") + kids(o.head) +
    `</head><body hx-boost:inherited="true" hx-target:inherited="#${MAIN}" hx-swap:inherited="outerMorph show:top">${kids(o.header)}<main${klass === "" ? "" : ` class="${klass}"`} id="${MAIN}">${body}</main>${kids(o.footer)}</body></html>`;
  if (DEV) audit(h);
  return new Page(h);
}

const IDREF = /\s(hx-target|commandfor|popovertarget|aria-labelledby|aria-describedby|aria-controls|for|list)="([^"]*)"|\shx-status:\d+="target:(#[^ "]*)/g;
/** Development only: what the types cannot hold about a whole document. Ids are unique, and every reference to an id finds one. */
function audit(h: string): void {
  const ids = new Set<string>();
  for (const m of h.matchAll(/\sid="([^"]*)"/g)) {
    if (ids.has(m[1])) throw new TypeError(`strict-tags: id "${m[1]}" appears twice in one document. A form shown twice takes { scope: "…" } in its state; an id you wrote yourself needs a key`);
    ids.add(m[1]);
  }
  for (const m of h.matchAll(IDREF)) {
    const refs = m[1] === "hx-target" ? (m[2].startsWith("#") ? [m[2].slice(1)] : []) : m[3] ? [m[3].slice(1)] : m[2].split(/\s+/);
    for (const ref of refs) if (ref && !ids.has(ref)) throw new TypeError(`strict-tags: ${m[1] ?? "hx-status"} points at id "${ref}", which is not in this document. A wire needs its part's root on the page (route(…).root); a dialog needs h2(modal(id).title, …)`);
  }
}

export class Redirect { declare readonly $redirect: true; to: string; constructor(to: string) { this.to = to; } }
export class NotFound { declare readonly $notFound: true; }
export class Invalid<Bd> { declare readonly $invalid: Bd; errors: Record<string, string | undefined>; constructor(errors: any) { this.errors = errors; } }
type Awaitable<T> = T | Promise<T>;
/** What a handler gets. Views get none of this: a view is a synchronous function of the data the handler passes in. */
export interface Ctx<In, Bd = undefined> {
  input: In;
  body: Bd;
  redirect(to: PageRef): Redirect;
  notFound(): NotFound;
  /** Answers 422 with the route's form re-rendered with these errors. */
  invalid(errors: { [K in keyof Bd]?: string }): Invalid<Bd>;
  request: unknown;
}
/** A page or part route reads and renders. An action route changes something and then redirects: it never answers markup of its own. */
export type Entry<R> = R extends { readonly $k: "page"; readonly $in: infer In } ? (ctx: Ctx<In>) => Awaitable<Page | Redirect | NotFound>
  : R extends { readonly $k: "part"; readonly $in: infer In; readonly $i: infer I extends string } ? (ctx: Ctx<In>) => Awaitable<El<string, Exclude<Mark, "unlabelled">, I> | NotFound>
  : R extends { readonly $k: "action"; readonly $in: infer In; readonly $b: infer Bd } ? (undefined extends Bd ? (ctx: Ctx<In>) => Awaitable<Redirect | NotFound>
    : { form: (state: State<Bd>) => El<string, Mark, any>; ok: (ctx: Ctx<In, Bd>) => Awaitable<Redirect | Invalid<Bd> | NotFound> })
  : never;

export type Answer = { status: number; body?: string; location?: string };
/** One entry per route; a missing or extra key is a compile error. Returns a dispatcher the server adapter mounts. */
export function handlers<R extends Record<string, { readonly $k: string }>>(table: R, entries: { [K in keyof R]: Entry<R[K]> }) {
  const reply = (out: any, def: AnyDef, key: string, expectId: string | undefined): Answer => {
    if (out instanceof Redirect) return { status: 303, location: out.to };
    if (out instanceof NotFound) return { status: 404 };
    if (def.k === "part") {
      if (!(out instanceof El) || out.id !== expectId) throw new TypeError(`strict-tags: ${key} must answer the element whose root is ${key}(…).root (id ${expectId})`);
      return { status: 200, body: out.h };
    }
    if (!(out instanceof Page)) throw new TypeError(`strict-tags: ${key} must answer a page (the app Layout), a redirect or notFound()`);
    return { status: 200, body: out.h };
  };
  const dispatch = async (key: keyof R & string, req: { input?: any; body?: any; request?: unknown } = {}): Promise<Answer> => {
    const route: any = table[key];
    const def: AnyDef = route.def;
    const entry: any = entries[key];
    const base = {
      input: req.input ?? {},
      body: undefined as any,
      request: req.request,
      redirect: (to: PageRef) => new Redirect(to.url),
      notFound: () => new NotFound(),
      invalid: (errors: any) => new Invalid(errors),
    };
    const expectId = def.k === "part" ? route(base.input).id : undefined;
    if (def.k !== "action" || def.body === undefined) return reply(await entry(base), def, key, expectId);
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
    return reply(out, def, key, undefined);
  };
  return Object.assign(dispatch, { table: table as Record<string, any> });
}

/** The markup of a view or a page, as a string. */
export const render = (view: El<string, Mark, any> | Page): string => view.h;
