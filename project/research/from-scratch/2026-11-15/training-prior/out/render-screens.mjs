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
  constructor(name) {
    this.name = name;
  }
  name;
  toString() {
    return this.name;
  }
};
var ID_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
function defineIds(names) {
  const out2 = {};
  for (const n of names) {
    if (!ID_RE.test(n)) throw new Error(`rtsx: id "${n}" must be kebab-case`);
    out2[n.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())] = new Id(n);
  }
  return out2;
}
var Route = class {
  constructor(url2, method, render2, invalid, poll) {
    this.url = url2;
    this.method = method;
    this.render = render2;
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
  const out2 = {};
  for (const key in defs) {
    const def = defs[key];
    const full = (prefix + def.path).replace(/\/+$/, "") || "/";
    const names = [...full.matchAll(/:([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]);
    out2[key] = (args = {}) => {
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
  return out2;
}
var Url = class {
  constructor(href) {
    this.href = href;
  }
  href;
};
var mainContent = new Id("main-content");
var CSS_VALUE = /^[#%.,/()\w\s+-]*$/;
var CSS_BLOCKED = /url\s*\(|expression\s*\(|\/\*|@import/i;
function cssValue(v) {
  const s = String(v);
  if (!CSS_VALUE.test(s) || CSS_BLOCKED.test(s)) throw new Error(`rtsx: ${JSON.stringify(s.slice(0, 60))} is not a plain CSS value (no ; { } " ' \\ url( or comments)`);
  return s;
}
function match(value, a, b) {
  if (b === void 0) return a[value]();
  return b[value[a]](value);
}

// rtsx/form.ts
function form(route, state = {}) {
  const values = state.values ?? {};
  const errors = state.errors ?? {};
  const value = (n) => values[n] == null ? "" : String(values[n]);
  const attrs = { ["hx-" + route.method]: route };
  if (route.invalid !== void 0) attrs["id"] = route.invalid;
  return {
    form: attrs,
    value,
    id: (n) => n,
    error: (n) => errors[n],
    errorId: (n) => n + "-error",
    field: (n) => errors[n] === void 0 ? { name: n, id: n, value: value(n) } : { name: n, id: n, value: value(n), "aria-invalid": true, "aria-describedby": n + "-error" },
    checked: (n, v) => v === void 0 ? { name: n, id: n, checked: Boolean(values[n]) } : { name: n, id: n + "-" + v, value: v, checked: values[n] === v }
  };
}

// rtsx/index.ts
var render = (view) => view.html;

// tools/render-screens.tsx
import { writeFileSync, mkdirSync } from "node:fs";

// screens/schema.ts
var Type = {
  String: (_o) => ({}),
  Optional: (_s) => ({}),
  Union: (_s) => ({}),
  Literal: (_v) => ({}),
  Object: (_p) => ({})
};

// screens/projects.schema.ts
var STATUSES = ["active", "paused", "archived"];
var ListQuery = Type.Object({ q: Type.String() });
var CreateProject = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 80 }),
  client: Type.String({ minLength: 1 }),
  status: Type.Union([Type.Literal("active"), Type.Literal("paused"), Type.Literal("archived")]),
  notes: Type.String({ maxLength: 2e3 })
});

// screens/projects.routes.ts
var ids = defineIds(["project-list", "project-form", "delete-dialog", "delete-title", "job-status"]);
var projects = defineRoutes("/projects", {
  list: { path: "/", query: ListQuery },
  results: { path: "/results", query: ListQuery, render: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id" },
  status: { path: "/:id/status", render: ids.jobStatus, poll: "2s" },
  remove: { method: "delete", path: "/:id" }
});

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
function classify(name) {
  const mod = /^(hx-[a-z-]+):(?:inherited|append)$/.exec(name);
  if (mod !== null) {
    const base = kinds.get(mod[1]);
    if (base === void 0 || base === 2 /* Verb */) throw new Error(`rtsx: "${name}" is not an inheritable htmx attribute`);
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
function text(name, v) {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (v instanceof Id) return v.name;
  throw new Error(`rtsx: ${name} takes a string, a number or an id, got ${v instanceof Route ? "a route" : typeof v}`);
}
function attr(name, v, props) {
  let kind = kinds.get(name);
  if (kind === void 0) kinds.set(name, kind = classify(name));
  switch (kind) {
    case 0 /* Plain */:
      if (v === true) return name.charCodeAt(4) === 45 && name.startsWith("aria") ? " " + name + '="true"' : " " + name;
      return " " + name + '="' + esc(text(name, v)) + '"';
    case 1 /* Url */:
      if (v instanceof Route) {
        const nav = name === "href" && props["target"] === void 0 && props["download"] === void 0 && !hasVerb(props);
        return " " + name + '="' + esc(v.url) + '"' + (nav ? ' hx-get="' + esc(v.url) + '"' + protocol(v, props) : "");
      }
      return " " + name + '="' + esc(safeUrl(v instanceof Url ? v.href : text(name, v))) + '"';
    case 2 /* Verb */: {
      if (!(v instanceof Route)) throw new Error(`rtsx: ${name} takes a route (routes.x(), or localUrl(path) for a path from data), not a ${typeof v}`);
      if (name.slice(3) !== v.method) throw new Error(`rtsx: ${name} got a ${v.method} route`);
      return " " + name + '="' + esc(v.url) + '"' + protocol(v, props);
    }
    case 3 /* Target */:
      return " " + name + '="' + (v instanceof Id ? "#" + v.name : esc(text(name, v))) + '"';
    case 4 /* Json */:
      if (typeof v !== "object" || v === null) throw new Error(`rtsx: ${name} takes an object, not a string`);
      return " " + name + '="' + esc(JSON.stringify(v)) + '"';
    case 5 /* Confirm */: {
      const s = text(name, v);
      if (/^\s*(?:js|javascript):/i.test(s)) throw new Error("rtsx: hx-confirm text must not start with js: or javascript:");
      return " " + name + '="' + esc(s) + '"';
    }
    case 6 /* Trigger */: {
      const s = text(name, v);
      if (s.includes("[")) throw new Error("rtsx: hx-trigger filters ([expr]) run script and are not allowed");
      return " " + name + '="' + esc(s) + '"';
    }
    case 7 /* Style */: {
      const s = styleText(v);
      return s ? ' style="' + esc(s) + '"' : "";
    }
    case 8 /* Srcdoc */: {
      const sandbox = props["sandbox"];
      if (typeof sandbox === "string" && /allow-scripts/.test(sandbox) && /allow-same-origin/.test(sandbox)) throw new Error("rtsx: srcdoc with allow-scripts and allow-same-origin is the page's own origin");
      return ' srcdoc="' + esc(text(name, v)) + '"' + (sandbox === void 0 ? ' sandbox=""' : "");
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
  let out2 = "<" + type;
  for (const k in props) {
    if (k === "children") continue;
    const v = props[k];
    if (v == null || v === false) continue;
    if (k === "class") {
      const c2 = typeof v === "string" ? v : cx(v);
      if (c2) out2 += ' class="' + esc(c2) + '"';
    } else if (k === "value" && (type === "textarea" || type === "select")) continue;
    else out2 += attr(k, v, props);
  }
  if (type === "button" && props["type"] === void 0) {
    out2 += props["command"] !== void 0 || props["popovertarget"] !== void 0 || hasVerb(props) ? ' type="button"' : ' type="submit"';
  }
  if (VOID.has(type)) {
    if (props["children"] != null) throw new Error(`rtsx: <${type}> takes no children`);
    return new Html(out2 + ">", 0 /* Html */, rootId(props));
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
  if (type === "html") return new Html("<!DOCTYPE html>" + out2 + ">" + inner + "</html>", 3 /* Document */);
  return new Html(out2 + ">" + inner + "</" + type + ">", 0 /* Html */, rootId(props));
}
function hasVerb(p) {
  return p["hx-get"] !== void 0 || p["hx-post"] !== void 0 || p["hx-put"] !== void 0 || p["hx-patch"] !== void 0 || p["hx-delete"] !== void 0;
}
function rootId(p) {
  const id = p["id"];
  return id === void 0 ? void 0 : id instanceof Id ? id.name : String(id);
}
var jsxs = jsx;

// screens/layout.tsx
function Layout({ title, children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charset: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("title", { children: title }),
      /* @__PURE__ */ jsx("link", { rel: "stylesheet", href: "/css/app.css" }),
      /* @__PURE__ */ jsx("script", { src: "/js/htmx.min.js", defer: true })
    ] }),
    /* @__PURE__ */ jsx("body", { class: "bg-surface text-text", children: /* @__PURE__ */ jsx("main", { id: mainContent, class: "mx-auto max-w-3xl p-6", children }) })
  ] });
}

// screens/ui.tsx
var tone = {
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  archived: "bg-surface-2 text-text-dim"
};
function StatusBadge({ status }) {
  return /* @__PURE__ */ jsx("span", { class: ["rounded-full px-2 py-1 text-xs font-medium", tone[status]], children: status });
}
function Field({ f, name, label, children }) {
  const error = f.error(name);
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsx("label", { for: f.id(name), class: "text-sm font-medium text-text", children: label }),
    children,
    error && /* @__PURE__ */ jsx("p", { id: f.errorId(name), class: "text-sm text-danger", children: error })
  ] });
}
var control = "rounded-control border border-line bg-surface px-3 py-2 text-text aria-invalid:border-danger";
var primary = "rounded-control bg-primary px-4 py-2 font-medium text-on-accent hover:bg-primary-700";
var danger = "rounded-control bg-danger px-4 py-2 font-medium text-on-accent hover:bg-danger/90";
var quiet = "rounded-control border border-line px-4 py-2 text-text hover:bg-surface-2";

// screens/projects.list.view.tsx
function ProjectsPage({ rows: rows2, q }) {
  return /* @__PURE__ */ jsxs(Layout, { title: "Projects", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("h1", { class: "text-2xl font-semibold text-text", children: "Projects" }),
      /* @__PURE__ */ jsx("a", { href: projects.new(), class: primary, children: "New project" })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "search",
        name: "q",
        value: q,
        placeholder: "Search projects",
        "aria-label": "Search projects",
        "hx-get": projects.results(),
        "hx-trigger": "input changed delay:300ms",
        "hx-sync": "this:replace",
        class: ["mt-6 w-full", control]
      }
    ),
    /* @__PURE__ */ jsx(ProjectList, { rows: rows2, q })
  ] });
}
function ProjectList({ rows: rows2, q }) {
  return /* @__PURE__ */ jsx("div", { id: ids.projectList, class: "mt-4", children: rows2.length === 0 ? /* @__PURE__ */ jsx("p", { class: "py-12 text-center text-text-dim", children: q ? `No projects match "${q}".` : "No projects yet. Create the first one." }) : /* @__PURE__ */ jsx("ul", { class: "divide-y divide-line", children: rows2.map((p) => /* @__PURE__ */ jsx("li", { id: `project-${p.id}`, children: /* @__PURE__ */ jsxs("a", { href: projects.detail({ id: p.id }), class: "flex items-center justify-between gap-4 py-3 hover:bg-surface-2", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      /* @__PURE__ */ jsx("span", { class: "block font-medium text-text", children: p.name }),
      /* @__PURE__ */ jsx("span", { class: "block text-sm text-text-dim", children: p.client })
    ] }),
    /* @__PURE__ */ jsx(StatusBadge, { status: p.status })
  ] }) })) }) });
}

