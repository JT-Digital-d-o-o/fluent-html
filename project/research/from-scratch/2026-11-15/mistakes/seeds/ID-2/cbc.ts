// ID-2 cbc: One form is rendered twice on one page, so the ids the library derives repeat.
import { Layout, ProjectForm, render } from "../../arms/cbc/app.ts";
export default () => render(Layout({ title: "New project" },
  ProjectForm({}),
  ProjectForm({ errors: { name: "Required" } }), // ✗
));
