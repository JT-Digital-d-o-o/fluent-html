// Page Parts against the from-scratch XSS fixture set (K3): each context through the kit's idiomatic API
// for that sink, all public exports. Raw()/trustedHtml is never used: it is the declared bypass and takes
// a source literal only. Run: node ../fixtures/xss/check.mjs xss/adapter.mjs
import {
  Div, A, Img, Button, Input, Textarea, Iframe, Form, external, local, hx, JsonData, ScriptData, CssRule, Sandbox,
  page, Page, app,
} from "../kit/index.ts";

export const name = "page-parts";

// A page's title is the only <title> sink: render a real document through app() and cut the element out.
async function title(p) {
  const doc = page("/t");
  doc.view(() => Page({ title: p }));
  const res = await app({ doc }).handle({ method: "GET", url: "/t" });
  const start = res.body.indexOf("<title>");
  return res.body.slice(start, res.body.indexOf("</title>", start) + "</title>".length);
}

export async function render(ctx, p) {
  switch (ctx) {
    case "text": return Div(p).html;
    case "rcdata-textarea": return Textarea(p).html;
    case "rcdata-title": return title(p);
    case "attr-title": return Div({ title: p }).html;
    case "attr-data": return Div({ data: { note: p } }).html;
    case "attr-id": return Div({ id: p }).html;
    case "attr-class": return Div({ class: p }).html;
    case "attr-input-value": return Input({ value: p }).html;
    case "attr-name": return Div({ data: { [p.key]: p.value } }).html;
    case "url-href": return A({ href: external(p) }, "link").html;
    case "url-img-src": return Img({ src: external(p), alt: "x" }).html;
    case "url-iframe-src": return Iframe({ src: external(p), title: "x" }).html;
    case "url-form-action": return Form({ action: external(p), method: "post" }).html;
    case "url-formaction": return Button({ type: "submit", formaction: external(p) }, "Go").html;
    case "style-value": return Div({ style: { color: p } }).html;
    case "style-element": return CssRule(".x", { color: p }).html;
    case "json-script": return JsonData("data", { v: p }).html;
    case "js-script-var": return ScriptData("__DATA", { v: p }).html;
    case "htmx-get": return Button({ wire: hx({ get: local(p) }) }, "Load").html;
    case "htmx-confirm": return { unsupported: "no hx-confirm sink: an action's confirm is a native <dialog> whose title and body are text (covered by the part-sink test)" };
    case "htmx-vals": return Button({ wire: hx({ post: local("/items"), vals: { q: p } }) }, "Save").html;
    case "htmx-headers": return Button({ wire: hx({ post: local("/items"), headers: { "X-Note": p } }) }, "Save").html;
    case "iframe-srcdoc": return Sandbox({ html: p, title: "Preview" }).html;
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
