import { defineIds, defineRoutes, t } from "../src/hx.ts";

export const ids = defineIds("project-list", "project-form", "job-status", "delete-dialog");

export const CreateProject = t.object(
  {
    name: t.string({ minLength: 3, maxLength: 80 }),
    ownerEmail: t.string({ format: "email" }),
    status: t.enum(["active", "paused"]),
    notes: t.string({ maxLength: 500 }),
  },
  { optional: ["notes"] },
);

export const projects = defineRoutes("/projects", {
  list: { query: { q: "string" } },
  rows: { path: "/rows", query: { q: "string" }, fragment: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id", params: { id: "number" } },
  status: { path: "/:id/status", params: { id: "number" }, fragment: ids.jobStatus },
  remove: { method: "delete", path: "/:id", params: { id: "number" } },
});
