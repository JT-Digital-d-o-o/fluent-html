// NEST-4 cbc: A link is placed inside a button.
import { a, button, projects, render } from "../../arms/cbc/app.ts";
export default () => render(button(a(projects.list(), "Open"))); // ✗
