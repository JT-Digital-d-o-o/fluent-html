// TW-2 page-parts: A default-palette colour the theme closed.
import { Page, page, serve, Div } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div({ class: "bg-gray-100" }, "x"))); // ✗
export default () => serve({ seed }, "/seed");
