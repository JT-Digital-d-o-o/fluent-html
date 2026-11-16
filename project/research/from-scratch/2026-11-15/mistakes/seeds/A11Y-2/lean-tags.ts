// A11Y-2 lean-tags: An image is rendered with no alt text.
import { img, render } from "../../arms/lean-tags/app.ts";
export default () => render(img({ src: "/logo.png" })); // ✗
