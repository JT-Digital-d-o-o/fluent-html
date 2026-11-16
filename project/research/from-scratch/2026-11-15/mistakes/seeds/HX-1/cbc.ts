// HX-1 cbc: A request to the status fragment route is aimed at the list region.
import { Layout, ProjectRows, button, entries, handlers, projects, render, wire } from "../../arms/cbc/app.ts";
const app = handlers(projects, entries);
export default async () => [
  render(Layout({ title: "Projects" }, ProjectRows({ items: [] }),
    button(wire({ get: projects.status({ id: 1 }), target: projects.rows() }), "Refresh"), // ✗
  )),
  await app("status", { input: { id: 1 } }),
];
