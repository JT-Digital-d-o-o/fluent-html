// BTN-1 cbc: A Cancel button inside a form has no type, so it submits the form.
import { button, cls, label, projects, render, type FormState } from "../../arms/cbc/app.ts";
const Form = (s: FormState<typeof projects.create>) => projects.create().form(s, cls("grid gap-4"), (f) => [
  label("Name", f.input("name")),
  button({ type: "submit" }, "Save"),
  button("Cancel"), // ✗
]);
export default () => render(Form({}));
