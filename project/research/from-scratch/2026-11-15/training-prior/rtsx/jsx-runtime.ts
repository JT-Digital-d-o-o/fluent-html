// rtsx JSX runtime: every element is rendered to a string the moment it is created.
// There is no retained tree. `jsx()` returns an Html value; text children are escaped,
// Html children pass through.
import { esc, Html, Id, Kind, Route, Url, cssValue } from "./core.js";
import type { JSX as J } from "./jsx.js";

export namespace JSX {
  export type Element = J.Element;
  export type ElementChildrenAttribute = J.ElementChildrenAttribute;
  export type IntrinsicElements = J.IntrinsicElements;
  export type IntrinsicAttributes = J.IntrinsicAttributes;
}

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TAG_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const tagOk = new Map<string, boolean>();

const enum A { Plain, Url, Verb, Target, Json, Confirm, Trigger, Style, Srcdoc, Data }

const URL_ATTRS = ["href", "src", "action", "formaction", "poster", "cite", "data", "ping", "background", "manifest", "xlink:href"];
const HX_VERBS = ["hx-get", "hx-post", "hx-put", "hx-patch", "hx-delete"];
const HX_PLAIN = ["hx-swap", "hx-push-url", "hx-replace-url", "hx-include", "hx-select", "hx-indicator", "hx-disable", "hx-sync", "hx-boost", "hx-encoding", "hx-validate", "hx-preserve", "hx-ignore"];
const LEAKS: Record<string, string> = {
  className: 'use class="…"',
  htmlFor: 'use for="…"',
  dangerouslySetInnerHTML: "pass unsafeHtml(trusted) as a child",
};

const kinds = new Map<string, A>();
for (const n of URL_ATTRS) kinds.set(n, A.Url);
for (const n of HX_VERBS) kinds.set(n, A.Verb);
for (const n of HX_PLAIN) kinds.set(n, A.Plain);
kinds.set("hx-target", A.Target);
kinds.set("hx-vals", A.Json);
kinds.set("hx-headers", A.Json);
kinds.set("hx-config", A.Json);
kinds.set("hx-confirm", A.Confirm);
kinds.set("hx-trigger", A.Trigger);
kinds.set("style", A.Style);
kinds.set("srcdoc", A.Srcdoc);
kinds.set("data", A.Url);
kinds.set("dataset", A.Data);

const NAME_RE = /^[A-Za-z][A-Za-z0-9]*(?:[-:.][A-Za-z0-9]+)*$/;

function classify(name: string): A {
  const mod = /^(hx-[a-z-]+):(?:inherited|append)$/.exec(name);
  if (mod !== null) {
    const base = kinds.get(mod[1]!);
    if (base === undefined || base === A.Verb) throw new Error(`rtsx: "${name}" is not an inheritable htmx attribute`);
    return base;
  }
  if (!NAME_RE.test(name)) throw new Error(`rtsx: ${JSON.stringify(name.slice(0, 40))} is not an attribute name`);
  if (name in LEAKS) throw new Error(`rtsx: ${name} is not an attribute: ${LEAKS[name]}`);
  const lower = name.toLowerCase();
  if (lower.startsWith("on")) throw new Error(`rtsx: inline handler "${name}" is not allowed: use command/commandfor, popovertarget or an hx-* attribute`);
  if (/^(data-)?hx-?on/.test(lower) || lower.startsWith("data-hx")) throw new Error(`rtsx: "${name}" would run script through htmx and is not allowed`);
  if (lower.startsWith("hx-") && !lower.startsWith("hx-status:")) {
    throw new Error(`rtsx: unknown htmx attribute "${name}". Known: ${[...HX_VERBS, "hx-target", "hx-trigger", "hx-confirm", "hx-vals", "hx-headers", ...HX_PLAIN].join(", ")}`);
  }
  return A.Plain;
}

const URL_STRIP = /^[\u0000- ]+|[\t\n\r]/g;
const URL_SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;
const URL_OK = new Set(["http", "https", "mailto", "tel", "sms"]);
const DATA_OK = /^data:(?:image\/(?:png|jpeg|gif|webp|avif)|audio\/|video\/|font\/)/i;

export function safeUrl(v: string): string {
  const m = URL_SCHEME.exec(v.replace(URL_STRIP, ""));
  if (m === null || URL_OK.has(m[1]!.toLowerCase())) return v;
  if (m[1]!.toLowerCase() === "data" && DATA_OK.test(v.replace(URL_STRIP, ""))) return v;
  return "about:invalid#blocked";
}

