// rtsx through its idiomatic API per context. unsafeHtml() is never used: it is the
// declared bypass. Where a context takes a runtime URL into an hx-* attribute, the
// documented door is localUrl(); for a link target from data it is url().
import { css, js, json, localUrl, render as r, url, defineRoutes } from "rtsx";

export const name = "route-typed-tsx";
const items = defineRoutes("/items", { create: { method: "post", path: "/" }, remove: { method: "post", path: "/:id" } });

export function render(ctx: string, p: any): string | { unsupported: string } {
  switch (ctx) {
    case "text": return r(<div>{p}</div>);
    case "rcdata-textarea": return r(<textarea>{p}</textarea>);
    case "rcdata-title": return r(<title>{p}</title>);
    case "attr-title": return r(<div title={p} />);
    case "attr-data": return r(<div data-note={p} />);
    case "attr-id": return r(<div id={p} />);
    case "attr-class": return r(<div class={p} />);
    case "attr-input-value": return r(<input value={p} />);
    case "attr-name": return r(<div dataset={{ [p.key]: p.value }} />);
    case "url-href": return r(<a href={url(p)}>link</a>);
    case "url-img-src": return r(<img src={p} alt="x" />);
    case "url-iframe-src": return r(<iframe src={p} />);
    case "url-form-action": return r(<form action={p} method="post" />);
    case "url-formaction": return r(<button type="submit" formaction={p}>Go</button>);
    case "style-value": return r(<div style={{ color: p }} />);
    case "style-element": return r(<style>{css`.x{color: ${p}}`}</style>);
    case "json-script": return r(<script type="application/json">{json({ v: p })}</script>);
    case "js-script-var": return r(<script>{js`window.__DATA = ${{ v: p }}`}</script>);
    case "htmx-get": return r(<button hx-get={localUrl(p)}>Load</button>);
    case "htmx-confirm": return r(<button hx-post={items.remove({ id: 1 })} hx-confirm={p}>Delete</button>);
    case "htmx-vals": return r(<button hx-post={items.create()} hx-vals={{ q: p }}>Save</button>);
    case "htmx-headers": return r(<button hx-post={items.create()} hx-headers={{ "X-Note": p }}>Save</button>);
    case "iframe-srcdoc": return r(<iframe srcdoc={p} />);
    default: return { unsupported: `no mapping for ${ctx}` };
  }
}
