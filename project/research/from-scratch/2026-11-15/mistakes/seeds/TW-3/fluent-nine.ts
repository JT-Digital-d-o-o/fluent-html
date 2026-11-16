// TW-3 fluent-nine: A variant that does not exist.
import { Div, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Div("x").tw("hovr:bg-surface-2")); // ✗
