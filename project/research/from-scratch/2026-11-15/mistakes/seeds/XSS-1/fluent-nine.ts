// XSS-1 fluent-nine: HTML from data goes through the raw-markup sink.
import { Div, Raw, html, hostile } from "../../arms/fluent-nine/app.ts";
export default () => html(Div(Raw(hostile.html))); // ✗
