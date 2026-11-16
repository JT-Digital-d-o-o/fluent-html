// Per group: rejected before run (tsc or check) of the kinds that have a form, then absorbed / throws / nowhere;
// and safety parity: the kinds fluent-html 8 rejects before run that each design does not.
//   node groups.mjs
import { readFileSync } from "node:fs";
import { KINDS } from "./kinds.mjs";
const group = Object.fromEntries(KINDS.map((k) => [k[0], k[2]]));
const arms = ["fh8", "page-parts", "lean-tags", "fluent-nine", "cbc"];
const rows = Object.fromEntries(arms.map((a) => [a, readFileSync(new URL(`results/${a}.tsv`, import.meta.url), "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"))]));
const before = (r) => r[3] === "tsc" || r[3] === "check";
console.log(`| Group | Kinds | ${arms.join(" | ")} |\n|---|---|${arms.map(() => "---").join("|")}|`);
for (const g of [...new Set(KINDS.map((k) => k[2])), "all"]) {
  const cells = arms.map((a) => {
    const rs = rows[a].filter((r) => (g === "all" || group[r[1]] === g) && r[3] !== "n/a");
    const n = (f) => rs.filter(f).length;
    return `${n(before)}/${rs.length}; ${n((r) => r[4] === "absorbed")} absorbed, ${n((r) => r[4] === "throws")} throws, ${n((r) => r[3] === "law")} law, ${n((r) => r[3] === "nowhere")} nowhere`;
  });
  console.log(`| ${g} | ${KINDS.filter((k) => g === "all" || k[2] === g).length} | ${cells.join(" | ")} |`);
}
const s8 = rows.fh8.filter(before).map((r) => r[1]);
console.log(`\nfluent-html 8 rejects before run: ${s8.join(" ")}`);
for (const a of arms.slice(1)) console.log(`${a} does not: ${rows[a].filter((r) => s8.includes(r[1]) && !before(r)).map((r) => `${r[1]} (${r[3]}${r[4] ? ", " + r[4] : ""})`).join(", ") || "none"}`);
