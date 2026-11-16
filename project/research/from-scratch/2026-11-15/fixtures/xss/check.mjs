// XSS checker for the from-scratch round (K3). Renderer-agnostic.
//
//   node check.mjs <adapter.mjs> [--json] [--verbose]
//
// An adapter exports `name` and `render(ctx, payload)`: it fills the sink named by `ctx`
// (see CONTEXTS in cases.mjs) with `payload` through the renderer's idiomatic API and
// returns the rendered HTML of that one element. It returns { unsupported: "why" } when
// the renderer has no API for the context, and may throw to refuse a value (fail closed).
//
// The checker appends a sentinel <p>, parses the result with parse5 (the WHATWG HTML
// parser) and classifies each case:
//   escape:xss   the payload changed the document's structure (an extra element, a lost
//                sentinel, text outside its element) or reached a script sink: an on* or
//                [data-]hx-on* attribute, a javascript:/vbscript:/scriptable data: URL, an
//                htmx 4 js:/javascript: prefix (hx-get/post/…, hx-confirm, hx-vals,
//                hx-headers; case-sensitive startsWith, as htmx does), script in an
//                unsandboxed srcdoc, injected JS that ran
//   escape:css   attacker CSS: a second declaration (style attribute or <style> rule), a
//                broken-out rule, @import, a comment or backslash escape inside a <style> rule
//   legacy       only expression(), or url() inside the expected color value (invalid CSS);
//                no current browser runs either (reported, not an escape)
//   safe         none of that (for a benign case: and the value round-trips)
//   rejected     the adapter threw on a hostile value (fail closed)
//   broken       a benign case did not round-trip or was refused
//   unsupported  the renderer has no API for the context (listed, not scored)
// K3 counts escape:xss + escape:css. Exit code 1 when that count is above zero.
import { parse } from "parse5";
import vm from "node:vm";
import { isDeepStrictEqual } from "node:util";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { CASES, CONTEXTS } from "./cases.mjs";

const SENTINEL = '<p id="xss-sentinel">end</p>';
const BASE = "https://app.example/";

const ROOT_TAG = {
  text: "div", "rcdata-textarea": "textarea", "rcdata-title": "title",
  "attr-title": "div", "attr-data": "div", "attr-id": "div", "attr-class": "div",
  "attr-input-value": "input", "attr-name": "div",
  "url-href": "a", "url-img-src": "img", "url-iframe-src": "iframe",
  "url-form-action": "form", "url-formaction": "button",
  "style-value": "div", "style-element": "style",
  "json-script": "script", "js-script-var": "script",
  "htmx-get": "button", "htmx-confirm": "button", "htmx-vals": "button", "htmx-headers": "button",
  "iframe-srcdoc": "iframe",
};

