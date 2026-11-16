// HX-8 cbc under the house rule, counter: the delete posts from button(action), which carries the #main wire; the 303 is followed to the page.
import { Layout, ProjectRows, button, entries, handlers, projects, render, span } from "../../../arms/cbc/app.ts";
const Screen = (n: number) => Layout({ title: "Projects" }, span({ id: "project-count" }, `${n} projects`), ProjectRows({ items: [] }),
  button(projects.remove({ id: 1 }), "Delete"));
const app = handlers(projects, { ...entries, list: () => Screen(1) });
export default async () => [render(Screen(2)), await app("list", { input: {} })];
