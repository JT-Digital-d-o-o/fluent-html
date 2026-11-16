// TW-5 lean-tags: Tailwind class text goes through the raw class sink.
import { div, render } from "../../arms/lean-tags/app.ts";
export default () => render(div({ class: "p-4 bg-gray-100" }, "x")); // ✗
