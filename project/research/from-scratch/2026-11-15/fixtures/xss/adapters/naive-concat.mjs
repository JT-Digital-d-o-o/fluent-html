// Calibration: string concatenation with no escaping at all. Every hostile case should be
// an escape or a mangle; if the checker calls one of these safe, the oracle is too weak.
export const name = "naive-concat (calibration)";

export function render(ctx, p) {
  const j = (o) => JSON.stringify(o);
  switch (ctx) {
    case "text": return `<div>${p}</div>`;
    case "rcdata-textarea": return `<textarea>${p}</textarea>`;
    case "rcdata-title": return `<title>${p}</title>`;
    case "attr-title": return `<div title="${p}"></div>`;
    case "attr-data": return `<div data-note="${p}"></div>`;
    case "attr-id": return `<div id="${p}"></div>`;
    case "attr-class": return `<div class="${p}"></div>`;
    case "attr-input-value": return `<input value="${p}">`;
    case "attr-name": return `<div data-${p.key}="${p.value}"></div>`;
    case "url-href": return `<a href="${p}">link</a>`;
    case "url-img-src": return `<img src="${p}" alt="x">`;
    case "url-iframe-src": return `<iframe src="${p}"></iframe>`;
    case "url-form-action": return `<form action="${p}" method="post"></form>`;
    case "url-formaction": return `<button type="submit" formaction="${p}">Go</button>`;
    case "style-value": return `<div style="color: ${p}"></div>`;
    case "style-element": return `<style>.x{color: ${p}}</style>`;
    case "json-script": return `<script type="application/json">${j({ v: p })}</script>`;
    case "js-script-var": return `<script>window.__DATA = ${j({ v: p })}</script>`;
    case "htmx-get": return `<button hx-get="${p}">Load</button>`;
    case "htmx-confirm": return `<button hx-post="/items/1" hx-confirm="${p}">Delete</button>`;
    case "htmx-vals": return `<button hx-post="/items" hx-vals='${j({ q: p })}'>Save</button>`;
    case "htmx-headers": return `<button hx-post="/items" hx-headers='${j({ "X-Note": p })}'>Save</button>`;
    case "iframe-srcdoc": return `<iframe srcdoc="${p}"></iframe>`;
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
