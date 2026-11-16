// rtsx check: one command, three checks, every finding one line with the fact first.
//   1. tsc's own diagnostics, re-ordered so the innermost message (the fact) leads
//   2. hyphenated attributes tsc cannot check (hx-gte, hx-on:click) against the known set
//   3. every class literal against the app's Tailwind design system: unknown classes
//      (so the closed palette is enforced), with the nearest valid class, and pairs that
//      set the same properties under the same variants
// Usage: node tools/check.mjs <tsconfig.json> <app.css> [--allow nav-link,js-*]
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";

const require = createRequire(resolve(process.cwd(), process.env.RTSX_TOOLS ?? "../../../../../package.json"));
const ts = require("typescript");
const tw = require("tailwindcss");

const [tsconfigPath, cssPath] = process.argv.slice(2);
const allowArg = process.argv.indexOf("--allow");
const allow = (allowArg > 0 ? process.argv[allowArg + 1].split(",") : []).map((g) => new RegExp("^" + g.replace(/\*/g, ".*") + "$"));

const HX = ["hx-get", "hx-post", "hx-put", "hx-patch", "hx-delete", "hx-target", "hx-swap", "hx-trigger", "hx-confirm", "hx-vals", "hx-headers", "hx-include", "hx-select", "hx-indicator", "hx-disable", "hx-sync", "hx-push-url", "hx-replace-url", "hx-boost", "hx-encoding", "hx-validate", "hx-preserve", "hx-ignore", "hx-config"];

const findings = [];
const add = (file, pos, code, msg) => {
  const { line, character } = file.getLineAndCharacterOfPosition(pos);
  findings.push(`${relative(process.cwd(), file.fileName)}:${line + 1}:${character + 1} ${code} ${msg}`);
};

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const nearest = (word, pool, n = 3) => pool.map((p) => [distance(word, p), p]).sort((x, y) => x[0] - y[0]).slice(0, n).map((x) => x[1]);

// ── program ──────────────────────────────────────────────────────────────
const cfg = ts.getParsedCommandLineOfConfigFile(resolve(tsconfigPath), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => { throw new Error(ts.flattenDiagnosticMessageText(d.messageText, "\n")); } });
const program = ts.createProgram(cfg.fileNames, cfg.options);
const checker = program.getTypeChecker();

