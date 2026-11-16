// NEST-2 cbc: A link is placed inside another link.
import { a, projects, render } from "../../arms/cbc/app.ts";
export default () => render(a(projects.list(), "Projects ", a(projects.new(), "New"))); // ✗
