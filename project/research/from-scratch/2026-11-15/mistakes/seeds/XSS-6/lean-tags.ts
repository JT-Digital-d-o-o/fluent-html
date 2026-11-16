// XSS-6 lean-tags: A style attribute is built from a data string.
import { div, hostile, render } from "../../arms/lean-tags/app.ts";
export default () => render(div({ style: `color: ${hostile.css}` }, "x")); // ✗
