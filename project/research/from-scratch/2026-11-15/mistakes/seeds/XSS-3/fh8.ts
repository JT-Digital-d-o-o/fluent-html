// XSS-3 fh8: An hx-get is a javascript: URL from data.
import { Button, externalUrl, html, hx, hostile } from "../../arms/fh8/app.ts";
export default () => html(Button("Load").setType("button").setHtmx(hx(externalUrl(hostile.url)))); // ✗
