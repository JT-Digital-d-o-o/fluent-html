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
  constructor(key, name2) {
    this.name = name2;
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
var UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function defineRoutes(prefix, defs) {
  const out = {};
  for (const name2 of Object.keys(defs)) {
    const d = defs[name2];
    const full = prefix + (d.path === "/" ? "" : d.path) || "/";
    const parts = full.split(/(:[A-Za-z_]\w*)/);
    const params = d.params ?? {};
    const query = d.query ?? {};
    for (let i = 1; i < parts.length; i += 2) {
      if (!(parts[i].slice(1) in params)) fail(`route ${name2}: path param ${parts[i]} has no entry in params`);
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
          fail(`route ${name2}: param ${key} must be a ${want}, got ${show(v)}`);
        }
        url += encodeURIComponent(String(v)) + parts[i + 1];
      }
      let sep = "?";
      if (args) {
        for (const k in args) {
          if (k in params) continue;
          if (!(k in query)) fail(`route ${name2}: ${show(k)} is neither a path param nor a declared query key`);
          const v = args[k];
          if (v == null || v === "") continue;
          url += sep + encodeURIComponent(k) + "=" + encodeURIComponent(String(v));
          sep = "&";
        }
      }
      return new Route(KEY, kind, method, url, region, invalid);
    };
    fn.def = d;
    out[name2] = fn;
  }
  return out;
}
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
        const name2 = v instanceof Id ? v.name : typeof v === "string" ? v : fail(`<${tag} id> takes an id or a string, got ${show(v)}`);
        id = name2;
        out += ' id="' + esc(name2) + '"';
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
function render(view, ctx = {}) {
  if (!(view instanceof Html)) fail(`render() takes JSX, got ${show(view)}`);
  const s = view.s;
  if (!nonceSlotUsed || !s.includes(NONCE_SLOT)) return s;
  const nonce = ctx.nonce;
  if (nonce === void 0 || !/^[A-Za-z0-9+\/_-]+=*$/.test(nonce)) return fail("this view has a <script> or <style>: render(view, { nonce }) needs the response's CSP nonce");
  return s.replaceAll(NONCE_SLOT, nonce);
}

// bench/page.tsx
var name = "sealed-sinks";
var cart = defineRoutes("/cart", {
  add: { method: "post", path: "/add/:id", params: { id: "number" }, render: "none" }
});
var NAV = ["Home", "About", "Products", "Contact"];
var LEGAL = ["Privacy", "Terms", "Support"];
var range = (n) => Array.from({ length: n }, (_, i) => i);
function Product({ i }) {
  return /* @__PURE__ */ jsxs("article", { class: "border rounded-lg overflow-hidden", children: [
    /* @__PURE__ */ jsx("img", { class: "w-full h-48 object-cover", src: `/img/product-${i}.jpg`, alt: `Product ${i}` }),
    /* @__PURE__ */ jsxs("div", { class: "p-4", children: [
      /* @__PURE__ */ jsxs("h2", { class: "text-lg font-bold", children: [
        "Product ",
        i
      ] }),
      /* @__PURE__ */ jsxs("p", { class: "text-green-600 font-bold", children: [
        "$",
        (i + 1) * 9.99
      ] }),
      /* @__PURE__ */ jsx("p", { class: "text-gray-500 text-sm", children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }),
      /* @__PURE__ */ jsx("button", { class: "px-4 py-2 bg-blue-500 text-white rounded", hx: fire(cart.add({ id: i })), children: "Add to Cart" })
    ] })
  ] });
}
function Review({ i }) {
  return /* @__PURE__ */ jsxs("tr", { children: [
    /* @__PURE__ */ jsxs("td", { class: "p-2 border", children: [
      "Customer ",
      i
    ] }),
    /* @__PURE__ */ jsx("td", { class: "p-2 border", children: "\u2605".repeat(3 + i % 3) }),
    /* @__PURE__ */ jsx("td", { class: "p-2 border", children: "Great product, highly recommended!" })
  ] });
}
function build() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("header", { children: /* @__PURE__ */ jsx("nav", { class: "p-4 bg-white shadow-md", children: /* @__PURE__ */ jsx("ul", { class: "flex gap-4", children: NAV.map((label) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { class: "nav-link px-4 py-2", children: label }) })) }) }) }),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsxs("section", { class: "p-8", children: [
        /* @__PURE__ */ jsx("h1", { class: "text-3xl font-bold mb-4", children: "Welcome to Our Store" }),
        /* @__PURE__ */ jsx("p", { class: "text-gray-600", children: "Browse our collection of fine products." })
      ] }),
      /* @__PURE__ */ jsxs("section", { class: "p-8", children: [
        /* @__PURE__ */ jsx("h2", { class: "text-2xl font-bold mb-6", children: "Featured Products" }),
        /* @__PURE__ */ jsx("div", { class: "grid grid-cols-3 gap-6", children: range(12).map((i) => /* @__PURE__ */ jsx(Product, { i })) })
      ] }),
      /* @__PURE__ */ jsxs("section", { class: "p-8", children: [
        /* @__PURE__ */ jsx("h2", { class: "text-2xl font-bold mb-4", children: "Customer Reviews" }),
        /* @__PURE__ */ jsxs("table", { class: "w-full border", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: "Name" }),
            /* @__PURE__ */ jsx("th", { children: "Rating" }),
            /* @__PURE__ */ jsx("th", { children: "Comment" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: range(10).map((i) => /* @__PURE__ */ jsx(Review, { i })) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("footer", { class: "bg-gray-800", children: /* @__PURE__ */ jsxs("div", { class: "flex justify-between items-center p-8", children: [
      /* @__PURE__ */ jsx("p", { class: "text-gray-400", children: "\xA9 2026 Our Store. All rights reserved." }),
      /* @__PURE__ */ jsx("ul", { class: "flex gap-4", children: LEGAL.map((label) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { class: "text-gray-400", children: label }) })) })
    ] }) })
  ] });
}
var render2 = (view) => render(view);
export {
  build,
  name,
  render2 as render
};
