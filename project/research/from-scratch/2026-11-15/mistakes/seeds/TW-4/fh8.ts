// TW-4 fh8: A class built from data at run time.
import { Div, html, tone } from "../../arms/fh8/app.ts";
export default () => html(Div("x").bg(`${tone}/20`)); // ✗
