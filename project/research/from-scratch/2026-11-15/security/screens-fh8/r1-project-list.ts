import { A, Div, ForEach, H1, Header, IfThenElse, Input, Li, P, Section, Span, Ul } from "fluent-html";
import { Layout } from "./layout.js";
import { ids, projectRoutes } from "./projects.routes.js";
import type { Project } from "./projects.types.js";

type Props = { projects: readonly Project[]; q: string };

export function ProjectListPage({ projects, q }: Props) {
  return Layout({
    title: "Projects",
    children: [
      Header(
        H1("Projects").text("2xl").font("semibold"),
        A("New project")
          .nav(projectRoutes.new())
          .rounded("control").bg("primary").px("4").py("2").text("sm").font("medium").text("on-accent")
          .hover({ bg: "primary-700" }),
      ).flex().items("center").justify("between").gap("4"),
      Input()
        .setType("search")
        .setName("q")
        .setValue(q)
        .setPlaceholder("Search projects")
        .setAria({ label: "Search projects" })
        .search(ids.projectList, projectRoutes.rows())
        .mt("6").w("full").rounded("control").border().border("line").bg("surface").px("3").py("2")
        .focusVisible({ ring: "2", outline: "hidden" })
        .focusVisible({ ring: "primary" }),
      ProjectList({ projects, q }),
    ],
  });
}

export function ProjectList({ projects, q }: Props) {
  return Section(
    IfThenElse(
      projects.length > 0,
      () =>
        Ul(ForEach(projects, (project) => ProjectRow({ project })))
          .divideY().divide("line").rounded("card").border().border("line").bg("surface"),
      () => EmptyState({ q }),
    ),
  ).setId(ids.projectList).mt("4").setAria({ label: "Projects" });
}

function ProjectRow({ project }: { project: Project }) {
  return Li(
    A(
      Span(project.name).font("medium"),
      Span(project.client).text("sm").text("text-dim"),
    )
      .nav(projectRoutes.detail({ id: project.id }))
      .flex().items("center").justify("between").gap("4").px("4").py("3")
      .hover({ bg: "surface-2" }),
  );
}

function EmptyState({ q }: { q: string }) {
  return Div(
    P(q ? `No projects match "${q}"` : "No projects yet").font("medium"),
    P(q ? "Try a different search." : "Create the first one to get started.").mt("1").text("sm").text("text-dim"),
  ).rounded("card").border().border("dashed").border("line").p("10").text("center");
}
