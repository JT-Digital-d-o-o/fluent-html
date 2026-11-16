// HX-8 fh8, badge: A delete swaps only the list region, so the nav badge with the project count goes stale.
import { A, Button, Layout, Nav, ProjectList, Span, defineIds, defineRoutes, fragment, html, ids, projectRoutes } from "../../arms/fh8/app.ts";
const nav = defineIds(["nav-badge"] as const);
const routes = defineRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const, render: ids.projectList }, // ✗
} as const);
// The template's Navigation sits inside #main-content (layout.view.ts, MainContent), so the badge does here too.
const Navigation = (n: number) => Nav(A("Projects", Span(String(n)).setId(nav.navBadge)).nav(projectRoutes.index()));
export default () => [
  html(Layout("Projects", Navigation(2), ProjectList(["Apollo", "Borealis"]),
    Button("Delete Apollo").setType("button").fragment(ids.projectList, routes.remove({ id: 7 })))),
  fragment(routes.remove, () => ProjectList(["Borealis"])),
];
