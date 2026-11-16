// HX-8 lean-tags, flash: A delete swaps only the list region, so the flash keeps the last message and never says what happened.
import { Layout, ProjectRows, button, entries, handlers, p, projects, render, wire } from "../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => {
  const r = await app("remove", { input: { id: 1 } });
  return [
    render(Layout({ title: "Projects" }, p({ id: "flash" }, "Project created."), ProjectRows({ items: [] }),
      button(wire({ post: "/projects/1/delete", target: "#project-list" }), "Delete"), // ✗
    )),
    // serve() answers a redirect to an htmx request with HX-Redirect, a full navigation (lean-tags dist/index.js, serve).
    { ...r, navigates: r.location !== undefined },
  ];
};
