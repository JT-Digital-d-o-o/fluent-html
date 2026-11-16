// A11Y-3 page-parts: An icon button has no text and no accessible name.
import { Page, page, serve, Button } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Button({ class: "p-2 rounded-control" }))); // ✗
export default () => serve({ seed }, "/seed");
