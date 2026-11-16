// XSS-6 page-parts: A style attribute is built from a data string.
import { Page, page, serve, Div, hostile } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div({ style: `color: ${hostile.css}` }, "x"))); // ✗
export default () => serve({ seed }, "/seed");
