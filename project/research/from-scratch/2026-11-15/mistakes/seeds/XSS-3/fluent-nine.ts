// XSS-3 fluent-nine: An hx-get is a javascript: URL from data.
import { Button, externalUrl, html, hx, hostile } from "../../arms/fluent-nine/app.ts";
export default () => html(Button("Load").setType("button").setHtmx(hx(externalUrl(hostile.url)))); // ✗
