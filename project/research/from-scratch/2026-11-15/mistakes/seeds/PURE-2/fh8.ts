// PURE-2 fh8: A lookup over the job union leaves out failed.
import { Match, Span, html, type Job } from "../../arms/fh8/app.ts";
const Badge = (job: Job) => Match(job, { queued: () => Span("Queued"), running: () => Span("Running"), done: () => Span("Done") }); // ✗
export default () => html(Badge("failed"));
