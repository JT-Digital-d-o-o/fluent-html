// HX-8 fluent-nine, flash: A delete swaps only the list region, so the flash keeps the last message and never says what happened.
import { Button, Layout, P, ProjectList, defineIds, defineRoutes, fragment, html, ids } from "../../arms/fluent-nine/app.ts";
const local = defineIds(["flash"] as const);
const routes = defineRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const, render: ids.projectList }, // ✗
} as const);
export default () => [
  html(Layout("Projects", P("Project created.").setId(local.flash), ProjectList(["Apollo", "Borealis"]),
    Button("Delete Apollo").setType("button").fragment(ids.projectList, routes.remove({ id: 7 })))),
  fragment(routes.remove, () => ProjectList(["Borealis"])),
];
