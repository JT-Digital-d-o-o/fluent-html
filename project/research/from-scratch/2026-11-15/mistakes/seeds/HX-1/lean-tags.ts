// HX-1 lean-tags: A request to the status fragment route is aimed at the list region.
import { Layout, ProjectRows, button, entries, handlers, projects, render, wire } from "../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => [
  render(Layout({ title: "Projects" }, ProjectRows({ items: [] }),
    button(wire({ get: "/projects/1/status", target: "#project-list" }), "Refresh"), // ✗
  )),
  await app("status", { input: { id: 1 } }),
];
