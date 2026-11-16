// ID-2 fluent-nine: One form is rendered twice on one page, so the ids the library derives repeat.
import { Layout, ProjectForm, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Layout("New project",
  ProjectForm({}),
  ProjectForm({ errors: { name: "Required" } }), // ✗
));
