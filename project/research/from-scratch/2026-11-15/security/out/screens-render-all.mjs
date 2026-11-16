// screens/render-all.tsx
import { mkdirSync, writeFileSync } from "node:fs";

// sealed/index.ts
var KEY = /* @__PURE__ */ Symbol("sealed");
var ESC_RE = /[&<>"']/;
var ESC_G = /[&<>"']/g;
var ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var rep = (c) => ESC_MAP[c];
var esc = (s) => ESC_RE.test(s) ? s.replace(ESC_G, rep) : s;
function fail(msg) {
  throw new TypeError(`sealed: ${msg}`);
}
var show = (v) => typeof v === "string" ? JSON.stringify(v.slice(0, 40)) : Object.prototype.toString.call(v);
var Html = class {
  s;
  id;
  constructor(key, s, id) {
    if (key !== KEY) fail("Html comes from JSX, html`...` or sanitize(); there is no constructor from a string");
    this.s = s;
    this.id = id;
  }
  toString() {
    return fail("an Html value was stringified; pass it as a JSX child, or call render(view, ctx) at the response");
  }
};
var EMPTY = new Html(KEY, "");
var Id = class {
  constructor(key, name) {
    this.name = name;
    if (key !== KEY) fail("ids come from defineIds()");
  }
  name;
};
var Route = class {
  constructor(key, kind, method, url, region, invalid) {
    this.kind = kind;
    this.method = method;
    this.url = url;
    this.region = region;
    this.invalid = invalid;
    if (key !== KEY) fail("routes come from defineRoutes() or localUrl()");
  }
  kind;
  method;
  url;
  region;
  invalid;
};
var Css = class {
  constructor(key, s) {
    this.s = s;
    if (key !== KEY) fail("Css comes from css`...`");
  }
  s;
};
var Json = class {
  constructor(key, s) {
    this.s = s;
    if (key !== KEY) fail("Json comes from json(data)");
  }
  s;
};
var Js = class {
  constructor(key, s) {
    this.s = s;
    if (key !== KEY) fail("Js comes from js`...`");
  }
  s;
};
var Verb = class {
  constructor(key, attrs, selfId) {
    this.attrs = attrs;
    this.selfId = selfId;
    if (key !== KEY) fail("hx verbs come from search(), poll(), swap(), fire(), load()");
  }
  attrs;
  selfId;
};
var kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
var ID_RE = /^[a-z][a-z0-9-]*$/;
function defineIds(names) {
  const out = {};
  for (const n of names) {
    const k = kebab(n);
    if (!ID_RE.test(k)) fail(`defineIds: ${show(n)} is not an identifier`);
    out[n] = new Id(KEY, k);
  }
  return out;
}
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function defineRoutes(prefix, defs) {
  const out = {};
  for (const name of Object.keys(defs)) {
    const d = defs[name];
    const full = prefix + (d.path === "/" ? "" : d.path) || "/";
    const parts = full.split(/(:[A-Za-z_]\w*)/);
    const params = d.params ?? {};
    const query = d.query ?? {};
    for (let i = 1; i < parts.length; i += 2) {
      if (!(parts[i].slice(1) in params)) fail(`route ${name}: path param ${parts[i]} has no entry in params`);
    }
    const kind = d.region ? "fragment" : d.render === "none" ? "none" : "page";
    const method = d.method ?? "get";
    const region = d.region?.name;
    const invalid = d.invalid?.name;
    const isStatic = parts.length === 1;
    const staticRoute = isStatic ? new Route(KEY, kind, method, full, region, invalid) : void 0;
    const fn = (args) => {
      if (args === void 0 && staticRoute) return staticRoute;
      let url = parts[0];
      for (let i = 1; i < parts.length; i += 2) {
        const key = parts[i].slice(1);
        const v = args?.[key];
        const want = params[key];
        if (want === "number" ? typeof v !== "number" || !Number.isFinite(v) : typeof v !== "string" || v === "" || want === "uuid" && !UUID_RE.test(v)) {
          fail(`route ${name}: param ${key} must be a ${want}, got ${show(v)}`);
        }
        url += encodeURIComponent(String(v)) + parts[i + 1];
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
    fn.def = d;
    out[name] = fn;
  }
  return out;
}
var EVERY_RE = /^\d+(ms|s)$/;
var WORD_JOINER = "\u2060";
function reqAttr(route) {
  if (!(route instanceof Route)) fail(`an hx verb takes a route, got ${show(route)}. Routes come from defineRoutes(); a path stored as data goes through localUrl()`);
  return " hx-" + route.method + '="' + esc(route.url) + '"';
}
function optAttrs(o) {
  if (!o) return "";
  let s = "";
  if (o.vals !== void 0) s += ' hx-vals="' + esc(jsonObject(o.vals, "vals")) + '"';
  if (o.headers !== void 0) s += ' hx-headers="' + esc(jsonObject(o.headers, "headers")) + '"';
  if (o.confirm !== void 0) s += ' hx-confirm="' + esc(htmxText(String(o.confirm))) + '"';
  if (o.include !== void 0) s += ' hx-include="#' + idOf(o.include, "include") + '"';
  return s;
}
function jsonObject(v, what) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) fail(`hx ${what} must be an object, got ${show(v)}`);
  return JSON.stringify(v);
}
var htmxText = (s) => /^(js|javascript):/.test(s) ? WORD_JOINER + s : s;
function regionOf(route, verb) {
  if (route.region === void 0) fail(`${verb}() needs a fragment route (one that declares region: ids.x); ${route.url} answers a ${route.kind}`);
  return route.region;
}
function search(route, delay = "300ms", opts) {
  if (!EVERY_RE.test(delay)) fail(`search delay ${show(delay)}`);
  return new Verb(KEY, reqAttr(route) + ' hx-trigger="input changed delay:' + delay + ', search" hx-target="#' + regionOf(route, "search") + '" hx-swap="outerMorph" hx-sync="this:replace"' + optAttrs(opts), void 0);
}
function poll(route, every = "2s") {
  if (!EVERY_RE.test(every)) fail(`poll interval ${show(every)}`);
  return new Verb(KEY, reqAttr(route) + ' hx-trigger="every ' + every + '" hx-target="this" hx-swap="outerHTML"', regionOf(route, "poll"));
}
function fire(route, opts) {
  const nav = route.kind === "page" ? ' hx-target="#main-content" hx-swap="outerMorph show:top" hx-push-url="true"' : ' hx-swap="none"';
  return new Verb(KEY, reqAttr(route) + nav + optAttrs(opts), void 0);
}
var CSS_VALUE_OK = /^[A-Za-z0-9 #%.,()\/+\-_]*$/;
var CSS_VALUE_BAD = /\/\*|\*\/|url\s*\(|image-set\s*\(|expression\s*\(|image\s*\(/i;
function cssValue(v) {
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
var K_NORMAL = 1;
var K_VOID = 2;
var K_RCDATA = 3;
var K_SCRIPT = 4;
var K_STYLE = 5;
var K_NOKIDS = 6;
var ELEMENTS = /* @__PURE__ */ Object.create(null);
for (const t of "html head body main header footer nav section article aside div span p a h1 h2 h3 h4 h5 h6 ul ol li dl dt dd table thead tbody tfoot tr th td caption colgroup form label button select option optgroup fieldset legend output dialog details summary figure figcaption blockquote pre code em strong small b i u s sub sup mark time abbr address picture video audio canvas progress meter datalist template search hgroup menu q cite kbd samp var del ins bdi bdo ruby rt rp data".split(" ")) ELEMENTS[t] = K_NORMAL;
for (const t of "br hr img input meta link col source track wbr area embed".split(" ")) ELEMENTS[t] = K_VOID;
ELEMENTS.textarea = K_RCDATA;
ELEMENTS.title = K_RCDATA;
ELEMENTS.script = K_SCRIPT;
ELEMENTS.style = K_STYLE;
ELEMENTS.iframe = K_NOKIDS;
var A_TEXT = 1;
var A_URL = 2;
var A_IDREF = 3;
var A_SRCDOC = 4;
var A_SANDBOX = 5;
var A_SRCSET = 6;
var ATTR = /* @__PURE__ */ Object.create(null);
for (const a of "title lang dir role tabindex hidden draggable inert popover name value type placeholder required disabled readonly checked selected multiple autofocus autocomplete min max step minlength maxlength pattern rows cols wrap accept alt width height loading decoding rel target download method enctype novalidate colspan rowspan scope open datetime label span start reversed charset content media sizes as crossorigin integrity referrerpolicy allow allowfullscreen controls autoplay loop muted playsinline preload kind srclang default command closedby inputmode enterkeyhint spellcheck translate contenteditable accesskey high low optimum async defer nomodule fetchpriority property itemprop".split(" ")) ATTR[a] = A_TEXT;
for (const a of "href src action formaction poster cite".split(" ")) ATTR[a] = A_URL;
for (const a of "for form list commandfor popovertarget headers".split(" ")) ATTR[a] = A_IDREF;
ATTR.srcdoc = A_SRCDOC;
ATTR.sandbox = A_SANDBOX;
ATTR.srcset = A_SRCSET;
var ALIAS = Object.assign(/* @__PURE__ */ Object.create(null), { htmlFor: "for" });
var DYN_OK = /^(data|aria)-[a-z0-9][a-z0-9_.-]*$/;
var DYN_BAD = /^data-(hx|on)/;
var dynCache = /* @__PURE__ */ new Map();
function dynAttr(tag, k) {
  if (dynCache.has(k)) return A_TEXT;
  if (!DYN_OK.test(k) || DYN_BAD.test(k)) {
    if (/^on/i.test(k)) fail(`<${tag} ${k}>: inline handlers are not writable. Use command/commandfor, popovertarget, or the hx prop`);
    if (/^(data-)?hx-/i.test(k)) fail(`<${tag} ${k}>: hx-* attributes are not writable. Use the hx prop: hx={swap(route)}, search(route), poll(route, "2s"), fire(route), load(route)`);
    fail(`<${tag}>: ${show(k)} is not an attribute of this element (known attributes, data-* and aria-* only)`);
  }
  if (dynCache.size < 4096) dynCache.set(k, true);
  return A_TEXT;
}
var P_LINK = 0;
var P_MEDIA = 1;
var P_FRAME = 2;
var P_CODE = 3;
var SCHEME = /^([a-zA-Z][a-zA-Z0-9+.\-]*):/;
var SAFE_DATA = /^data:(image\/(?!svg)[a-z0-9.+-]+|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|font\/[a-z0-9.+-]+)[;,]/i;
var BLOCKED = "about:invalid#blocked";
function urlOk(u, policy) {
  const c0 = u.charCodeAt(0);
  if (policy === P_CODE) return c0 === 47 && u.charCodeAt(1) !== 47 && u.charCodeAt(1) !== 92 && !/[\u0000- \\]/.test(u);
  if (c0 === 47 || c0 === 35 || c0 === 63 || c0 === 46) return true;
  const n = /[\u0000- ]/.test(u) ? u.replace(/[\t\n\r]/g, "").replace(/^[\u0000- ]+/, "") : u;
  const m = SCHEME.exec(n);
  if (m === null) return true;
  const s = m[1].toLowerCase();
  if (s === "https" || s === "http") return true;
  if (policy === P_FRAME) return false;
  if (s === "data") return SAFE_DATA.test(n);
  return policy === P_LINK && (s === "mailto" || s === "tel");
}
function policyFor(tag, k) {
  if (k === "poster") return P_MEDIA;
  if (k === "src") return tag === "script" ? P_CODE : tag === "iframe" || tag === "embed" ? P_FRAME : P_MEDIA;
  if (k === "href") return tag === "link" ? P_CODE : P_LINK;
  return P_LINK;
}
var idOf = (v, what) => v instanceof Id ? v.name : fail(`${what} takes an id from defineIds(), got ${show(v)}`);
function classValue(v) {
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
var propCache = /* @__PURE__ */ new Map();
function cssProp(k) {
  let p = propCache.get(k);
  if (p === void 0) {
    p = k.startsWith("--") ? k : kebab(k);
    if (!/^(--)?[a-z][a-z0-9-]*$/.test(p)) fail(`style: ${show(k)} is not a CSS property name`);
    if (propCache.size < 1024) propCache.set(k, p);
  }
  return p;
}
function styleValue(v) {
  if (v instanceof Css) return v.s;
  if (v === null || typeof v !== "object" || Array.isArray(v)) {
    return fail(`style takes an object ({ color: value }), got ${show(v)}. A style string cannot be made safe`);
  }
  let s = "";
  for (const k in v) {
    const raw = v[k];
    if (raw == null || raw === false) continue;
    const val = cssValue(raw);
    if (val === null) continue;
    s += (s === "" ? "" : ";") + cssProp(k) + ":" + val;
  }
  return s;
}
var SANDBOX_TOKENS = /* @__PURE__ */ new Set(["allow-forms", "allow-modals", "allow-popups", "allow-downloads", "allow-scripts", "allow-same-origin", "allow-presentation"]);
var nonceSlotUsed = false;
var NONCE_SLOT = "sealed-nonce-" + crypto.randomUUID() + crypto.randomUUID();
function attr(tag, k, v) {
  let a = ATTR[k];
  if (a === void 0) {
    const alias = ALIAS[k];
    if (alias !== void 0) {
      k = alias;
      a = ATTR[k];
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
function formAction(r, u) {
  let s = ' action="' + u + '" method="' + (r.method === "get" ? "get" : "post") + '" hx-' + r.method + '="' + u + '"';
  if (r.region !== void 0) s += ' hx-target="#' + r.region + '" hx-swap="outerMorph"';
  else if (r.kind === "none") s += ' hx-swap="none"';
  else s += ' hx-target="#main-content" hx-swap="outerMorph show:top" hx-push-url="true"';
  if (r.invalid !== void 0) s += ' hx-status:422="target:#' + r.invalid + ' swap:outerMorph push:false"';
  return s;
}
function kids(c) {
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
function textOnly(tag, c) {
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
function jsx(tag, props, _key) {
  if (typeof tag === "function") {
    const r = tag(props ?? {});
    if (r instanceof Html) return r;
    if (r === null) return EMPTY;
    return fail(`component ${tag.name || "(anonymous)"} returned ${show(r)}; a component returns JSX or null`);
  }
  const kind = ELEMENTS[tag];
  if (kind === void 0) fail(`<${String(tag)}> is not a writable element`);
  let out = "<" + tag;
  let children;
  let id;
  let verb;
  let hasType = false;
  let invoker = false;
  let srcdoc;
  let sandbox;
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
        const name = v instanceof Id ? v.name : typeof v === "string" ? v : fail(`<${tag} id> takes an id or a string, got ${show(v)}`);
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
  if (verb !== void 0) {
    if (verb.selfId !== void 0) {
      if (id === void 0) out += ' id="' + (id = verb.selfId) + '"';
      else if (id !== verb.selfId) fail(`<${tag} id="${id}"> polls a route whose region is "${verb.selfId}"`);
    }
    out += verb.attrs;
  }
  if (tag === "button" && !hasType) out += verb !== void 0 || invoker ? ' type="button"' : ' type="submit"';
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
        if (t !== void 0 && t !== "application/json" && t !== "application/ld+json") fail(`<script type=${show(t)}> cannot hold json(data)`);
        out += (t === void 0 ? ' type="application/json"' : "") + ">" + body.s + "</script>";
      } else if (body instanceof Js || body == null && props?.src !== void 0) {
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
      if (sandbox !== void 0 && sandbox !== true) {
        if (typeof sandbox !== "string") fail("<iframe sandbox> takes a string of allow-* tokens");
        tokens = sandbox.trim();
        for (const t of tokens === "" ? [] : tokens.split(/\s+/)) if (!SANDBOX_TOKENS.has(t)) fail(`<iframe sandbox>: unknown token ${show(t)}`);
      }
      if (srcdoc !== void 0) {
        const scripts = /\ballow-scripts\b/.test(tokens);
        if (srcdoc instanceof Html) out += ' srcdoc="' + esc(srcdoc.s) + '"';
        else if (typeof srcdoc === "string") {
          if (scripts) fail("<iframe srcdoc>: a string runs with no scripts; allow-scripts needs srcdoc to be JSX");
          out += ' srcdoc="' + esc(srcdoc) + '"';
        } else fail(`<iframe srcdoc> takes a string or JSX, got ${show(srcdoc)}`);
        if (scripts && /\ballow-same-origin\b/.test(tokens)) fail("<iframe srcdoc>: allow-scripts with allow-same-origin removes the sandbox");
        out += ' sandbox="' + tokens + '"';
      } else if (sandbox !== void 0) out += ' sandbox="' + tokens + '"';
      out += "></" + tag + ">";
    }
  }
  return new Html(KEY, out, id);
}
var jsxs = jsx;
function bind(route, state = {}) {
  const prefix = route.def.invalid?.name ?? "form";
  const values = state.values ?? {};
  const errors = state.errors ?? {};
  const fid = (n) => prefix + "-" + n;
  const val = (n) => values[n] == null ? "" : String(values[n]);
  const wiring = (n) => errors[n] ? { "aria-invalid": true, "aria-describedby": fid(n) + "-error" } : {};
  return {
    input: (n, type = "text") => ({ name: n, id: fid(n), type, value: type === "password" ? "" : val(n), ...wiring(n) }),
    field: (n) => ({ name: n, id: fid(n), ...wiring(n) }),
    value: val,
    id: fid,
    error: (n, cls) => errors[n] ? jsx("p", { id: fid(n) + "-error", class: cls, children: errors[n] }) : null
  };
}
function render(view, ctx2 = {}) {
  if (!(view instanceof Html)) fail(`render() takes JSX, got ${show(view)}`);
  const s = view.s;
  if (!nonceSlotUsed || !s.includes(NONCE_SLOT)) return s;
  const nonce = ctx2.nonce;
  if (nonce === void 0 || !/^[A-Za-z0-9+\/_-]+=*$/.test(nonce)) return fail("this view has a <script> or <style>: render(view, { nonce }) needs the response's CSP nonce");
  return s.replaceAll(NONCE_SLOT, nonce);
}
var rootId = (view) => view.id;

// screens/layout.tsx
function Layout({ title, children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charset: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("title", { children: title }),
      /* @__PURE__ */ jsx("link", { rel: "stylesheet", href: "/css/app.css" }),
      /* @__PURE__ */ jsx("script", { src: "/js/htmx.js", defer: true })
    ] }),
    /* @__PURE__ */ jsx("body", { class: "bg-bg text-text", children: /* @__PURE__ */ jsx("main", { id: "main-content", class: "mx-auto max-w-3xl p-6", children }) })
  ] });
}

// screens/typebox-shim.ts
var Type = {
  String: (_o) => ({}),
  Number: (_o) => ({}),
  Object: (_p) => ({})
};

// screens/projects.routes.ts
var ids = defineIds(["projectList", "projectForm", "statusBadge", "confirmDelete", "confirmDeleteTitle"]);
var CreateProject = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 80 }),
  client: Type.String({ minLength: 1, maxLength: 80 }),
  budget: Type.Number({ minimum: 0 })
});
var projects = defineRoutes("/projects", {
  list: { path: "/", query: { q: "string" } },
  rows: { path: "/rows", query: { q: "string" }, region: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id", params: { id: "number" } },
  status: { path: "/:id/status", params: { id: "number" }, region: ids.statusBadge },
  remove: { method: "delete", path: "/:id", params: { id: "number" } }
});

// screens/r1-project-list.tsx
function ProjectListPage({ projects: rows2, q }) {
  return /* @__PURE__ */ jsxs(Layout, { title: "Projects", children: [
    /* @__PURE__ */ jsxs("header", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("h1", { class: "text-2xl font-semibold", children: "Projects" }),
      /* @__PURE__ */ jsx("a", { href: projects.new(), class: "rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-accent hover:bg-primary-700", children: "New project" })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "search",
        name: "q",
        value: q,
        placeholder: "Search projects",
        "aria-label": "Search projects",
        class: "mt-6 w-full rounded-control border border-line bg-surface px-3 py-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-hidden",
        hx: search(projects.rows())
      }
    ),
    /* @__PURE__ */ jsx(ProjectList, { projects: rows2, q })
  ] });
}
function ProjectList({ projects: rows2, q }) {
  return /* @__PURE__ */ jsx("section", { id: ids.projectList, class: "mt-4", "aria-label": "Projects", children: rows2.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { q }) : /* @__PURE__ */ jsx("ul", { class: "divide-y divide-line rounded-card border border-line bg-surface", children: rows2.map((project) => /* @__PURE__ */ jsx(ProjectRow, { project })) }) });
}
function ProjectRow({ project }) {
  return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("a", { href: projects.detail({ id: project.id }), class: "flex items-center justify-between gap-4 px-4 py-3 hover:bg-surface-2", children: [
    /* @__PURE__ */ jsx("span", { class: "font-medium", children: project.name }),
    /* @__PURE__ */ jsx("span", { class: "text-sm text-text-dim", children: project.client })
  ] }) });
}
function EmptyState({ q }) {
  return /* @__PURE__ */ jsxs("div", { class: "rounded-card border border-dashed border-line p-10 text-center", children: [
    /* @__PURE__ */ jsx("p", { class: "font-medium", children: q ? `No projects match "${q}"` : "No projects yet" }),
    /* @__PURE__ */ jsx("p", { class: "mt-1 text-sm text-text-dim", children: q ? "Try a different search." : "Create the first one to get started." })
  ] });
}

