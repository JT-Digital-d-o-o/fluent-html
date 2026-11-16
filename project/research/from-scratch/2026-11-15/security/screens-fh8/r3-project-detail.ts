import { A, Button, Dd, Dialog, Div, Dl, Dt, H1, H2, Header, IfThenElse, Nav, P, Span, externalUrl } from "fluent-html";
import type { StylerFor } from "@tpl/shared/stylers.js";
import { Layout } from "./layout.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { Job, JobStatus, Project } from "./projects.types.js";

type Props = { project: Project; job: Job };

const tone: StylerFor<JobStatus> = (status) => (t) =>
  t.whenMatch(status, {
    queued: (s) => s.bg("surface-2").text("text-dim"),
    running: (s) => s.bg("info/10").text("info"),
    done: (s) => s.bg("success/10").text("success"),
    failed: (s) => s.bg("danger/10").text("danger"),
  });

const LABEL = { queued: "Queued", running: "Importing", done: "Ready", failed: "Import failed" } satisfies Record<JobStatus, string>;

export function ProjectDetailPage({ project, job }: Props) {
  return Layout({
    title: project.name,
    children: [
      Nav(A("Projects").nav(projectRoutes.list()).hover({ underline: true }), " / ", project.name)
        .setAria({ label: "Breadcrumb" }).text("sm").text("text-dim"),
      Header(
        Div(H1(project.name).text("2xl").font("semibold"), StatusBadge({ projectId: project.id, job }))
          .flex().items("center").gap("3"),
        Button("Delete")
          .setType("button")
          .setCommand("show-modal")
          .setCommandfor(ids.confirmDelete)
          .rounded("control").border().border("line").px("3").py("2").text("sm").text("danger").cursor("pointer")
          .hover({ bg: "danger/10" }),
      ).mt("2").flex().items("center").justify("between").gap("4"),
      Dl(
        Dt("Client").text("text-dim"),
        Dd(project.client),
        Dt("Budget").text("text-dim"),
        Dd(`${project.budget} EUR`),
        Dt("Website").text("text-dim"),
        Dd(
          IfThenElse(
            project.website,
            (website) => A(website).setHref(externalUrl(website)).setRel("noopener").underline(),
            () => "None",
          ),
        ),
      ).mt("6").grid().gridCols("2").gap("4").text("sm"),
      ConfirmDelete({ project }),
    ],
  });
}

export function StatusBadge({ projectId, job }: { projectId: number; job: Job }) {
  const live = job.status === "queued" || job.status === "running";
  return Span(LABEL[job.status])
    .setId(ids.statusBadge)
    .inlineFlex().items("center").rounded("full").px("2.5").py("0.5").text("xs").font("medium")
    .apply(tone(job.status))
    .when(live, (t) => t.poll(projectRoutes.status({ id: projectId }), "2s"));
}

function ConfirmDelete({ project }: { project: Project }) {
  return Dialog(
    H2(`Delete ${project.name}?`).setId(ids.confirmDeleteTitle).text("lg").font("semibold"),
    P("This removes the project and its entries. It cannot be undone.").mt("2").text("sm").text("text-dim"),
    Div(
      Button("Cancel")
        .setType("button")
        .setCommand("close")
        .setCommandfor(ids.confirmDelete)
        .rounded("control").border().border("line").px("3").py("2").text("sm").cursor("pointer"),
      Button("Delete project")
        .setType("button")
        .nav(projectRoutes.remove({ id: project.id }))
        .rounded("control").bg("danger").px("3").py("2").text("sm").font("medium").text("on-accent").cursor("pointer"),
    ).mt("6").flex().justify("end").gap("3"),
  )
    .setId(ids.confirmDelete)
    .setClosedby("any")
    .setAria({ labelledby: ids.confirmDeleteTitle.id })
    .rounded("card").p("6")
    .variant("[&::backdrop]", { bg: "inverse/40" });
}
