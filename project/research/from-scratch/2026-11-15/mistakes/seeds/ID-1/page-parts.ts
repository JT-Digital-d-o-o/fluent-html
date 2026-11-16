// ID-1 page-parts: Two elements on one page are given the same id.
import { Page, page, serve, Span } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Span({ id: "project-count" }, "3 projects"), Span({ id: "project-count" }, "3 projects"))); // ✗
export default () => serve({ seed }, "/seed");
