import { defineIds, defineRoutes } from "sealed";
import { Type, type Static } from "./typebox-shim";

export const ids = defineIds(["projectList", "projectForm", "statusBadge", "confirmDelete", "confirmDeleteTitle"] as const);

export const CreateProject = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 80 }),
  client: Type.String({ minLength: 1, maxLength: 80 }),
  budget: Type.Number({ minimum: 0 }),
});
export type CreateProjectReq = Static<typeof CreateProject>;

export const projects = defineRoutes("/projects", {
  list:   { path: "/", query: { q: "string" } },
  rows:   { path: "/rows", query: { q: "string" }, region: ids.projectList },
  new:    { path: "/new" },
  create: { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id", params: { id: "number" } },
  status: { path: "/:id/status", params: { id: "number" }, region: ids.statusBadge },
  remove: { method: "delete", path: "/:id", params: { id: "number" } },
});
