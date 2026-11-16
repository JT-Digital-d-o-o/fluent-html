// XSS-3 lean-tags: An hx-get is a javascript: URL from data.
import { button, hostile, render, wire } from "../../arms/lean-tags/app.ts";
export default () => render(button(wire({ get: hostile.url }), "Load")); // ✗
