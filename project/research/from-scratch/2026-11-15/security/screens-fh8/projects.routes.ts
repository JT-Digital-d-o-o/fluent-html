import { defineIds, defineRoutes } from "fluent-html";

export const ids = defineIds(["projectList", "projectForm", "statusBadge", "confirmDelete", "confirmDeleteTitle"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list:   { path: "/" },
  rows:   { path: "/rows", render: ids.projectList },
  new:    { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.statusBadge },
  remove: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);
