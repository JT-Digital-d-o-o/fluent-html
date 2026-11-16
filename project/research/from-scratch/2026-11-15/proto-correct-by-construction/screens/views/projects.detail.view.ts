import { a, backdrop, button, cls, dd, dialog, div, dl, dt, h1, h2, hover, modal, p } from "#st";
import { Layout } from "../../support/layout.ts";
import type { Project } from "../../support/projects.service.ts";
import { projects } from "../projects.routes.ts";
import { JobBadge, StatusPill, dangerButton, quietButton } from "./projects.components.ts";

const confirm = modal("delete-project");

const DeleteDialog = ({ id, name }: Project) =>
  dialog(
    cls("w-full max-w-sm rounded-card bg-surface p-6 shadow-lg", backdrop("bg-overlay/40")),
    confirm.root,
    h2(cls("text-lg font-semibold"), confirm.title, "Delete project?"),
    p(cls("mt-2 text-sm text-text-dim"), `"${name}" and its exports will be removed. This cannot be undone.`),
    div(
      cls("mt-6 flex justify-end gap-3"),
      button(quietButton, confirm.close, "Cancel"),
      button(dangerButton, projects.remove({ id }), "Delete project"),
    ),
  );

export const ProjectDetailPage = (project: Project) =>
  Layout(
    { title: project.name },
    a(cls("text-sm text-text-dim", hover("underline")), projects.list(), "Projects"),
    div(
      cls("mt-2 flex items-start justify-between gap-4"),
      div(h1(cls("text-2xl font-semibold"), project.name), p(cls("mt-1 text-text-dim"), project.description)),
      button(dangerButton, confirm.open, "Delete"),
    ),
    dl(
      cls("mt-6 grid grid-cols-[8rem_1fr] gap-y-3 text-sm"),
      dt(cls("text-text-dim"), "Status"),
      dd(StatusPill(project.status)),
      dt(cls("text-text-dim"), "Export"),
      dd(JobBadge(project)),
    ),
    DeleteDialog(project),
  );
