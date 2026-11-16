// FORM-1 fh8: A form field is named nmae, which the schema does not have.
import { Button, Form, html, projectRoutes, type CreateProjectReq } from "../../arms/fh8/app.ts";
export default () => html(Form<CreateProjectReq>((f) => [
  f.label("nmae", "Name"), f.input("nmae", "text"), // ✗
  Button("Create").setType("submit"),
]).submit(projectRoutes.create()));
