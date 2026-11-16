// HX-5 fh8: An hx-get attribute is written by hand, with a mistyped path.
import { Div, html } from "../../arms/fh8/app.ts";
export default () => html(Div("Rows").addAttribute("hx-get", "/projects/rowz")); // ✗
