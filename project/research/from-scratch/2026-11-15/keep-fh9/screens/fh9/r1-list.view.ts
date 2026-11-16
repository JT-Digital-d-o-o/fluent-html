import { A, Div, ForEachKeyed, H1, IfThenElse, Input, Li, P, Span, Ul } from "../../proto/fh9.js";
import "../../proto/verbs.js";
import type { Project } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { StatusBadge } from "./r3-detail.view.js";
import { card, field, primaryButton } from "./ui.js";

type ListProps = { projects: Project[]; q: string };

export function ProjectListPage({ projects, q }: ListProps) {
  return Div(
    Div(
      H1("Projects").tw("text-2xl font-semibold text-text"),
      A("New project").nav(projectRoutes.new()).tw(primaryButton),
    ).tw("flex items-center justify-between mb-6"),
    Input()
      .setType("search")
      .setName("q")
      .setValue(q)
      .setPlaceholder("Search projects")
      .setAria({ label: "Search projects" })
      .tw(field, "mb-4")
      .search(ids.projectList, projectRoutes.rows()),
    ProjectList({ projects, q }),
  );
}

export function ProjectList({ projects, q }: ListProps) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () => Ul(ForEachKeyed(projects, (p) => `project-${p.id}`, ProjectRow)).tw("divide-y divide-line"),
      () => EmptyState({ q }),
    ),
  ).setId(ids.projectList).tw(card, "p-0");
}

function ProjectRow(project: Project) {
  return Li(
    A(
      Div(
        Span(project.name).tw("font-medium text-text"),
        Span(project.client).tw("text-sm text-text-dim"),
      ).tw("flex flex-col"),
      StatusBadge({ status: project.status }),
    )
      .nav(projectRoutes.detail({ id: project.id }))
      .tw("flex items-center justify-between gap-4 px-6 py-4 hover:bg-surface-2"),
  );
}

function EmptyState({ q }: { q: string }) {
  return Div(
    P(q ? `No projects match "${q}".` : "No projects yet.").tw("font-medium text-text"),
    P("Create one to get started.").tw("text-sm text-text-dim"),
  ).tw("px-6 py-12 text-center");
}
