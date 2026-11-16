// NEST-2 fluent-nine: A link is placed inside another link.
import { A, html, projectRoutes } from "../../arms/fluent-nine/app.ts";
export default () => html(A("Projects ", A("New").nav(projectRoutes.new())).nav(projectRoutes.index())); // ✗
