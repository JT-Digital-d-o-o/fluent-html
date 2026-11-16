// fluent-html 9 (prototype) on the XSS fixture set: fluent-html 8's sinks where they were already
// safe, the proto/fh9-safe.ts closers where they were not. Needs `tsc -p tsconfig.build.json` first.
//   NODE_ENV=production node ../fixtures/xss/check.mjs xss/fluent-html-9.mjs
import { render as r, Div, Textarea, Title, Input, A, Img, Iframe, Form, Button, hx } from "fluent-html";
import { assetUrl } from "fluent-html/htmx";
import {
  JsonScript, InlineScript, js, StyleSheet, css, styles, dataAttrs, externalUrl, confirmText, SandboxedFrame,
} from "../build/proto/fh9-safe.js";

export const name = "fluent-html-9 (prototype)";

export function render(ctx, p) {
  switch (ctx) {
    case "text": return r(Div(p));
    case "rcdata-textarea": return r(Textarea(p));
    case "rcdata-title": return r(Title(p));
    case "attr-title": return r(Div().setTitle(p));
    case "attr-data": return r(dataAttrs(Div(), { note: p }));
    case "attr-id": return r(Div().setId(p));
    case "attr-class": return r(Div().cssClass(p));
    case "attr-input-value": return r(Input().setValue(p));
    case "attr-name": return r(dataAttrs(Div(), { [p.key]: p.value }));
    case "url-href": return r(A("link").setHref(externalUrl(p)));
    case "url-img-src": return r(Img().setSrc(p).setAlt("x"));
    case "url-iframe-src": return r(Iframe().setSrc(p));
    case "url-form-action": return r(Form().setAction(p).setMethod("post"));
    case "url-formaction": return r(Button("Go").setType("submit").setFormaction(p));
    case "style-value": return r(styles(Div(), { color: p }));
    case "style-element": return r(StyleSheet(css`.x{color: ${p}}`));
    case "json-script": return r(JsonScript({ v: p }));
    case "js-script-var": return r(InlineScript(js`window.__DATA = ${{ v: p }}`));
    case "htmx-get": return r(Button("Load").hxGet(externalUrl(p)));
    case "htmx-confirm": return r(Button("Delete").setHtmx(hx(assetUrl("/items/1"), { method: "post", confirm: confirmText(p) })));
    case "htmx-vals": return r(Button("Save").hxPost(assetUrl("/items"), { vals: { q: p } }));
    case "htmx-headers": return r(Button("Save").hxPost(assetUrl("/items"), { headers: { "X-Note": p } }));
    case "iframe-srcdoc": return r(SandboxedFrame(p));
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
