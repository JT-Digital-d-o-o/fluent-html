// HX-8 page-parts under the house rule, search: Search() targets a region only, so the page-answering filter is a Link with a query into #main-content.
import { Li, Link, Page, Span, Type, Ul, page, serve, htmx } from "../../../arms/page-parts/app.ts";
const names = ["Apollo", "Borealis"];
const match = (q?: string) => names.filter((x) => !q || x.toLowerCase().includes(q.toLowerCase()));
export const seed = page("/seed", { query: { q: Type.Optional(Type.String()) }, load: ({ query }) => match(query.q) });
const rows = seed.region("rows", { load: ({ query }) => match(query.q) });
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
seed.view(({ data }) => Page({ title: "Seed" }, Span({ id: "project-count" }, `${data.length} projects`),
  Link({ to: seed, query: { q: "apo" } }, "Only Apollo"), rows.show()));
export default async () => [await serve({ seed }, "/seed"), await serve({ seed }, "/seed?q=apo", { headers: htmx() })];
