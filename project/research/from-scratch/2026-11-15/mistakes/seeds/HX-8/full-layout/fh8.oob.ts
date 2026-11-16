// HX-8 fh8, the opt-in done right: the delete keeps its targeted swap and sends the count as a Partial beside the list.
import { Button, Layout, Partial, ProjectList, Span, defineRoutes, html, ids, renderView } from "../../../arms/fh8/app.ts";
const routes = defineRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const, render: ids.projectList },
} as const);
const Count = (n: number) => Span(`${n} projects`).setId(ids.projectCount);
export default () => [
  html(Layout("Projects", Count(2), ProjectList(["Apollo", "Borealis"]),
    Button("Delete Apollo").setType("button").fragment(ids.projectList, routes.remove({ id: 7 })))),
  renderView(200, [ProjectList(["Borealis"]), Partial(ids.projectCount, Count(1))]),
];
