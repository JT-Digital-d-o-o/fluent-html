// HX-6 cbc: A link navigates to a fragment route as if it answered a page.
import { a, projects, render } from "../../arms/cbc/app.ts";
export default () => render(a(projects.rows(), "All rows")); // ✗
