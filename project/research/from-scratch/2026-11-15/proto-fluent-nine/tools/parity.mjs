// Safety parity: every mistake fluent-html 8 rejects (probes/parity/fh8.ts) must be rejected by the
// same check command, tsc, in Fluent Nine (probes/parity/fh9.ts). Each mistake line ends in `// P<n> <kind>`.
// Also renders hostile text through both packages: text escaping is the runtime half of "unescaped HTML".
//   node tools/parity.mjs
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("../probes/parity/", import.meta.url));
const tsc = fileURLToPath(new URL("../node_modules/.bin/tsc", import.meta.url));
function check(side) {
  let out = "";
  try { out = execFileSync(tsc, ["-p", `${dir}tsconfig.${side}.json`, "--pretty", "false"], { encoding: "utf8" }); } catch (e) { out = e.stdout; }
  const errLines = new Set([...out.matchAll(new RegExp(`${side}\\.ts\\((\\d+),`, "g"))].map((m) => Number(m[1])));
  const rows = {};
  readFileSync(`${dir}${side}.ts`, "utf8").split("\n").forEach((l, i) => {
    const m = l.match(/\/\/ (P\d+b?) (.*)$/);
    if (m) rows[m[1]] = { kind: m[2], rejected: errLines.has(i + 1) };
  });
  return { rows, errors: [...out.matchAll(/error TS\d+/g)].length };
}
const fh8 = check("fh8"), fh9 = check("fh9");
const keys = [...new Set([...Object.keys(fh8.rows), ...Object.keys(fh9.rows)])];
console.log("| Mistake | Kind | fluent-html 8 (tsc) | Fluent Nine (tsc) |\n|---|---|---|---|");
let parity = true;
for (const k of keys) {
  const a = fh8.rows[k], b = fh9.rows[k];
  const v = (r) => (r ? (r.rejected ? "rejected" : "**accepted**") : "not written");
  if (a?.rejected && !b?.rejected) parity = false;
  console.log(`| ${k} | ${(a ?? b).kind} | ${v(a)} | ${v(b)} |`);
}
const hostile = '<img src=x onerror=alert(1)>"\'&';
const fh8m = await import(new URL("../../../../../../dist/src/index.js", import.meta.url).href);
const fh9m = await import("fluent-html");
const e8 = fh8m.render(fh8m.Div(hostile)), e9 = fh9m.render(fh9m.Div(hostile));
console.log(`\ntsc errors: fluent-html 8 ${fh8.errors}, Fluent Nine ${fh9.errors}`);
console.log(`text escaping: fluent-html 8 ${e8}, Fluent Nine ${e9}, identical: ${e8 === e9}`);
console.log(`parity (every mistake 8 rejects, 9 rejects): ${parity}`);
process.exit(parity ? 0 : 1);
