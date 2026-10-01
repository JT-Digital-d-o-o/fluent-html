// Usage: node calls.cjs <surface.json> <dir...>  — AST inventory of fluent imports and method calls
const ts = require(process.env.TSPATH);
const fs = require("fs"), path = require("path");
const surface = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const methods = new Set(surface.methods), exps = new Set(surface.exports);
const PALETTE = /\b(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b/g;
const out = { files: {}, importsMissing: [], importsUsed: [], calls: {}, unknownCalls: {}, rawClassStrings: 0, rawClassTokens: 0, paletteLiterals: 0, paletteSamples: new Set(), hxAttrs: {}, hxRawUrls: [] };
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : /\.(ts|tsx|js|mjs)$/.test(e.name) ? [path.join(dir, e.name)] : []); }
for (const dir of process.argv.slice(3)) for (const file of walk(dir)) {
  const src = fs.readFileSync(file, "utf8");
  out.files[file] = src.split("\n").length;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const pal = src.match(PALETTE) || []; out.paletteLiterals += pal.length; pal.forEach((p) => out.paletteSamples.add(p));
  for (const m of src.matchAll(/["'`](hx-[a-z-]+(?::[a-z-]+)?)["'`]/g)) out.hxAttrs[m[1]] = (out.hxAttrs[m[1]] || 0) + 1;
  const visit = (n) => {
    if (ts.isImportDeclaration(n) && /fluent-html/.test(n.moduleSpecifier.text)) {
      const nb = n.importClause && n.importClause.namedBindings;
      if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) { const nm = (el.propertyName || el.name).text; out.importsUsed.push(nm); if (!exps.has(nm) && !n.importClause.isTypeOnly && !el.isTypeOnly) out.importsMissing.push(`${nm} (${n.moduleSpecifier.text})`); }
      if (n.moduleSpecifier.text !== "fluent-html") out.importsMissing.push(`subpath ${n.moduleSpecifier.text}`);
    }
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)) {
      const name = n.expression.name.text;
      out.calls[name] = (out.calls[name] || 0) + 1;
      if (!methods.has(name)) out.unknownCalls[name] = (out.unknownCalls[name] || 0) + 1;
      if ((name === "addClass" || name === "setClass") && n.arguments[0]) { out.rawClassStrings++; const t = n.arguments[0].getText(); out.rawClassTokens += (t.match(/[a-z0-9:\/\[\]._-]+/gi) || []).length; }
    }
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "hx" && n.arguments[0]) out.hxRawUrls.push(n.arguments[0].getText());
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
out.paletteSamples = [...out.paletteSamples];
console.log(JSON.stringify(out, null, 1));
