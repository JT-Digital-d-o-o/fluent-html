// XSS-6 cbc: A style attribute is built from a data string.
import { div, hostile, render } from "../../arms/cbc/app.ts";
export default () => render(div({ style: `color: ${hostile.css}` }, "x")); // ✗
