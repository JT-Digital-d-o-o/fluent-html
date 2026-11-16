// Correct by construction (proto-correct-by-construction, "Strict Tags"): the library, and the prototype's own screens, schema, layout and service as the app.
import { projects } from "../../../proto-correct-by-construction/screens/projects.routes.ts";
import { ProjectListPage, ProjectRows } from "../../../proto-correct-by-construction/screens/views/projects.list.view.ts";
import { ProjectForm, NewProjectPage } from "../../../proto-correct-by-construction/screens/views/projects.form.view.ts";
import { ProjectDetailPage } from "../../../proto-correct-by-construction/screens/views/projects.detail.view.ts";
import { JobBadge } from "../../../proto-correct-by-construction/screens/views/projects.components.ts";
import { findProjects, getProject } from "../../../proto-correct-by-construction/support/projects.service.ts";
export * from "../../../proto-correct-by-construction/lib/index.ts";
export { projects, ProjectListPage, ProjectRows, ProjectForm, NewProjectPage, ProjectDetailPage, JobBadge, findProjects, getProject };
export { ProjectInput } from "../../../proto-correct-by-construction/screens/projects.schema.ts";
export { primaryButton } from "../../../proto-correct-by-construction/screens/views/projects.components.ts";
export { Layout } from "../../../proto-correct-by-construction/support/layout.ts";
export type { Project } from "../../../proto-correct-by-construction/support/projects.service.ts";
export { hostile, tone, count } from "../common/data.ts";

type Redirect = (to: ReturnType<typeof projects.list>) => any;
// The prototype controller's entries, so a seed replaces one: handlers(projects, { ...entries, status: … }).
export const entries = {
  list: async ({ input }: { input: { q?: string } }) => ProjectListPage({ q: input.q, items: await findProjects(input.q) }),
  rows: async ({ input }: { input: { q?: string } }) => ProjectRows({ q: input.q, items: await findProjects(input.q) }),
  new: () => NewProjectPage(),
  create: { form: ProjectForm, ok: async ({ redirect }: { redirect: Redirect }) => redirect(projects.list()) },
  detail: async () => ProjectDetailPage((await getProject(1))!),
  status: async () => JobBadge((await getProject(1))!),
  remove: async ({ redirect }: { redirect: Redirect }) => redirect(projects.list()),
};
