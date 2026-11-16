// XSS-5 lean-tags: Data is interpolated into markup the code vouches for as trusted.
import { div, hostile, raw, render, trusted } from "../../arms/lean-tags/app.ts";
export default () => render(div(raw(trusted`<strong>${hostile.html}</strong>`))); // ✗
