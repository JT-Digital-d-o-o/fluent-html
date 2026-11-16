// NEST-2 page-parts: A link is placed inside another link.
import { Page, page, serve, Link, feature } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Link({ to: feature.projectList }, "Projects ", Link({ to: feature.projectNew }, "New")))); // ✗
export default () => serve({ seed }, "/seed");
