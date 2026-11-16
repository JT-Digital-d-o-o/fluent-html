// A11Y-1 fh8: A text input is rendered with no label.
import { Div, Input, html } from "../../arms/fh8/app.ts";
export default () => html(Div(Input().setType("text"))); // ✗
