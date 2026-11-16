// A11Y-1 page-parts: A text input is rendered with no label.
import { Page, page, serve, Div, Input } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div(Input({ type: "text" })))); // ✗
export default () => serve({ seed }, "/seed");
