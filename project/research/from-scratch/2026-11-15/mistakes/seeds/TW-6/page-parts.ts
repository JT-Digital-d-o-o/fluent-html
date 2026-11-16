// TW-6 page-parts: Class text is passed where a child goes, so it renders as visible text.
import { Page, page, serve, Div, P } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div("flex gap-4", P("Body")))); // ✗
export default () => serve({ seed }, "/seed");
