import { defineController, page, fragment } from "../../core/render/define-controller.js";
import { pollRateLimit } from "../../core/htmx/rate-limit.js";
import { NotFoundPage } from "../../shared/views/not-found.view.js";
import { db } from "./projects.service.js";
import { projectRoutes, projectIds } from "./projects.routes.js";
import { createProjectSchema, validateProject, type ProjectStatus } from "./projects.schema.js";
import { ProjectListPage, ProjectRows } from "./views/projects.list.view.js";
import { ProjectNewPage, ProjectForm } from "./views/projects.new.view.js";
import { ProjectDetailPage, ProjectStatusBadge } from "./views/projects.detail.view.js";

export default defineController(projectRoutes, {
  list: page(async ({ query }) => ProjectListPage({ projects: await db.search(query.q), q: query.q })),
  rows: fragment(async ({ query }) => ProjectRows({ projects: await db.search(query.q), q: query.q })),
  new: page(() => ProjectNewPage({ values: { status: "draft" } })),
  create: {
    schema: createProjectSchema,
    POST: async (request, reply) => {
      const errors = validateProject(request.body);
      if (!errors.name && (await db.nameTaken(request.body.name))) errors.name = "A project with this name exists";
      if (Object.keys(errors).length > 0) {
        return reply.renderInvalid(
          { fragment: [projectIds.projectForm, ProjectForm], page: ProjectNewPage },
          { values: request.body, errors },
        );
      }
      const project = await db.create({ ...request.body, status: request.body.status as ProjectStatus });
      return reply.redirect(projectRoutes.detail.resolve({ id: project.id }));
    },
  },
  detail: {
    GET: async (request, reply) => {
      const project = await db.find(request.params.id);
      if (!project) return reply.code(404).renderPage(NotFoundPage());
      return reply.renderPage(ProjectDetailPage({ project, job: await db.job(project.id) }));
    },
  },
  status: fragment(
    async ({ params }) => ProjectStatusBadge({ id: params.id, job: await db.job(params.id) }),
    { config: { rateLimit: pollRateLimit() } },
  ),
  delete: {
    POST: async (request, reply) => {
      await db.remove(request.params.id);
      return reply.redirect(projectRoutes.list.resolve());
    },
  },
});
