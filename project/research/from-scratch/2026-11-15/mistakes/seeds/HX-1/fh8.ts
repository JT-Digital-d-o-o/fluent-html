// HX-1 fh8: A request to the status fragment route is aimed at the list region.
import { Button, Layout, ProjectList, StatusRegion, fragment, html, ids, projectRoutes } from "../../arms/fh8/app.ts";
export default () => [
  html(Layout("Projects", ProjectList(["Apollo"]),
    Button("Refresh").setType("button").fragment(ids.projectList, projectRoutes.status({ id: 7 })), // ✗
  )),
  fragment(projectRoutes.status, () => StatusRegion({ id: 7, job: "done" })),
];
