import { defineIds, defineRoutes } from "rtsx";
import { CreateProject, ListQuery } from "./projects.schema.js";

export const ids = defineIds(["project-list", "project-form", "delete-dialog", "delete-title", "job-status"]);

export const projects = defineRoutes("/projects", {
  list: { path: "/", query: ListQuery },
  results: { path: "/results", query: ListQuery, render: ids.projectList },
  new: { path: "/new" },
  create: { method: "post", path: "/", body: CreateProject, invalid: ids.projectForm },
  detail: { path: "/:id" },
  status: { path: "/:id/status", render: ids.jobStatus, poll: "2s" },
  remove: { method: "delete", path: "/:id" },
});
