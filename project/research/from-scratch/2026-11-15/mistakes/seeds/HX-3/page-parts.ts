// HX-3 page-parts: A form's 422 answer is not the region the form swaps into.
import { Page, invalid, page, serve, htmx } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
const save = seed.action("save", { run: () => invalid({ name: "Taken" }) }); // ✗
seed.view(() => Page({ title: "Seed" }, save.button({}, "Save")));
export default async () => [await serve({ seed }, "/seed"), await serve({ seed }, "/seed?/save", { method: "POST", headers: htmx() })];
