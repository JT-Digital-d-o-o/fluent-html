// XSS-2 lean-tags: A link's href is a javascript: URL from data.
import { a, hostile, render } from "../../arms/lean-tags/app.ts";
export default () => render(a({ href: hostile.url }, "Website")); // ✗
