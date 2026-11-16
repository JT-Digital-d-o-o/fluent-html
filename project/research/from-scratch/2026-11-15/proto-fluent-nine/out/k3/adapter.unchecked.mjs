// fluent-html 9 (prototype) on the XSS fixture set, through the package's public API only, each
// context written the way fluent-html 9's reference says to write it. The same calls as the
// fluent-html 8 adapter except where 9 replaced the sink (setStyles, Style(css``), JsonScript,
// Script(js``), SubmitButton).
//   node ../fixtures/xss/check.mjs xss/adapter.mjs
import {
  render as r, Div, Textarea, Title, Input, A, Img, Iframe, Form, Button, SubmitButton, hx,
  Style, css, Script, js, JsonScript,
} from "/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/proto-fluent-nine/pkg/dist/index.js";
import { assetUrl, externalUrl } from "/Users/tony/jt-digital/fluent-html/project/research/from-scratch/2026-11-15/proto-fluent-nine/pkg/dist/htmx.js";

export const name = "fluent-html-9 (prototype)";

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
    case "url-formaction": return r(SubmitButton("Go").setFormaction(p));
    case "style-value": return r(Div()._attr("style", `color: ${p}`));
    case "style-element": return r(Style(`.x{color: ${p}}`));
    case "json-script": return r(JsonScript({ v: p }));
    case "js-script-var": return r(Script(js`window.__DATA = ${{ v: p }}`));
    case "htmx-get": return r(Button("Load").hxGet(externalUrl(p)));
    case "htmx-confirm": return r(Button("Delete").setHtmx(hx(assetUrl("/items/1"), { method: "post", confirm: p })));
    case "htmx-vals": return r(Button("Save").hxPost(assetUrl("/items"), { vals: { q: p } }));
    case "htmx-headers": return r(Button("Save").hxPost(assetUrl("/items"), { headers: { "X-Note": p } }));
    case "iframe-srcdoc": return r(Iframe()._attr("srcdoc", p));
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
