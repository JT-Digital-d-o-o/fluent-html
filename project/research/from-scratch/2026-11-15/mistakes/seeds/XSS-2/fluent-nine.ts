// XSS-2 fluent-nine: A link's href is a javascript: URL from data.
import { A, externalUrl, html, hostile } from "../../arms/fluent-nine/app.ts";
export default () => html(A("Website").setHref(externalUrl(hostile.url)).tw("cursor-pointer")); // ✗
