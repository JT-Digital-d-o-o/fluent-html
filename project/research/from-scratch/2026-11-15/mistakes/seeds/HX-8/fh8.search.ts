// HX-8 fh8, search: A live search swaps only the list region, so the result count above it goes stale.
import { Button, Form, Layout, ProjectList, Span, fragment, html, ids, projectRoutes } from "../../arms/fh8/app.ts";
type SearchReq = { q: string };
export default () => [
  html(Layout("Projects", Span("2 projects").setId(ids.projectCount),
    Form<SearchReq>({}, (f) => [f.label("q", "Search"),
      f.input("q", "search").search(ids.projectList, projectRoutes.rows()), Button("Search").setType("submit")]), // ✗
    ProjectList(["Apollo", "Borealis"]))),
  fragment(projectRoutes.rows, () => ProjectList(["Apollo"])),
];
