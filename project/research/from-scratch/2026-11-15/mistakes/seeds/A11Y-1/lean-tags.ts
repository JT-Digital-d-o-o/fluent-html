// A11Y-1 lean-tags: A text input is rendered with no label.
import { div, input, render } from "../../arms/lean-tags/app.ts";
export default () => render(div(input({ type: "text" }))); // ✗
