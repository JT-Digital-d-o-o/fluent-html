// HX-8 fh8 under the house rule as a type, counter: the same targeted delete as seeds/HX-8/fh8.counter.ts.
import { Button, Layout, ProjectList, Span, fragment, html, ids } from "../../../arms/fh8/app.ts";
import { houseRoutes } from "./house-rule.ts";
const routes = houseRoutes("/projects", {
  remove: { method: "post", path: "/:id/delete", params: { id: "number" }, render: ids.projectList }, // ✗
});
export default () => [
  html(Layout("Projects", Span("2 projects").setId(ids.projectCount), ProjectList(["Apollo", "Borealis"]),
    Button("Delete Apollo").setType("button").fragment(ids.projectList, routes.remove({ id: 7 })))),
  fragment(routes.remove, () => ProjectList(["Borealis"])),
];
