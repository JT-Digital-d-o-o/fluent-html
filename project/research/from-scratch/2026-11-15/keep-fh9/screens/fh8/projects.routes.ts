import { defineIds, defineRoutes } from "fluent-html";

export const ids = defineIds(["project-list", "project-form", "project-status", "delete-dialog"] as const);

// The list route is `index`, not `list`: a route named `list` called with arguments fails
// `npm run css` in fluent-html 8 (the extractor reads it as the `.list()` styling method).
export const projectRoutes = defineRoutes("/projects", {
  index:  { path: "/", query: { q: "string" } as const },
  rows:   { path: "/rows", query: { q: "string" } as const, render: ids.projectList },
  new:    { path: "/new" },
  create: { method: "post", path: "/" },
  detail: { path: "/:id", params: { id: "number" } as const },
  status: { path: "/:id/status", params: { id: "number" } as const, render: ids.projectStatus },
  remove: { method: "delete", path: "/:id", params: { id: "number" } as const },
} as const);
