import { defineRoutes, defineIds } from "fluent-html";

export const projectIds = defineIds(["project-rows", "project-form", "project-status", "project-delete-dialog", "project-delete-title"] as const);

export const projectRoutes = defineRoutes("/projects", {
  list:   { path: "/", query: { q: "string" } as const, sitemap: "exclude" },
  rows:   { path: "/rows", query: { q: "string" } as const, render: projectIds.projectRows },
  new:    { path: "/new", sitemap: "exclude" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const, sitemap: "exclude" },
  status: { path: "/:id/status", params: { id: "number" } as const, render: projectIds.projectStatus },
  delete: { method: "post", path: "/:id/delete", params: { id: "number" } as const },
} as const);
