// HX-8 cbc, badge: A delete swaps only the list region, so the nav badge with the project count goes stale.
import { ProjectRows, a, button, doc, entries, handlers, header, nav, projects, render, span, wire } from "../../arms/cbc/app.ts";
// doc() is the only way to a header, and it puts the header outside <main id="main">.
const Screen = (n: number) => doc({ title: "Projects", header: header(nav(a(projects.list(), "Projects", span({ id: "nav-badge" }, String(n))))) },
  ProjectRows({ items: [] }),
  button(wire({ post: projects.remove({ id: 1 }), target: projects.rows() }), "Delete"), // ✗
);
const app = handlers(projects, { ...entries, list: () => Screen(1) });
export default async () => [render(Screen(2)), await app("list", { input: {} })];
