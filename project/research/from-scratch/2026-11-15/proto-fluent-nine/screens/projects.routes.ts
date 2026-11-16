import { defineIds, defineRoutes } from "fluent-html";

export const ids = defineIds(["project-list", "project-form", "project-status", "delete-dialog"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list:   { path: "/", query: { q: "string" } as const },
  rows:   { path: "/rows", query: { q: "string" } as const, render: ids.projectList },
  new:    { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.projectStatus },
  remove: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);
