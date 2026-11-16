// fluent-html 8 through its idiomatic API per context: typed setters where they exist,
// the documented runtime-value paths otherwise (externalUrl for a runtime URL, setStyle
// for a runtime style value, Script(JSON.stringify(...)) for embedded data). Raw() is
// never used: it is the declared bypass. Entry overridable with FH8_ENTRY.
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const entry = process.env.FH8_ENTRY ?? resolve(here, "../../../../../../../dist/src/index.js");
const fh = await import(pathToFileURL(entry).href);
const {
  render: r, Div, Textarea, Title, Input, A, Img, Iframe, Form, Button, Style, Script,
  hx, externalUrl, assetUrl,
} = fh;

export const name = "fluent-html-8";

export function render(ctx, p) {
  switch (ctx) {
    case "text": return r(Div(p));
    case "rcdata-textarea": return r(Textarea(p));
    case "rcdata-title": return r(Title(p));
    case "attr-title": return r(Div().setTitle(p));
    case "attr-data": return r(Div().setDataAttrs({ note: p }));
    case "attr-id": return r(Div().setId(p));
    case "attr-class": return r(Div().cssClass(p));
    case "attr-input-value": return r(Input().setValue(p));
    case "attr-name": return r(Div().setDataAttrs({ [p.key]: p.value }));
    case "url-href": return r(A("link").setHref(externalUrl(p)));
    case "url-img-src": return r(Img().setSrc(p).setAlt("x"));
    case "url-iframe-src": return r(Iframe().setSrc(p));
    case "url-form-action": return r(Form().setAction(p).setMethod("post"));
    case "url-formaction": return r(Button("Go").setType("submit").setFormaction(p));
    case "style-value": return r(Div().setStyle(`color: ${p}`));
    case "style-element": return r(Style(`.x{color: ${p}}`));
    case "json-script": return r(Script(JSON.stringify({ v: p })).setType("application/json"));
    case "js-script-var": return r(Script(`window.__DATA = ${JSON.stringify({ v: p })}`));
    case "htmx-get": return r(Button("Load").hxGet(externalUrl(p)));
    case "htmx-confirm": return r(Button("Delete").setHtmx(hx(assetUrl("/items/1"), { method: "post", confirm: p })));
    case "htmx-vals": return r(Button("Save").hxPost(assetUrl("/items"), { vals: { q: p } }));
    case "htmx-headers": return r(Button("Save").hxPost(assetUrl("/items"), { headers: { "X-Note": p } }));
    case "iframe-srcdoc": return r(Iframe().setSrcdoc(p));
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
