// TW-1 fluent-nine: A class Tailwind does not have.
import { Div, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Div("x").tw("flex justify-centre")); // ✗
