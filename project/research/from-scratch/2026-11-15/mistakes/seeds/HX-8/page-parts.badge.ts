// HX-8 page-parts, badge: A delete swaps only the list region, so the nav badge with the project count goes stale.
import { Li, Link, Nav, Page, Span, Ul, page, refresh, serve, htmx } from "../../arms/page-parts/app.ts";
const names = ["Apollo", "Borealis"];
export const seed = page("/seed", { load: () => names });
const rows = seed.region("rows", { load: () => names });
const remove = seed.action("remove", { run: () => { names.shift(); return refresh(rows); } }); // ✗
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
// Page() writes only <main>, so the nav and its badge sit inside it.
seed.view(({ data }) => Page({ title: "Seed" }, Nav(Link({ to: seed }, "Projects", Span({ id: "nav-badge" }, String(data.length)))),
  rows.show(), remove.button({}, "Delete Apollo")));
export default async () => [await serve({ seed }, "/seed"), await serve({ seed }, "/seed?/remove", { method: "POST", headers: htmx() })];
