// A11Y-1 fluent-nine: A text input is rendered with no label.
import { Div, Input, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Div(Input().setType("text"))); // ✗
