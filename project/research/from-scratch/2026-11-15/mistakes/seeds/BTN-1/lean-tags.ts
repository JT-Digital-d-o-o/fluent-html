// BTN-1 lean-tags: A Cancel button inside a form has no type, so it submits the form.
import { button, label, projects, render, type FormState } from "../../arms/lean-tags/app.ts";
const Form = (s: FormState<typeof projects.create>) => projects.create().form(s, (f) => [
  label("Name", f.input("name")),
  button({ type: "submit" }, "Save"),
  button("Cancel"), // ✗
]);
export default () => render(Form({}));
