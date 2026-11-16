// HX-8 lean-tags, badge: A delete swaps only the list region, so the nav badge with the project count goes stale.
import { ProjectRows, a, button, doc, entries, handlers, header, main, nav, projects, render, span, wire } from "../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => {
  const r = await app("remove", { input: { id: 1 } });
  return [
    render(doc({ title: "Projects" }, header(nav(a(projects.list(), "Projects", span({ id: "nav-badge" }, "2")))),
      main({ id: "main" }, ProjectRows({ items: [] }),
        button(wire({ post: "/projects/1/delete", target: "#project-list" }), "Delete"), // ✗
      ))),
    // serve() answers a redirect to an htmx request with HX-Redirect, a full navigation (lean-tags dist/index.js, serve).
    { ...r, navigates: r.location !== undefined },
  ];
};
