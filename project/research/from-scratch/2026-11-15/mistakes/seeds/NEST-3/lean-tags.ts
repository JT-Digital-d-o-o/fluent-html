// NEST-3 lean-tags: A form is placed inside another form.
import { Layout, ProjectForm, form, input, label, projects, render } from "../../arms/lean-tags/app.ts";
export default () => render(Layout({ title: "New" }, form(projects.list(), label("Search", input({ type: "search", name: "q" })), ProjectForm({})))); // ✗
