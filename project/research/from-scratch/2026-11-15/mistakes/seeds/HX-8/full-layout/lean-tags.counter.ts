// HX-8 lean-tags under the house rule, counter: the delete posts from button(action); serve() turns its redirect into HX-Redirect.
import { Layout, ProjectRows, button, entries, handlers, projects, render, span } from "../../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => {
  const r = await app("remove", { input: { id: 1 } });
  return [render(Layout({ title: "Projects" }, span({ id: "project-count" }, "2 projects"), ProjectRows({ items: [] }), button(projects.remove({ id: 1 }), "Delete"))),
    { ...r, navigates: r.location !== undefined }];
};
