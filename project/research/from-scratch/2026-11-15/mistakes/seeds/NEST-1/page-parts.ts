// NEST-1 page-parts: A list item is written outside any list.
import { Page, page, serve, Div, Li } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div(Li("Orphan")))); // ✗
export default () => serve({ seed }, "/seed");
