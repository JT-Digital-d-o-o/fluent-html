// HX-8 lean-tags under the house rule, flash: the delete posts from button(action); serve() turns its redirect into HX-Redirect.
import { Layout, ProjectRows, button, entries, handlers, p, projects, render } from "../../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => {
  const r = await app("remove", { input: { id: 1 } });
  return [render(Layout({ title: "Projects" }, p({ id: "flash" }, "Project created."), ProjectRows({ items: [] }), button(projects.remove({ id: 1 }), "Delete"))),
    { ...r, navigates: r.location !== undefined }];
};
