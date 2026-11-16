// Grammar accuracy on class text Claude Code actually wrote: every class token in the given HTML
// files is judged by Tailwind 4.3.3 itself (candidatesToCss, default theme plus the sessions'
// theme tokens) and by the .tw() type check (tsc on one call per token, same theme tokens).
//   node tools/grammar-corpus.mjs <out-dir> <theme files…> -- <html files…>
import { __unstable__loadDesignSystem } from "tailwindcss";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const outDir = resolve(args[0]);
const sep = args.indexOf("--");
const themes = args.slice(1, sep), htmls = args.slice(sep + 1);
const colours = new Set(), radii = new Set();
for (const f of themes) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/--color-([a-z0-9-]+)\s*:/g)) colours.add(m[1]);
  for (const m of s.matchAll(/--radius-([a-z0-9-]+)\s*:/g)) radii.add(m[1]);
  const cb = s.match(/colors\s*:\s*\{([^}]*)\}/); if (cb) for (const m of cb[1].matchAll(/"?([a-z][a-z0-9-]*)"?\s*:/g)) colours.add(m[1]);
  const rb = s.match(/radius\s*:\s*\{([^}]*)\}/); if (rb) for (const m of rb[1].matchAll(/"?([a-z][a-z0-9-]*)"?\s*:/g)) radii.add(m[1]);
}
const tokens = new Set();
for (const f of htmls) for (const m of readFileSync(f, "utf8").matchAll(/ class="([^"]*)"/g)) for (const t of m[1].split(/\s+/)) if (t) tokens.add(t.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&gt;/g, ">").replace(/&lt;/g, "<"));
// Seeded misspellings of the same tokens (a letter doubled in the base, in the first variant, a colour
// one letter off): Tailwind judges them too, so they measure what the type check lets through.
const mutate = (t) => {
  const i = t.lastIndexOf(":"), v = t.slice(0, i + 1), b = t.slice(i + 1);
  const out = [];
  if (b.length > 2 && !b.includes("[")) out.push(v + b.slice(0, -1) + b.slice(-2, -1) + b.slice(-1));
  if (b.length > 3 && !b.includes("[")) out.push(v + b.slice(0, 2) + b.slice(3));
  if (i > 0 && !v.includes("[")) out.push(v[0] + v + b);
  return out;
};
const seeded = new Set();
for (const t of tokens) for (const m of mutate(t)) if (!tokens.has(m)) seeded.add(m);
for (const m of seeded) tokens.add(m);
const list = [...tokens].sort();

const req = createRequire(import.meta.url);
const themeCss = readFileSync(req.resolve("tailwindcss/theme.css"), "utf8");
const extra = `@theme { ${[...colours].map((c) => `--color-${c}: #123456;`).join(" ")} ${[...radii].map((r) => `--radius-${r}: 1rem;`).join(" ")} }`;
const ds = await __unstable__loadDesignSystem(themeCss + "\n" + extra + "\n@tailwind utilities;", { base: here });
const twOk = new Map(list.map((t) => [t, ds.candidatesToCss([t])[0] != null]));

mkdirSync(outDir, { recursive: true });
const q = (s) => JSON.stringify(s);
const ts = `import { Div, defineTheme, type ThemeKeys } from "fluent-html";
const tokens = { colors: { ${[...colours].map((c) => `${q(c)}: "#123456"`).join(", ")} }, radius: { ${[...radii].map((r) => `${q(r)}: "1rem"`).join(", ")} } } as const;
export const theme = defineTheme(tokens);
declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
}
${list.map((t) => `Div().tw(${q(t)});`).join("\n")}
`;
writeFileSync(resolve(outDir, "corpus.ts"), ts);
writeFileSync(resolve(outDir, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "NodeNext", moduleResolution: "NodeNext", strict: true, noEmit: true, skipLibCheck: true, types: [], typeRoots: [resolve(here, "../node_modules/@types")] }, include: ["corpus.ts"] }));
let out = "";
try { out = execFileSync(resolve(here, "../node_modules/.bin/tsc"), ["-p", resolve(outDir, "tsconfig.json"), "--pretty", "false"], { encoding: "utf8", cwd: resolve(here, "..") }); }
catch (e) { out = e.stdout; }
const bad = new Set();
for (const m of out.matchAll(/corpus\.ts\((\d+),/g)) bad.add(Number(m[1]));
const firstLine = ts.split("\n").findIndex((l) => l.startsWith("Div().tw(")) + 1;
let fp = [], fn = [], tp = 0, tn = 0;
list.forEach((t, i) => {
  const typeOk = !bad.has(firstLine + i);
  if (twOk.get(t) && typeOk) tp++;
  else if (!twOk.get(t) && !typeOk) tn++;
  else if (twOk.get(t)) fp.push(t); else fn.push(t);
});
const seededFn = fn.filter((t) => seeded.has(t));
const summary = { tokens: list.length, seeded: seeded.size, seededTailwindRejects: [...seeded].filter((t) => !twOk.get(t)).length, seededFalseNegatives: seededFn.length, colours: colours.size, radii: radii.size, bothAccept: tp, bothReject: tn, falsePositives: fp, falseNegatives: fn };
writeFileSync(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 1));
