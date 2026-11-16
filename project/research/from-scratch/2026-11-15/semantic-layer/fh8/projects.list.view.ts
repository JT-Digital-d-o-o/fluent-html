import { Div, H1, P, Span, A, Input, Label, Ul, Li, ForEachKeyed, IfThenElse } from "fluent-html";
import { Layout } from "../../../core/layout/layout.view.js";
import { inputStyle } from "../../../shared/ui/form.js";
import { projectRoutes, projectIds } from "../projects.routes.js";
import type { Project } from "../projects.service.js";

type ListProps = { projects: Project[]; q?: string };

export function ProjectListPage({ projects, q }: ListProps) {
  return Layout({
    title: "Projects",
    children: Div(
      Div(
        H1("Projects").text("2xl").font("semibold").text("text"),
        A("New project").nav(projectRoutes.new())
          .rounded("control").bg("primary").px("4").py("2").text("on-accent").hover({ bg: "primary-700" }),
      ).flex().items("center").justify("between").gap("4"),
      Label("Search projects").setFor("project-search").srOnly(),
      Input("search").setId("project-search").setName("q").setValue(q ?? "").setPlaceholder("Search by name")
        .search(projectIds.projectRows, projectRoutes.rows())
        .apply(inputStyle).mt("6").w("full"),
      ProjectRows({ projects, q }),
    ).mx("auto").maxW("3xl").p("6"),
  });
}

export function ProjectRows({ projects, q }: ListProps) {
  return Div(
    IfThenElse(
      projects.length > 0,
      () =>
        Ul(
          ForEachKeyed(projects, (p) => p.id, (p) =>
            Li(
              A(
                Span(p.name).font("medium").text("text"),
                Span(p.status).text("sm").text("text-dim"),
              ).nav(projectRoutes.detail({ id: p.id }))
                .flex().items("center").justify("between").px("4").py("3").hover({ bg: "surface-2" }),
            ),
          ),
        ).mt("4").divideY().divide("line").rounded("card").border().border("line").bg("surface"),
      () =>
        Div(
          P(q ? `No projects match "${q}"` : "No projects yet").font("medium").text("text"),
          P("Create one to get started.").mt("1").text("sm").text("text-dim"),
        ).mt("4").rounded("card").border().border("dashed").border("line").p("10").text("center"),
    ),
  ).setId(projectIds.projectRows);
}
