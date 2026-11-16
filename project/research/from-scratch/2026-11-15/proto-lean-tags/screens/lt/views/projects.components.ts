import { span, tw, type Tw } from "lean-tags";
import type { Project } from "../../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";

const buttonBase = tw`inline-flex cursor-pointer items-center rounded-control px-4 py-2 text-sm font-medium focus-visible:ring-2`;
export const primaryButton = tw`${buttonBase} bg-primary text-on-accent hover:bg-primary-700`;
export const quietButton = tw`${buttonBase} border border-line hover:bg-surface-2`;
export const dangerButton = tw`${buttonBase} bg-danger text-on-accent hover:bg-danger-700`;

const pill = tw`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`;

const statusTone: Record<Project["status"], Tw> = {
  active: tw`bg-success/10 text-success`,
  paused: tw`bg-warning/10 text-warning`,
  archived: tw`bg-surface-2 text-text-dim`,
};
export const StatusPill = (status: Project["status"]) => span(pill, statusTone[status], tw`capitalize`, status);

const jobTone: Record<Project["job"], Tw> = {
  queued: tw`bg-surface-2 text-text-dim`,
  running: tw`bg-primary/10 text-primary`,
  done: tw`bg-success/10 text-success`,
  failed: tw`bg-danger/10 text-danger`,
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
