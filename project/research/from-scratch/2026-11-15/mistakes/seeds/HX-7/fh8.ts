// HX-7 fh8: An htmx request is given a hand-written URL string, with a mistyped path.
import { Button, html, hx } from "../../arms/fh8/app.ts";
export default () => html(Button("Load").setType("button").setHtmx(hx("/projects/rowz"))); // ✗
