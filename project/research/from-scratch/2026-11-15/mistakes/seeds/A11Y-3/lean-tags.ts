// A11Y-3 lean-tags: An icon button has no text and no accessible name.
import { button, render, tw } from "../../arms/lean-tags/app.ts";
export default () => render(button(tw`p-2 rounded-control`)); // ✗
