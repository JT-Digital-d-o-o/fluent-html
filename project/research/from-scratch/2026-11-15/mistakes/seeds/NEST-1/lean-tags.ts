// NEST-1 lean-tags: A list item is written outside any list.
import { div, li, render } from "../../arms/lean-tags/app.ts";
export default () => render(div(li("Orphan"))); // ✗