const URL_ATTRS = new Set(["href", "src", "action", "formaction", "data", "poster", "xlink:href", "background", "ping", "cite", "codebase"]);
const HTMX_REQUEST_ATTR = /^(data-)?hx-(get|post|put|patch|delete|action)$/;
const HTMX_JS_ATTR = /^(data-)?hx-(confirm|vals|headers|config)$/;
const HTMX_JS_PREFIX = /^(js|javascript):/;
const SAFE_DATA = /^data:(image\/(?!svg)[a-z0-9.+-]+|audio\/[a-z0-9.+-]+|video\/[a-z0-9.+-]+|font\/[a-z0-9.+-]+)[;,]/i;
const CSS_FETCH = /url\s*\(|image-set\s*\(|@import/i;
const CSS_LEGACY = /expression\s*\(/i;

const norm = (s) => s.replace(/\r\n?/g, "\n").replace(/\0/g, "");
const xss = (msg) => ({ cls: "xss", msg });
const css = (msg) => ({ cls: "css", msg });
const legacy = (msg) => ({ cls: "legacy", msg });

function elements(node, out = []) {
  for (const c of node.childNodes ?? []) {
    if (c.tagName) {
      out.push(c);
      elements(c, out);
      if (c.content) elements(c.content, out);
    }
  }
  return out;
}

function text(node) {
  let s = "";
  for (const c of node.childNodes ?? []) {
    if (c.nodeName === "#text") s += c.value;
    else if (c.childNodes) s += text(c);
  }
  return s;
}

const attr = (el, name) => el.attrs.find((a) => a.name === name)?.value;

function scheme(value) {
  try {
    return new URL(value, BASE).protocol;
  } catch {
    return null;
  }
}

function urlSink(value) {
  const p = scheme(value);
  if (p === "javascript:" || p === "vbscript:") return `${p} URL`;
  if (p === "data:" && !SAFE_DATA.test(value.replace(/^[\u0000- ]+/, ""))) return "scriptable data: URL";
  return null;
}

function cssDeclarations(style) {
  const decls = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (const ch of style) {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === ";" && depth === 0) {
      if (cur.trim()) decls.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) decls.push(cur.trim());
  return decls;
}

function scanSinks(doc, ctx, depth = 0) {
  const found = [];
  for (const el of elements(doc)) {
    if (el.tagName === "script" && !(depth === 0 && (ctx === "json-script" || ctx === "js-script-var"))) {
      found.push(xss("script element"));
    }
    for (const a of el.attrs) {
      const n = a.name.toLowerCase();
      if (/^on/.test(n)) found.push(xss(`event handler ${n}`));
      if (/^(data-)?hx-on/.test(n)) found.push(xss(`htmx handler ${n}`));
      if (URL_ATTRS.has(n)) {
        const s = urlSink(a.value);
        if (s) found.push(xss(`${s} in ${n}`));
      }
      if (HTMX_REQUEST_ATTR.test(n) && HTMX_JS_PREFIX.test(a.value)) found.push(xss(`htmx js: action in ${n}`));
      if (HTMX_JS_ATTR.test(n) && HTMX_JS_PREFIX.test(a.value)) found.push(xss(`htmx js: value in ${n}`));
      if (n === "style" && CSS_LEGACY.test(a.value)) found.push(legacy("expression() in style attribute"));
      if (n === "srcdoc") {
        const sandbox = attr(el, "sandbox");
        const scriptsAllowed = sandbox === undefined || sandbox.split(/\s+/).includes("allow-scripts");
        if (scriptsAllowed) {
          const inner = scanSinks(parse(a.value), ctx, depth + 1).filter((f) => f.cls === "xss");
          if (inner.length) found.push(xss(`srcdoc runs: ${inner.map((f) => f.msg).join(", ")}`));
        }
      }
    }
  }
  return found;
}

function runScript(code) {
  let alerts = 0;
  const sandbox = { window: {}, alert: () => { alerts++; }, document: {} };
  try {
    vm.runInNewContext(code, sandbox, { timeout: 100 });
    return { alerts, data: sandbox.window.__DATA, error: null };
  } catch (e) {
    return { alerts, data: undefined, error: String(e) };
  }
}

function judge(c, html) {
  const doc = parse(`<!DOCTYPE html><html><head></head><body>${html}${SENTINEL}</body></html>`);
  const body = doc.childNodes.find((n) => n.tagName === "html").childNodes.find((n) => n.tagName === "body");
  const findings = [];
  const rootTag = ROOT_TAG[c.ctx];

  const kids = body.childNodes.filter((n) => n.tagName);
  const strayText = body.childNodes.filter((n) => n.nodeName === "#text" && n.value.trim() !== "");
  const root = kids[0];
  const sentinel = kids[kids.length - 1];
  if (!root || root.tagName !== rootTag) findings.push(xss(`structure: expected <${rootTag}>, got <${root?.tagName ?? "nothing"}>`));
  if (!sentinel || attr(sentinel, "id") !== "xss-sentinel") findings.push(xss("structure: sentinel swallowed"));
  if (kids.length !== 2) findings.push(xss(`structure: ${kids.length} top-level elements, expected 2`));
  if (strayText.length) findings.push(xss("structure: text outside the element"));
  if (root && root.tagName === rootTag) {
    const nested = elements(root);
    if (nested.length) findings.push(xss(`structure: <${nested[0].tagName}> inside the element`));
  }
  findings.push(...scanSinks(doc, c.ctx));

  let roundTrip = null;
  if (root && root.tagName === rootTag) {
    const p = c.payload;
    switch (c.ctx) {
      case "text": case "rcdata-textarea": case "rcdata-title":
        roundTrip = norm(text(root)) === norm(p); break;
      case "attr-title": roundTrip = attr(root, "title") === p; break;
      case "attr-data": roundTrip = attr(root, "data-note") === p; break;
      case "attr-id": roundTrip = attr(root, "id") === p; break;
      case "attr-class": roundTrip = (attr(root, "class") ?? "").trim() === p; break;
      case "attr-input-value": roundTrip = attr(root, "value") === p; break;
      case "attr-name": roundTrip = attr(root, `data-${p.key}`) === p.value; break;
      case "url-href": roundTrip = attr(root, "href") === p; break;
      case "url-img-src": case "url-iframe-src": roundTrip = attr(root, "src") === p; break;
      case "url-form-action": roundTrip = attr(root, "action") === p; break;
      case "url-formaction": roundTrip = attr(root, "formaction") === p; break;
      case "style-value": {
        const decls = cssDeclarations(attr(root, "style") ?? "");
        if (decls.length > 1) findings.push(css(`${decls.length} declarations in style attribute, expected 1`));
        else if (CSS_FETCH.test(decls[0] ?? "")) findings.push(legacy("url() inside the color value (invalid CSS, inert)"));
        roundTrip = decls.length === 1 && /^color\s*:/i.test(decls[0]) && decls[0].replace(/^color\s*:\s*/i, "") === p;
        break;
      }
      case "style-element": {
        const sheet = text(root);
        const opens = (sheet.match(/\{/g) ?? []).length;
        const closes = (sheet.match(/\}/g) ?? []).length;
        if (opens !== 1 || closes !== 1) findings.push(css(`${opens} rule openings, ${closes} closings in <style>, expected 1`));
        const decls = cssDeclarations(sheet.slice(sheet.indexOf("{") + 1, sheet.lastIndexOf("}")));
        if (decls.length > 1) findings.push(css(`${decls.length} declarations in the <style> rule, expected 1`));
        else if (CSS_FETCH.test(decls[0] ?? "")) findings.push(legacy("url() inside the color value (invalid CSS, inert)"));
        if (/@import/i.test(sheet)) findings.push(css("@import in <style>"));
        if (/\/\*|\\/.test(sheet)) findings.push(css("comment or backslash escape in <style>"));
        if (CSS_LEGACY.test(sheet)) findings.push(legacy("expression() in <style>"));
        roundTrip = sheet.includes(`color: ${p}`) || sheet.includes(`color:${p}`);
        break;
      }
      case "json-script": {
        try { roundTrip = isDeepStrictEqual(JSON.parse(text(root)), { v: p }); } catch { roundTrip = false; }
        break;
      }
      case "js-script-var": {
        const r = runScript(text(root));
        if (r.alerts) findings.push(xss("injected JS ran"));
        roundTrip = r.error === null && isDeepStrictEqual(JSON.parse(JSON.stringify(r.data ?? null)), { v: p });
        break;
      }
      case "htmx-get": roundTrip = attr(root, "hx-get") === p; break;
      case "htmx-confirm": roundTrip = attr(root, "hx-confirm") === p; break;
      case "htmx-vals": case "htmx-headers": {
        const name = c.ctx === "htmx-vals" ? "hx-vals" : "hx-headers";
        const want = c.ctx === "htmx-vals" ? { q: p } : { "X-Note": p };
        try { roundTrip = isDeepStrictEqual(JSON.parse(attr(root, name)), want); } catch { roundTrip = false; }
        break;
      }
      case "iframe-srcdoc": roundTrip = attr(root, "srcdoc") === p; break;
      default: throw new Error(`no oracle for ${c.ctx}`);
    }
  }
  return { findings, roundTrip };
}

const args = process.argv.slice(2);
const adapterPath = args.find((a) => !a.startsWith("--"));
const asJson = args.includes("--json");
const verbose = args.includes("--verbose");
if (!adapterPath) {
  console.error("usage: node check.mjs <adapter.mjs> [--json] [--verbose]");
  process.exit(2);
}
const adapter = await import(pathToFileURL(resolve(adapterPath)).href);

const results = [];
for (const c of CASES) {
  let html;
  try {
    html = await adapter.render(c.ctx, c.payload);
  } catch (e) {
    results.push({ ...c, verdict: c.benign ? "broken" : "rejected", detail: `threw: ${String(e.message ?? e).slice(0, 160)}` });
    continue;
  }
  if (html && typeof html === "object" && "unsupported" in html) {
    results.push({ ...c, verdict: "unsupported", detail: html.unsupported });
    continue;
  }
  const { findings, roundTrip } = judge(c, html);
  let verdict;
  if (findings.some((f) => f.cls === "xss")) verdict = "escape:xss";
  else if (findings.some((f) => f.cls === "css")) verdict = "escape:css";
  else if (c.benign && !roundTrip) verdict = "broken";
  else if (findings.length) verdict = "legacy";
  else verdict = "safe";
  results.push({ ...c, verdict, roundTrip, detail: findings.map((f) => `[${f.cls}] ${f.msg}`).join("; "), html: verbose || verdict !== "safe" ? html : undefined });
}

const FIELDS = ["hostile", "xss", "css", "legacy", "rejected", "safe", "benign", "broken", "unsupported"];
const byCtx = {};
for (const r of results) {
  const k = (byCtx[r.ctx] ??= Object.fromEntries([["ctx", r.ctx], ...FIELDS.map((f) => [f, 0])]));
  if (r.verdict === "unsupported") { k.unsupported++; continue; }
  if (r.benign) {
    k.benign++;
    if (r.verdict !== "safe") k.broken++;
    continue;
  }
  k.hostile++;
  if (r.verdict === "escape:xss") k.xss++;
  else if (r.verdict === "escape:css") k.css++;
  else k[r.verdict]++;
}
const total = Object.values(byCtx).reduce((t, k) => {
  for (const f of FIELDS) t[f] += k[f];
  return t;
}, Object.fromEntries([["ctx", "TOTAL"], ...FIELDS.map((f) => [f, 0])]));
const k3Escapes = total.xss + total.css;

if (asJson) {
  console.log(JSON.stringify({ adapter: adapter.name, k3Escapes, contexts: CONTEXTS, summary: [...Object.values(byCtx), total], results }, null, 2));
} else {
  console.log(`adapter: ${adapter.name}  cases: ${CASES.length}  K3 escapes (xss+css): ${k3Escapes}`);
  console.table([...Object.values(byCtx), total]);
  for (const r of results.filter((x) => x.verdict !== "safe" && x.verdict !== "rejected")) {
    console.log(`${r.verdict.toUpperCase().padEnd(11)} ${r.id}  payload=${JSON.stringify(r.payload)}`);
    if (r.detail) console.log(`            ${r.detail}`);
    if (r.html !== undefined) console.log(`            html: ${JSON.stringify(r.html).slice(0, 220)}`);
  }
}
process.exitCode = k3Escapes > 0 ? 1 : 0;
