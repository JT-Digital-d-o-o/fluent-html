// FORM-1 fluent-nine: A form field is named nmae, which the schema does not have.
import { Button, Form, html, projectRoutes, type CreateProjectReq } from "../../arms/fluent-nine/app.ts";
export default () => html(Form<CreateProjectReq>((f) => [
  f.label("nmae", "Name"), f.input("nmae", "text"), // ✗
  Button("Create").setType("submit"),
]).submit(projectRoutes.create()));
