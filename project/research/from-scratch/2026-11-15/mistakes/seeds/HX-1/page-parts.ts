// HX-1 page-parts: A request to the status fragment route is aimed at the list region.
import { Button, Li, Page, Span, Type, Ul, hx, htmx, page, serve } from "../../arms/page-parts/app.ts";
export const seed = page("/seed/:id", { params: { id: Type.Integer() } });
const rows = seed.region("rows", { load: () => ["Apollo"] });
const status = seed.region("status", { load: () => "done" });
rows.view(({ data }) => Ul(data.map((x) => Li(x))));
status.view(({ data }) => Span(data));
seed.view(({ params }) => Page({ title: "Seed" }, rows.show(), status.show(),
  Button({ wire: hx({ get: seed.url({ id: params.id }), target: "#seed-id-rows" }) }, "Refresh status"), // ✗
));
export default async () => [await serve({ seed }, "/seed/1"), await serve({ seed }, "/seed/1", { headers: htmx("div#seed-id-rows") })];
