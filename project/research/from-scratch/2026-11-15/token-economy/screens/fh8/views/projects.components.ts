import { Span, type Styler } from "fluent-html";
import type { Project } from "../projects.service.js";
import { projectRoutes, ids } from "../projects.routes.js";

const buttonBase: Styler = (t) =>
  t.inlineFlex().cursor("pointer").items("center").rounded("control").px("4").py("2").text("sm").font("medium").focusVisible({ ring: "2" });
export const primaryButton: Styler = (t) => t.apply(buttonBase).bg("primary").text("on-accent").hover({ bg: "primary-700" });
export const quietButton: Styler = (t) => t.apply(buttonBase).border().border("line").hover({ bg: "surface-2" });
export const dangerButton: Styler = (t) => t.apply(buttonBase).bg("danger").text("on-accent").hover({ bg: "danger-700" });

const pill: Styler = (t) => t.inlineFlex().items("center").rounded("full").px("2.5").py("0.5").text("xs").font("medium");

export function StatusPill({ status }: Pick<Project, "status">) {
  return Span(status)
    .apply(pill)
    .whenMatch(status, {
      active: (t) => t.bg("success/10").text("success"),
      paused: (t) => t.bg("warning/10").text("warning"),
      archived: (t) => t.bg("surface-2").text("text-dim"),
    })
    .capitalize();
}

const jobLabel: Record<Project["job"], string> = {
  queued: "Export queued",
  running: "Exporting…",
  done: "Export ready",
  failed: "Export failed",
};

export function JobBadge({ id, job }: Pick<Project, "id" | "job">) {
  return Span(jobLabel[job])
    .setId(ids.projectStatus)
    .apply(pill)
    .whenMatch(job, {
      queued: (t) => t.bg("surface-2").text("text-dim"),
      running: (t) => t.bg("primary/10").text("primary"),
      done: (t) => t.bg("success/10").text("success"),
      failed: (t) => t.bg("danger/10").text("danger"),
    })
    .when(job === "queued" || job === "running", (t) => t.poll(projectRoutes.status({ id }), "2s"));
}
