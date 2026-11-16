// HX-8 cbc: A delete swaps only the list region, so the project count elsewhere on the page goes stale.
import { Layout, ProjectRows, button, entries, handlers, projects, render, span, wire } from "../../arms/cbc/app.ts";
const app = handlers(projects, entries);
export default async () => [
  render(Layout({ title: "Projects" }, span({ id: "project-count" }, "2 projects"), ProjectRows({ items: [] }),
    button(wire({ post: projects.remove({ id: 1 }), target: projects.rows() }), "Delete"), // ✗
  )),
  // The library ships no server: the 303 reaches htmx, which follows it and swaps the page into #project-list.
  { ...(await app("remove", { input: { id: 1 } })), navigates: false },
];
