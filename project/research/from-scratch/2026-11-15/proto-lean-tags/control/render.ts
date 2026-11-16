// Renders the fluent-html 8 control screens in the same states tools/run-screens.mjs renders for Lean Tags.
//   tsc -p control/tsconfig.json && node control/build/render.js
import { mkdirSync, writeFileSync } from "node:fs";
import { render, type View } from "fluent-html";
import type { Project } from "./src/app/projects/projects.service.js";
import { ProjectListPage, ProjectRows } from "./src/app/projects/views/projects.list.view.js";
import { NewProjectPage, ProjectForm } from "./src/app/projects/views/projects.form.view.js";
import { ProjectDetailPage } from "./src/app/projects/views/projects.detail.view.js";
import { JobBadge } from "./src/app/projects/views/projects.components.js";

const rows: Project[] = [
  { id: 1, name: "Atlas <redesign>", description: "Q3 & Q4 site refresh", status: "active", job: "running" },
  { id: 2, name: "Billing export", description: null, status: "paused", job: "done" },
];
const out = new URL("../../out/fh8/", import.meta.url);
mkdirSync(out, { recursive: true });
const views: Record<string, View> = {
  "r1-list.html": ProjectListPage({ items: rows }),
  "r1-rows-empty.fragment.html": ProjectRows({ items: [], q: "zzz" }),
  "r2-new.html": NewProjectPage({}),
  "r2-invalid.fragment.html": ProjectForm({
    values: { name: "", description: "x".repeat(501), status: "nope" },
    errors: { name: "Name is required", description: "Keep the description under 500 characters", status: "Choose one of: active, paused" },
  }),
  "r3-detail.html": ProjectDetailPage(rows[0]!),
  "r3-status-done.fragment.html": JobBadge({ id: 1, job: "done" }),
};
for (const [name, view] of Object.entries(views)) writeFileSync(new URL(name, out), render(view) + "\n");
console.log("rendered", Object.keys(views).length, "fluent-html 8 control files");
