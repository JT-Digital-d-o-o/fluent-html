// HX-6 page-parts: A link navigates to a fragment route as if it answered a page.
import { Page, page, serve, Link, feature } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Link({ to: feature.projectRows }, "All rows"))); // ✗
export default () => serve({ seed }, "/seed");
