// Class check for Lean Tags: every literal class inside a tw`…` template is asked of Tailwind
// itself (the design system built from the app's own theme), so the closed palette, typos and
// unknown variants fail with file:line:col and the fix on the same line. No extractor, no
// safelist: the class text is literal source, which Tailwind v4 also scans directly.
//   node tools/check-classes.mjs <theme.css> <file-or-dir>...
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve, dirname, join, relative } from "node:path";

const [themePath, ...targets] = process.argv.slice(2);
if (!themePath || targets.length === 0) {
  console.error("usage: node check-classes.mjs <theme.css> <file-or-dir>...");
  process.exit(2);
}
const require = createRequire(resolve(process.env.TAILWIND_FROM ?? process.cwd(), "noop.js"));
const twEntry = require.resolve("tailwindcss");
const twModule = await import(twEntry);
const __unstable__loadDesignSystem = twModule.__unstable__loadDesignSystem ?? twModule.default.__unstable__loadDesignSystem;
const twDir = dirname(require.resolve("tailwindcss/package.json"));
const design = await __unstable__loadDesignSystem(readFileSync(themePath, "utf8"), {
  base: dirname(resolve(themePath)),
  loadStylesheet: async (id, base) => {
    const path = id === "tailwindcss" ? join(twDir, "index.css") : id.startsWith("tailwindcss/") ? join(twDir, id.slice(12) + (id.endsWith(".css") ? "" : ".css")) : resolve(base, id);
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  },
});
const colors = [...design.theme.namespace("--color").keys()].filter((k) => k && !k.includes("--")).sort();

const files = [];
const walk = (p) => {
  if (statSync(p).isDirectory()) for (const f of readdirSync(p)) walk(join(p, f));
  else if (/\.(ts|mts|tsx)$/.test(p)) files.push(p);
};
targets.forEach((t) => walk(resolve(t)));

const COLOR_UTIL = /^(?:.*:)?(bg|text|border|ring|divide|outline|fill|stroke|from|via|to|accent|caret|decoration|shadow|placeholder)-(.+?)(?:\/[\w.[\]%]+)?$/;
const lev = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
function hint(token) {
  const m = COLOR_UTIL.exec(token);
  if (m) {
    const near = colors.map((c) => [lev(m[2], c), c]).sort((x, y) => x[0] - y[0]);
    if (near[0] && near[0][0] <= 2) return `did you mean ${token.replace(m[2], near[0][1])}?`;
    return `"${m[2]}" is not in the theme. Colors: ${colors.join(", ")}`;
  }
  return "Tailwind generates no CSS for it under this theme";
}

let problems = 0;
let checked = 0;
for (const file of files) {
  const src = readFileSync(file, "utf8");
  const where = (i) => {
    const before = src.slice(0, i);
    return `${relative(process.cwd(), file)}:${before.split("\n").length}:${i - before.lastIndexOf("\n")}`;
  };
  for (const m of src.matchAll(/\btw`((?:[^`\\]|\\.)*)`/g)) {
    const start = m.index + 3;
    // Static text between holes; a hole is ${ … } with no nested template.
    for (const part of m[1].matchAll(/((?:(?!\$\{)[^])+)|\$\{[^}]*\}/g)) {
      if (part[1] === undefined) continue;
      const text = part[1];
      const at = start + part.index;
      if (/:$/.test(text) && m[1].startsWith("${", part.index + text.length)) {
        problems++;
        console.log(`${where(at + text.length - 1)} variant prefix on a hole: "${text.trim().split(/\s+/).pop()}\${…}" prefixes only the preset's first class. Write the prefix on each class inside the preset`);
      }
      const tokens = [...text.matchAll(/\S+/g)].filter((t) => !(/:$/.test(t[0]) && t.index + t[0].length === text.length));
      const css = design.candidatesToCss(tokens.map((t) => t[0]));
      tokens.forEach((t, i) => {
        checked++;
        if (css[i] === null) {
          problems++;
          console.log(`${where(at + t.index)} unknown class "${t[0]}": ${hint(t[0])}`);
        }
      });
    }
  }
}
console.log(`${checked} classes in ${files.length} files, ${problems} problem${problems === 1 ? "" : "s"}`);
process.exit(problems ? 1 : 0);
