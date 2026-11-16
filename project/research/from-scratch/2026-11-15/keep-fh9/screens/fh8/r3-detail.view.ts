import { Button, Dialog, Div, H1, H2, Match, P, Span } from "fluent-html";
import "../../proto/verbs.js";
import type { Project, ProjectStatus } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { card, dangerButton, quietButton } from "./ui.js";

export function ProjectDetailPage({ project }: { project: Project }) {
  return Div(
    Div(
      Div(
        H1(project.name).text("2xl").font("semibold").text("text"),
        P(project.client).text("text-dim"),
      ),
      Button("Delete")
        .setType("button")
        .setCommand("show-modal")
        .setCommandfor(ids.deleteDialog)
        .cursor("pointer")
        .apply(quietButton),
    ).flex().items("start").justify("between").mb("6"),
    Div(
      H2("Build").text("sm").font("medium").text("text-dim").mb("2"),
      ProjectStatusRegion({ project }),
    ).apply(card),
    DeleteDialog({ project }),
  );
}

const isRunning = (status: ProjectStatus) => status === "queued" || status === "building";

/** The polled region: it carries the poll only while the job runs, so the last answer stops it. */
export function ProjectStatusRegion({ project }: { project: Project }) {
  return Div(
    StatusBadge({ status: project.status }),
    Span(`Updated ${project.updatedAt}`).text("sm").text("text-faint"),
  )
    .setId(ids.projectStatus)
    .flex().items("center").gap("3")
    .when(isRunning(project.status), (t) => t.poll(projectRoutes.status({ id: project.id }), "3s"));
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const badge = (label: string) => Span(label).inlineFlex().px("2").py("0.5").rounded("full").text("xs").font("medium");
  return Match(status, {
    queued: () => badge("Queued").bg("surface-2").text("text-dim"),
    building: () => badge("Building").bg("warning/10").text("warning"),
    ready: () => badge("Ready").bg("success/10").text("success"),
    failed: () => badge("Failed").bg("danger/10").text("danger"),
  });
}

function DeleteDialog({ project }: { project: Project }) {
  return Dialog(
    H2("Delete this project?").text("lg").font("semibold").text("text"),
    P(`"${project.name}" and its builds are removed. This cannot be undone.`).mt("2").text("sm").text("text-dim"),
    Div(
      Button("Cancel")
        .setType("button")
        .setCommand("close")
        .setCommandfor(ids.deleteDialog)
        .cursor("pointer")
        .apply(quietButton),
      Button("Delete project").setType("button").nav(projectRoutes.remove({ id: project.id })).apply(dangerButton),
    ).flex().justify("end").gap("3").mt("6"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .setAria({ label: "Delete project" })
    .w("full").maxW("md").p("6").rounded("card").bg("surface")
    .variant("[&::backdrop]", { bg: "inverse/50" });
}
