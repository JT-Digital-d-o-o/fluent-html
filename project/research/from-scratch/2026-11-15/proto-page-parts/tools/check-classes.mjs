// Class check: every Tailwind class written in a class position must exist in the app's theme.
// The classes are literal text in the source, so Tailwind's own scanner finds them (no extractor,
// no safelist); this check is what turns an unknown class, a palette literal the theme closed, or
// a misspelt variant into an error instead of a rule that is silently never emitted.
//
//   node tools/check-classes.mjs <theme.css> <file.ts | dir>...
//
// A class position is: a property whose name is `class` or ends in `Class`, an argument of cx(),
// or a value in configure({ styles }). Every string literal under that expression is class text.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve, relative } from "node:path";
import ts from "typescript";
import { __unstable__loadDesignSystem } from "tailwindcss";

const require = createRequire(import.meta.url);
const [themePath, ...inputs] = process.argv.slice(2);
const expand = (p) => statSync(p).isDirectory() ? readdirSync(p).flatMap((f) => expand(resolve(p, f))) : /\.(ts|tsx|mts)$/.test(p) ? [p] : [];
const files = inputs.flatMap(expand);
if (!themePath || files.length === 0) {
  console.error("usage: node tools/check-classes.mjs <theme.css> <file.ts>...");
  process.exit(2);
}

const design = await __unstable__loadDesignSystem(readFileSync(themePath, "utf8"), {
  base: dirname(resolve(themePath)),
  loadStylesheet: async (id, base) => {
    const path = id.startsWith(".") ? resolve(base, id) : require.resolve(id === "tailwindcss" ? "tailwindcss/index.css" : id);
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  },
});

const known = new Map();
function isKnown(token) {
  let v = known.get(token);
  if (v === undefined) {
    v = design.candidatesToCss([token])[0] !== null;
    known.set(token, v);
  }
  return v;
}

const colors = [...design.theme.namespace("--color").keys()].filter((k) => k !== null);
function hint(token) {
  const utility = token.split(":").pop();
  const variants = token.split(":").slice(0, -1);
  if (variants.length > 0 && isKnown(utility)) return `the variant "${variants.find((v) => !isKnown(v + ":flex")) ?? variants[0]}:" does not exist`;
  const m = /^(bg|text|border|ring|fill|stroke|divide|outline|from|to|via|decoration|accent|caret|shadow)-(.+?)(\/\d+)?$/.exec(utility);
  if (m && /^[a-z]+-\d{2,3}$/.test(m[2])) return `"${m[2]}" is a palette colour and the theme closed the palette; its colours are: ${colors.join(", ")}`;
  return "not a class in this theme";
}

const isClassName = (name) => name === "class" || name.endsWith("Class");
let errors = 0;
let checked = 0;

for (const file of files) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const report = (node, text) => {
    for (const token of text.split(/\s+/)) {
      if (token === "") continue;
      checked++;
      if (isKnown(token)) continue;
      const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source) + 1 + Math.max(0, text.indexOf(token)));
      console.log(`${relative(process.cwd(), file)}(${line + 1},${character + 1}): error CLASS: "${token}": ${hint(token)}`);
      errors++;
    }
  };
  const literals = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) report(node, node.text);
    else if (ts.isTemplateExpression(node)) {
      report(node.head, node.head.text);
      for (const span of node.templateSpans) report(span.literal, span.literal.text);
    } else if (ts.isPropertyAssignment(node)) literals(node.initializer);
    else ts.forEachChild(node, (c) => {
      if (ts.isElementAccessExpression(node) && c === node.argumentExpression) return;
      literals(c);
    });
  };
  const walk = (node) => {
    if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))) {
      if (isClassName(node.name.text)) return literals(node.initializer);
      if (node.name.text === "styles" && ts.isObjectLiteralExpression(node.initializer)) return literals(node.initializer);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "cx") return node.arguments.forEach(literals);
    ts.forEachChild(node, walk);
  };
  walk(source);
}

console.log(`${checked} classes checked in ${files.length} file(s), ${errors} error(s)`);
process.exit(errors > 0 ? 1 : 0);
