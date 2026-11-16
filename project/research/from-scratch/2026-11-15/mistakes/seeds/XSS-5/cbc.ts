// XSS-5 cbc: Data is interpolated into markup the code vouches for as trusted.
import { div, hostile, raw, render, trusted } from "../../arms/cbc/app.ts";
export default () => render(div(raw(trusted`<strong>${hostile.html}</strong>`))); // ✗
