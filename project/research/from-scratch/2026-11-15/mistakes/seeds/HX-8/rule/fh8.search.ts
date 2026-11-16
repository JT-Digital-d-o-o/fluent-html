// HX-8 fh8 under the house rule as a type, search: a targeted live search names its reason, so it compiles, and the count goes stale.
import { Button, Form, Layout, ProjectList, Span, fragment, html, ids } from "../../../arms/fh8/app.ts";
import { houseRoutes } from "./house-rule.ts";
const routes = houseRoutes("/projects", {
  rows: { path: "/rows", query: { q: "string" }, render: ids.projectList, reason: "search" },
});
type SearchReq = { q: string };
export default () => [
  html(Layout("Projects", Span("2 projects").setId(ids.projectCount),
    Form<SearchReq>({}, (f) => [f.label("q", "Search"),
      f.input("q", "search").search(ids.projectList, routes.rows()), Button("Search").setType("submit")]), // ✗
    ProjectList(["Apollo", "Borealis"]))),
  fragment(routes.rows, () => ProjectList(["Apollo"])),
];
