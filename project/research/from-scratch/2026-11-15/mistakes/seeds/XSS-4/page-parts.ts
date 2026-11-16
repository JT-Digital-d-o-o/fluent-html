// XSS-4 page-parts: An hx-on handler's code comes from data.
import { Page, page, serve, Button, hostile } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Button({ "hx-on:click": hostile.js }, "Go"))); // ✗
export default () => serve({ seed }, "/seed");
