// XSS-6 fh8: A style attribute is built from a data string.
import { Div, html, hostile } from "../../arms/fh8/app.ts";
export default () => html(Div("x").setStyle(`color: ${hostile.css}`)); // ✗