// screens/r2-project-form.tsx
var label = "block text-sm font-medium";
var control = "mt-1 w-full rounded-control border border-line bg-surface px-3 py-2 aria-invalid:border-danger";
var error = "mt-1 text-sm text-danger";
function NewProjectPage(state) {
  return /* @__PURE__ */ jsxs(Layout, { title: "New project", children: [
    /* @__PURE__ */ jsx("h1", { class: "text-2xl font-semibold", children: "New project" }),
    /* @__PURE__ */ jsx(ProjectForm, { ...state })
  ] });
}
function ProjectForm(state) {
  const f = bind(projects.create, state);
  return /* @__PURE__ */ jsxs("form", { id: ids.projectForm, action: projects.create(), novalidate: true, class: "mt-6 flex max-w-lg flex-col gap-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { for: f.id("name"), class: label, children: "Name" }),
      /* @__PURE__ */ jsx("input", { ...f.input("name"), required: true, maxlength: 80, class: control }),
      f.error("name", error)
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { for: f.id("client"), class: label, children: "Client" }),
      /* @__PURE__ */ jsx("input", { ...f.input("client"), required: true, maxlength: 80, class: control }),
      f.error("client", error)
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { for: f.id("budget"), class: label, children: "Budget (EUR)" }),
      /* @__PURE__ */ jsx("input", { ...f.input("budget", "number"), min: 0, step: 100, class: control }),
      f.error("budget", error)
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("button", { class: "rounded-control bg-primary px-4 py-2 text-sm font-medium text-on-accent hover:bg-primary-700 cursor-pointer", children: "Create project" }),
      /* @__PURE__ */ jsx("a", { href: projects.list(), class: "text-sm text-text-dim hover:underline", children: "Cancel" })
    ] })
  ] });
}

