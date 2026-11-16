// TW-4 fluent-nine: A class built from data at run time.
import { Div, html, tone } from "../../arms/fluent-nine/app.ts";
export default () => html(Div("x").tw(`bg-${tone}/20`)); // ✗
