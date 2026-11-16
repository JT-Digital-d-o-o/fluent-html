// HX-8 cbc, counter: A delete swaps only the list region, so the project count elsewhere on the page goes stale.
import { Layout, ProjectRows, button, entries, handlers, projects, render, span, wire } from "../../arms/cbc/app.ts";
const Screen = (n: number) => Layout({ title: "Projects" }, span({ id: "project-count" }, `${n} projects`), ProjectRows({ items: [] }),
  button(wire({ post: projects.remove({ id: 1 }), target: projects.rows() }), "Delete"), // ✗
);
const app = handlers(projects, { ...entries, list: () => Screen(1) });
// The action answers 303 to the list page (entries.remove); htmx's fetch follows it and swaps that page into #project-list.
export default async () => [render(Screen(2)), await app("list", { input: {} })];
