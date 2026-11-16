// NEST-3 fh8: A form is placed inside another form.
import { Div, Form, Layout, ProjectForm, html, projectRoutes, type CreateProjectReq } from "../../arms/fh8/app.ts";
const Outer = () => Form<CreateProjectReq>((f) => [f.label("name", "Name"), f.input("name", "text"), ProjectForm({})]).submit(projectRoutes.create()); // ✗
export default () => html(Layout("New", Div(Outer())));
