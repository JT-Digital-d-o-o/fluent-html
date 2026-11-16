// A11Y-2 fh8: An image is rendered with no alt text.
import { Img, html } from "../../arms/fh8/app.ts";
export default () => html(Img().setSrc("/logo.png")); // ✗
