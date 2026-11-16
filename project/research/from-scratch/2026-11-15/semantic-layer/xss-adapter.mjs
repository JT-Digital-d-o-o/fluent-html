// The semantic kit against the from-scratch XSS fixture set (K3).
// Each context goes through the kit's idiomatic API for that sink. Raw()/trustedHtml is never
// used: it is the declared bypass, and it takes a source literal only.
import { Div, A, Img, Button, external, local, hx, JsonData, ScriptData, CssRule, Sandbox } from "./kit/index.ts";
import { View, attrs, esc } from "./kit/core.ts";

export const name = "semantic-kit";

// Elements the prototype's public surface does not carry yet, built on the kit's own attribute
// serializer (the same code path Div/A/Button use), so the escaping measured is the kit's.
const raw = (tag, a, text = "", isVoid = false) => new View("<" + tag + attrs(a) + ">" + (isVoid ? "" : esc(text) + "</" + tag + ">"));

export function render(ctx, p) {
  switch (ctx) {
    case "text": return Div(p).html;
    case "rcdata-textarea": return raw("textarea", {}, p).html;
    case "rcdata-title": return raw("title", {}, p).html;
    case "attr-title": return Div({ title: p }).html;
    case "attr-data": return Div({ data: { note: p } }).html;
    case "attr-id": return Div({ id: p }).html;
    case "attr-class": return Div({ class: p }).html;
    case "attr-input-value": return raw("input", { value: p }, "", true).html;
    case "attr-name": return Div({ data: { [p.key]: p.value } }).html;
    case "url-href": return A({ href: external(p) }, "link").html;
    case "url-img-src": return Img({ src: external(p), alt: "x" }).html;
    case "url-iframe-src": return raw("iframe", { src: external(p) }).html;
    case "url-form-action": return raw("form", { action: external(p), method: "post" }).html;
    case "url-formaction": return raw("button", { type: "submit", formaction: external(p) }, "Go").html;
    case "style-value": return Div({ style: { color: p } }).html;
    case "style-element": return CssRule(".x", { color: p }).html;
    case "json-script": return JsonData("data", { v: p }).html;
    case "js-script-var": return ScriptData("__DATA", { v: p }).html;
    case "htmx-get": return Button({ wire: hx({ get: local(p) }) }, "Load").html;
    case "htmx-confirm": return { unsupported: "no hx-confirm sink: an action's confirmation is a native <dialog>, and its text is the text context" };
    case "htmx-vals": return Button({ wire: hx({ post: local("/items"), vals: { q: p } }) }, "Save").html;
    case "htmx-headers": return Button({ wire: hx({ post: local("/items"), headers: { "X-Note": p } }) }, "Save").html;
    case "iframe-srcdoc": return Sandbox({ html: p, title: "Preview" }).html;
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
