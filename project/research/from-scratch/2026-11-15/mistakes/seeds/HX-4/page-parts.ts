// HX-4 page-parts: The status region polls in every state, the finished one included.
import { Page, Span, page, serve, htmx } from "../../arms/page-parts/app.ts";
export const seed = page("/seed");
const status = seed.region("status", { load: () => ({ state: "done" as "running" | "done" }), poll: { every: "2s", while: () => true } }); // ✗
status.view(({ data }) => Span(data.state));
seed.view(() => Page({ title: "Seed" }, status.show()));
export default () => serve({ seed }, "/seed", { headers: htmx("div#seed-status") });
