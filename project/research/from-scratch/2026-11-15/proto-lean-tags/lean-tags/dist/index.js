// Lean Tags: bake-off prototype for the from-scratch round (token-economy lens).
// One file, erasable TypeScript only. A prototype: the bench page, the three reference screens, nothing more.
import { createServer } from "node:http";
// ───────────────────────── values ─────────────────────────
/** Finished, already-escaped markup. `I` is the id its root carries when it was built with a part's root wire. */
export class Html {
    h;
    id;
    constructor(h, id) {
        this.h = h;
        this.id = id;
    }
    toString() {
        return this.h;
    }
}
/** A full document: what a page route answers. */
export class Page {
    h;
    constructor(h) {
        this.h = h;
    }
}
/** A class list. Only tw`…` and tw.token() make one, so a class attribute never holds an unchecked string. */
export class Tw {
    /** Attribute-escaped class text. */
    c;
    constructor(c) {
        this.c = c;
    }
}
/** Attribute text produced by the framework. `I` is set when the wire makes its element a part's root. */
export class Wire {
    s;
    id;
    constructor(s, id) {
        this.s = s;
        this.id = id;
    }
}
// ───────────────────────── escaping ─────────────────────────
const ESC = /[&<>"']/;
export function esc(s) {
    if (!ESC.test(s))
        return s;
    let out = "";
    let last = 0;
    for (let i = 0; i < s.length; i++) {
        let r;
        switch (s.charCodeAt(i)) {
            case 38:
                r = "&amp;";
                break;
            case 60:
                r = "&lt;";
                break;
            case 62:
                r = "&gt;";
                break;
            case 34:
                r = "&quot;";
                break;
            case 39:
                r = "&#39;";
                break;
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
export function safeUrl(u) {
    const c = u.charCodeAt(0);
    if ((c === 47 || c === 35 || c === 63) && !/[\t\n\r]/.test(u))
        return u;
    // WHATWG URL parsing: leading C0/space stripped, tab and newline removed anywhere.
    const t = u.replace(/^[\u0000-\u0020]+/, "").replace(/[\t\n\r]/g, "");
    if (!HAS_SCHEME.test(t))
        return u;
    if (SAFE_SCHEME.test(t) || SAFE_DATA.test(t))
        return u;
    return "#";
}
const CSS_OK = /^[a-zA-Z0-9 #%.,()+\-/_]*$/;
const CSS_BAD = /\/\*|url\s*\(|expression\s*\(|image-set\s*\(/i;
/** A CSS value from data: one value, never a second declaration, a rule, a comment or a fetch. */
export function cssValue(v) {
    const s = String(v);
    if (!CSS_OK.test(s) || CSS_BAD.test(s))
        throw new TypeError(`lt: refused CSS value ${JSON.stringify(s.slice(0, 40))}: a value from data is one plain CSS value`);
    return s;
}
const HTMX_JS = /^\s*(js|javascript):/i;
// ───────────────────────── attributes ─────────────────────────
const PLAIN = 0, URL_ = 1, STYLE = 2, DATA = 3, SRCDOC = 4, ARIA = 5;
const KIND = new Map();
const URL_ATTRS = new Set(["href", "src", "action", "formaction", "poster", "cite", "ping", "background", "xlink:href", "codebase", "manifest", "srcset"]);
const DATA_KEY = /^[a-z][a-z0-9-]*$/;
function classify(k) {
    if (k === "class")
        throw new TypeError("lt: classes are a leading tw argument: div(tw`flex gap-4`, …), not a class attribute");
    if (/^on/i.test(k))
        throw new TypeError(`lt: refused attribute ${k}: inline event handlers are not rendered`);
    if (/^(data-)?hx-/i.test(k))
        throw new TypeError(`lt: refused attribute ${k}: htmx attributes come from a route wire (route(...), .search(), .poll(), wire({…}))`);
    let kind = PLAIN;
    if (k === "style")
        kind = STYLE;
    else if (k === "data")
        kind = DATA;
    else if (k === "srcdoc")
        kind = SRCDOC;
    else if (k.startsWith("aria-"))
        kind = ARIA;
    else if (URL_ATTRS.has(k))
        kind = URL_;
    else if (!/^[a-zA-Z_][a-zA-Z0-9_.:-]*$/.test(k))
        throw new TypeError(`lt: refused attribute name ${JSON.stringify(k.slice(0, 40))}`);
    KIND.set(k, kind);
    return kind;
}
function dataKey(k) {
    if (!DATA_KEY.test(k) || k.startsWith("hx-") || k.startsWith("on"))
        throw new TypeError(`lt: refused data attribute name ${JSON.stringify(k.slice(0, 40))}`);
    return k;
}
function attrs(o) {
    let s = "";
    for (const k in o) {
        const v = o[k];
        if (v == null)
            continue;
        let kind = KIND.get(k);
        if (kind === undefined)
            kind = classify(k);
        if (kind === ARIA) {
            s += " " + k + '="' + esc(String(v)) + '"';
            continue;
        }
        if (v === false)
            continue;
        if (kind === PLAIN) {
            s += v === true ? " " + k : " " + k + '="' + esc(typeof v === "string" ? v : String(v)) + '"';
        }
        else if (kind === URL_) {
            s += " " + k + '="' + esc(safeUrl(String(v))) + '"';
        }
        else if (kind === STYLE) {
            let d = "";
            for (const p in v) {
                if (v[p] == null || v[p] === false)
                    continue;
                if (!/^(--)?[a-zA-Z][a-zA-Z0-9-]*$/.test(p))
                    throw new TypeError(`lt: refused CSS property ${JSON.stringify(p.slice(0, 40))}`);
                d += (d ? "; " : "") + p + ": " + cssValue(v[p]);
            }
            if (d)
                s += ' style="' + esc(d) + '"';
        }
        else if (kind === DATA) {
            for (const dk in v) {
                const dv = v[dk];
                if (dv == null || dv === false)
                    continue;
                s += " data-" + dataKey(dk) + (dv === true ? "" : '="' + esc(String(dv)) + '"');
            }
        }
        else {
            const sb = o.sandbox;
            if (typeof sb === "string" && /\ballow-scripts\b/.test(sb))
                throw new TypeError("lt: srcdoc with sandbox allow-scripts runs the content in a scriptable frame; pass trusted markup through a src URL instead");
            s += ' srcdoc="' + esc(String(v)) + '"' + (sb == null ? ' sandbox=""' : "");
        }
    }
    return s;
}
// ───────────────────────── elements ─────────────────────────
function kid(c) {
    if (typeof c === "string")
        return esc(c);
    if (c instanceof Html)
        return c.h;
    if (c == null || c === false || c === true)
        return "";
    if (typeof c === "number")
        return String(c);
    if (Array.isArray(c)) {
        let s = "";
        for (let i = 0; i < c.length; i++)
            s += kid(c[i]);
        return s;
    }
    if (c instanceof Page)
        throw new TypeError("lt: a Page cannot be rendered inside an element");
    if (typeof c === "function")
        throw new TypeError("lt: a tag must be called to become a child: hr(), not hr");
    throw new TypeError("lt: classes, attributes and wires come before children: tag(tw`…`, {…}, child, child)");
}
function make(tag, isVoid = false) {
    const open = "<" + tag;
    const close = isVoid ? "" : "</" + tag + ">";
    const isButton = tag === "button";
    return function (...args) {
        let s = open;
        let rest = "";
        let klass = "";
        let id;
        let typed = !isButton;
        const n = args.length;
        let i = 0;
        for (; i < n; i++) {
            const a = args[i];
            if (typeof a !== "object" || a === null)
                break;
            if (a instanceof Tw)
                klass = klass === "" ? a.c : klass + " " + a.c;
            else if (a instanceof Html || Array.isArray(a))
                break;
            else if (a instanceof Wire) {
                rest += a.s;
                if (a.id !== undefined)
                    id = a.id;
            }
            else if (a instanceof Ref)
                rest += a.on(tag);
            else {
                rest += attrs(a);
                if (!typed && a.type != null)
                    typed = true;
                if (typeof a.id === "string")
                    id = a.id;
            }
        }
        if (klass !== "")
            s += ' class="' + klass + '"';
        s += rest;
        if (!typed)
            s += ' type="button"';
        s += ">";
        if (isVoid) {
            if (i < n)
                throw new TypeError(`lt: <${tag}> is a void element and takes no children`);
            return new Html(s, id);
        }
        for (; i < n; i++)
            s += kid(args[i]);
        return new Html(s + close, id);
    };
}
const SITE = new WeakMap();
const squash = (c) => (/\s\s|^\s|\s$|[\n\t]/.test(c) ? c.replace(/\s+/g, " ").trim() : c);
function twText(strings, holes) {
    let c = esc(strings[0]);
    for (let i = 1; i < strings.length; i++) {
        if (strings[i - 1].endsWith(":"))
            throw new TypeError(`lt: a variant prefix applies to one class, not to a hole: write the prefix on each class inside the preset (…${strings[i - 1].slice(-16)}\${…})`);
        const h = holes[i - 1];
        if (h) {
            if (!(h instanceof Tw))
                throw new TypeError("lt: a tw hole takes another tw`…` value (or false/null); a raw string is unchecked. Use tw.token(value) for one class from data");
            c += h.c;
        }
        c += esc(strings[i]);
    }
    return c;
}
/**
 * The class list of an element: tag(tw`flex gap-4`, …). Also a preset: const card = tw`p-6 bg-surface`.
 * Holes take other tw values or false/null. Several tw arguments on one tag are joined in order; nothing is merged or dropped.
 */
export const tw = Object.assign((strings, ...holes) => {
    if (strings.length === 1) {
        let t = SITE.get(strings);
        if (t === undefined) {
            t = new Tw(esc(squash(strings[0])));
            SITE.set(strings, t);
        }
        return t;
    }
    return new Tw(squash(twText(strings, holes)));
}, {
    token(value) {
        if (!/^[A-Za-z0-9_:\-./[\]%#]+$/.test(value))
            throw new TypeError(`lt: refused class token ${JSON.stringify(value.slice(0, 40))}`);
        return new Tw(value);
    },
});
const e = (tag) => make(tag);
const v = (tag) => make(tag, true);
export const div = e("div"), span = e("span"), p = e("p"), main = e("main"), section = e("section"), article = e("article");
export const header = e("header"), footer = e("footer"), nav = e("nav"), aside = e("aside");
export const h1 = e("h1"), h2 = e("h2"), h3 = e("h3"), h4 = e("h4");
export const ul = e("ul"), ol = e("ol"), li = e("li"), dl = e("dl"), dt = e("dt"), dd = e("dd");
export const table = e("table"), thead = e("thead"), tbody = e("tbody"), tr = e("tr");
export const td = e("td"), th = e("th");
export const strong = e("strong"), em = e("em"), small = e("small"), code = e("code"), pre = e("pre");
export const time = e("time");
export const a = e("a");
export const button = e("button");
export const form = e("form");
export const label = e("label");
export const select = e("select"), option = e("option");
export const textarea = e("textarea");
export const dialog = e("dialog");
export const details = e("details"), summary = e("summary");
export const iframe = e("iframe");
export const title = e("title");
export const input = v("input"), img = v("img"), hr = v("hr"), br = v("br");
export const meta = v("meta"), link = v("link");
/** External script only. Data for scripts goes through json() or jsVar(). */
export const script = (a) => new Html("<script" + attrs(a) + "></script>");
// ───────────────────────── safe sinks ─────────────────────────
const JSON_ESC = { "<": "\\u003c", ">": "\\u003e", "&": "\\u0026", "\u2028": "\\u2028", "\u2029": "\\u2029" };
const jsonText = (data) => JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => JSON_ESC[c]);
/** Data for client code: <script type="application/json">. */
export const json = (data, a) => new Html('<script type="application/json"' + (a ? attrs(a) : "") + ">" + jsonText(data) + "</script>");
/** Data handed to inline JS as one global: <script>window.NAME = …</script>. */
export function jsVar(name, data) {
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name))
        throw new TypeError(`lt: refused global name ${JSON.stringify(name.slice(0, 40))}`);
    return new Html("<script>window." + name + " = " + jsonText(data) + "</script>");
}
export class Css {
    t;
    constructor(t) {
        this.t = t;
    }
}
/** A stylesheet: the literal text is yours, each hole is one CSS value from data. */
export function css(strings, ...holes) {
    let t = strings[0];
    for (let i = 1; i < strings.length; i++)
        t += cssValue(holes[i - 1]) + strings[i];
    if (/<\/style/i.test(t))
        throw new TypeError("lt: refused </style in a stylesheet");
    return new Css(t);
}
export const style = (sheet) => new Html("<style>" + sheet.t + "</style>");
export class Trusted {
    h;
    constructor(h) {
        this.h = h;
    }
}
/** Markup you wrote: a template with no holes. The only other source of Trusted is a sanitizer you register. */
export function trusted(strings) {
    if (strings.length !== 1)
        throw new TypeError("lt: trusted`…` takes no holes");
    return new Trusted(strings[0]);
}
export const raw = (t) => {
    if (!(t instanceof Trusted))
        throw new TypeError("lt: raw() takes trusted`…` markup, never a string");
    return new Html(t.h);
};
/** A GET route that answers a page. Inputs named in the path are path parameters; the rest are the query. */
export function page(path, inputs) {
    return { k: "page", path: (path ?? "/"), shape: (inputs ?? {}) };
}
/** A GET route that answers one fragment: the element whose root carries `id`. */
export function part(id, path, inputs) {
    return { k: "part", id, path, shape: (inputs ?? {}) };
}
export function post(path, a, b) {
    const hasBody = a != null && a["~standard"] !== undefined;
    return { k: "post", path, body: hasBody ? a : undefined, shape: (hasBody ? b : a) ?? {} };
}
const MAIN = "main";
const NAV = ` hx-target="#${MAIN}" hx-swap="outerMorph show:top" hx-push-url="true"`;
/** A route address used as a leading argument. What it emits depends on the tag it sits on. */
export class Ref {
    url;
    constructor(url) {
        this.url = url;
    }
}
/** A page address: a(ref, …) links to it, form(ref, …) is a GET form to it. */
export class PageRef extends Ref {
    on(tag) {
        if (tag === "a")
            return ' href="' + esc(this.url) + '"';
        if (tag === "form")
            return ' action="' + esc(this.url) + '" method="get"';
        throw new TypeError(`lt: a page route goes on a(…) or form(…), not <${tag}>`);
    }
}
/** A fragment address plus the wires that load it. */
export class PartRef {
    url;
    id;
    constructor(url, id) {
        this.url = url;
        this.id = id;
    }
    /** Makes the element this part's root: it carries the part's id. */
    get root() {
        return new Wire(' id="' + this.id + '"', this.id);
    }
    /** Root that refreshes itself while `every` is set. Pass false for the settled root, which ends the poll. */
    poll(every) {
        if (!every)
            return this.root;
        return new Wire(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="every ${every}" hx-target="this" hx-swap="outerHTML"`, this.id);
    }
    /** Root that loads itself once after the page arrives. */
    defer() {
        return new Wire(` id="${this.id}" hx-get="${esc(this.url)}" hx-trigger="load" hx-target="this" hx-swap="outerHTML" hx-sync="this:replace"`, this.id);
    }
    /** On an input: names the field and reloads the part after typing stops. */
    search(name) {
        return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="input changed delay:300ms, search" hx-target="#${this.id}" hx-swap="outerMorph" hx-sync="this:replace"`);
    }
    /** On a select or checkbox: names the field and reloads the part when it changes. */
    change(name) {
        return new Wire(` name="${name}" hx-get="${esc(this.url)}" hx-trigger="change" hx-target="#${this.id}" hx-swap="outerMorph" hx-include="closest form"`);
    }
    /** On a button: reloads the part on click. */
    load() {
        return new Wire(` hx-get="${esc(this.url)}" hx-target="#${this.id}" hx-swap="outerMorph"`);
    }
}
/** A POST address. button(ref, …) posts on click; ref.form(…) builds its schema-bound form. */
export class ActionRef extends Ref {
    formId;
    constructor(url, formId) {
        super(url);
        this.formId = formId;
    }
    on(tag) {
        if (tag === "button")
            return ` hx-post="${esc(this.url)}"${NAV}`;
        throw new TypeError(`lt: an action route goes on button(…) or through .form(…), not <${tag}>`);
    }
    /** Posts with no swap (a counter, a like). */
    fire() {
        return new Wire(` hx-post="${esc(this.url)}" hx-swap="none"`);
    }
    /** The route's form: it carries the form region's id, and a 422 answer lands back in it. */
    form(state, ...rest) {
        const id = this.formId;
        const u = esc(this.url);
        const body = rest[rest.length - 1];
        const lead = lead_(rest, 0, rest.length - 1);
        return new Html(`<form${lead} id="${id}" action="${u}" method="post" hx-post="${u}"${NAV} hx-status:422="target:#${id} swap:outerMorph push:false">` + kid(body(fields(id, state))) + "</form>", id);
    }
}
function lead_(args, from, to) {
    let klass = "";
    let rest = "";
    for (let i = from; i < to; i++) {
        const a = args[i];
        if (a instanceof Tw)
            klass = klass === "" ? a.c : klass + " " + a.c;
        else if (a)
            rest += attrs(a);
    }
    return (klass === "" ? "" : ' class="' + klass + '"') + rest;
}
function fields(formId, state) {
    const values = state.values ?? {};
    const errors = state.errors ?? {};
    const base = formId.replace(/-form$/, "");
    const wired = (name) => ` name="${esc(name)}" id="${base}-${esc(name)}"` + (errors[name] ? ` aria-invalid="true" aria-describedby="${base}-${esc(name)}-error"` : "");
    const val = (name) => (values[name] == null ? "" : String(values[name]));
    const typeOf = (rest) => rest.find((a) => a && !(a instanceof Tw) && a.type != null)?.type;
    return {
        input(name, ...rest) {
            const type = typeOf(rest);
            const value = type === "password" || val(name) === "" ? "" : ` value="${esc(val(name))}"`;
            return new Html(`<input${wired(name)}${type ? "" : ' type="text"'}${value}${lead_(rest, 0, rest.length)}>`);
        },
        textarea: (name, ...rest) => new Html(`<textarea${wired(name)}${lead_(rest, 0, rest.length)}>${esc(val(name))}</textarea>`),
        select(name, options, ...rest) {
            let o = "";
            for (const value in options)
                o += `<option value="${esc(value)}"${val(name) === value ? " selected" : ""}>${esc(options[value])}</option>`;
            return new Html(`<select${wired(name)}${lead_(rest, 0, rest.length)}>${o}</select>`);
        },
        checkbox: (name, ...rest) => new Html(`<input${wired(name)} type="checkbox"${values[name] ? " checked" : ""}${lead_(rest, 0, rest.length)}>`),
        hidden: (name, value) => new Html(`<input type="hidden" name="${esc(name)}" value="${esc(String(value ?? ""))}">`),
        error: (name, ...rest) => (errors[name] ? new Html(`<span id="${base}-${esc(name)}-error"${lead_(rest, 0, rest.length)}>${esc(errors[name])}</span>`) : null),
    };
}
export function routes(prefix, defs) {
    const out = {};
    const group = prefix.replace(/^\/|\/$/g, "").replace(/\//g, "-");
    for (const key in defs) {
        const def = defs[key];
        const full = (prefix + (def.path === "/" ? "" : def.path)) || "/";
        const segs = full.split(/:([A-Za-z_][A-Za-z0-9_]*)/);
        const pathKeys = new Set();
        for (let i = 1; i < segs.length; i += 2)
            pathKeys.add(segs[i]);
        const hasQuery = Object.keys(def.shape).some((k) => !pathKeys.has(k));
        const url = (input) => {
            let u = segs[0];
            for (let i = 1; i < segs.length; i += 2) {
                const pv = input?.[segs[i]];
                if (pv == null || pv === "")
                    throw new TypeError(`lt: route ${group}.${key} needs ${segs[i]}`);
                u += encodeURIComponent(String(pv)) + segs[i + 1];
            }
            if (hasQuery && input) {
                let q = "";
                for (const k in input) {
                    if (pathKeys.has(k))
                        continue;
                    const qv = input[k];
                    if (qv == null || qv === "" || qv === false)
                        continue;
                    q += (q ? "&" : "?") + encodeURIComponent(k) + "=" + encodeURIComponent(String(qv));
                }
                u += q;
            }
            return u;
        };
        const formId = `${group}-${key}-form`;
        const fn = def.k === "page" ? (input) => new PageRef(url(input))
            : def.k === "part" ? (input) => new PartRef(url(input), def.id)
                : (input) => new ActionRef(url(input), formId);
        fn.def = def;
        fn.key = key;
        fn.pattern = full;
        out[key] = fn;
    }
    return out;
}
/** The escape hatch for htmx: a request the route wires do not cover. Every value is checked. */
export function wire(o) {
    let s = "";
    for (const m of ["get", "post", "put", "delete"]) {
        const u = o[m];
        if (u == null)
            continue;
        if (HTMX_JS.test(u) || safeUrl(u) !== u)
            throw new TypeError(`lt: refused htmx URL ${JSON.stringify(u.slice(0, 40))}`);
        s += ` hx-${m}="${esc(u)}"`;
    }
    if (o.target != null) {
        if (!/^(this|#[A-Za-z][\w-]*|closest [a-z][\w-]*)$/.test(o.target))
            throw new TypeError(`lt: refused htmx target ${JSON.stringify(o.target.slice(0, 40))}`);
        s += ` hx-target="${o.target}"`;
    }
    if (o.swap != null)
        s += ` hx-swap="${esc(o.swap)}"`;
    if (o.trigger != null) {
        if (!/^(click|change|load|revealed|submit|\d+(ms|s))$/.test(o.trigger))
            throw new TypeError(`lt: refused htmx trigger ${JSON.stringify(String(o.trigger).slice(0, 40))}`);
        s += ` hx-trigger="${/^\d/.test(o.trigger) ? "every " + o.trigger : o.trigger}"`;
    }
    if (o.confirm != null) {
        if (HTMX_JS.test(o.confirm))
            throw new TypeError("lt: refused confirm text that htmx would run as JavaScript (js: prefix)");
        s += ` hx-confirm="${esc(o.confirm)}"`;
    }
    if (o.vals != null)
        s += ` hx-vals="${esc(JSON.stringify(o.vals))}"`;
    if (o.headers != null)
        s += ` hx-headers="${esc(JSON.stringify(o.headers))}"`;
    if (o.push)
        s += ' hx-push-url="true"';
    return new Wire(s);
}
/** A native modal dialog: three attribute sets that cannot drift apart. */
export function modal(id) {
    return { open: { command: "show-modal", commandfor: id }, root: { id, closedby: "any" }, close: { command: "close", commandfor: id } };
}
export function match(value, a, b) {
    return b === undefined ? a[value](value) : b[value[a]](value);
}
// ───────────────────────── documents and handlers ─────────────────────────
/** The document shell. An app wraps this once in its own Layout({ title }, …children). */
export function doc(o, ...body) {
    return new Page(`<!DOCTYPE html><html lang="${esc(o.lang ?? "en")}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(o.title)}</title>` +
        (o.description ? `<meta name="description" content="${esc(o.description)}">` : "") + kid(o.head) +
        `</head><body hx-boost:inherited="true" hx-target:inherited="#${MAIN}" hx-swap:inherited="outerMorph show:top">${kid(body)}</body></html>`);
}
export class Redirect {
    to;
    constructor(to) { this.to = to; }
}
export class NotFound {
}
export class Invalid {
    errors;
    constructor(errors) { this.errors = errors; }
}
/** One entry per route; a missing or extra key is a compile error. Returns a dispatcher the server adapter mounts. */
export function handlers(table, entries) {
    const reply = (out, def, key) => {
        if (out instanceof Redirect)
            return { status: 303, location: out.to };
        if (out instanceof NotFound)
            return { status: 404 };
        if (def.k === "part") {
            if (!(out instanceof Html) || out.id !== def.id)
                throw new TypeError(`lt: ${key} must answer the element whose root is ${key}().root (id ${def.id})`);
            return { status: 200, body: out.h };
        }
        if (!(out instanceof Page))
            throw new TypeError(`lt: ${key} must answer a page (the app Layout) or a redirect`);
        return { status: 200, body: out.h };
    };
    const dispatch = async (key, req = {}) => {
        const def = table[key].def;
        const entry = entries[key];
        const base = {
            input: req.input ?? {},
            body: undefined,
            request: req.request,
            redirect: (to) => new Redirect(to.url),
            notFound: () => new NotFound(),
            invalid: (errors) => new Invalid(errors),
        };
        if (def.k !== "post" || def.body === undefined)
            return reply(await entry(base), def, key);
        const res = await def.body["~standard"].validate(req.body);
        const values = req.body ?? {};
        if (res.issues) {
            const errors = {};
            for (const issue of res.issues) {
                const seg = issue.path?.[0];
                const name = String(typeof seg === "object" && seg !== null ? seg.key : seg);
                errors[name] ??= issue.message;
            }
            return { status: 422, body: entry.form({ values, errors }).h };
        }
        const out = await entry.ok({ ...base, body: res.value });
        if (out instanceof Invalid)
            return { status: 422, body: entry.form({ values, errors: out.errors }).h };
        return reply(out, def, key);
    };
    return Object.assign(dispatch, { table: table });
}
/** The markup of a view or a page, as a string. */
export const render = (view) => view.h;
function coerce(shape, raw) {
    const out = {};
    for (const k in shape) {
        const v = raw[k];
        if (v === undefined || v === "") {
            if (!shape[k].endsWith("?"))
                return null;
            continue;
        }
        if (shape[k].startsWith("number")) {
            const n = Number(v);
            if (!Number.isFinite(n))
                return null;
            out[k] = n;
        }
        else
            out[k] = shape[k].startsWith("boolean") ? v === "true" || v === "on" : v;
    }
    return out;
}
/** A minimal node:http server for handlers(...) tables: GET for page and part routes, POST (urlencoded) for actions. */
export function serve(apps, port = 3000) {
    const table = apps.flatMap((app) => Object.entries(app.table).map(([key, fn]) => ({
        app, key, def: fn.def,
        method: fn.def.k === "post" ? "POST" : "GET",
        re: new RegExp("^" + String(fn.pattern).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/:([A-Za-z_]\w*)/g, "(?<$1>[^/]+)") + "/?$"),
    })));
    return createServer(async (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        let answer = { status: 404, body: "Not found" };
        for (const r of table) {
            const m = r.method === req.method ? r.re.exec(url.pathname) : null;
            const input = m && coerce(r.def.shape, { ...Object.fromEntries(url.searchParams), ...m.groups });
            if (!input)
                continue;
            let body;
            if (req.method === "POST") {
                let text = "";
                for await (const chunk of req)
                    text += chunk;
                body = Object.fromEntries(new URLSearchParams(text));
            }
            answer = await r.app(r.key, { input, body, request: req });
            break;
        }
        if (answer.location && req.headers["hx-request"] === "true") {
            res.writeHead(200, { "hx-redirect": answer.location }).end();
            return;
        }
        res.writeHead(answer.status, answer.location ? { location: answer.location } : { "content-type": "text/html; charset=utf-8" });
        res.end(answer.body ?? "");
    }).listen(port);
}
