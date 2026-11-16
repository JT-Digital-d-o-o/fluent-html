// HX-7 page-parts: An htmx request is given a hand-written URL string, with a mistyped path.
import { Page, page, serve, Button, hx, local } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Button({ wire: hx({ get: local("/projects/rowz"), target: "#projects-rows" }) }, "Load"))); // ✗
export default () => serve({ seed }, "/seed");
