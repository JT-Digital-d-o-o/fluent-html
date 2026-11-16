// Renders every state of the three screens to out/screens/ (for html-validate and the report).
import { mkdirSync, writeFileSync } from "node:fs";
import { render, rootId } from "sealed";
import { ProjectListPage, ProjectList } from "./r1-project-list";
import { NewProjectPage, ProjectForm } from "./r2-project-form";
import { ProjectDetailPage, StatusBadge } from "./r3-project-detail";
import type { Project } from "./projects.types";

const hostile = `<img src=x onerror=alert(1)>`;
const rows: Project[] = [
  { id: 1, name: "Harbour redesign", client: "Luka Koper", budget: 12000, website: "https://example.com/harbour" },
  { id: 2, name: hostile, client: `"O'Neil" & Sons`, budget: 800, website: "javascript:alert(1)" },
];
const ctx = { nonce: "dGVzdG5vbmNl" };
const dir = new URL("../out/screens/", import.meta.url);
mkdirSync(dir, { recursive: true });
const put = (name: string, s: string) => writeFileSync(new URL(name, dir), s.replace(/></g, ">\n<") + "\n");

put("r1-list.html", render(<ProjectListPage projects={rows} q="" />, ctx));
put("r1-list-empty.html", render(<ProjectListPage projects={[]} q={hostile} />, ctx));
put("r1-rows.fragment.html", render(<ProjectList projects={rows} q="har" />));
put("r2-form.html", render(<NewProjectPage />, ctx));
put("r2-form-invalid.html", render(<NewProjectPage values={{ name: "", client: hostile, budget: "-5" }} errors={{ name: "Enter a name", budget: "Budget cannot be negative" }} />, ctx));
put("r2-form-invalid.fragment.html", render(<ProjectForm values={{ name: "" }} errors={{ name: "Enter a name" }} />));
put("r3-detail-running.html", render(<ProjectDetailPage project={rows[1]!} job={{ status: "running" }} />, ctx));
put("r3-detail-done.html", render(<ProjectDetailPage project={rows[0]!} job={{ status: "done" }} />, ctx));
put("r3-status.fragment.html", render(<StatusBadge projectId={1} job={{ status: "done" }} />));
console.log("root ids:", rootId(ProjectList({ projects: rows, q: "" })), rootId(ProjectForm({})), rootId(StatusBadge({ projectId: 1, job: { status: "running" } })));
