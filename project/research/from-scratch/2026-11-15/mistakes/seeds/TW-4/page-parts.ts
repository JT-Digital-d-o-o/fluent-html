// TW-4 page-parts: A class built from data at run time.
import { Page, page, serve, Div, tone } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div({ class: `bg-${tone}/20` }, "x"))); // ✗
export default () => serve({ seed }, "/seed");
