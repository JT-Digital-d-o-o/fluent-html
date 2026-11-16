// BTN-1 fh8: A Cancel button inside a form has no type, so it submits the form.
import { Button, Form, html, projectRoutes, type CreateProjectReq } from "../../arms/fh8/app.ts";
export default () => html(Form<CreateProjectReq>((f) => [
  f.label("name", "Name"), f.input("name", "text"),
  Button("Save").setType("submit"),
  Button("Cancel"), // ✗
]).submit(projectRoutes.create()));
