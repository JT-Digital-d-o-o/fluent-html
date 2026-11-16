// XSS-5 page-parts: Data is interpolated into markup the code vouches for as trusted.
import { Page, page, serve, Div, Raw, trustedHtml, hostile } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
seed.view(() => Page({ title: "Seed" }, Div(Raw(trustedHtml`<strong>${hostile.html}</strong>`)))); // ✗
export default () => serve({ seed }, "/seed");
