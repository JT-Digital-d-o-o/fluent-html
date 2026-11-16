// HX-8 lean-tags under the house rule, badge: the delete posts from button(action); serve() turns its redirect into HX-Redirect.
import { ProjectRows, a, button, doc, entries, handlers, header, main, nav, projects, render, span } from "../../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => {
  const r = await app("remove", { input: { id: 1 } });
  return [render(doc({ title: "Projects" }, header(nav(a(projects.list(), "Projects", span({ id: "nav-badge" }, "2")))),
    main({ id: "main" }, ProjectRows({ items: [] }), button(projects.remove({ id: 1 }), "Delete")))),
    { ...r, navigates: r.location !== undefined }];
};
