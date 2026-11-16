// rtsx/core.ts
var ESC_TEST = /[&<>"']/;
var ESC_ALL = /[&<>"']/g;
var ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
var escOne = (c) => ESC_MAP[c];
var esc = (s) => ESC_TEST.test(s) ? s.replace(ESC_ALL, escOne) : s;
var Html = class {
  constructor(html, kind = 0 /* Html */, rootId2) {
    this.html = html;
    this.kind = kind;
    this.rootId = rootId2;
  }
  html;
  kind;
  rootId;
  toString() {
    return this.html;
  }
};
var Id = class {
  constructor(name2) {
    this.name = name2;
  }
  name;
  toString() {
    return this.name;
  }
};
var Route = class {
  constructor(url2, method, render3, invalid, poll) {
    this.url = url2;
    this.method = method;
    this.render = render3;
    this.invalid = invalid;
    this.poll = poll;
  }
  url;
  method;
  render;
  invalid;
  poll;
  toString() {
    return this.url;
  }
};
function defineRoutes(prefix, defs) {
  const out = {};
  for (const key in defs) {
    const def = defs[key];
    const full = (prefix + def.path).replace(/\/+$/, "") || "/";
    const names = [...full.matchAll(/:([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]);
    out[key] = (args = {}) => {
      let url2 = full;
      for (const n of names) {
        const v = args[n];
        if (v === void 0 || v === null) throw new Error(`rtsx: route ${key} needs the param "${n}"`);
        url2 = url2.replace(":" + n, encodeURIComponent(String(v)));
      }
      let qs = "";
      for (const k in args) {
        const v = args[k];
        if (names.includes(k) || v === void 0 || v === null || v === "") continue;
        qs += (qs ? "&" : "?") + encodeURIComponent(k) + "=" + encodeURIComponent(String(v));
      }
      return new Route(url2 + qs, def.method ?? "get", def.render, def.invalid, def.poll);
    };
  }
  return out;
}
function localUrl(path) {
  if (!/^\/(?![/\\])[^\s\\]*$/.test(path)) throw new Error(`rtsx: localUrl() takes a same-origin path starting with "/", got ${JSON.stringify(path.slice(0, 40))}`);
  return new Route(path, "get", void 0);
}
var Url = class {
  constructor(href) {
    this.href = href;
  }
  href;
};
var url = (href) => new Url(href);
var mainContent = new Id("main-content");
var JSON_UNSAFE = /[<>&\u2028\u2029]/g;
var jsonEsc = (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
var safeJson = (v) => JSON.stringify(v).replace(JSON_UNSAFE, jsonEsc);
var json = (data) => new Html(safeJson(data), 1 /* Script */);
function js(parts, ...holes) {
  let s = parts[0];
  for (let i = 0; i < holes.length; i++) s += safeJson(holes[i]) + parts[i + 1];
  if (/<\/script|<!--/i.test(s)) throw new Error("rtsx: js`` source must not contain </script or <!--");
  return new Html(s, 1 /* Script */);
}
var CSS_VALUE = /^[#%.,/()\w\s+-]*$/;
var CSS_BLOCKED = /url\s*\(|expression\s*\(|\/\*|@import/i;
function cssValue(v) {
  const s = String(v);
  if (!CSS_VALUE.test(s) || CSS_BLOCKED.test(s)) throw new Error(`rtsx: ${JSON.stringify(s.slice(0, 60))} is not a plain CSS value (no ; { } " ' \\ url( or comments)`);
  return s;
}
function css(parts, ...holes) {
  let s = parts[0];
  for (let i = 0; i < holes.length; i++) s += cssValue(holes[i]) + parts[i + 1];
  if (/<\/style/i.test(s)) throw new Error("rtsx: css`` source must not contain </style");
  return new Html(s, 2 /* Css */);
}

// rtsx/index.ts
var render = (view) => view.html;

// rtsx/jsx-runtime.ts
var VOID = /* @__PURE__ */ new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
var TAG_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
var tagOk = /* @__PURE__ */ new Map();
var URL_ATTRS = ["href", "src", "action", "formaction", "poster", "cite", "data", "ping", "background", "manifest", "xlink:href"];
var HX_VERBS = ["hx-get", "hx-post", "hx-put", "hx-patch", "hx-delete"];
var HX_PLAIN = ["hx-swap", "hx-push-url", "hx-replace-url", "hx-include", "hx-select", "hx-indicator", "hx-disable", "hx-sync", "hx-boost", "hx-encoding", "hx-validate", "hx-preserve", "hx-ignore"];
var LEAKS = {
  className: 'use class="\u2026"',
  htmlFor: 'use for="\u2026"',
  dangerouslySetInnerHTML: "pass unsafeHtml(trusted) as a child"
};
var kinds = /* @__PURE__ */ new Map();
for (const n of URL_ATTRS) kinds.set(n, 1 /* Url */);
for (const n of HX_VERBS) kinds.set(n, 2 /* Verb */);
for (const n of HX_PLAIN) kinds.set(n, 0 /* Plain */);
kinds.set("hx-target", 3 /* Target */);
kinds.set("hx-vals", 4 /* Json */);
kinds.set("hx-headers", 4 /* Json */);
kinds.set("hx-config", 4 /* Json */);
kinds.set("hx-confirm", 5 /* Confirm */);
kinds.set("hx-trigger", 6 /* Trigger */);
kinds.set("style", 7 /* Style */);
kinds.set("srcdoc", 8 /* Srcdoc */);
kinds.set("data", 1 /* Url */);
kinds.set("dataset", 9 /* Data */);
var NAME_RE = /^[A-Za-z][A-Za-z0-9]*(?:[-:.][A-Za-z0-9]+)*$/;
function classify(name2) {
  const mod = /^(hx-[a-z-]+):(?:inherited|append)$/.exec(name2);
  if (mod !== null) {
    const base = kinds.get(mod[1]);
    if (base === void 0 || base === 2 /* Verb */) throw new Error(`rtsx: "${name2}" is not an inheritable htmx attribute`);
    return base;
  }
  if (!NAME_RE.test(name2)) throw new Error(`rtsx: ${JSON.stringify(name2.slice(0, 40))} is not an attribute name`);
  if (name2 in LEAKS) throw new Error(`rtsx: ${name2} is not an attribute: ${LEAKS[name2]}`);
  const lower = name2.toLowerCase();
  if (lower.startsWith("on")) throw new Error(`rtsx: inline handler "${name2}" is not allowed: use command/commandfor, popovertarget or an hx-* attribute`);
  if (/^(data-)?hx-?on/.test(lower) || lower.startsWith("data-hx")) throw new Error(`rtsx: "${name2}" would run script through htmx and is not allowed`);
  if (lower.startsWith("hx-") && !lower.startsWith("hx-status:")) {
    throw new Error(`rtsx: unknown htmx attribute "${name2}". Known: ${[...HX_VERBS, "hx-target", "hx-trigger", "hx-confirm", "hx-vals", "hx-headers", ...HX_PLAIN].join(", ")}`);
  }
  return 0 /* Plain */;
}
var URL_STRIP = /^[\u0000- ]+|[\t\n\r]/g;
var URL_SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;
var URL_OK = /* @__PURE__ */ new Set(["http", "https", "mailto", "tel", "sms"]);
var DATA_OK = /^data:(?:image\/(?:png|jpeg|gif|webp|avif)|audio\/|video\/|font\/)/i;
function safeUrl(v) {
  const m = URL_SCHEME.exec(v.replace(URL_STRIP, ""));
  if (m === null || URL_OK.has(m[1].toLowerCase())) return v;
  if (m[1].toLowerCase() === "data" && DATA_OK.test(v.replace(URL_STRIP, ""))) return v;
  return "about:invalid#blocked";
}
function cx(v) {
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
function styleText(v) {
  if (typeof v !== "object" || v === null) throw new Error("rtsx: style takes an object, e.g. style={{ width: `${pct}%` }}");
  let s = "";
  for (const k in v) {
    const val = v[k];
    if (val == null || val === false) continue;
    if (!/^(?:--)?[a-zA-Z][a-zA-Z0-9-]*$/.test(k)) throw new Error(`rtsx: ${JSON.stringify(k)} is not a CSS property name`);
    const prop = k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
    s += (s ? "; " : "") + prop + ": " + cssValue(val);
  }
  return s;
}
function text(name2, v) {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v instanceof Id) return v.name;
  throw new Error(`rtsx: ${name2} takes a string, a number or an id, got ${v instanceof Route ? "a route" : typeof v}`);
}
function attr(name2, v, props) {
  let kind = kinds.get(name2);
  if (kind === void 0) kinds.set(name2, kind = classify(name2));
  switch (kind) {
    case 0 /* Plain */:
      if (v === true) return name2.charCodeAt(4) === 45 && name2.startsWith("aria") ? " " + name2 + '="true"' : " " + name2;
      return " " + name2 + '="' + esc(text(name2, v)) + '"';
    case 1 /* Url */:
      if (v instanceof Route) {
        const nav = name2 === "href" && props["target"] === void 0 && props["download"] === void 0 && !hasVerb(props);
        return " " + name2 + '="' + esc(v.url) + '"' + (nav ? ' hx-get="' + esc(v.url) + '"' + protocol(v, props) : "");
      }
      return " " + name2 + '="' + esc(safeUrl(v instanceof Url ? v.href : text(name2, v))) + '"';
    case 2 /* Verb */: {
      if (!(v instanceof Route)) throw new Error(`rtsx: ${name2} takes a route (routes.x(), or localUrl(path) for a path from data), not a ${typeof v}`);
      if (name2.slice(3) !== v.method) throw new Error(`rtsx: ${name2} got a ${v.method} route`);
      return " " + name2 + '="' + esc(v.url) + '"' + protocol(v, props);
    }
    case 3 /* Target */:
      return " " + name2 + '="' + (v instanceof Id ? "#" + v.name : esc(text(name2, v))) + '"';
    case 4 /* Json */:
      if (typeof v !== "object" || v === null) throw new Error(`rtsx: ${name2} takes an object, not a string`);
      return " " + name2 + '="' + esc(JSON.stringify(v)) + '"';
    case 5 /* Confirm */: {
      const s = text(name2, v);
      if (/^\s*(?:js|javascript):/i.test(s)) throw new Error("rtsx: hx-confirm text must not start with js: or javascript:");
      return " " + name2 + '="' + esc(s) + '"';
    }
    case 6 /* Trigger */: {
      const s = text(name2, v);
      if (s.includes("[")) throw new Error("rtsx: hx-trigger filters ([expr]) run script and are not allowed");
      return " " + name2 + '="' + esc(s) + '"';
    }
    case 7 /* Style */: {
      const s = styleText(v);
      return s ? ' style="' + esc(s) + '"' : "";
    }
    case 8 /* Srcdoc */: {
      const sandbox = props["sandbox"];
      if (typeof sandbox === "string" && /allow-scripts/.test(sandbox) && /allow-same-origin/.test(sandbox)) throw new Error("rtsx: srcdoc with allow-scripts and allow-same-origin is the page's own origin");
      return ' srcdoc="' + esc(text(name2, v)) + '"' + (sandbox === void 0 ? ' sandbox=""' : "");
    }
    case 9 /* Data */: {
      let s = "";
      for (const k in v) {
        const val = v[k];
        if (val == null || val === false) continue;
        if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(k) || /^hx(?:-|$)/.test(k)) throw new Error(`rtsx: ${JSON.stringify(k.slice(0, 40))} is not a data-* key (kebab-case, not hx-*)`);
        s += " data-" + k + '="' + esc(text("data-" + k, val)) + '"';
      }
      return s;
    }
  }
}
function protocol(r, props) {
  const to = r.render;
  let s = "";
  if (r.poll !== void 0) return ' hx-trigger="every ' + r.poll + '" hx-target="this" hx-swap="outerHTML"';
  if (to === "none") {
    if (props["hx-swap"] === void 0) s += ' hx-swap="none"';
  } else {
    if (props["hx-target"] === void 0) s += ' hx-target="#' + (to === void 0 ? "main-content" : to.name) + '"';
    if (props["hx-swap"] === void 0) s += ' hx-swap="outerMorph"';
    if (to === void 0 && r.method === "get" && props["hx-push-url"] === void 0) s += ' hx-push-url="true"';
  }
  if (r.invalid !== void 0) s += ' hx-status:422="target:#' + r.invalid.name + ' swap:outerMorph push:false"';
  return s;
}
function kids(c) {
  if (typeof c === "string") return esc(c);
  if (c instanceof Html) {
    if (c.kind === 0 /* Html */) return c.html;
    if (c.kind === 3 /* Document */) throw new Error("rtsx: a document (<html>) cannot be a child");
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
function rawKids(tag, want, c) {
  if (c == null) return "";
  if (c instanceof Html && c.kind === want) return c.html;
  throw new Error(tag === "script" ? "rtsx: <script> content must come from json(data) or js`\u2026`" : "rtsx: <style> content must come from css`\u2026`");
}
function jsx(type, props) {
  if (typeof type === "function") {
    const r = type(props);
    return r instanceof Html ? r : new Html(kids(r));
  }
  let ok = tagOk.get(type);
  if (ok === void 0) tagOk.set(type, ok = TAG_RE.test(type));
  if (!ok) throw new Error(`rtsx: ${JSON.stringify(String(type).slice(0, 40))} is not an element name`);
  let out = "<" + type;
  for (const k in props) {
    if (k === "children") continue;
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === "class") {
      const c2 = typeof v === "string" ? v : cx(v);
      if (c2) out += ' class="' + esc(c2) + '"';
    } else if (k === "value" && (type === "textarea" || type === "select")) continue;
    else out += attr(k, v, props);
  }
  if (type === "button" && props["type"] === void 0) {
    out += props["command"] !== void 0 || props["popovertarget"] !== void 0 || hasVerb(props) ? ' type="button"' : ' type="submit"';
  }
  if (VOID.has(type)) {
    if (props["children"] != null) throw new Error(`rtsx: <${type}> takes no children`);
    return new Html(out + ">", 0 /* Html */, rootId(props));
  }
  const c = props["children"];
  let inner;
  if (type === "script") inner = rawKids(type, 1 /* Script */, c);
  else if (type === "style") inner = rawKids(type, 2 /* Css */, c);
  else {
    if (type === "textarea") {
      inner = props["value"] != null ? esc(text("value", props["value"])) : kids(c);
      if (inner.charCodeAt(0) === 10) inner = "\n" + inner;
    } else {
      inner = kids(c);
      if (type === "select" && props["value"] != null) inner = inner.replace('value="' + esc(text("value", props["value"])) + '"', "$& selected");
    }
  }
  if (type === "html") return new Html("<!DOCTYPE html>" + out + ">" + inner + "</html>", 3 /* Document */);
  return new Html(out + ">" + inner + "</" + type + ">", 0 /* Html */, rootId(props));
}
function hasVerb(p) {
  return p["hx-get"] !== void 0 || p["hx-post"] !== void 0 || p["hx-put"] !== void 0 || p["hx-patch"] !== void 0 || p["hx-delete"] !== void 0;
}
function rootId(p) {
  const id = p["id"];
  return id === void 0 ? void 0 : id instanceof Id ? id.name : String(id);
}

// xss/adapter.tsx
var name = "route-typed-tsx";
var items = defineRoutes("/items", { create: { method: "post", path: "/" }, remove: { method: "post", path: "/:id" } });
function render2(ctx, p) {
  switch (ctx) {
    case "text":
      return render(/* @__PURE__ */ jsx("div", { children: p }));
    case "rcdata-textarea":
      return render(/* @__PURE__ */ jsx("textarea", { children: p }));
    case "rcdata-title":
      return render(/* @__PURE__ */ jsx("title", { children: p }));
    case "attr-title":
      return render(/* @__PURE__ */ jsx("div", { title: p }));
    case "attr-data":
      return render(/* @__PURE__ */ jsx("div", { "data-note": p }));
    case "attr-id":
      return render(/* @__PURE__ */ jsx("div", { id: p }));
    case "attr-class":
      return render(/* @__PURE__ */ jsx("div", { class: p }));
    case "attr-input-value":
      return render(/* @__PURE__ */ jsx("input", { value: p }));
    case "attr-name":
      return render(/* @__PURE__ */ jsx("div", { dataset: { [p.key]: p.value } }));
    case "url-href":
      return render(/* @__PURE__ */ jsx("a", { href: url(p), children: "link" }));
    case "url-img-src":
      return render(/* @__PURE__ */ jsx("img", { src: p, alt: "x" }));
    case "url-iframe-src":
      return render(/* @__PURE__ */ jsx("iframe", { src: p }));
    case "url-form-action":
      return render(/* @__PURE__ */ jsx("form", { action: p, method: "post" }));
    case "url-formaction":
      return render(/* @__PURE__ */ jsx("button", { type: "submit", formaction: p, children: "Go" }));
    case "style-value":
      return render(/* @__PURE__ */ jsx("div", { style: { color: p } }));
    case "style-element":
      return render(/* @__PURE__ */ jsx("style", { children: css`.x{color: ${p}}` }));
    case "json-script":
      return render(/* @__PURE__ */ jsx("script", { type: "application/json", children: json({ v: p }) }));
    case "js-script-var":
      return render(/* @__PURE__ */ jsx("script", { children: js`window.__DATA = ${{ v: p }}` }));
    case "htmx-get":
      return render(/* @__PURE__ */ jsx("button", { "hx-get": localUrl(p), children: "Load" }));
    case "htmx-confirm":
      return render(/* @__PURE__ */ jsx("button", { "hx-post": items.remove({ id: 1 }), "hx-confirm": p, children: "Delete" }));
    case "htmx-vals":
      return render(/* @__PURE__ */ jsx("button", { "hx-post": items.create(), "hx-vals": { q: p }, children: "Save" }));
    case "htmx-headers":
      return render(/* @__PURE__ */ jsx("button", { "hx-post": items.create(), "hx-headers": { "X-Note": p }, children: "Save" }));
    case "iframe-srcdoc":
      return render(/* @__PURE__ */ jsx("iframe", { srcdoc: p }));
    default:
      return { unsupported: `no mapping for ${ctx}` };
  }
}
export {
  name,
  render2 as render
};
