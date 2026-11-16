import { cls, focusVisible, hover, span, type Cls } from "#st";
import type { Project } from "../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";

const buttonBase = cls("inline-flex cursor-pointer items-center rounded-control px-4 py-2 text-sm font-medium", focusVisible("ring-2"));
export const primaryButton = cls(buttonBase, "bg-primary text-on-accent", hover("bg-primary-700"));
export const quietButton = cls(buttonBase, "border border-line", hover("bg-surface-2"));
export const dangerButton = cls(buttonBase, "bg-danger text-on-accent", hover("bg-danger-700"));

const pill = cls("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium");

const statusTone: Record<Project["status"], Cls> = {
  active: cls("bg-success/10 text-success"),
  paused: cls("bg-warning/10 text-warning"),
  archived: cls("bg-surface-2 text-text-dim"),
};
export const StatusPill = (status: Project["status"]) => span(pill, statusTone[status], cls("capitalize"), status);

const jobTone: Record<Project["job"], Cls> = {
  queued: cls("bg-surface-2 text-text-dim"),
  running: cls("bg-primary/10 text-primary"),
  done: cls("bg-success/10 text-success"),
  failed: cls("bg-danger/10 text-danger"),
};
const jobLabel: Record<Project["job"], string> = {
  queued: "Export queued",
  running: "Exporting…",
  done: "Export ready",
  failed: "Export failed",
};
export const JobBadge = ({ id, job }: Pick<Project, "id" | "job">) =>
  span(
    pill,
    jobTone[job],
    projects.status({ id }).poll((job === "queued" || job === "running") && "2s"),
    jobLabel[job],
  );
