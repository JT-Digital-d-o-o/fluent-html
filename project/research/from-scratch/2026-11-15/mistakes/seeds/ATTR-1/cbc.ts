// ATTR-1 cbc: An input's type is a value HTML does not have.
import { input, render } from "../../arms/cbc/app.ts";
export default () => render(input({ type: "txt", "aria-label": "Name" })); // ✗
