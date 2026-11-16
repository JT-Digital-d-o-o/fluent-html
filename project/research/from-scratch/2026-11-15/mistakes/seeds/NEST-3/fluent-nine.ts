// NEST-3 fluent-nine: A form is placed inside another form.
import { Div, Form, Layout, ProjectForm, html, projectRoutes, type CreateProjectReq } from "../../arms/fluent-nine/app.ts";
const Outer = () => Form<CreateProjectReq>((f) => [f.label("name", "Name"), f.input("name", "text"), ProjectForm({})]).submit(projectRoutes.create()); // ✗
export default () => html(Layout("New", Div(Outer())));
