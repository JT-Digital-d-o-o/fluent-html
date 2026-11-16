import { Button, Dialog, Div, H1, H2, MatchValue, P, Span, tw, type Tw } from "../../proto/fh9.js";
import "../../proto/verbs.js";
import type { Project, ProjectStatus } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { card, dangerButton, quietButton } from "./ui.js";

export function ProjectDetailPage({ project }: { project: Project }) {
  return Div(
    Div(
      Div(
        H1(project.name).tw("text-2xl font-semibold text-text"),
        P(project.client).tw("text-text-dim"),
      ),
      Button("Delete").setCommand("show-modal").setCommandfor(ids.deleteDialog).tw(quietButton),
    ).tw("flex items-start justify-between mb-6"),
    Div(
      H2("Build").tw("text-sm font-medium text-text-dim mb-2"),
      ProjectStatusRegion({ project }),
    ).tw(card),
    DeleteDialog({ project }),
  );
}

const isRunning = (status: ProjectStatus) => status === "queued" || status === "building";

/** The polled region: it carries the poll only while the job runs, so the last answer stops it. */
export function ProjectStatusRegion({ project }: { project: Project }) {
  return Div(
    StatusBadge({ status: project.status }),
    Span(`Updated ${project.updatedAt}`).tw("text-sm text-text-faint"),
  )
    .setId(ids.projectStatus)
    .tw("flex items-center gap-3")
    .when(isRunning(project.status), (t) => t.poll(projectRoutes.status({ id: project.id }), "3s"));
}

const BADGE = {
  queued: { label: "Queued", tone: tw("bg-surface-2 text-text-dim") },
  building: { label: "Building", tone: tw("bg-warning/10 text-warning") },
  ready: { label: "Ready", tone: tw("bg-success/10 text-success") },
  failed: { label: "Failed", tone: tw("bg-danger/10 text-danger") },
} satisfies Record<ProjectStatus, { label: string; tone: Tw }>;

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, tone } = MatchValue(status, BADGE);
  return Span(label).tw("inline-flex px-2 py-0.5 rounded-full text-xs font-medium", tone);
}

function DeleteDialog({ project }: { project: Project }) {
  return Dialog(
    H2("Delete this project?").tw("text-lg font-semibold text-text"),
    P(`"${project.name}" and its builds are removed. This cannot be undone.`).tw("mt-2 text-sm text-text-dim"),
    Div(
      Button("Cancel").setCommand("close").setCommandfor(ids.deleteDialog).tw(quietButton),
      Button("Delete project").nav(projectRoutes.remove({ id: project.id })).tw(dangerButton),
    ).tw("flex justify-end gap-3 mt-6"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .setAria({ label: "Delete project" })
    .tw("w-full max-w-md p-6 rounded-card bg-surface backdrop:bg-inverse/50");
}
