// PURE-1 page-parts: A view reads a file while it renders.
import { readFileSync } from "node:fs";
import { P, Page, page, serve } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, P(readFileSync(new URL("../../kinds.mjs", import.meta.url), "utf8").slice(0, 40)))); // ✗
export default () => serve({ seed }, "/seed");
