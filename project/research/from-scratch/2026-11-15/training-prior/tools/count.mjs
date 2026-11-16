// Size of each screen in both spellings. Tokens are not counted here (no tokenizer on
// this machine, and the count API was not called): bytes, non-blank lines, and the same
// source with indentation and line breaks collapsed, which is closer to token count.
import { readFileSync } from "node:fs";
const pairs = [
  ["routes + ids", "screens/projects.routes.ts", "fh8-screens/projects.routes.ts"],
  ["shared ui", "screens/ui.tsx", "fh8-screens/ui.ts"],
  ["R1 list", "screens/projects.list.view.tsx", "fh8-screens/projects.list.view.ts"],
  ["R2 form", "screens/projects.new.view.tsx", "fh8-screens/projects.new.view.ts"],
  ["R3 detail", "screens/projects.detail.view.tsx", "fh8-screens/projects.detail.view.ts"],
];
const measure = (p) => {
  const s = readFileSync(p, "utf8");
  const dense = s.replace(/\s+/g, " ").trim();
  // A rough token proxy: words, numbers, and each punctuation character.
  const proxy = (dense.match(/[A-Za-z_$][A-Za-z0-9_$]*|\d+|[^\sA-Za-z0-9_$]/g) ?? []).length;
  return { bytes: s.length, dense: dense.length, lines: s.split("\n").filter((l) => l.trim()).length, proxy };
};
let tot = { a: { bytes: 0, dense: 0, lines: 0, proxy: 0 }, b: { bytes: 0, dense: 0, lines: 0, proxy: 0 } };
console.log("part | rtsx bytes/dense/lexemes | fh8 bytes/dense/lexemes | dense ratio | lexeme ratio");
for (const [name, a, b] of pairs) {
  const x = measure(a), y = measure(b);
  for (const k in x) { tot.a[k] += x[k]; tot.b[k] += y[k]; }
  console.log(`${name} | ${x.bytes}/${x.dense}/${x.proxy} | ${y.bytes}/${y.dense}/${y.proxy} | ${(x.dense / y.dense).toFixed(2)} | ${(x.proxy / y.proxy).toFixed(2)}`);
}
console.log(`total | ${tot.a.bytes}/${tot.a.dense}/${tot.a.proxy} | ${tot.b.bytes}/${tot.b.dense}/${tot.b.proxy} | ${(tot.a.dense / tot.b.dense).toFixed(2)} | ${(tot.a.proxy / tot.b.proxy).toFixed(2)}`);
