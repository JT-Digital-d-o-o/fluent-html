// ID-1 fluent-nine: Two elements on one page are given the same id.
import { Layout, Span, html, ids } from "../../arms/fluent-nine/app.ts";
export default () => html(Layout("Projects",
  Span("3 projects").setId(ids.projectCount),
  Span("3 projects").setId(ids.projectCount), // ✗
));
