// XSS-5 fh8: Data is interpolated into markup the code vouches for as trusted.
import { Div, Raw, html, hostile } from "../../arms/fh8/app.ts";
export default () => html(Div(Raw(`<strong>${hostile.html}</strong>`))); // ✗
