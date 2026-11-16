// NEST-4 lean-tags: A link is placed inside a button.
import { a, button, projects, render } from "../../arms/lean-tags/app.ts";
export default () => render(button(a(projects.list(), "Open"))); // ✗
