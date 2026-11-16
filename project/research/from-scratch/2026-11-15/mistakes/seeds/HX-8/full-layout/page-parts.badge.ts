// HX-8 page-parts under the house rule, badge: the action answers redirect(page), which the kit sends as HX-Location into #main-content.
import { Li, Link, Nav, Page, Span, Ul, page, redirect, serve, htmx } from "../../../arms/page-parts/app.ts";
const names = ["Apollo", "Borealis"];
export const seed = page("/seed", { load: () => names });
const rows = seed.region("rows", { load: () => names });
const remove = seed.action("remove", { run: () => { names.shift(); return redirect(seed); } });
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
seed.view(({ data }) => Page({ title: "Seed" }, Nav(Link({ to: seed }, "Projects", Span({ id: "nav-badge" }, String(data.length)))),
  rows.show(), remove.button({}, "Delete Apollo")));
export default async () => {
  const before = await serve({ seed }, "/seed");
  const loc = JSON.parse((await serve({ seed }, "/seed?/remove", { method: "POST", headers: htmx() })).headers["hx-location"] ?? "{}");
  return [before, { ...(await serve({ seed }, loc.path, { headers: htmx() })), target: loc.target }];
};
