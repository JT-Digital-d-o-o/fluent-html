// HX-8 page-parts, the opt-in done right: the count is a region too, and the action refreshes both.
import { Li, Page, Span, Ul, page, refresh, serve, htmx } from "../../../arms/page-parts/app.ts";
const names = ["Apollo", "Borealis"];
export const seed = page("/seed", { load: () => names });
const rows = seed.region("rows", { load: () => names });
const count = seed.region("count", { load: () => names.length });
const remove = seed.action("remove", { run: () => { names.shift(); return refresh(rows, count); } });
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
count.view(({ data }) => Span(`${data} projects`));
seed.view(() => Page({ title: "Seed" }, count.show(), rows.show(), remove.button({}, "Delete Apollo")));
export default async () => [await serve({ seed }, "/seed"), await serve({ seed }, "/seed?/remove", { method: "POST", headers: htmx() })];
