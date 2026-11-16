import { A, Div, H1, Input, Li, P, Ul, ForEachKeyed, IfThenElse } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import type { Project } from "../projects.service.js";
import { projectRoutes, ids } from "../projects.routes.js";
import { StatusPill, primaryButton } from "./projects.components.js";

type ListProps = { items: Project[]; q?: string };

function Row(item: Project) {
  return Li(
    A(
      Div(P(item.name).font("medium"), P(item.description).text("sm").text("text-dim")),
      StatusPill({ status: item.status }),
    )
      .nav(projectRoutes.detail({ id: item.id }))
      .flex().items("center").justify("between").gap("4").px("4").py("3")
      .hover({ bg: "surface-2" }),
  );
}

function Empty({ q }: Pick<ListProps, "q">) {
  return Div(
    P(q ? `No projects match "${q}"` : "No projects yet").font("medium"),
    P(q ? "Try a different search." : "Create your first project to get started.").mt("1").text("sm").text("text-dim"),
  ).px("4").py("12").text("center");
}

export function ProjectRows({ items, q }: ListProps) {
  return Div(
    IfThenElse(
      items.length > 0,
      () => Ul(ForEachKeyed(items, (item) => `project-${item.id}`, Row)).divideY().divide("line"),
      () => Empty({ q }),
    ),
  )
    .setId(ids.projectList)
    .rounded("card").border().border("line").bg("surface");
}

export function ProjectListPage(props: ListProps) {
  return Layout({
    title: "Projects",
    children: [
      Div(
        H1("Projects").text("2xl").font("semibold"),
        A("New project").nav(projectRoutes.new()).apply(primaryButton),
      ).flex().items("center").justify("between"),
      Input()
        .setType("search")
        .setName("q")
        .setValue(props.q ?? "")
        .setPlaceholder("Search projects")
        .setAriaLabel("Search projects")
        .search(ids.projectList, projectRoutes.rows())
        .mt("6").w("full").rounded("control").border().border("line").bg("surface").px("3").py("2").text("sm"),
      Div(ProjectRows(props)).mt("4"),
    ],
  });
}
