// HX-8 page-parts: A delete swaps only the list region, so the project count elsewhere on the page goes stale.
import { Li, Page, Span, Ul, page, refresh, serve, htmx } from "../../arms/page-parts/app.ts";
const names = ["Apollo", "Borealis"];
export const seed = page("/seed", { load: () => names });
const rows = seed.region("rows", { load: () => names });
const remove = seed.action("remove", { run: () => { names.shift(); return refresh(rows); } }); // ✗
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
seed.view(({ data }) => Page({ title: "Seed" }, Span({ id: "project-count" }, `${data.length} projects`), rows.show(), remove.button({}, "Delete Apollo")));
export default async () => [await serve({ seed }, "/seed"), await serve({ seed }, "/seed?/remove", { method: "POST", headers: htmx() })];