// 1. tsc diagnostics, fact first
for (const d of ts.getPreEmitDiagnostics(program)) {
  const chain = [];
  let m = d.messageText;
  while (typeof m === "object") { chain.push(m.messageText); m = m.next?.[0]; }
  if (typeof m === "string") chain.push(m);
  const fact = chain[chain.length - 1];
  const prop = chain.map((c) => /Types of property '"?([^'"]+)"?' are incompatible/.exec(c)?.[1]).filter(Boolean).pop();
  const head = chain.length > 1 ? ` (${chain[0].length > 150 ? chain[0].slice(0, 150) + "…" : chain[0]})` : "";
  const msg = (prop ? `${prop}: ` : "") + fact + (prop ? "" : head);
  if (d.file) add(d.file, d.start, `TS${d.code}`, msg); else findings.push(`TS${d.code} ${msg}`);
}

// 3. design system
const css = readFileSync(cssPath, "utf8");
const twRoot = dirname(require.resolve("tailwindcss/package.json"));
const ds = await tw.__unstable__loadDesignSystem(css, {
  base: dirname(resolve(cssPath)),
  loadStylesheet: async (id, base) => {
    const path = id === "tailwindcss" ? resolve(twRoot, "index.css") : id.startsWith("tailwindcss/") ? resolve(twRoot, id.slice(12) + (id.endsWith(".css") ? "" : ".css")) : resolve(base, id);
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  },
});
const vocabulary = ds.getClassList().map((e) => e[0]);
const themeColors = [...css.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((m) => m[1]);
const cssCache = new Map();
const cssOf = (token) => {
  if (!cssCache.has(token)) cssCache.set(token, ds.candidatesToCss([token])[0]);
  return cssCache.get(token);
};
const split = (token) => { const i = token.lastIndexOf(":"); return [token.slice(0, i + 1), token.slice(i + 1)]; };
const props = (token) => {
  const out = cssOf(token);
  if (!out) return "";
  return [...out.matchAll(/^\s*(-{0,2}[a-z][a-z-]*)\s*:/gm)].map((m) => m[1]).filter((p) => !p.startsWith("--tw-")).sort().join(",");
};

function checkClasses(file, node, text) {
  const tokens = text.split(/\s+/).filter(Boolean);
  const seen = new Map();
  for (const t of tokens) {
    if (allow.some((re) => re.test(t))) continue;
    if (cssOf(t) == null) {
      const [variants, base] = split(t);
      const stem = base.replace(/\/\d+$/, "");
      const prefix = stem.split("-")[0];
      const pool = vocabulary.filter((v) => v.startsWith(prefix + "-") || v === prefix);
      const color = /^(bg|text|border|ring|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|shadow)-([a-z]+-\d{2,3})$/.exec(stem);
      if (color) {
        add(file, node.getStart(), "RX-CLASS", `"${t}": ${color[2]} is not a color in this theme. Theme colors: ${themeColors.join(", ")}`);
        continue;
      }
      const hint = nearest(stem, pool.length ? pool : vocabulary).map((s) => variants + s);
      add(file, node.getStart(), "RX-CLASS", `"${t}" is not a class in this theme. Nearest: ${hint.join(", ")}`);
      continue;
    }
    const [variants] = split(t);
    const key = variants + "|" + props(t);
    if (props(t) && seen.has(key) && seen.get(key) !== t) add(file, node.getStart(), "RX-CLASS", `"${seen.get(key)}" and "${t}" set the same properties (${props(t)}); keep one`);
    seen.set(key, t);
  }
}

function literals(file, expr, depth = 0) {
  if (!expr || depth > 4) return;
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) return checkClasses(file, expr, expr.text);
  if (ts.isTemplateExpression(expr)) return add(file, expr.getStart(), "RX-CLASS", "a class must be a complete literal: pick between whole strings, do not build one with ${}");
  if (ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr) || ts.isElementAccessExpression(expr)) {
    const root = ts.isIdentifier(expr) ? expr : expr.expression;
    let sym = checker.getSymbolAtLocation(root);
    if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
    const decl = sym?.valueDeclaration;
    if (decl && ts.isVariableDeclaration(decl) && decl.initializer) literals(decl.getSourceFile(), decl.initializer, depth + 1);
    return;
  }
  if (ts.isConditionalExpression(expr)) { literals(file, expr.whenTrue, depth); literals(file, expr.whenFalse, depth); return; }
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) literals(file, expr.right, depth);
    else if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) { literals(file, expr.left, depth); literals(file, expr.right, depth); }
    return;
  }
  if (ts.isArrayLiteralExpression(expr)) return expr.elements.forEach((e) => literals(file, e, depth));
  if (ts.isObjectLiteralExpression(expr)) return expr.properties.forEach((q) => ts.isPropertyAssignment(q) && literals(file, q.initializer, depth));
  if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr)) return literals(file, expr.expression, depth);
}

const done = new Set();
for (const file of program.getSourceFiles()) {
  if (file.isDeclarationFile || !file.fileName.endsWith(".tsx")) continue;
  const visit = (node) => {
    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(file);
      // 2. hyphenated attributes
      if (name.startsWith("hx-") && !HX.includes(name.replace(/:(inherited|append)$/, "")) && !name.startsWith("hx-status:")) {
        add(file, node.getStart(), "RX-ATTR", name.startsWith("hx-on") ? `"${name}" runs inline script and is not allowed` : `"${name}" is not an htmx attribute. Nearest: ${nearest(name, HX).join(", ")}`);
      }
      if (name === "class" && node.initializer) {
        const init = ts.isJsxExpression(node.initializer) ? node.initializer.expression : node.initializer;
        const key = init.getSourceFile().fileName + ":" + init.getStart();
        if (!done.has(key)) { done.add(key); literals(file, init); }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
}

const unique = [...new Set(findings)];
for (const f of unique) console.log(f);
console.log(unique.length === 0 ? "rtsx check: clean" : `rtsx check: ${unique.length} finding${unique.length === 1 ? "" : "s"}`);
process.exit(unique.length === 0 ? 0 : 1);
