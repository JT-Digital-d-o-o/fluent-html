// HX-8 cbc under the house rule, flash: the delete answers the page into #main, with the flash inside it.
import { Layout, ProjectRows, button, entries, handlers, p, projects, render } from "../../../arms/cbc/app.ts";
const Screen = (flash: string) => Layout({ title: "Projects" }, p({ id: "flash" }, flash), ProjectRows({ items: [] }),
  button(projects.remove({ id: 1 }), "Delete"));
const app = handlers(projects, { ...entries, list: () => Screen("Apollo deleted.") });
export default async () => [render(Screen("Project created.")), await app("list", { input: {} })];
