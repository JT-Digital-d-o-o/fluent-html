import { defineRoutes, defineIds } from "fluent-html";

export const ids = defineIds(["project-list", "project-form", "delete-dialog", "delete-title", "job-status"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list: { path: "/", query: { q: "string" } },
  results: { path: "/results", query: { q: "string" }, render: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.jobStatus },
  remove: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);
