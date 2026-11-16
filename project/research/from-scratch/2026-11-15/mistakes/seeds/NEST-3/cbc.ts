// NEST-3 cbc: A form is placed inside another form.
import { Layout, ProjectForm, form, input, label, projects, render } from "../../arms/cbc/app.ts";
export default () => render(Layout({ title: "New" }, form(projects.list(), label("Search", input({ type: "search", name: "q" })), ProjectForm({})))); // ✗
