// PURE-2 cbc: A lookup over the job union leaves out failed.
import { match, render, span, type Project } from "../../arms/cbc/app.ts";
const Badge = (job: Project["job"]) => match(job, { queued: () => span("Queued"), running: () => span("Running"), done: () => span("Done") }); // ✗
export default () => render(Badge("failed"));
