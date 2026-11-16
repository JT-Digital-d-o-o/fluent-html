// Errors per file from html-validate's JSON formatter: node tools/validate-summary.mjs <file.html>...
import { execFileSync } from "node:child_process";
const files = process.argv.slice(2);
let raw;
try { raw = execFileSync("npx", ["html-validate", "--config", ".htmlvalidate.json", "--formatter", "json", ...files], { encoding: "utf8" }); }
catch (e) { raw = e.stdout; }
const results = raw.trim() ? JSON.parse(raw) : [];
const byFile = new Map(results.map((r) => [r.filePath, r]));
let total = 0;
for (const f of files) {
  const r = [...byFile.entries()].find(([p]) => p.endsWith(f))?.[1];
  const n = r?.errorCount ?? 0;
  total += n;
  const rules = r ? [...new Set(r.messages.map((m) => m.ruleId))].join(", ") : "";
  console.log(`${String(n).padStart(3)}  ${f}${rules ? "  (" + rules + ")" : ""}`);
}
console.log(`${String(total).padStart(3)}  total errors`);
