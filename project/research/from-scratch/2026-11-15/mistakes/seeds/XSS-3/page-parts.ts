// XSS-3 page-parts: An hx-get is a javascript: URL from data.
import { Page, page, serve, Button, hx, local, hostile } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Button({ wire: hx({ get: local(hostile.url) }) }, "Load"))); // ✗
export default () => serve({ seed }, "/seed");
