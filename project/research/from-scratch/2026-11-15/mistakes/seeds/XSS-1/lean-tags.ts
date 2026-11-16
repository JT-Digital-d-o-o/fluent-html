// XSS-1 lean-tags: HTML from data goes through the raw-markup sink.
import { div, hostile, raw, render } from "../../arms/lean-tags/app.ts";
export default () => render(div(raw(hostile.html))); // ✗
