// FORM-1 cbc: A form field is named nmae, which the schema does not have.
import { button, cls, label, projects, render, type FormState } from "../../arms/cbc/app.ts";
const Form = (s: FormState<typeof projects.create>) => projects.create().form(s, cls("grid gap-4"), (f) => [
  label("Name", f.input("nmae")), // ✗
  button({ type: "submit" }, "Create"),
]);
export default () => render(Form({}));
