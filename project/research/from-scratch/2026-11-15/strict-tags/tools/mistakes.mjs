// Counts what tsc says about probes/mistakes.ts: every `export const m…` line must carry an error,
// no other line may. Prints one line per mistake with the first line of its diagnostic.
//   node tools/mistakes.mjs [--full]
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tsc = process.env.TSC ?? "/Users/tony/jt-digital/fluent-html/node_modules/.bin/tsc";
const run = spawnSync(tsc, ["-p", "probes/tsconfig.mistakes.json", "--pretty", "false"], { cwd: root, encoding: "utf8" });
const source = readFileSync(resolve(root, "probes/mistakes.ts"), "utf8").split("\n");
const byLine = new Map();
let elsewhere = 0;
let current = null;
for (const line of run.stdout.split("\n")) {
  const m = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/.exec(line);
  if (m) {
    if (!m[1].endsWith("probes/mistakes.ts")) { elsewhere++; current = null; console.log("ELSEWHERE " + line); continue; }
    current = { code: m[4], first: m[5], lines: 1 };
    const n = Number(m[2]);
    if (!byLine.has(n)) byLine.set(n, []);
    byLine.get(n).push(current);
  } else if (line.trim() && current) current.lines++;
}
let mistakes = 0, caught = 0, controls = 0, falseErrors = 0, oneLine = 0, withFix = 0, overloads = 0;
const full = process.argv.includes("--full");
source.forEach((text, i) => {
  const name = /^export const (m[A-F]\d+|ok\d+)\b/.exec(text)?.[1];
  const errors = byLine.get(i + 1) ?? [];
  if (!name) { if (errors.length) { falseErrors++; console.log(`UNEXPECTED line ${i + 1}: ${errors[0].first}`); } return; }
  if (name.startsWith("ok")) { controls++; if (errors.length) { falseErrors++; console.log(`FALSE ERROR ${name}: ${errors[0].first}`); } return; }
  mistakes++;
  if (!errors.length) { console.log(`MISSED ${name}: ${text.slice(0, 110)}`); return; }
  caught++;
  const e = errors[0];
  if (e.lines === 1) oneLine++;
  if (/✗|Did you mean/.test(e.first)) withFix++;
  if (/No overload matches/.test(e.first)) overloads++;
  console.log(`${name.padEnd(5)} ${e.code} ${e.lines === 1 ? " " : "+" + (e.lines - 1)} ${full ? e.first : e.first.slice(0, 230)}`);
});
console.log(`\n${caught} of ${mistakes} mistakes rejected by tsc; ${controls - falseErrors} of ${controls} controls accepted; ${oneLine} diagnostics are one line; ${withFix} name the fix on their first line; ${overloads} overload lists; errors outside the probe: ${elsewhere}`);
process.exit(caught === mistakes && falseErrors === 0 && elsewhere === 0 ? 0 : 1);
