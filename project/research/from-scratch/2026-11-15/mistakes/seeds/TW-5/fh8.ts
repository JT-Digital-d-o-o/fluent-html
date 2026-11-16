// TW-5 fh8: Tailwind class text goes through the raw class sink.
import { Div, html } from "../../arms/fh8/app.ts";
export default () => html(Div("x").cssClass("p-4 bg-gray-100")); // ✗
