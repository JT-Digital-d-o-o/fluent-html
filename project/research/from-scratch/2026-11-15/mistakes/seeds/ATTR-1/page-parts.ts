// ATTR-1 page-parts: An input's type is a value HTML does not have.
import { Page, page, serve, Input } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Input({ type: "txt", "aria-label": "Name" }))); // ✗
export default () => serve({ seed }, "/seed");
