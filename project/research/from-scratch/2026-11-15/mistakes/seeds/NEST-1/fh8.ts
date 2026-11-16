// NEST-1 fh8: A list item is written outside any list.
import { Div, Li, html } from "../../arms/fh8/app.ts";
export default () => html(Div(Li("Orphan"))); // ✗
