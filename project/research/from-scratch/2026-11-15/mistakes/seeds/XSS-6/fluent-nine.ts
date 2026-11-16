// XSS-6 fluent-nine: A style attribute is built from a data string.
import { Div, html, hostile } from "../../arms/fluent-nine/app.ts";
export default () => html(Div("x").setStyle(`color: ${hostile.css}`)); // ✗
