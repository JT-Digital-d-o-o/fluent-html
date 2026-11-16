// XSS-2 page-parts: A link's href is a javascript: URL from data.
import { Page, page, serve, A, external, hostile } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, A({ href: external(hostile.url) }, "Website"))); // ✗
export default () => serve({ seed }, "/seed");
