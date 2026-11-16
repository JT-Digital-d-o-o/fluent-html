import { action, page, part, routes } from "#st";
import { ProjectInput } from "./projects.schema.ts";

export const projects = routes("/projects", {
  list: page("/", { q: "string?" }),
  rows: part("project-list", "/rows", { q: "string?" }),
  new: page("/new"),
  create: action("/", ProjectInput),
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  remove: action("/:id/delete", { id: "number" }),
});
