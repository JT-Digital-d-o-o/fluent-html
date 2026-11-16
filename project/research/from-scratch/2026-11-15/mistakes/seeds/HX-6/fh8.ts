// HX-6 fh8: A link navigates to a fragment route as if it answered a page.
import { A, html, projectRoutes } from "../../arms/fh8/app.ts";
export default () => html(A("All rows").nav(projectRoutes.rows())); // ✗
