// HX-8 fluent-nine under the house rule, counter: the delete answers the page, morphed into #main-content.
import { Button, Layout, ProjectList, Span, defineRoutes, html, ids, page } from "../../../arms/fluent-nine/app.ts";
const routes = defineRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } as const },
} as const);
const Screen = (names: string[]) => Layout("Projects", Span(`${names.length} projects`).setId(ids.projectCount), ProjectList(names),
  Button("Delete Apollo").setType("button").submit(routes.remove({ id: 7 })));
export default () => [html(Screen(["Apollo", "Borealis"])), page(routes.remove, () => Screen(["Borealis"]))];
