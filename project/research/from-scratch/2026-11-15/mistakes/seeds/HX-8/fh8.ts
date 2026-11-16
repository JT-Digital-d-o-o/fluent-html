// HX-8 fh8: A delete swaps only the list region, so the project count elsewhere on the page goes stale.
import { Button, Layout, ProjectList, Span, defineRoutes, fragment, html, ids } from "../../arms/fh8/app.ts";
const routes = defineRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const, render: ids.projectList }, // ✗
} as const);
export default () => [
  html(Layout("Projects", Span("2 projects").setId(ids.projectCount), ProjectList(["Apollo", "Borealis"]),
    Button("Delete Apollo").setType("button").fragment(ids.projectList, routes.remove({ id: 7 })))),
  fragment(routes.remove, () => ProjectList(["Borealis"])),
];
