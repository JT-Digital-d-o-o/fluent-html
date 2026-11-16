// TW-1 page-parts: A class Tailwind does not have.
import { Page, page, serve, Div } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div({ class: "flex justify-centre" }, "x"))); // ✗
export default () => serve({ seed }, "/seed");
