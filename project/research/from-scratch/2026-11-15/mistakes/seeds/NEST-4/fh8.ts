// NEST-4 fh8: A link is placed inside a button.
import { A, Button, html, projectRoutes } from "../../arms/fh8/app.ts";
export default () => html(Button(A("Open").nav(projectRoutes.index())).setType("button")); // ✗
