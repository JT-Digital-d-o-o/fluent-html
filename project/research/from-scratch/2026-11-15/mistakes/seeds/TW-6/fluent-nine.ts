// TW-6 fluent-nine: Class text is passed where a child goes, so it renders as visible text.
import { Div, P, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Div("flex gap-4", P("Body"))); // ✗
