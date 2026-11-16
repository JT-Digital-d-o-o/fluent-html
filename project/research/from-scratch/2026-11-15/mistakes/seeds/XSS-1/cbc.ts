// XSS-1 cbc: HTML from data goes through the raw-markup sink.
import { div, hostile, raw, render } from "../../arms/cbc/app.ts";
export default () => render(div(raw(hostile.html))); // ✗
