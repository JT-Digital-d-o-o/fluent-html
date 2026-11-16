// Renders the three reference screens in both versions to out/<version>/<screen>.html.
//   node build/render-screens.js
import { mkdirSync, writeFileSync } from "node:fs";
import { render, type View } from "fluent-html";
import { PROJECTS } from "./screens/domain.js";
import * as l8 from "./screens/fh8/r1-list.view.js";
import * as f8 from "./screens/fh8/r2-form.view.js";
import * as d8 from "./screens/fh8/r3-detail.view.js";
import * as l9 from "./screens/fh9/r1-list.view.js";
import * as f9 from "./screens/fh9/r2-form.view.js";
import * as d9 from "./screens/fh9/r3-detail.view.js";

const errors = { name: "Name is required", client: "Client is required" };
const doc = (title: string, body: string) =>
  `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${title}</title>\n</head>\n<body>\n<main id="main-content">\n${body}\n</main>\n</body>\n</html>\n`;

const screens: Record<string, Record<string, View>> = {
  fh8: {
    "r1-list": l8.ProjectListPage({ projects: PROJECTS, q: "" }),
    "r1-empty": l8.ProjectListPage({ projects: [], q: "zz" }),
    "r2-form": f8.NewProjectPage(),
    "r2-invalid": f8.NewProjectPage({ values: { kind: "app" }, errors }),
    "r3-running": d8.ProjectDetailPage({ project: PROJECTS[1]! }),
    "r3-done": d8.ProjectDetailPage({ project: PROJECTS[0]! }),
  },
  fh9: {
    "r1-list": l9.ProjectListPage({ projects: PROJECTS, q: "" }),
    "r1-empty": l9.ProjectListPage({ projects: [], q: "zz" }),
    "r2-form": f9.NewProjectPage(),
    "r2-invalid": f9.NewProjectPage({ values: { kind: "app" }, errors }),
    "r3-running": d9.ProjectDetailPage({ project: PROJECTS[1]! }),
    "r3-done": d9.ProjectDetailPage({ project: PROJECTS[0]! }),
  },
};

for (const [version, set] of Object.entries(screens)) {
  mkdirSync(`out/${version}`, { recursive: true });
  for (const [name, view] of Object.entries(set)) {
    writeFileSync(`out/${version}/${name}.html`, doc(name, render(view)));
  }
}
console.log("rendered", Object.values(screens).reduce((n, s) => n + Object.keys(s).length, 0), "files");
