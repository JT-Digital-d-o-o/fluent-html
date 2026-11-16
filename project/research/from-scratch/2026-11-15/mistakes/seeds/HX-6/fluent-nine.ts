// HX-6 fluent-nine: A link navigates to a fragment route as if it answered a page.
import { A, html, projectRoutes } from "../../arms/fluent-nine/app.ts";
export default () => html(A("All rows").nav(projectRoutes.rows())); // ✗
