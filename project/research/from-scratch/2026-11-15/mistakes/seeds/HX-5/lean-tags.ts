// HX-5 lean-tags: An hx-get attribute is written by hand, with a mistyped path.
import { div, render } from "../../arms/lean-tags/app.ts";
export default () => render(div({ "hx-get": "/projects/rowz" }, "Rows")); // ✗
