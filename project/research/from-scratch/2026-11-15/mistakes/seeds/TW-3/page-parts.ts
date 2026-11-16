// TW-3 page-parts: A variant that does not exist.
import { Page, page, serve, Div } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div({ class: "hovr:bg-surface-2" }, "x"))); // ✗
export default () => serve({ seed }, "/seed");
