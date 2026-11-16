// HX-8 fluent-nine under the house rule, search: the live search is untargeted, so it answers the page into #main-content.
import { Button, Form, Layout, ProjectList, Span, html, ids, page, projectRoutes } from "../../../arms/fluent-nine/app.ts";
type SearchReq = { q: string };
const Screen = (names: string[]) => Layout("Projects", Span(`${names.length} projects`).setId(ids.projectCount),
  Form<SearchReq>({}, (f) => [f.label("q", "Search"), f.input("q", "search").search(projectRoutes.index()), Button("Search").setType("submit")]), ProjectList(names));
export default () => [html(Screen(["Apollo", "Borealis"])), page(projectRoutes.index, () => Screen(["Apollo"]))];
