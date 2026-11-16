// TW-3 fh8: A variant that does not exist.
import { Div, html } from "../../arms/fh8/app.ts";
export default () => html(Div("x").variant("hovr", { bg: "surface-2" })); // ✗
