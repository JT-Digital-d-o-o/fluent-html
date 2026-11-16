import { A, Button, Dialog, Div, H1, H2, Nav, P, Span, Time, Match, type StylerFor } from "fluent-html";
import { Layout } from "../../core/layout/layout.view.js";
import { projectRoutes, ids } from "./projects.routes.js";
import type { Job, Project } from "./projects.schema.js";
import { StatusBadge, danger, quiet } from "./ui.js";

export function ProjectDetailPage({ project, job }: { project: Project; job: Job }) {
  return Layout({
    title: project.name,
    children: [
      Nav(A("Projects").nav(projectRoutes.list()).hover({ underline: true }), " / ", project.name)
        .setAria("label", "Breadcrumb")
        .text("sm")
        .text("text-dim"),
      Div(
        H1(project.name).text("2xl").font("semibold").text("text"),
        StatusBadge({ status: project.status }),
      ).mt("4").flex().items("center").justify("between").gap("4"),
      P(project.client).mt("1").text("text-dim"),
      P("Export", JobStatus({ projectId: project.id, job })).mt("6").flex().items("center").gap("3").text("sm").text("text"),
      Button("Delete project")
        .setType("button")
        .setCommand("show-modal")
        .setCommandfor(ids.deleteDialog)
        .cursor("pointer")
        .mt("8")
        .rounded("control")
        .border()
        .border("danger")
        .px("4")
        .py("2")
        .text("danger")
        .hover({ bg: "danger/10" }),
      DeleteDialog({ project }),
    ],
  });
}

function DeleteDialog({ project }: { project: Project }) {
  return Dialog(
    H2(`Delete ${project.name}?`).setId(ids.deleteTitle).text("lg").font("semibold").text("text"),
    P("This removes the project and its exports. It cannot be undone.").mt("2").text("text-dim"),
    Div(
      Button("Cancel").setType("button").setCommand("close").setCommandfor(ids.deleteDialog).cursor("pointer").apply(quiet),
      Button("Delete").setType("button").submit(projectRoutes.remove({ id: project.id })).apply(danger),
    ).mt("6").flex().justify("end").gap("3"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .setAria("labelledby", ids.deleteTitle)
    .rounded("card")
    .bg("surface")
    .p("6")
    .shadow("lg")
    .variant("backdrop", { bg: "black/40" });
}

const tone: StylerFor<Job["state"]> = (t, state) =>
  t.whenMatch(state, {
    queued: (b) => b.bg("surface-2").text("text-dim"),
    running: (b) => b.bg("primary/10").text("primary"),
    done: (b) => b.bg("success/10").text("success"),
    failed: (b) => b.bg("danger/10").text("danger"),
  });

export function JobStatus({ projectId, job }: { projectId: number; job: Job }) {
  const running = job.state === "queued" || job.state === "running";
  return Span(
    Match(job, "state", {
      queued: () => "Queued",
      running: (j) => `Running, ${j.percent}%`,
      done: (j) => Time("Done").setDatetime(j.finishedAt),
      failed: (j) => `Failed: ${j.reason}`,
    }),
  )
    .setId(ids.jobStatus)
    .when(running, (t) => t.poll(projectRoutes.status({ id: projectId }), "2s"))
    .rounded("full")
    .px("3")
    .py("1")
    .text("sm")
    .font("medium")
    .apply((t) => tone(t, job.state));
}
