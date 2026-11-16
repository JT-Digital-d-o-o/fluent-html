// TW-1 lean-tags: A class Tailwind does not have.
import { div, render, tw } from "../../arms/lean-tags/app.ts";
export default () => render(div(tw`flex justify-centre`, "x")); // ✗
