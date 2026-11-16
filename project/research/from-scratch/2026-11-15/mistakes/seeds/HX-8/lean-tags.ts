// HX-8 lean-tags: A delete swaps only the list region, so the project count elsewhere on the page goes stale.
import { Layout, ProjectRows, button, entries, handlers, projects, render, span, wire } from "../../arms/lean-tags/app.ts";
const app = handlers(projects, entries);
export default async () => [
  render(Layout({ title: "Projects" }, span({ id: "project-count" }, "2 projects"), ProjectRows({ items: [] }),
    button(wire({ post: "/projects/1/delete", target: "#project-list" }), "Delete"), // ✗
  )),
  // serve() answers a redirect to an htmx request with HX-Redirect, a full navigation (lean-tags dist/index.js, serve).
  { ...(await app("remove", { input: { id: 1 } })), navigates: true },
];
