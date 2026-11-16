// HX-8 lean-tags, search: A live search swaps only the list region, so the result count above it goes stale.
import { Layout, ProjectRows, entries, handlers, input, label, projects, render, span } from "../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => [
  render(Layout({ title: "Projects" }, span({ id: "project-count" }, "2 projects"),
    label("Search", input({ type: "search" }, projects.rows().search("q"))), // ✗
    ProjectRows({ items: [] }),
  )),
  await app("rows", { input: { q: "apo" } }),
];
