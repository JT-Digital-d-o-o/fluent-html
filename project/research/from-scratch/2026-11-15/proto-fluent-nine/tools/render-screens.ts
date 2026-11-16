// Renders the design's three reference screens (six states) to out/screens/<state>.html.
//   node tools/render-screens.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { render, type View } from "fluent-html";
import { PROJECTS } from "../screens/domain.ts";
import { ProjectListPage } from "../screens/r1-list.view.ts";
import { NewProjectPage } from "../screens/r2-form.view.ts";
import { ProjectDetailPage } from "../screens/r3-detail.view.ts";

const errors = { name: "Name is required", client: "Client is required" };
const doc = (title: string, body: string) =>
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${title}</title>\n</head>\n<body>\n<main id="main-content">\n${body}\n</main>\n</body>\n</html>\n`;

const screens: Record<string, View> = {
  "r1-list": ProjectListPage({ projects: PROJECTS, q: "" }),
  "r1-empty": ProjectListPage({ projects: [], q: "zz" }),
  "r2-form": NewProjectPage(),
  "r2-invalid": NewProjectPage({ values: { kind: "app" }, errors }),
  "r3-running": ProjectDetailPage({ project: PROJECTS[1]! }),
  "r3-done": ProjectDetailPage({ project: PROJECTS[0]! }),
};
const dir = new URL("../out/screens/", import.meta.url);
mkdirSync(dir, { recursive: true });
for (const [name, view] of Object.entries(screens)) writeFileSync(new URL(`${name}.html`, dir), doc(name, render(view)));
console.log("rendered", Object.keys(screens).length, "files");
