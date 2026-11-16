// XSS-1 page-parts: HTML from data goes through the raw-markup sink.
import { Page, page, serve, Div, Raw, hostile } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div(Raw(hostile.html)))); // ✗
export default () => serve({ seed }, "/seed");
