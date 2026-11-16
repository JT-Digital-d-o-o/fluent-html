// NEST-1 cbc: A list item is written outside any list.
import { div, li, render } from "../../arms/cbc/app.ts";
export default () => render(div(li("Orphan"))); // ✗