// screens/projects.new.view.tsx
function NewProjectPage({ state }) {
  return /* @__PURE__ */ jsxs(Layout, { title: "New project", children: [
    /* @__PURE__ */ jsx("h1", { class: "text-2xl font-semibold text-text", children: "New project" }),
    /* @__PURE__ */ jsx(ProjectForm, { state })
  ] });
}
function ProjectForm({ state }) {
  const f = form(projects.create(), state);
  return /* @__PURE__ */ jsxs("form", { ...f.form, class: "mt-6 flex max-w-lg flex-col gap-4", children: [
    /* @__PURE__ */ jsx(Field, { f, name: "name", label: "Name", children: /* @__PURE__ */ jsx("input", { ...f.field("name"), type: "text", required: true, maxlength: 80, class: control }) }),
    /* @__PURE__ */ jsx(Field, { f, name: "client", label: "Client", children: /* @__PURE__ */ jsx("input", { ...f.field("client"), type: "text", required: true, class: control }) }),
    /* @__PURE__ */ jsx(Field, { f, name: "status", label: "Status", children: /* @__PURE__ */ jsx("select", { ...f.field("status"), class: control, children: STATUSES.map((s) => /* @__PURE__ */ jsx("option", { value: s, children: s })) }) }),
    /* @__PURE__ */ jsx(Field, { f, name: "notes", label: "Notes", children: /* @__PURE__ */ jsx("textarea", { ...f.field("notes"), rows: 4, class: control }) }),
    /* @__PURE__ */ jsxs("div", { class: "flex justify-end gap-3", children: [
      /* @__PURE__ */ jsx("a", { href: projects.list(), class: quiet, children: "Cancel" }),
      /* @__PURE__ */ jsx("button", { type: "submit", class: primary, children: "Create project" })
    ] })
  ] });
}

