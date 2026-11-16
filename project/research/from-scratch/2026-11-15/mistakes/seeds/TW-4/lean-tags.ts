// TW-4 lean-tags: A class built from data at run time.
import { div, render, tone, tw } from "../../arms/lean-tags/app.ts";
export default () => render(div(tw`bg-${tone}/20`, "x")); // ✗
