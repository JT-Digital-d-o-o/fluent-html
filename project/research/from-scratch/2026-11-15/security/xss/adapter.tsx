// Sealed Sinks through its idiomatic API per context. No bypass is used: there is none
// that takes a string.
import { render as r, json, js, css, fire, swap, localUrl, defineRoutes, defineIds } from "sealed";

export const name = "sealed-sinks";

const ids = defineIds(["result"] as const);
const items = defineRoutes("/items", {
  save: { method: "post", path: "/", render: "none" },
  remove: { method: "post", path: "/:id", params: { id: "number" }, render: "none" },
});
const NONCE = { nonce: "dGVzdG5vbmNl" };

export function render(ctx: string, p: any): string | { unsupported: string } {
  switch (ctx) {
    case "text": return r(<div>{p}</div>);
    case "rcdata-textarea": return r(<textarea>{p}</textarea>);
    case "rcdata-title": return r(<title>{p}</title>);
    case "attr-title": return r(<div title={p}></div>);
    case "attr-data": return r(<div data-note={p}></div>);
    case "attr-id": return r(<div id={p}></div>);
    case "attr-class": return r(<div class={p}></div>);
    case "attr-input-value": return r(<input value={p} />);
    case "attr-name": return r(<div {...{ [`data-${p.key}`]: p.value }}></div>);
    case "url-href": return r(<a href={p}>link</a>);
    case "url-img-src": return r(<img src={p} alt="x" />);
    case "url-iframe-src": return r(<iframe src={p} />);
    case "url-form-action": return r(<form action={p} method="post"></form>);
    case "url-formaction": return r(<button type="submit" formaction={p}>Go</button>);
    case "style-value": return r(<div style={{ color: p }}></div>);
    case "style-element": return r(<style>{css`.x{color: ${p}}`}</style>, NONCE);
    case "json-script": return r(<script>{json({ v: p })}</script>);
    case "js-script-var": return r(<script>{js`window.__DATA = ${{ v: p }}`}</script>, NONCE);
    case "htmx-get": {
      const route = localUrl(p, { region: ids.result });
      return r(<button hx={route ? swap(route as never) : undefined}>Load</button>);
    }
    case "htmx-confirm": return r(<button hx={fire(items.remove({ id: 1 }), { confirm: p })}>Delete</button>);
    case "htmx-vals": return r(<button hx={fire(items.save(), { vals: { q: p } })}>Save</button>);
    case "htmx-headers": return r(<button hx={fire(items.save(), { headers: { "X-Note": p } })}>Save</button>);
    case "iframe-srcdoc": return r(<iframe srcdoc={p} />);
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
