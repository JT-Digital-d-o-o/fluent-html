// HX-6 lean-tags: A link navigates to a fragment route as if it answered a page.
import { a, projects, render } from "../../arms/lean-tags/app.ts";
export default () => render(a(projects.rows(), "All rows")); // ✗
