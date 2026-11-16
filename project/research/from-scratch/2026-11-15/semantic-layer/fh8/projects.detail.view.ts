import { Div, H1, H2, P, Span, Button, Dialog, Form, Match, MatchValue } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { dialogStyle, dialogTitle, dialogBody, dialogActions, ghostButton, dangerButton } from "../../../shared/ui/dialog.js";
import { projectRoutes, projectIds } from "../projects.routes.js";
import type { Project, Job } from "../projects.service.js";

export function ProjectDetailPage({ project, job }: { project: Project; job: Job | undefined }) {
  return Layout({
    title: project.name,
    children: Div(
      Div(
        Div(
          H1(project.name).text("2xl").font("semibold").text("text"),
          P(project.description || "No description.").mt("1").text("text-dim"),
        ),
        Button("Delete").setType("button").setCommand("show-modal").setCommandfor(projectIds.projectDeleteDialog)
          .rounded("control").border().border("danger").px("4").py("2").text("danger").cursor("pointer").hover({ bg: "danger/10" }),
      ).flex().items("start").justify("between").gap("4"),
      DeleteProjectDialog({ id: project.id }),
      ProjectStatusBadge({ id: project.id, job }),
    ).mx("auto").maxW("3xl").p("6"),
  });
}

function DeleteProjectDialog({ id }: { id: number }) {
  return Dialog(
    Form(
      H2("Delete this project?").setId(projectIds.projectDeleteTitle).apply(dialogTitle),
      P("Its jobs and files go with it. This cannot be undone.").apply(dialogBody),
      Div(
        Button("Cancel").setType("button").setCommand("close").setCommandfor(projectIds.projectDeleteDialog).apply(ghostButton),
        Button("Delete project").setType("submit").apply(dangerButton),
      ).apply(dialogActions),
    ).submit(projectRoutes.delete({ id })),
  )
    .setId(projectIds.projectDeleteDialog)
    .setClosedby("any")
    .setAria({ labelledby: projectIds.projectDeleteTitle })
    .apply(dialogStyle);
}

/** The polled region. A missing job answers the terminal, trigger-less variant with the same id. */
export function ProjectStatusBadge({ id, job }: { id: number; job: Job | undefined }) {
  const region = Div().setId(projectIds.projectStatus).setRole("status");
  if (!job) return region;
  const polling = job.state === "queued" || job.state === "running";
  return Div(
    Span(MatchValue(job.state, { queued: "Queued", running: `Running, ${job.progress}%`, done: "Finished", failed: "Failed" }))
      .mt("6").inlineFlex().rounded("full").px("3").py("1").text("sm").font("medium")
      .whenMatch(job.state, {
        queued: (t) => t.bg("surface-2").text("text-dim"),
        running: (t) => t.bg("info/10").text("info"),
        done: (t) => t.bg("success/10").text("success"),
        failed: (t) => t.bg("danger/10").text("danger"),
      }),
  )
    .setId(projectIds.projectStatus)
    .setRole("status")
    .when(polling, (t) => t.poll(projectRoutes.status({ id })));
}
