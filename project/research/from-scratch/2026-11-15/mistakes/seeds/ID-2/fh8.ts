// ID-2 fh8: One form is rendered twice on one page, so the ids the library derives repeat.
import { Layout, ProjectForm, html } from "../../arms/fh8/app.ts";
export default () => html(Layout("New project",
  ProjectForm({}),
  ProjectForm({ errors: { name: "Required" } }), // ✗
));
