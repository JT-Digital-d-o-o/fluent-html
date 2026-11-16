import { A, Div, ForEachKeyed, H1, IfThenElse, Input, Li, P, Span, Ul } from "fluent-html";
import "../../proto/verbs.js";
import type { Project } from "../domain.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { StatusBadge } from "./r3-detail.view.js";
import { card, field, primaryButton } from "./ui.js";

type ListProps = { projects: Project[]; q: string };

export function ProjectListPage({ projects, q }: ListProps) {
  return Div(
    Div(
      H1("Projects").text("2xl").font("semibold").text("text"),
      A("New project").nav(projectRoutes.new()).apply(primaryButton),
    ).flex().items("center").justify("between").mb("6"),
    Input()
      .setType("search")
      .setName("q")
      .setValue(q)
      .setPlaceholder("Search projects")
      .setAria({ label: "Search projects" })
      .apply(field)
      .mb("4")
      .search(ids.projectList, projectRoutes.rows()),
    ProjectList({ projects, q }),
  );
}

export function ProjectList({ projects, q }: ListProps) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () => Ul(ForEachKeyed(projects, (p) => `project-${p.id}`, ProjectRow)).divideY().divide("line"),
      () => EmptyState({ q }),
    ),
  ).setId(ids.projectList).apply(card).p("0");
}

function ProjectRow(project: Project) {
  return Li(
    A(
      Div(
        Span(project.name).font("medium").text("text"),
        Span(project.client).text("sm").text("text-dim"),
      ).flex().flex("col"),
      StatusBadge({ status: project.status }),
    )
      .nav(projectRoutes.detail({ id: project.id }))
      .flex().items("center").justify("between").gap("4").px("6").py("4")
      .hover({ bg: "surface-2" }),
  );
}

function EmptyState({ q }: { q: string }) {
  return Div(
    P(q ? `No projects match "${q}".` : "No projects yet.").font("medium").text("text"),
    P("Create one to get started.").text("sm").text("text-dim"),
  ).px("6").py("12").text("center");
}
