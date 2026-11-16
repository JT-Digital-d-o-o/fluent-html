// HX-8 page-parts, search: A live search swaps only the list region, so the result count above it goes stale.
import { Li, Page, Search, Span, Type, Ul, page, serve, htmx } from "../../arms/page-parts/app.ts";
const names = ["Apollo", "Borealis"];
const match = (q?: string) => names.filter((x) => !q || x.toLowerCase().includes(q.toLowerCase()));
export const seed = page("/seed", { query: { q: Type.Optional(Type.String()) }, load: ({ query }) => match(query.q) });
const rows = seed.region("rows", { load: ({ query }) => match(query.q) });
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
seed.view(({ data }) => Page({ title: "Seed" }, Span({ id: "project-count" }, `${data.length} projects`),
  Search({ into: rows, name: "q", label: "Search" }), // ✗
  rows.show()));
export default async () => [await serve({ seed }, "/seed"), await serve({ seed }, "/seed?q=apo", { headers: htmx("div#seed-rows") })];
