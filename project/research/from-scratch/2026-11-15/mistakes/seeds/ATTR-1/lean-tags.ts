// ATTR-1 lean-tags: An input's type is a value HTML does not have.
import { input, render } from "../../arms/lean-tags/app.ts";
export default () => render(input({ type: "txt", "aria-label": "Name" })); // ✗
