// TW-6 lean-tags: Class text is passed where a child goes, so it renders as visible text.
import { div, p, render } from "../../arms/lean-tags/app.ts";
export default () => render(div("flex gap-4", p("Body"))); // ✗
