// FORM-1 lean-tags: A form field is named nmae, which the schema does not have.
import { button, label, projects, render, type FormState } from "../../arms/lean-tags/app.ts";
const Form = (s: FormState<typeof projects.create>) => projects.create().form(s, (f) => [
  label("Name", f.input("nmae")), // ✗
  button({ type: "submit" }, "Create"),
]);
export default () => render(Form({}));
