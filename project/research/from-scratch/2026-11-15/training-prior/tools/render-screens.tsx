import { render } from "rtsx";
import { writeFileSync, mkdirSync } from "node:fs";
import { ProjectsPage, ProjectList } from "../screens/projects.list.view.js";
import { NewProjectPage, ProjectForm } from "../screens/projects.new.view.js";
import { ProjectDetailPage, JobStatus } from "../screens/projects.detail.view.js";
import type { Project } from "../screens/projects.schema.js";

const rows: Project[] = [
  { id: 1, name: "Atlas <relaunch>", client: "Northwind & Co", status: "active" },
  { id: 2, name: "Billing cleanup", client: "Contoso", status: "paused" },
  { id: 3, name: "Old intranet", client: "Fabrikam", status: "archived" },
];
const out = process.argv[2] ?? "out";
mkdirSync(out, { recursive: true });
const pages = {
  "r1-list": <ProjectsPage rows={rows} q="" />,
  "r1-empty": <ProjectsPage rows={[]} q="zzz" />,
  "r1-fragment": <ProjectList rows={rows} q="a" />,
  "r2-new": <NewProjectPage />,
  "r2-invalid": <NewProjectPage state={{ values: { name: "", client: "Contoso", status: "paused", notes: "x" }, errors: { name: "Name is required" } }} />,
  "r2-fragment": <ProjectForm state={{ values: { name: "" }, errors: { name: "Name is required" } }} />,
  "r3-running": <ProjectDetailPage project={rows[0]!} job={{ state: "running", percent: 40 }} />,
  "r3-done": <ProjectDetailPage project={rows[0]!} job={{ state: "done", finishedAt: "2026-11-15T22:00:00Z" }} />,
  "r3-fragment": <JobStatus projectId={1} job={{ state: "failed", reason: "disk full" }} />,
};
for (const [name, view] of Object.entries(pages)) writeFileSync(`${out}/${name}.html`, render(view) + "\n");
console.log(Object.keys(pages).length, "files");
