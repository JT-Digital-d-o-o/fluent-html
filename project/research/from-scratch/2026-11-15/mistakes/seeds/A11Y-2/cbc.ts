// A11Y-2 cbc: An image is rendered with no alt text.
import { asset, img, render } from "../../arms/cbc/app.ts";
export default () => render(img({ src: asset("/logo.png") })); // ✗
