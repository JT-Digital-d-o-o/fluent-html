// Backtick Tags through its idiomatic API per context. raw(trusted`…`) is never used: it is
// the declared bypass and takes no string.
import { div, textarea, title, input, a, img, iframe, form, button, cls, style, css, json, jsVar, wire } from "../bt.ts";

export const name = "backtick-tags";
const r = (h) => h.h;

export function render(ctx, p) {
  switch (ctx) {
    case "text": return r(div(p));
    case "rcdata-textarea": return r(textarea(p));
    case "rcdata-title": return r(title(p));
    case "attr-title": return r(div({ title: p }));
    case "attr-data": return r(div({ "data-note": p }));
    case "attr-id": return r(div({ id: p }));
    case "attr-class": return r(div`${cls.token(p)}`());
    case "attr-input-value": return r(input({ value: p }));
    case "attr-name": return r(div({ data: { [p.key]: p.value } }));
    case "url-href": return r(a({ href: p }, "link"));
    case "url-img-src": return r(img({ src: p, alt: "x" }));
    case "url-iframe-src": return r(iframe({ src: p }));
    case "url-form-action": return r(form({ action: p, method: "post" }));
    case "url-formaction": return r(button({ type: "submit", formaction: p }, "Go"));
    case "style-value": return r(div({ style: { color: p } }));
    case "style-element": return r(style(css`.x{color: ${p}}`));
    case "json-script": return r(json({ v: p }));
    case "js-script-var": return r(jsVar("__DATA", { v: p }));
    case "htmx-get": return r(button(wire({ get: p }), "Load"));
    case "htmx-confirm": return r(button(wire({ post: "/items/1", confirm: p }), "Delete"));
    case "htmx-vals": return r(button(wire({ post: "/items", vals: { q: p } }), "Save"));
    case "htmx-headers": return r(button(wire({ post: "/items", headers: { "X-Note": p } }), "Save"));
    case "iframe-srcdoc": return r(iframe({ srcdoc: p }));
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
