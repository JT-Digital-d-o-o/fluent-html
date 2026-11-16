// HX-8 fh8 under the house rule, badge: the delete answers the page; the nav sits inside #main-content, as in the template.
import { A, Button, Layout, Nav, ProjectList, Span, defineIds, defineRoutes, html, page, projectRoutes } from "../../../arms/fh8/app.ts";
const nav = defineIds(["nav-badge"] as const);
const routes = defineRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const },
} as const);
const Screen = (names: string[]) => Layout("Projects",
  Nav(A("Projects", Span(String(names.length)).setId(nav.navBadge)).nav(projectRoutes.index())), ProjectList(names),
  Button("Delete Apollo").setType("button").submit(routes.remove({ id: 7 })));
export default () => [html(Screen(["Apollo", "Borealis"])), page(routes.remove, () => Screen(["Borealis"]))];
