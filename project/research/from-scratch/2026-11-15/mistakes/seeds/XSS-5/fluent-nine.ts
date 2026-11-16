// XSS-5 fluent-nine: Data is interpolated into markup the code vouches for as trusted.
import { Div, Raw, html, hostile } from "../../arms/fluent-nine/app.ts";
export default () => html(Div(Raw(`<strong>${hostile.html}</strong>`))); // ✗
