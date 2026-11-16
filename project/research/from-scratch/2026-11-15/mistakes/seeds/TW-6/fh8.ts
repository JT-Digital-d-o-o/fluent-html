// TW-6 fh8: Class text is passed where a child goes, so it renders as visible text.
import { Div, P, html } from "../../arms/fh8/app.ts";
export default () => html(Div("flex gap-4", P("Body"))); // ✗
