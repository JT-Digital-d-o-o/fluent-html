// HX-8 cbc, a documented opt-in that is the kind: ActionRef.fire() "posts with no swap (a counter, a like)", so nothing re-renders the count.
import { Layout, ProjectRows, button, entries, handlers, projects, render, span } from "../../../arms/cbc/app.ts";
const Screen = (n: number) => Layout({ title: "Projects" }, span({ id: "project-count" }, `${n} projects`), ProjectRows({ items: [] }),
  button(projects.remove({ id: 1 }).fire(), "Delete"));
const app = handlers(projects, { ...entries, list: () => Screen(1) });
export default async () => [render(Screen(2)), await app("list", { input: {} })];
