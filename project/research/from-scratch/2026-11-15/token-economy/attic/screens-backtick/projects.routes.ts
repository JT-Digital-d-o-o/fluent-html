import { page, part, post, routes } from "#bt";
import { ProjectInput } from "./projects.schema.ts";

export const projects = routes("/projects", {
  list: page("/", { q: "string?" }),
  rows: part("project-list", "/rows", { q: "string?" }),
  new: page("/new"),
  create: post("/", ProjectInput),
  detail: page("/:id", { id: "number" }),
  status: part("project-status", "/:id/status", { id: "number" }),
  remove: post("/:id/delete", { id: "number" }),
});
