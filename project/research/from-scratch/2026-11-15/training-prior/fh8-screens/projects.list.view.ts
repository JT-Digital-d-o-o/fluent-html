import { A, Div, H1, Input, Li, P, Span, Ul, ForEachKeyed, IfThenElse } from "fluent-html";
import { Layout } from "../../core/layout/layout.view.js";
import { projectRoutes, ids } from "./projects.routes.js";
import type { Project } from "./projects.schema.js";
import { StatusBadge, control, primary } from "./ui.js";

type Props = { rows: Project[]; q: string };

export function ProjectsPage({ rows, q }: Props) {
  return Layout({
    title: "Projects",
    children: [
      Div(
        H1("Projects").text("2xl").font("semibold").text("text"),
        A("New project").nav(projectRoutes.new()).apply(primary),
      ).flex().items("center").justify("between").gap("4"),
      Input("search")
        .setName("q")
        .setValue(q)
        .setPlaceholder("Search projects")
        .setAria("label", "Search projects")
        .search(ids.projectList, projectRoutes.results())
        .mt("6")
        .w("full")
        .apply(control),
      ProjectList({ rows, q }),
    ],
  });
}

export function ProjectList({ rows, q }: Props) {
  return Div(
    IfThenElse(
      rows.length === 0,
      () => P(q ? `No projects match "${q}".` : "No projects yet. Create the first one.").py("12").text("center").text("text-dim"),
      () => Ul(ForEachKeyed(rows, (p) => p.id, ProjectRow)).divideY().divide("line"),
    ),
  ).setId(ids.projectList).mt("4");
}

function ProjectRow(p: Project) {
  return Li(
    A(
      Span(
        Span(p.name).block().font("medium").text("text"),
        Span(p.client).block().text("sm").text("text-dim"),
      ),
      StatusBadge({ status: p.status }),
    )
      .nav(projectRoutes.detail({ id: p.id }))
      .flex()
      .items("center")
      .justify("between")
      .gap("4")
      .py("3")
      .hover({ bg: "surface-2" }),
  );
}
