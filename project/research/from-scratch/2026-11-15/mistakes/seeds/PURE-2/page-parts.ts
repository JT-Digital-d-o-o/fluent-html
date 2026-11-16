// PURE-2 page-parts: A lookup over the job union leaves out failed.
import { Page, Span, page, serve } from "../../arms/page-parts/app.ts";
type Job = "queued" | "running" | "done" | "failed";
export const seed = page("/seed", { load: (): Job => "failed" });
seed.view(({ data: job }) => Page({ title: "Seed" }, Span({ queued: "Queued", running: "Running", done: "Done" }[job]))); // ✗
export default () => serve({ seed }, "/seed");
