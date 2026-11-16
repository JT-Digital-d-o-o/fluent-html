// A11Y-2 page-parts: An image is rendered with no alt text.
import { Page, page, serve, Img, asset } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Img({ src: asset("/logo.png") }))); // ✗
export default () => serve({ seed }, "/seed");