// screens/r3-project-detail.tsx
var TONE = {
  queued: "bg-surface-2 text-text-dim",
  running: "bg-info/10 text-info",
  done: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger"
};
var LABEL = { queued: "Queued", running: "Importing", done: "Ready", failed: "Import failed" };
function ProjectDetailPage({ project, job }) {
  return /* @__PURE__ */ jsxs(Layout, { title: project.name, children: [
    /* @__PURE__ */ jsxs("nav", { "aria-label": "Breadcrumb", class: "text-sm text-text-dim", children: [
      /* @__PURE__ */ jsx("a", { href: projects.list(), class: "hover:underline", children: "Projects" }),
      " / ",
      project.name
    ] }),
    /* @__PURE__ */ jsxs("header", { class: "mt-2 flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("h1", { class: "text-2xl font-semibold", children: project.name }),
        /* @__PURE__ */ jsx(StatusBadge, { projectId: project.id, job })
      ] }),
      /* @__PURE__ */ jsx("button", { command: "show-modal", commandfor: ids.confirmDelete, class: "rounded-control border border-line px-3 py-2 text-sm text-danger hover:bg-danger/10 cursor-pointer", children: "Delete" })
    ] }),
    /* @__PURE__ */ jsxs("dl", { class: "mt-6 grid grid-cols-2 gap-4 text-sm", children: [
      /* @__PURE__ */ jsx("dt", { class: "text-text-dim", children: "Client" }),
      /* @__PURE__ */ jsx("dd", { children: project.client }),
      /* @__PURE__ */ jsx("dt", { class: "text-text-dim", children: "Budget" }),
      /* @__PURE__ */ jsxs("dd", { children: [
        project.budget,
        " EUR"
      ] }),
      /* @__PURE__ */ jsx("dt", { class: "text-text-dim", children: "Website" }),
      /* @__PURE__ */ jsx("dd", { children: project.website ? /* @__PURE__ */ jsx("a", { href: project.website, rel: "noopener", class: "underline", children: project.website }) : "None" })
    ] }),
    /* @__PURE__ */ jsx(ConfirmDelete, { project })
  ] });
}
function StatusBadge({ projectId, job }) {
  const live = job.status === "queued" || job.status === "running";
  return /* @__PURE__ */ jsx(
    "span",
    {
      id: ids.statusBadge,
      class: ["inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", TONE[job.status]],
      hx: live ? poll(projects.status({ id: projectId }), "2s") : void 0,
      children: LABEL[job.status]
    }
  );
}
function ConfirmDelete({ project }) {
  return /* @__PURE__ */ jsxs("dialog", { id: ids.confirmDelete, closedby: "any", "aria-labelledby": ids.confirmDeleteTitle, class: "rounded-card p-6 backdrop:bg-inverse/40", children: [
    /* @__PURE__ */ jsxs("h2", { id: ids.confirmDeleteTitle, class: "text-lg font-semibold", children: [
      "Delete ",
      project.name,
      "?"
    ] }),
    /* @__PURE__ */ jsx("p", { class: "mt-2 text-sm text-text-dim", children: "This removes the project and its entries. It cannot be undone." }),
    /* @__PURE__ */ jsxs("div", { class: "mt-6 flex justify-end gap-3", children: [
      /* @__PURE__ */ jsx("button", { command: "close", commandfor: ids.confirmDelete, class: "rounded-control border border-line px-3 py-2 text-sm cursor-pointer", children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { hx: fire(projects.remove({ id: project.id })), class: "rounded-control bg-danger px-3 py-2 text-sm font-medium text-on-accent cursor-pointer", children: "Delete project" })
    ] })
  ] });
}

// screens/render-all.tsx
var hostile = `<img src=x onerror=alert(1)>`;
var rows = [
  { id: 1, name: "Harbour redesign", client: "Luka Koper", budget: 12e3, website: "https://example.com/harbour" },
  { id: 2, name: hostile, client: `"O'Neil" & Sons`, budget: 800, website: "javascript:alert(1)" }
];
var ctx = { nonce: "dGVzdG5vbmNl" };
var dir = new URL("../out/screens/", import.meta.url);
mkdirSync(dir, { recursive: true });
var put = (name, s) => writeFileSync(new URL(name, dir), s.replace(/></g, ">\n<") + "\n");
put("r1-list.html", render(/* @__PURE__ */ jsx(ProjectListPage, { projects: rows, q: "" }), ctx));
put("r1-list-empty.html", render(/* @__PURE__ */ jsx(ProjectListPage, { projects: [], q: hostile }), ctx));
put("r1-rows.fragment.html", render(/* @__PURE__ */ jsx(ProjectList, { projects: rows, q: "har" })));
put("r2-form.html", render(/* @__PURE__ */ jsx(NewProjectPage, {}), ctx));
put("r2-form-invalid.html", render(/* @__PURE__ */ jsx(NewProjectPage, { values: { name: "", client: hostile, budget: "-5" }, errors: { name: "Enter a name", budget: "Budget cannot be negative" } }), ctx));
put("r2-form-invalid.fragment.html", render(/* @__PURE__ */ jsx(ProjectForm, { values: { name: "" }, errors: { name: "Enter a name" } })));
put("r3-detail-running.html", render(/* @__PURE__ */ jsx(ProjectDetailPage, { project: rows[1], job: { status: "running" } }), ctx));
put("r3-detail-done.html", render(/* @__PURE__ */ jsx(ProjectDetailPage, { project: rows[0], job: { status: "done" } }), ctx));
put("r3-status.fragment.html", render(/* @__PURE__ */ jsx(StatusBadge, { projectId: 1, job: { status: "done" } })));
console.log("root ids:", rootId(ProjectList({ projects: rows, q: "" })), rootId(ProjectForm({})), rootId(StatusBadge({ projectId: 1, job: { status: "running" } })));
