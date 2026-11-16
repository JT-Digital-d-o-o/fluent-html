// HX-5 cbc: An hx-get attribute is written by hand, with a mistyped path.
import { div, render } from "../../arms/cbc/app.ts";
export default () => render(div({ "hx-get": "/projects/rowz" }, "Rows")); // ✗
