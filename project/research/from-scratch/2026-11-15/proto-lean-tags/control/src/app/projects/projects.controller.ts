import { defineController, page } from "../../core/render/define-controller.js";
import { isHtmxRequest } from "../../core/htmx/request.js";
import { projectRoutes, ids } from "./projects.routes.js";
import { projectListSchema, projectSchema, validateProject } from "./projects.schema.js";
import { createProject, deleteProject, findProjects, getProject } from "./projects.service.js";
import { JobBadge } from "./views/projects.components.js";
import { ProjectListPage, ProjectRows } from "./views/projects.list.view.js";
import { NewProjectPage, ProjectForm } from "./views/projects.form.view.js";
import { ProjectDetailPage } from "./views/projects.detail.view.js";

export default defineController(projectRoutes, {
  list: {
    schema: projectListSchema,
    GET: async (request, reply) => {
      const { q } = request.query;
      return reply.renderPage(ProjectListPage({ q, items: await findProjects(q) }));
    },
  },
  rows: {
    schema: projectListSchema,
    GET: async (request, reply) => {
      const { q } = request.query;
      return reply.renderFragment(ids.projectList, ProjectRows({ q, items: await findProjects(q) }));
    },
  },
  new: page(() => NewProjectPage({})),
  create: {
    schema: projectSchema,
    POST: async (request, reply) => {
      const result = validateProject(request.body);
      if (!result.ok) {
        const props = { values: request.body, errors: result.errors };
        return reply.code(422).renderView(isHtmxRequest(request) ? ProjectForm(props) : NewProjectPage(props));
      }
      const project = await createProject(result.value);
      return reply.redirect(projectRoutes.detail.resolve({ id: project.id }));
    },
  },
  detail: {
    GET: async (request, reply) => {
      const project = await getProject(request.params.id);
      if (!project) return reply.callNotFound();
      return reply.renderPage(ProjectDetailPage(project));
    },
  },
  status: {
    GET: async (request, reply) => {
      const project = await getProject(request.params.id);
      if (!project) return reply.callNotFound();
      return reply.renderFragment(ids.projectStatus, JobBadge(project));
    },
  },
  remove: {
    POST: async (request, reply) => {
      await deleteProject(request.params.id);
      return reply.redirect(projectRoutes.list.resolve());
    },
  },
});
