// A11Y-1 cbc: A text input is rendered with no label.
import { div, input, render } from "../../arms/cbc/app.ts";
export default () => render(div(input({ type: "text" }))); // ✗
