import { handlers } from "#lt";
import { projects } from "./projects.routes.ts";
import { createProject, deleteProject, findProjects, getProject } from "../../support/projects.service.ts";
import { JobBadge } from "./views/projects.components.ts";
import { ProjectListPage, ProjectRows } from "./views/projects.list.view.ts";
import { NewProjectPage, ProjectForm } from "./views/projects.form.view.ts";
import { ProjectDetailPage } from "./views/projects.detail.view.ts";

export default handlers(projects, {
  list: async ({ input }) => ProjectListPage({ q: input.q, items: await findProjects(input.q) }),
  rows: async ({ input }) => ProjectRows({ q: input.q, items: await findProjects(input.q) }),
  new: () => NewProjectPage(),
  create: {
    form: ProjectForm,
    ok: async ({ body, redirect }) => redirect(projects.detail({ id: (await createProject(body)).id })),
  },
  detail: async ({ input, notFound }) => {
    const project = await getProject(input.id);
    return project ? ProjectDetailPage(project) : notFound();
  },
  status: async ({ input, notFound }) => {
    const project = await getProject(input.id);
    return project ? JobBadge(project) : notFound();
  },
  remove: async ({ input, redirect }) => {
    await deleteProject(input.id);
    return redirect(projects.list());
  },
});
