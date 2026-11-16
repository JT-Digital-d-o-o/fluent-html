// TW-3 lean-tags: A variant that does not exist.
import { div, render, tw } from "../../arms/lean-tags/app.ts";
export default () => render(div(tw`hovr:bg-surface-2`, "x")); // ✗
