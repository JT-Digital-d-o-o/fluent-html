// Hoisted HTML through its idiomatic spelling per context: the payload goes into a hole at the
// place the context names. No helper is called except where the design has no hole for the
// position (an attribute name from data goes through attrs()). trustedHtml() is never used:
// it is the declared bypass.
import { html, attrs } from "../src/hh.ts";

export const name = "hoisted-html";

export function render(ctx, p) {
  switch (ctx) {
    case "text": return html`<div>${p}</div>`.s;
    case "rcdata-textarea": return html`<textarea>${p}</textarea>`.s;
    case "rcdata-title": return html`<title>${p}</title>`.s;
    case "attr-title": return html`<div title="${p}"></div>`.s;
    case "attr-data": return html`<div data-note="${p}"></div>`.s;
    case "attr-id": return html`<div id="${p}"></div>`.s;
    case "attr-class": return html`<div class="${p}"></div>`.s;
    case "attr-input-value": return html`<input value="${p}">`.s;
    case "attr-name": return html`<div ${attrs({ ["data-" + p.key]: p.value })}></div>`.s;
    case "url-href": return html`<a href="${p}">link</a>`.s;
    case "url-img-src": return html`<img src="${p}" alt="x">`.s;
    case "url-iframe-src": return html`<iframe src="${p}"></iframe>`.s;
    case "url-form-action": return html`<form action="${p}" method="post"></form>`.s;
    case "url-formaction": return html`<button type="submit" formaction="${p}">Go</button>`.s;
    case "style-value": return html`<div style="color: ${p}"></div>`.s;
    case "style-element": return html`<style>.x{color: ${p}}</style>`.s;
    case "json-script": return html`<script type="application/json">${{ v: p }}</script>`.s;
    case "js-script-var": return html`<script>window.__DATA = ${{ v: p }}</script>`.s;
    case "htmx-get": return html`<button type="button" hx-get="${p}">Load</button>`.s;
    case "htmx-confirm": return html`<button type="button" hx-post="/items/1" hx-confirm="${p}">Delete</button>`.s;
    case "htmx-vals": return html`<button type="button" hx-post="/items" hx-vals="${{ q: p }}">Save</button>`.s;
    case "htmx-headers": return html`<button type="button" hx-post="/items" hx-headers="${{ "X-Note": p }}">Save</button>`.s;
    case "iframe-srcdoc": return html`<iframe sandbox srcdoc="${p}"></iframe>`.s;
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