// screens/projects.detail.view.tsx
function ProjectDetailPage({ project, job }) {
  return /* @__PURE__ */ jsxs(Layout, { title: project.name, children: [
    /* @__PURE__ */ jsxs("nav", { "aria-label": "Breadcrumb", class: "text-sm text-text-dim", children: [
      /* @__PURE__ */ jsx("a", { href: projects.list(), class: "hover:underline", children: "Projects" }),
      " / ",
      project.name
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "mt-4 flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("h1", { class: "text-2xl font-semibold text-text", children: project.name }),
      /* @__PURE__ */ jsx(StatusBadge, { status: project.status })
    ] }),
    /* @__PURE__ */ jsx("p", { class: "mt-1 text-text-dim", children: project.client }),
    /* @__PURE__ */ jsxs("p", { class: "mt-6 flex items-center gap-3 text-sm text-text", children: [
      "Export",
      /* @__PURE__ */ jsx(JobStatus, { projectId: project.id, job })
    ] }),
    /* @__PURE__ */ jsx("button", { command: "show-modal", commandfor: ids.deleteDialog, class: "mt-8 rounded-control border border-danger px-4 py-2 text-danger hover:bg-danger/10", children: "Delete project" }),
    /* @__PURE__ */ jsxs("dialog", { id: ids.deleteDialog, closedby: "any", "aria-labelledby": ids.deleteTitle, class: "rounded-card bg-surface p-6 shadow-lg backdrop:bg-black/40", children: [
      /* @__PURE__ */ jsxs("h2", { id: ids.deleteTitle, class: "text-lg font-semibold text-text", children: [
        "Delete ",
        project.name,
        "?"
      ] }),
      /* @__PURE__ */ jsx("p", { class: "mt-2 text-text-dim", children: "This removes the project and its exports. It cannot be undone." }),
      /* @__PURE__ */ jsxs("div", { class: "mt-6 flex justify-end gap-3", children: [
        /* @__PURE__ */ jsx("button", { command: "close", commandfor: ids.deleteDialog, class: quiet, children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { "hx-delete": projects.remove({ id: project.id }), class: danger, children: "Delete" })
      ] })
    ] })
  ] });
}
var tone2 = {
  queued: "bg-surface-2 text-text-dim",
  running: "bg-primary/10 text-primary",
  done: "bg-success/10 text-success",
  failed: "bg-danger/10 text-danger"
};
function JobStatus({ projectId, job }) {
  const running = job.state === "queued" || job.state === "running";
  return /* @__PURE__ */ jsx("span", { id: ids.jobStatus, "hx-get": running && projects.status({ id: projectId }), class: ["rounded-full px-3 py-1 text-sm font-medium", tone2[job.state]], children: match(job, "state", {
    queued: () => "Queued",
    running: (j) => `Running, ${j.percent}%`,
    done: (j) => /* @__PURE__ */ jsx("time", { datetime: j.finishedAt, children: "Done" }),
    failed: (j) => `Failed: ${j.reason}`
  }) });
}

// tools/render-screens.tsx
var rows = [
  { id: 1, name: "Atlas <relaunch>", client: "Northwind & Co", status: "active" },
  { id: 2, name: "Billing cleanup", client: "Contoso", status: "paused" },
  { id: 3, name: "Old intranet", client: "Fabrikam", status: "archived" }
];
var out = process.argv[2] ?? "out";
mkdirSync(out, { recursive: true });
var pages = {
  "r1-list": /* @__PURE__ */ jsx(ProjectsPage, { rows, q: "" }),
  "r1-empty": /* @__PURE__ */ jsx(ProjectsPage, { rows: [], q: "zzz" }),
  "r1-fragment": /* @__PURE__ */ jsx(ProjectList, { rows, q: "a" }),
  "r2-new": /* @__PURE__ */ jsx(NewProjectPage, {}),
  "r2-invalid": /* @__PURE__ */ jsx(NewProjectPage, { state: { values: { name: "", client: "Contoso", status: "paused", notes: "x" }, errors: { name: "Name is required" } } }),
  "r2-fragment": /* @__PURE__ */ jsx(ProjectForm, { state: { values: { name: "" }, errors: { name: "Name is required" } } }),
  "r3-running": /* @__PURE__ */ jsx(ProjectDetailPage, { project: rows[0], job: { state: "running", percent: 40 } }),
  "r3-done": /* @__PURE__ */ jsx(ProjectDetailPage, { project: rows[0], job: { state: "done", finishedAt: "2026-11-15T22:00:00Z" } }),
  "r3-fragment": /* @__PURE__ */ jsx(JobStatus, { projectId: 1, job: { state: "failed", reason: "disk full" } })
};
for (const [name, view] of Object.entries(pages)) writeFileSync(`${out}/${name}.html`, render(view) + "\n");
console.log(Object.keys(pages).length, "files");
