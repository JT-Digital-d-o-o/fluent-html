// Strict Tags check: one pass over the program tsc already type-checks.
//   node tools/check.mjs <tsconfig.json> <theme.css> [--out <file.css>]
// 1. tsc's own diagnostics (the class union, content models, routes: everything in the types).
// 2. The class list, read from the types: every cls(…) and variant call has the type Cls<"…">, so
//    the checker knows the exact class text at every site. No source scanning, no name matching.
//    Written as a Tailwind `@source inline(…)` file, because Tailwind's scanner cannot see
//    hover("bg-x") as hover:bg-x.
// 3. What types cannot say: two classes in one list that set the same properties to different
//    values under the same variants (p-6 with p-0), asked of Tailwind's own output.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";

const args = process.argv.slice(2);
const outAt = args.indexOf("--out");
const outFile = outAt >= 0 ? args.splice(outAt, 2)[1] : null;
const [configPath, themePath] = args;
if (!configPath || !themePath) {
  console.error("usage: node check.mjs <tsconfig.json> <theme.css> [--out <file.css>]");
  process.exit(2);
}
const require = createRequire(resolve(process.env.TAILWIND_FROM ?? process.cwd(), "noop.js"));
const ts = require("typescript");
const twModule = await import(require.resolve("tailwindcss"));
const loadDesignSystem = twModule.__unstable__loadDesignSystem ?? twModule.default.__unstable__loadDesignSystem;
const twDir = dirname(require.resolve("tailwindcss/package.json"));
const design = await loadDesignSystem(readFileSync(themePath, "utf8"), {
  base: dirname(resolve(themePath)),
  loadStylesheet: async (id, base) => {
    const path = id === "tailwindcss" ? join(twDir, "index.css") : id.startsWith("tailwindcss/") ? join(twDir, id.slice(12) + (id.endsWith(".css") ? "" : ".css")) : resolve(base, id);
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  },
});

const config = ts.getParsedCommandLineOfConfigFile(resolve(configPath), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n")); } });
const program = ts.createProgram(config.fileNames, config.options);
const checker = program.getTypeChecker();
const cwd = process.cwd();
const where = (file, pos) => {
  const { line, character } = file.getLineAndCharacterOfPosition(pos);
  return `${relative(cwd, file.fileName)}:${line + 1}:${character + 1}`;
};

// 1. tsc
const diagnostics = ts.getPreEmitDiagnostics(program);
for (const d of diagnostics) console.log(`${d.file ? where(d.file, d.start) : ""} error TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, "\n  ")}`);

// 2. classes, from the types
const isCls = (type) => {
  const symbol = type.aliasSymbol ?? type.getSymbol();
  return symbol?.getName() === "Cls" && symbol.declarations?.some((d) => /[\\/]core\.ts$/.test(d.getSourceFile().fileName));
};
const literals = (type) => (type.isUnion() ? type.types.flatMap(literals) : type.isStringLiteral() ? [type.value] : [null]);
const sites = [];
let unknownSites = 0;
for (const file of program.getSourceFiles()) {
  if (file.isDeclarationFile || /[\\/]lib[\\/](core|tw\.gen)\.ts$/.test(file.fileName)) continue;
  const visit = (node) => {
    if (ts.isCallExpression(node)) {
      const type = checker.getTypeAtLocation(node);
      if (isCls(type)) {
        const texts = literals(checker.getTypeArguments(type)[0]);
        // cls.token(value) and a preset typed as plain Cls carry no literal: the first is one token from data, the second was collected where it was made.
        if (texts.includes(null)) unknownSites++;
        for (const text of texts) if (text !== null) sites.push({ at: where(file, node.getStart()), text });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
}
const tokens = new Set();
for (const site of sites) for (const token of site.text.split(/\s+/)) if (token) tokens.add(token);
const all = [...tokens].sort();
const compiled = design.candidatesToCss(all);
const noRule = all.filter((_, i) => compiled[i] === null);
for (const token of noRule) console.log(`class "${token}" passed tsc but Tailwind has no rule for it`);

// 3. conflicts: same variants, same set of properties, different values
const cssOf = new Map(all.map((token, i) => [token, compiled[i]]));
const facts = (token) => {
  const css = cssOf.get(token);
  if (!css) return null;
  const cut = token.lastIndexOf(":", token.includes("[") ? token.indexOf("[") : token.length);
  const declarations = [...css.matchAll(/^\s*((?:--)?[a-zA-Z][\w-]*)\s*:\s*([^;{}]+);/gm)].map((m) => [m[1], m[2].trim()]);
  const names = [...new Set(declarations.map(([name]) => name))].sort().join(",");
  return { variants: cut < 0 ? "" : token.slice(0, cut), names, values: declarations.map(([n, v]) => `${n}:${v}`).sort().join(";") };
};
let conflicts = 0;
const reported = new Set();
for (const site of sites) {
  const seen = new Map();
  for (const token of new Set(site.text.split(/\s+/).filter(Boolean))) {
    const f = facts(token);
    if (!f || !f.names) continue;
    const key = f.variants + "|" + f.names;
    const earlier = seen.get(key);
    if (earlier && earlier.values !== f.values) {
      const line = `${site.at} "${earlier.token}" and "${token}" set the same properties (${f.names}) in one class list: the stylesheet's order decides, not yours`;
      if (!reported.has(line)) { reported.add(line); conflicts++; console.log(line); }
    } else seen.set(key, { token, values: f.values });
  }
}

if (outFile) {
  const escape = (token) => token.replace(/[\\"{},]/g, "\\$&");
  writeFileSync(outFile, `/* Generated by tools/check.mjs from the types of ${sites.length} class lists. Do not edit. */\n` + all.map((token) => `@source inline("${escape(token)}");`).join("\n") + "\n");
}
console.log(`${diagnostics.length} tsc errors; ${sites.length} class lists read from types (${unknownSites} without a literal), ${all.length} distinct classes, ${noRule.length} without a Tailwind rule; ${conflicts} conflicts${outFile ? `; wrote ${relative(cwd, outFile)}` : ""}`);
process.exit(diagnostics.length || noRule.length || conflicts ? 1 : 0);
