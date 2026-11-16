// HX-8 fh8 under the house rule as a type, the hatch: a page-answering delete aimed at the list through the route option `target` (harvest row 15).
import { Button, Layout, ProjectList, Span, html, ids, page } from "../../../arms/fh8/app.ts";
import { houseRoutes } from "./house-rule.ts";
const routes = houseRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" } },
});
const Screen = (n: number) => Layout("Projects", Span(`${n} projects`).setId(ids.projectCount), ProjectList(["Borealis"]),
  Button("Delete Apollo").setType("button").setHtmx(routes.remove({ id: 7 }, { target: ids.projectList }))); // ✗
export default () => [html(Screen(2)), page(routes.remove, () => Screen(1))];