function cx(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    let s = "";
    for (let i = 0; i < v.length; i++) {
      const p = cx(v[i]);
      if (p) s += (s ? " " : "") + p;
    }
    return s;
  }
  if (v == null || v === false) return "";
  throw new Error("rtsx: class takes a string or an array of strings and falsy values");
}

function styleText(v: unknown): string {
  if (typeof v !== "object" || v === null) throw new Error("rtsx: style takes an object, e.g. style={{ width: `${pct}%` }}");
  let s = "";
  for (const k in v as Record<string, unknown>) {
    const val = (v as Record<string, unknown>)[k];
    if (val == null || val === false) continue;
    if (!/^(?:--)?[a-zA-Z][a-zA-Z0-9-]*$/.test(k)) throw new Error(`rtsx: ${JSON.stringify(k)} is not a CSS property name`);
    const prop = k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    s += (s ? "; " : "") + prop + ": " + cssValue(val as string | number);
  }
  return s;
}

function text(name: string, v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v instanceof Id) return v.name;
  throw new Error(`rtsx: ${name} takes a string, a number or an id, got ${v instanceof Route ? "a route" : typeof v}`);
}

function attr(name: string, v: unknown, props: Record<string, unknown>): string {
  let kind = kinds.get(name);
  if (kind === undefined) kinds.set(name, (kind = classify(name)));
  switch (kind) {
    case A.Plain:
      if (v === true) return name.charCodeAt(4) === 45 && name.startsWith("aria") ? " " + name + '="true"' : " " + name;
      return " " + name + '="' + esc(text(name, v)) + '"';
    case A.Url:
      if (v instanceof Route) {
        const nav = name === "href" && props["target"] === undefined && props["download"] === undefined && !hasVerb(props);
        return " " + name + '="' + esc(v.url) + '"' + (nav ? ' hx-get="' + esc(v.url) + '"' + protocol(v, props) : "");
      }
      return " " + name + '="' + esc(safeUrl(v instanceof Url ? v.href : text(name, v))) + '"';
    case A.Verb: {
      if (!(v instanceof Route)) throw new Error(`rtsx: ${name} takes a route (routes.x(), or localUrl(path) for a path from data), not a ${typeof v}`);
      if (name.slice(3) !== v.method) throw new Error(`rtsx: ${name} got a ${v.method} route`);
      return " " + name + '="' + esc(v.url) + '"' + protocol(v, props);
    }
    case A.Target:
      return " " + name + '="' + (v instanceof Id ? "#" + v.name : esc(text(name, v))) + '"';
    case A.Json:
      if (typeof v !== "object" || v === null) throw new Error(`rtsx: ${name} takes an object, not a string`);
      return " " + name + '="' + esc(JSON.stringify(v)) + '"';
    case A.Confirm: {
      const s = text(name, v);
      if (/^\s*(?:js|javascript):/i.test(s)) throw new Error("rtsx: hx-confirm text must not start with js: or javascript:");
      return " " + name + '="' + esc(s) + '"';
    }
    case A.Trigger: {
      const s = text(name, v);
      if (s.includes("[")) throw new Error("rtsx: hx-trigger filters ([expr]) run script and are not allowed");
      return " " + name + '="' + esc(s) + '"';
    }
    case A.Style: {
      const s = styleText(v);
      return s ? ' style="' + esc(s) + '"' : "";
    }
    case A.Srcdoc: {
      const sandbox = props["sandbox"];
      if (typeof sandbox === "string" && /allow-scripts/.test(sandbox) && /allow-same-origin/.test(sandbox)) throw new Error("rtsx: srcdoc with allow-scripts and allow-same-origin is the page's own origin");
      return ' srcdoc="' + esc(text(name, v)) + '"' + (sandbox === undefined ? ' sandbox=""' : "");
    }
    case A.Data: {
      let s = "";
      for (const k in v as Record<string, unknown>) {
        const val = (v as Record<string, unknown>)[k];
        if (val == null || val === false) continue;
        if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(k) || /^hx(?:-|$)/.test(k)) throw new Error(`rtsx: ${JSON.stringify(k.slice(0, 40))} is not a data-* key (kebab-case, not hx-*)`);
        s += " data-" + k + '="' + esc(text("data-" + k, val)) + '"';
      }
      return s;
    }
  }
}

