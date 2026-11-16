import { A, Button, Dd, Dialog, Div, Dl, Dt, H1, H2, P } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import type { Project } from "../projects.service.js";
import { projectRoutes, ids } from "../projects.routes.js";
import { JobBadge, StatusPill, dangerButton, quietButton } from "./projects.components.js";

function DeleteDialog({ id, name }: Project) {
  return Dialog(
    H2("Delete project?").text("lg").font("semibold"),
    P(`"${name}" and its exports will be removed. This cannot be undone.`).mt("2").text("sm").text("text-dim"),
    Div(
      Button("Cancel").setType("button").setCommand("close").setCommandfor(ids.deleteDialog).apply(quietButton),
      Button("Delete project").setType("button").submit(projectRoutes.remove({ id })).apply(dangerButton),
    ).mt("6").flex().justify("end").gap("3"),
  )
    .setId(ids.deleteDialog)
    .setClosedby("any")
    .w("full").maxW("sm").rounded("card").bg("surface").p("6").shadow("lg")
    .variant("[&::backdrop]", { bg: "overlay/40" });
}

export function ProjectDetailPage(project: Project) {
  return Layout({
    title: project.name,
    children: [
      A("Projects").nav(projectRoutes.list()).text("sm").text("text-dim").hover({ underline: true }),
      Div(
        Div(H1(project.name).text("2xl").font("semibold"), P(project.description ?? "").mt("1").text("text-dim")),
        Button("Delete").setType("button").setCommand("show-modal").setCommandfor(ids.deleteDialog).apply(dangerButton),
      ).mt("2").flex().items("start").justify("between").gap("4"),
      Dl(
        Dt("Status").text("text-dim"),
        Dd(StatusPill({ status: project.status })),
        Dt("Export").text("text-dim"),
        Dd(JobBadge(project)),
      ).mt("6").grid().gridCols("[8rem_1fr]").gap("y", "3").text("sm"),
      DeleteDialog(project),
    ],
  });
}
