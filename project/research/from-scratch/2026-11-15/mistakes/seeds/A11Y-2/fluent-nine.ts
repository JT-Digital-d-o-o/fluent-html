// A11Y-2 fluent-nine: An image is rendered with no alt text.
import { Img, html } from "../../arms/fluent-nine/app.ts";
export default () => html(Img().setSrc("/logo.png")); // ✗