// What the route declared about its answer becomes the swap attributes, so the source
// element and the handler cannot disagree.
function protocol(r: Route, props: Record<string, unknown>): string {
  const to = r.render;
  let s = "";
  if (r.poll !== undefined) return ' hx-trigger="every ' + r.poll + '" hx-target="this" hx-swap="outerHTML"';
  if (to === "none") {
    if (props["hx-swap"] === undefined) s += ' hx-swap="none"';
  } else {
    if (props["hx-target"] === undefined) s += ' hx-target="#' + (to === undefined ? "main-content" : to.name) + '"';
    if (props["hx-swap"] === undefined) s += ' hx-swap="outerMorph"';
    if (to === undefined && r.method === "get" && props["hx-push-url"] === undefined) s += ' hx-push-url="true"';
  }
  if (r.invalid !== undefined) s += ' hx-status:422="target:#' + r.invalid.name + ' swap:outerMorph push:false"';
  return s;
}

function kids(c: unknown): string {
  if (typeof c === "string") return esc(c);
  if (c instanceof Html) {
    if (c.kind === Kind.Html) return c.html;
    if (c.kind === Kind.Document) throw new Error("rtsx: a document (<html>) cannot be a child");
    return esc(c.html);
  }
  if (c == null || c === false || c === true) return "";
  if (typeof c === "number") return String(c);
  if (Array.isArray(c)) {
    let s = "";
    for (let i = 0; i < c.length; i++) s += kids(c[i]);
    return s;
  }
  throw new Error(`rtsx: a child must be text, a number, an element or an array, got ${c instanceof Route ? "a route" : typeof c}`);
}

function rawKids(tag: string, want: Kind, c: unknown): string {
  if (c == null) return "";
  if (c instanceof Html && c.kind === want) return c.html;
  throw new Error(tag === "script" ? "rtsx: <script> content must come from json(data) or js`…`" : "rtsx: <style> content must come from css`…`");
}

export function jsx(type: string | ((props: any) => unknown), props: Record<string, unknown>): Html {
  if (typeof type === "function") {
    const r = type(props);
    return r instanceof Html ? r : new Html(kids(r));
  }
  let ok = tagOk.get(type);
  if (ok === undefined) tagOk.set(type, (ok = TAG_RE.test(type)));
  if (!ok) throw new Error(`rtsx: ${JSON.stringify(String(type).slice(0, 40))} is not an element name`);

  let out = "<" + type;
  for (const k in props) {
    if (k === "children") continue;
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === "class") {
      const c = typeof v === "string" ? v : cx(v);
      if (c) out += ' class="' + esc(c) + '"';
    } else if (k === "value" && (type === "textarea" || type === "select")) continue;
    else out += attr(k, v, props);
  }
  if (type === "button" && props["type"] === undefined) {
    out += props["command"] !== undefined || props["popovertarget"] !== undefined || hasVerb(props) ? ' type="button"' : ' type="submit"';
  }
  if (VOID.has(type)) {
    if (props["children"] != null) throw new Error(`rtsx: <${type}> takes no children`);
    return new Html(out + ">", Kind.Html, rootId(props));
  }
  const c = props["children"];
  let inner: string;
  if (type === "script") inner = rawKids(type, Kind.Script, c);
  else if (type === "style") inner = rawKids(type, Kind.Css, c);
  else {
    if (type === "textarea") {
      inner = props["value"] != null ? esc(text("value", props["value"])) : kids(c);
      if (inner.charCodeAt(0) === 10) inner = "\n" + inner;
    } else {
      inner = kids(c);
      if (type === "select" && props["value"] != null) inner = inner.replace('value="' + esc(text("value", props["value"])) + '"', "$& selected");
    }
  }
  if (type === "html") return new Html("<!DOCTYPE html>" + out + ">" + inner + "</html>", Kind.Document);
  return new Html(out + ">" + inner + "</" + type + ">", Kind.Html, rootId(props));
}

function hasVerb(p: Record<string, unknown>): boolean {
  return p["hx-get"] !== undefined || p["hx-post"] !== undefined || p["hx-put"] !== undefined || p["hx-patch"] !== undefined || p["hx-delete"] !== undefined;
}

function rootId(p: Record<string, unknown>): string | undefined {
  const id = p["id"];
  return id === undefined ? undefined : id instanceof Id ? id.name : String(id);
}

export const jsxs = jsx;
export const jsxDEV = jsx;

export function Fragment(props: { children?: unknown }): Html {
  return new Html(kids(props.children));
}
