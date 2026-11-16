// XSS-1 fh8: HTML from data goes through the raw-markup sink.
import { Div, Raw, html, hostile } from "../../arms/fh8/app.ts";
export default () => html(Div(Raw(hostile.html))); // ✗
