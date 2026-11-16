// ID-1 fh8: Two elements on one page are given the same id.
import { Layout, Span, html, ids } from "../../arms/fh8/app.ts";
export default () => html(Layout("Projects",
  Span("3 projects").setId(ids.projectCount),
  Span("3 projects").setId(ids.projectCount), // ✗
));
