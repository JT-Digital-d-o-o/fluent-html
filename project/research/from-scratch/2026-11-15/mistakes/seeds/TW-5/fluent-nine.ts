// TW-5 fluent-nine: Tailwind class text goes through the raw class sink.
import { Div, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Div("x").cssClass("p-4 bg-gray-100")); // ✗
