// Character counts of the three reference screens, per arm. Token estimate = characters / 4.
//   node tools/count.mjs            (table)
//   node tools/count.mjs --json
// "body" drops import lines, so the two arms' different folder depths do not count.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FILES = [
  ["R1 list view", "views/projects.list.view.ts"],
  ["R2 form view", "views/projects.form.view.ts"],
  ["R3 detail view", "views/projects.detail.view.ts"],
  ["shared components (pills, buttons, job badge)", "views/projects.components.ts"],
  ["routes and ids", "projects.routes.ts"],
  ["schema and validation", "projects.schema.ts"],
  ["controller", "projects.controller.ts"],
];
const ARMS = [
  ["fluent-html 8", "screens/fh8"],
  ["Lean Tags", "screens/lt"],
  ["backtick tags (first attempt, dropped)", "attic/screens-backtick"],
];
const body = (s) => s.replace(/^import [\s\S]*?;\n/gm, "");
const count = (dir, file) => {
  const s = readFileSync(resolve(root, dir, file), "utf8");
  return { all: s.length, body: body(s).trim().length, dense: body(s).replace(/\s+/g, "").length };
};
const rows = FILES.map(([label, file]) => ({ label, counts: ARMS.map(([, dir]) => count(dir, file)) }));
const sum = (pick, k) => ARMS.map((_, i) => rows.filter(pick).reduce((n, r) => n + r.counts[i][k], 0));
const views = (r) => r.label.startsWith("R") || r.label.startsWith("shared");
const totals = {
  viewsAll: sum(views, "all"), viewsBody: sum(views, "body"),
  featureAll: sum(() => true, "all"), featureBody: sum(() => true, "body"),
  viewsDense: sum(views, "dense"), featureDense: sum(() => true, "dense"),
};
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ arms: ARMS.map(([n]) => n), rows, totals }, null, 2));
} else {
  const pct = (a, b) => `${((1 - a / b) * 100).toFixed(1)}%`;
  const line = (label, c) => {
    const cells = c.map((x) => `${String(x).padStart(6)} ch ${String(Math.round(x / 4)).padStart(5)} tok`);
    console.log(`${label.padEnd(48)} ${cells.join(" | ")} | LT saves ${pct(c[1], c[0])}`);
  };
  console.log(`${"".padEnd(48)} ${ARMS.map(([n]) => n.slice(0, 19).padEnd(19)).join(" | ")}`);
  console.log("-- without import lines");
  for (const r of rows) line(r.label, r.counts.map((c) => c.body));
  line("VIEWS (R1+R2+R3+components)", totals.viewsBody);
  line("WHOLE FEATURE", totals.featureBody);
  console.log("-- with import lines");
  for (const r of rows) line(r.label, r.counts.map((c) => c.all));
  line("VIEWS (R1+R2+R3+components)", totals.viewsAll);
  line("WHOLE FEATURE", totals.featureAll);
  console.log("-- without import lines and without any whitespace (formatting-independent)");
  for (const r of rows) line(r.label, r.counts.map((c) => c.dense));
  line("VIEWS (R1+R2+R3+components)", totals.viewsDense);
  line("WHOLE FEATURE", totals.featureDense);
}
