// XSS-2 cbc: A link's href is a javascript: URL from data.
import { a, hostile, render, url } from "../../arms/cbc/app.ts";
export default () => render(a({ href: url(hostile.url) }, "Website")); // ✗
