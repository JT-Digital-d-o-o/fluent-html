// HX-3 fh8: A form's 422 answer is not the region the form swaps into.
import { Button, Div, Form, Layout, html, ids, projectRoutes, renderView, type FormProps, type CreateProjectReq } from "../../arms/fh8/app.ts";
const Fields = (p: FormProps) =>
  Form<CreateProjectReq>(p, (f) => [f.label("name", "Name"), f.input("name", "text"), f.error("name"), Button("Create").setType("submit")])
    .submit(projectRoutes.create(), { invalid: ids.projectForm });
export default () => [
  html(Layout("New project", Div(Fields({})).setId(ids.projectForm))),
  renderView(422, Fields({ errors: { name: "Required" } })), // ✗
];
