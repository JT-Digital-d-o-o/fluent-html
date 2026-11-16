// TW-6 cbc: Class text is passed where a child goes, so it renders as visible text.
import { div, p, render } from "../../arms/cbc/app.ts";
export default () => render(div("flex gap-4", p("Body"))); // ✗
