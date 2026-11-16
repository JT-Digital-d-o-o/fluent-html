import { defineIds, defineRoutes } from "fluent-html";
export const ids = defineIds(["project-list", "project-status"] as const);
export const projectRoutes = defineRoutes("/projects", {
  index: { path: "/" },
  rows: { path: "/rows", render: ids.projectList },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.projectStatus },
} as const);
