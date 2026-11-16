// Size of a set of source files, three ways, plus the framework vocabulary they use.
//   node tools/count.mjs <label> <file.ts>...
// bytes: wc -c. code lines: non-blank lines that are not only a comment. tokens: TypeScript
// lexical tokens (the scanner's, comments and whitespace skipped), a tokenizer-neutral proxy for
// what the model writes. vocabulary: distinct imported names plus distinct called member names
// (`.name(`), minus the stand-in data layer (db.*) and JS built-ins.
import { readFileSync } from "node:fs";
import ts from "typescript";

const [label, ...files] = process.argv.slice(2);
const BUILTIN = new Set(["keys", "includes", "trim", "repeat", "map", "filter", "toLowerCase", "values", "some"]);
const DATA = new Set(["search", "find", "nameTaken", "create", "remove", "job", "setJob"]);

let bytes = 0;
let lines = 0;
let tokens = 0;
let stringBytes = 0;
const imports = new Set();
const members = new Set();

for (const file of files) {
  const text = readFileSync(file, "utf8");
  bytes += Buffer.byteLength(text);
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  const codeLines = new Set();
  for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    tokens++;
    if (kind === ts.SyntaxKind.StringLiteral || kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) stringBytes += scanner.getTokenText().length;
    codeLines.add(text.slice(0, scanner.getTokenStart()).split("\n").length);
  }
  lines += codeLines.size;

  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const walk = (node) => {
    if (ts.isImportDeclaration(node) && node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      const from = node.moduleSpecifier.text;
      const domain = /service|data\.ts|\.view\.|schema\.js|routes\.js/.test(from);
      if (!domain) for (const el of node.importClause.namedBindings.elements) imports.add(el.name.text);
    }
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const name = node.expression.name.text;
      const owner = node.expression.expression;
      const onDb = ts.isIdentifier(owner) && owner.text === "db";
      if (!onDb && !BUILTIN.has(name) && !(DATA.has(name) && onDb)) members.add(name);
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
}

const vocabulary = new Set([...imports, ...members]);
console.log(JSON.stringify({
  label, files: files.length, bytes, codeLines: lines, tsTokens: tokens, stringLiteralChars: stringBytes,
  vocabulary: vocabulary.size, imports: [...imports].sort(), calledMembers: [...members].sort(),
}, null, 1));
