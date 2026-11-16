import { Value } from "@sinclair/typebox/value";
import type { ErrorBag } from "fluent-html";
import { defineController, page } from "../../core/render/define-controller.js";
import { ids, projectRoutes } from "./projects.routes.js";
import { CreateProjectBody, idParamsSchema, listQuerySchema, type CreateProjectReq } from "./projects.schema.js";
import { JobStatus, NewProjectPage, ProjectDetailPage, ProjectForm, ProjectList, ProjectListPage } from "./projects.views.js";
import * as store from "./projects.service.js";

function fieldErrors(body: unknown): ErrorBag<CreateProjectReq> {
  const errors: ErrorBag<CreateProjectReq> = {};
  for (const e of Value.Errors(CreateProjectBody, body)) {
    const field = e.path.slice(1) as keyof CreateProjectReq;
    errors[field] ??= e.message;
  }
  return errors;
}

export default defineController(projectRoutes, {
  list: {
    schema: listQuerySchema,
    GET: async (request, reply) =>
      reply.renderPage(ProjectListPage({ q: request.query.q, projects: await store.search(request.server.prisma, request.query.q) })),
  },
  rows: {
    schema: listQuerySchema,
    GET: async (request, reply) =>
      reply.renderFragment(ids.projectList, ProjectList({ projects: await store.search(request.server.prisma, request.query.q) })),
  },
  new: page(NewProjectPage),
  create: {
    POST: async (request, reply) => {
      const values = request.body as Partial<CreateProjectReq>;
      const errors = fieldErrors(request.body);
      if (Object.keys(errors).length === 0 && (await store.nameTaken(request.server.prisma, values.name!))) {
        errors.name = "A project with this name exists";
      }
      if (Object.keys(errors).length > 0) {
        return reply.renderInvalid({ fragment: [ids.projectForm, ProjectForm], page: NewProjectPage }, { values, errors });
      }
      const project = await store.create(request.server.prisma, values as CreateProjectReq);
      return reply.redirect(projectRoutes.detail.resolve({ id: project.id }));
    },
  },
  detail: {
    schema: idParamsSchema,
    GET: async (request, reply) => {
      const project = await store.get(request.server.prisma, request.params.id);
      return reply.renderPage(ProjectDetailPage({ project, job: await store.job(request.server.prisma, request.params.id) }));
    },
  },
  status: {
    schema: idParamsSchema,
    GET: async (request, reply) =>
      reply.renderFragment(ids.jobStatus, JobStatus({ projectId: request.params.id, job: await store.job(request.server.prisma, request.params.id) })),
  },
  remove: {
    schema: idParamsSchema,
    DELETE: async (request, reply) => {
      await store.remove(request.server.prisma, request.params.id);
      return reply.redirect(projectRoutes.list.resolve());
    },
  },
});
