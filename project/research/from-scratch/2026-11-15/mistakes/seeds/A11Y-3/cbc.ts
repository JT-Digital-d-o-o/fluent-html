// A11Y-3 cbc: An icon button has no text and no accessible name.
import { button, render, cls } from "../../arms/cbc/app.ts";
export default () => render(button(cls("p-2 rounded-control"))); // ✗
