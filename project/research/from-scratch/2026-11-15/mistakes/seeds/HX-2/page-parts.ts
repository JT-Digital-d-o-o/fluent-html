// HX-2 page-parts: The status fragment route answers with the list region.
import { Li, Page, Span, Type, Ul, htmx, page, serve } from "../../arms/page-parts/app.ts";
export const seed = page("/seed/:id", { params: { id: Type.Integer() } });
const rows = seed.region("rows", { load: () => ["Apollo"] });
const status = seed.region("status", { load: () => "done" });
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
status.view(() => rows.show()); // ✗
seed.view(() => Page({ title: "Seed" }, Span("Status"), status.show()));
export default () => serve({ seed }, "/seed/1", { headers: htmx("div#seed-id-status") });
