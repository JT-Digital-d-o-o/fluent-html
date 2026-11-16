// XSS-2 fh8: A link's href is a javascript: URL from data.
import { A, externalUrl, html, hostile } from "../../arms/fh8/app.ts";
export default () => html(A("Website").setHref(externalUrl(hostile.url)).cursor("pointer")); // ✗
