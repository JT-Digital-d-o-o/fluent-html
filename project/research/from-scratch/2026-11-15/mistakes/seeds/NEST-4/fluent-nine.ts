// NEST-4 fluent-nine: A link is placed inside a button.
import { A, Button, html, projectRoutes } from "../../arms/fluent-nine/app.ts";
export default () => html(Button(A("Open").nav(projectRoutes.index())).setType("button")); // ✗
