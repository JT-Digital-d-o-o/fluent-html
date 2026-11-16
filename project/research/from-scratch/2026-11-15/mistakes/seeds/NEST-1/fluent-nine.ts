// NEST-1 fluent-nine: A list item is written outside any list.
import { Div, Li, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Div(Li("Orphan"))); // ✗
