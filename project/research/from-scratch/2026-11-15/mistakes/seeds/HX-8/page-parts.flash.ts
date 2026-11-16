// HX-8 page-parts, flash: A delete swaps only the list region, so the flash keeps the last message and never says what happened.
import { Li, P, Page, Ul, page, refresh, serve, htmx } from "../../arms/page-parts/app.ts";
const names = ["Apollo", "Borealis"];
let flash = "Project created.";
export const seed = page("/seed", { load: () => ({ names, flash }) });
const rows = seed.region("rows", { load: () => names });
const remove = seed.action("remove", { run: () => { flash = `${names.shift()} deleted.`; return refresh(rows); } }); // ✗
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
seed.view(({ data }) => Page({ title: "Seed" }, P({ id: "flash" }, data.flash), rows.show(), remove.button({}, "Delete Apollo")));
export default async () => [await serve({ seed }, "/seed"), await serve({ seed }, "/seed?/remove", { method: "POST", headers: htmx() })];
