// HX-5 page-parts: An hx-get attribute is written by hand, with a mistyped path.
import { Page, page, serve, Div } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div({ "hx-get": "/projects/rowz" }, "Rows"))); // ✗
export default () => serve({ seed }, "/seed");
