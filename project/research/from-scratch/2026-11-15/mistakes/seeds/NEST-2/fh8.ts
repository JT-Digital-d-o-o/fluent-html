// NEST-2 fh8: A link is placed inside another link.
import { A, html, projectRoutes } from "../../arms/fh8/app.ts";
export default () => html(A("Projects ", A("New").nav(projectRoutes.new())).nav(projectRoutes.index())); // ✗
