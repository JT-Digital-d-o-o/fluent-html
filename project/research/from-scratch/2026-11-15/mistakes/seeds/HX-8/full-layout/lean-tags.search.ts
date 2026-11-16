// HX-8 lean-tags under the house rule, search: a GET form to the page, boosted by the document into #main (the search wire is part-only).
import { Layout, ProjectRows, button, entries, form, handlers, input, label, projects, render, span } from "../../../arms/lean-tags/app.ts";
const Screen = (n: number) => Layout({ title: "Projects" }, span({ id: "project-count" }, `${n} projects`),
  form(projects.list(), label("Search", input({ type: "search", name: "q" })), button({ type: "submit" }, "Search")), ProjectRows({ items: [] }));
const app = handlers(projects, { ...entries, list: () => Screen(1) });
export default async () => [render(Screen(2)), await app("list", { input: { q: "apo" } })];
