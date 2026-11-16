// HX-8 cbc under the house rule, badge: the delete answers the page into #main, and the header doc() writes sits outside it.
import { ProjectRows, a, button, doc, entries, handlers, header, nav, projects, render, span } from "../../../arms/cbc/app.ts";
const Screen = (n: number) => doc({ title: "Projects", header: header(nav(a(projects.list(), "Projects", span({ id: "nav-badge" }, String(n))))) },
  ProjectRows({ items: [] }), button(projects.remove({ id: 1 }), "Delete"));
const app = handlers(projects, { ...entries, list: () => Screen(1) });
export default async () => [render(Screen(2)), await app("list", { input: {} })];
