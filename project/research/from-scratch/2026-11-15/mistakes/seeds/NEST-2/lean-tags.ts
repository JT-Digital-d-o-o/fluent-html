// NEST-2 lean-tags: A link is placed inside another link.
import { a, projects, render } from "../../arms/lean-tags/app.ts";
export default () => render(a(projects.list(), "Projects ", a(projects.new(), "New"))); // ✗
