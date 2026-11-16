// HX-5 fluent-nine: An hx-get attribute is written by hand, with a mistyped path.
import { Div, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Div("Rows").addAttribute("hx-get", "/projects/rowz")); // ✗
