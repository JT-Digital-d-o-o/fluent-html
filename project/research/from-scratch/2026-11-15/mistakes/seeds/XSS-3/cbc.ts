// XSS-3 cbc: An hx-get is a javascript: URL from data.
import { button, hostile, local, render, wire } from "../../arms/cbc/app.ts";
export default () => render(button(wire({ get: local(hostile.url) }), "Load")); // ✗
