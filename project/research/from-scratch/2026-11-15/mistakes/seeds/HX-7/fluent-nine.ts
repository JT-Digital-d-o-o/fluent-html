// HX-7 fluent-nine: An htmx request is given a hand-written URL string, with a mistyped path.
import { Button, html, hx } from "../../arms/fluent-nine/app.ts";
export default () => html(Button("Load").setType("button").setHtmx(hx("/projects/rowz"))); // ✗
