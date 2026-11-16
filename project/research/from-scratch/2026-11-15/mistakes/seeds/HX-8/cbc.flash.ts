// HX-8 cbc, flash: A delete swaps only the list region, so the flash keeps the last message and never says what happened.
import { Layout, ProjectRows, button, entries, handlers, p, projects, render, wire } from "../../arms/cbc/app.ts";
const Screen = (flash: string) => Layout({ title: "Projects" }, p({ id: "flash" }, flash), ProjectRows({ items: [] }),
  button(wire({ post: projects.remove({ id: 1 }), target: projects.rows() }), "Delete"), // ✗
);
const app = handlers(projects, { ...entries, list: () => Screen("Apollo deleted.") });
export default async () => [render(Screen("Project created.")), await app("list", { input: {} })];
