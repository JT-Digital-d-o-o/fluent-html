// hh check: every html``, at(id)`` and tw`` template in the given directories, checked without
// running the app. It parses each file (no type-check), hands each template's static text to
// the same compile() the runtime uses, and asks Tailwind's own design system whether each
// class exists under the theme. Output is one line per finding: file:line, the fact, the fix.
//
//   node tools/check.mjs [--theme tools/theme.css] <dir>...
import { createRequire } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { compile, TemplateError } from "../src/hh.ts";

const here = dirname(fileURLToPath(import.meta.url));
const ts = createRequire(resolve(here, "../../../../../../package.json"))("typescript");

const args = process.argv.slice(2);
let themePath = resolve(here, "theme.css");
const dirs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--theme") themePath = resolve(args[++i]);
  else dirs.push(resolve(args[i]));
}

const t0 = performance.now();
const files = [];
const walk = (d) => {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name) && !name.endsWith(".d.ts")) files.push(p);
  }
};
dirs.forEach(walk);

const findings = [];
const classUses = []; // { file, line, token }
let templates = 0;

for (const file of files) {
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if (ts.isTaggedTemplateExpression(node)) {
      const tag = node.tag;
      const kind = ts.isIdentifier(tag) && tag.text === "html" ? "html"
        : ts.isIdentifier(tag) && tag.text === "tw" ? "tw"
        : ts.isCallExpression(tag) && ts.isIdentifier(tag.expression) && tag.expression.text === "at" ? "at"
        : null;
      if (kind !== null) {
        templates++;
        const tpl = node.template;
        const strings = ts.isNoSubstitutionTemplateLiteral(tpl) ? [tpl.text] : [tpl.head.text, ...tpl.templateSpans.map((s) => s.literal.text)];
        const startLine = sf.getLineAndCharacterOfPosition(tpl.getStart(sf)).line + 1;
        if (kind === "tw") {
          if (strings.length > 1) findings.push({ file, line: startLine, msg: "tw`` holds literal class text only: a hole hides the class from Tailwind" });
          for (const token of strings[0].split(/\s+/).filter(Boolean)) classUses.push({ file, line: startLine, token });
        } else {
          try {
            const compiled = compile(strings, kind === "at");
            for (const text of compiled.classes) for (const token of text.split(/\s+/).filter(Boolean)) classUses.push({ file, line: startLine, token });
          } catch (e) {
            if (!(e instanceof TemplateError)) throw e;
            findings.push({ file, line: startLine + (e.templateLine ?? 1) - 1, msg: e.fact ?? e.message });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}
const parsedMs = performance.now() - t0;

// Class judgement by Tailwind itself, when an install is reachable.
let tailwind = "not run";
try {
  const require = createRequire(process.env.TW_FROM ?? "/Users/tony/jt-digital/na-cent/package.json");
  const tw = require("@tailwindcss/node");
  const base = dirname(require.resolve("tailwindcss/package.json")) + "/..";
  const ds = await tw.__unstable__loadDesignSystem(readFileSync(themePath, "utf8"), { base });
  const tokens = [...new Set(classUses.map((c) => c.token))];
  const verdict = ds.candidatesToCss(tokens);
  const bad = new Set(tokens.filter((_, i) => verdict[i] === null));
  const colors = [...ds.theme.namespace("--color").keys()].filter((k) => k !== null && k !== "*");
  for (const use of classUses) {
    if (!bad.has(use.token)) continue;
    const hint = /-$|-\//.test(use.token)
      ? "a class name is never built from a hole: pick whole class strings with match()"
      : `no such class under this theme; colors are ${colors.join(", ")}`;
    findings.push({ file: use.file, line: use.line, msg: `class "${use.token}": ${hint}` });
  }
  tailwind = `tailwindcss ${require("tailwindcss/package.json").version}`;
} catch (e) {
  tailwind = `unavailable (${String(e.message).slice(0, 60)})`;
}

findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
for (const f of findings) console.log(`${relative(process.cwd(), f.file)}:${f.line} ${f.msg}`);
console.error(
  `hh check: ${files.length} files, ${templates} templates, ${classUses.length} class uses, ${findings.length} findings; ` +
    `parse+compile ${Math.round(parsedMs)} ms, total ${Math.round(performance.now() - t0)} ms; classes judged by ${tailwind}`,
);
process.exit(findings.length > 0 ? 1 : 0);
