// The clean control: the arm's app rendered through every entry the seeds use. Every rung must be green.
import { a, asset, ProjectRows, div, entries, handlers, img, label, input, li, projects, render, cls, hover, ul, Layout } from "./app.ts";

const app = handlers(projects, entries);
export default async () => [
  render(Layout({ title: "Clean" },
    ul(li(a(projects.detail({ id: 1 }), "Open"))),
    label("Search", input({ type: "search" }, projects.rows().search("q"))),
    img({ src: asset("/logo.png"), alt: "Logo" }), ProjectRows({ items: [] }),
    div(cls("p-4 bg-surface-2", hover("bg-primary")), "ok"),
  )),
  await app("list", { input: {} }),
  await app("new"),
  await app("detail", { input: { id: 1 } }),
  await app("status", { input: { id: 1 } }),
  await app("create", { body: { name: "" } }),
];
