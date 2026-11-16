// Strict Tags through its idiomatic API per context. raw(trusted`…`) is never used: it is the
// declared bypass and takes no string. Each sink gets the value the way a typed app would pass it:
// url() for a URL from data, cls.token() for a class from data, local() for a path from data.
import { div, textarea, input, a, img, iframe, form, button, cls, style, css, json, jsVar, wire, url, local, routes, action, doc } from "../lib/index.ts";

export const name = "strict-tags";
const r = (h) => h.h;
const items = routes("/items", { save: action("/"), remove: action("/:id") });
// <title> belongs to doc({ title }): the element is cut out of the document doc() writes.
const title = (p) => {
  const h = doc({ title: p }).h;
  return h.slice(h.indexOf("<title>"), h.indexOf("</title>") + 8);
};

export function render(ctx, p) {
  switch (ctx) {
    case "text": return r(div(p));
    case "rcdata-textarea": return r(textarea({ "aria-label": "x" }, p));
    case "rcdata-title": return title(p);
    case "attr-title": return r(div({ title: p }));
    case "attr-data": return r(div({ "data-note": p }));
    case "attr-id": return r(div({ id: p }));
    case "attr-class": return r(div(cls.token(p)));
    case "attr-input-value": return r(input({ value: p, "aria-label": "x" }));
    case "attr-name": return r(div({ data: { [p.key]: p.value } }));
    case "url-href": return r(a({ href: url(p) }, "link"));
    case "url-img-src": return r(img({ src: url(p), alt: "x" }));
    case "url-iframe-src": return r(iframe({ src: url(p), title: "x" }));
    case "url-form-action": return r(form({ action: url(p), method: "post" }));
    case "url-formaction": return r(button({ type: "submit", formaction: url(p) }, "Go"));
    case "style-value": return r(div({ style: { color: p } }));
    case "style-element": return r(style(css`.x{color: ${p}}`));
    case "json-script": return r(json({ v: p }));
    case "js-script-var": return r(jsVar("__DATA", { v: p }));
    case "htmx-get": return r(button(wire({ get: local(p) }), "Load"));
    case "htmx-confirm": return r(button(wire({ post: items.remove({ id: 1 }), confirm: p }), "Delete"));
    case "htmx-vals": return r(button(wire({ post: items.save(), vals: { q: p } }), "Save"));
    case "htmx-headers": return r(button(wire({ post: items.save(), headers: { "X-Note": p } }), "Save"));
    case "iframe-srcdoc": return r(iframe({ srcdoc: p, title: "x" }));
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
