/**
 * `npm run codemod:storage-fields -- <tsconfig> [--dry]` — migrate a consumer
 * repo off direct access to element storage fields, which are protected
 * `_`-prefixed storage since the privatization (no public field may shadow its
 * setter — a blind `.src()` guess must error as a missing property, not a
 * "String has no call signatures" cascade).
 *
 * Mechanics, mirroring canonical-names: a `PropertyAccessExpression` (or a
 * string-keyed `ElementAccessExpression` for the hyphenated SVG fields) whose
 * name is a storage field is rewritten **only if the receiver types as
 * fluent-html's `Tag`** (or a subclass):
 *
 *  - statement-position writes `tag.field = expr`  → the typed setter: `tag.setField(expr)`
 *  - reads of the fields with a public accessor (`class` → `getClass()`,
 *    `enctype` → `getEnctype()`)                    → the accessor call, with
 *    `?.` preserved. A property read participates in control-flow narrowing
 *    but a method call does not, so where the original read's flow type was
 *    narrowed past `undefined` (`t.class && re.test(t.class)`) the emission
 *    restores the checker's knowledge: `(getClass() ?? "")` where a neutral
 *    fallback exists, a `!` assertion otherwise — both no-ops at runtime,
 *    because the same flow analysis proved the value non-null.
 *  - shapes a setter cannot express are left untouched and reported: compound
 *    assignments (`t.class += x`), assignments whose value is used
 *    (`const c = (t.class = "x")` — setters return `this`), and destructuring
 *    of storage names off a Tag-typed source (`const { enctype } = form`).
 *  - any other read is left untouched and reported — the privatized surface
 *    keeps accessors only for the reads consumer repos were measured to make;
 *    a new legitimate read should become a library accessor, not a cast.
 *
 * @module
 */
import { pathToFileURL } from "node:url";

import { Node, Project, SyntaxKind, type Expression, type SourceFile, type Type } from "ts-morph";

/**
 * Storage-field reads that kept a public, non-shadowing accessor. `fallback`
 * is the neutral value spliced in as `?? fallback` where the original read's
 * flow type was narrowed past `undefined` (see the module doc); a getter
 * without one uses a `!` assertion there instead.
 */
const GETTERS: Readonly<Record<string, { readonly getter: string; readonly fallback?: string }>> = {
  class: { getter: "getClass", fallback: '""' },
  enctype: { getter: "getEnctype" },
};

const COMPOUND_ASSIGN_OPERATORS = new Set<SyntaxKind>([
  SyntaxKind.PlusEqualsToken,
  SyntaxKind.MinusEqualsToken,
  SyntaxKind.AsteriskEqualsToken,
  SyntaxKind.AsteriskAsteriskEqualsToken,
  SyntaxKind.SlashEqualsToken,
  SyntaxKind.PercentEqualsToken,
  SyntaxKind.LessThanLessThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanEqualsToken,
  SyntaxKind.GreaterThanGreaterThanGreaterThanEqualsToken,
  SyntaxKind.AmpersandEqualsToken,
  SyntaxKind.BarEqualsToken,
  SyntaxKind.CaretEqualsToken,
  SyntaxKind.AmpersandAmpersandEqualsToken,
  SyntaxKind.BarBarEqualsToken,
  SyntaxKind.QuestionQuestionEqualsToken,
]);

/** field → setter where the mechanical `set` + capitalize rule doesn't hold. */
const IRREGULAR_SETTERS: Readonly<Record<string, string>> = {
  crossorigin: "setCrossOrigin",
  fetchpriority: "setFetchPriority",
  referrerpolicy: "setReferrerPolicy",
  httpEquiv: "setHttpEquiv",
  contentValue: "setContent",
  listId: "setList",
  wrapMode: "setWrap",
  fillValue: "setFill",
  strokeValue: "setStroke",
  transformValue: "setTransform",
  svgOpacity: "setOpacity",
  "stroke-width": "setStrokeWidth",
  "stroke-linecap": "setStrokeLinecap",
  "stroke-linejoin": "setStrokeLinejoin",
  "stroke-dasharray": "setStrokeDasharray",
  "stroke-dashoffset": "setStrokeDashoffset",
  "stroke-opacity": "setStrokeOpacity",
  "fill-rule": "setFillRule",
  "clip-rule": "setClipRule",
  "text-anchor": "setTextAnchor",
  "dominant-baseline": "setDominantBaseline",
  "font-size": "setFontSize",
  "font-family": "setFontFamily",
  "font-weight": "setFontWeight",
  "font-style": "setFontStyle",
  "text-decoration": "setTextDecoration",
  "letter-spacing": "setLetterSpacing",
  "stop-color": "setStopColor",
  "stop-opacity": "setStopOpacity",
};

/** Every privatized storage field (element classes + the Tag base fields). */
const FIELDS = new Set([
  ...Object.keys(IRREGULAR_SETTERS),
  "id", "class", "style", "htmx",
  "abbr", "accept", "action", "allow", "alt", "as", "autocomplete", "capture",
  "charset", "cite", "clipPathUnits", "closedby", "cols", "colspan", "command",
  "commandfor", "coords", "cx", "cy", "d", "data", "datetime", "decoding", "dir",
  "dirname", "download", "dx", "dy", "edgeMode", "enctype", "filter",
  "filterUnits", "for", "formaction", "formenctype", "formmethod", "formtarget",
  "fx", "fy", "gradientTransform", "gradientUnits", "headers", "height", "high",
  "href", "hreflang", "imagesizes", "imagesrcset", "in", "inputmode",
  "integrity", "kind", "label", "lang", "loading", "low", "maskContentUnits",
  "maskUnits", "max", "maxlength", "media", "method", "min", "minlength",
  "name", "offset", "optimum", "pattern", "placeholder", "points", "poster",
  "preload", "primitiveUnits", "property", "r", "rel", "result", "rows",
  "rowspan", "rx", "ry", "sandbox", "scope", "shape", "size", "sizes", "span",
  "spreadMethod", "src", "srcdoc", "srclang", "srcset", "stdDeviation", "step",
  "target", "type", "value", "viewBox", "width", "x", "x1", "x2", "xmlns", "y",
  "y1", "y2",
]);

function setterFor(field: string): string {
  return IRREGULAR_SETTERS[field] ?? `set${field.charAt(0).toUpperCase()}${field.slice(1)}`;
}

export type Edit = { readonly start: number; readonly end: number; readonly text: string };
export type Skip = { readonly line: number; readonly name: string; readonly reason: string };

function typeIsTag(type: Type, seen = new Set<Type>()): boolean {
  if (seen.has(type)) return false;
  seen.add(type);
  const apparent = type.getApparentType();
  const parts = apparent.isUnion() ? apparent.getUnionTypes() : apparent.isIntersection() ? apparent.getIntersectionTypes() : [apparent];
  for (const part of parts) {
    const symbol = part.getSymbol();
    if (symbol?.getName() === "Tag") {
      const declFile = symbol.getDeclarations()[0]?.getSourceFile().getBaseName();
      if (declFile === "tag.ts" || declFile === "tag.d.ts") return true;
    }
    for (const base of part.getBaseTypes()) if (typeIsTag(base, seen)) return true;
  }
  return false;
}

/** The accessed field name when `node` is a storage-field access on a Tag receiver, else null. */
function storageAccess(node: Node): { name: string; receiver: Expression; optional: boolean } | null {
  if (Node.isPropertyAccessExpression(node)) {
    const name = node.getName();
    if (!FIELDS.has(name)) return null;
    return { name, receiver: node.getExpression(), optional: node.hasQuestionDotToken() };
  }
  if (Node.isElementAccessExpression(node)) {
    const arg = node.getArgumentExpression();
    if (!arg || !Node.isStringLiteral(arg)) return null;
    const name = arg.getLiteralValue();
    if (!FIELDS.has(name)) return null;
    return { name, receiver: node.getExpression(), optional: node.hasQuestionDotToken() };
  }
  return null;
}

/** The enclosing statement position: the expression's value is discarded (a plain `tag.x = v;`). */
function isStatementPosition(expr: Node): boolean {
  let parent = expr.getParent();
  while (parent && Node.isParenthesizedExpression(parent)) parent = parent.getParent();
  return parent !== undefined && Node.isExpressionStatement(parent);
}

/** The destructured storage-field name when `node` is a binding element like `{ enctype }`, else null. */
function destructuredField(node: Node): string | null {
  if (!Node.isBindingElement(node)) return null;
  const pattern = node.getParent();
  if (!Node.isObjectBindingPattern(pattern)) return null;
  const nameNode = node.getPropertyNameNode() ?? node.getNameNode();
  const name = Node.isStringLiteral(nameNode) ? nameNode.getLiteralValue() : nameNode.getText();
  if (!FIELDS.has(name)) return null;
  const owner = pattern.getParent();
  if (!owner || !(Node.isVariableDeclaration(owner) || Node.isParameterDeclaration(owner))) return null;
  // A binding-pattern VariableDeclaration's own type is `any` — type the source expression.
  const source = Node.isVariableDeclaration(owner) ? owner.getInitializer() : owner;
  if (!source || !typeIsTag(source.getType())) return null;
  return name;
}

export function collectEdits(file: SourceFile): { edits: Edit[]; skips: Skip[] } {
  const edits: Edit[] = [];
  const skips: Skip[] = [];

  file.forEachDescendant((node) => {
    const destructured = destructuredField(node);
    if (destructured !== null) {
      skips.push({ line: node.getStartLineNumber(), name: destructured, reason: `destructuring privatized field "${destructured}" off a Tag — read through its accessor (or the value you passed to ${setterFor(destructured)}) instead` });
      return;
    }

    const access = storageAccess(node);
    if (!access) return;
    const { name, receiver, optional } = access;
    const parent = node.getParent();
    if (!parent) return;
    // `.enctype(…)` etc. never compiled — calls are not field accesses.
    if (Node.isCallExpression(parent) && parent.getExpression() === node) return;
    if (!typeIsTag(receiver.getType())) return;
    const line = node.getStartLineNumber();

    if (Node.isBinaryExpression(parent) && parent.getLeft() === node) {
      const operator = parent.getOperatorToken().getKind();
      if (COMPOUND_ASSIGN_OPERATORS.has(operator)) {
        skips.push({ line, name, reason: `compound assignment to privatized field "${name}" — no setter expresses read-modify-write; rewrite by hand (e.g. addClass for class)` });
        return;
      }
      if (operator === SyntaxKind.EqualsToken) {
        if (!isStatementPosition(parent)) {
          skips.push({ line, name, reason: `assignment to "${name}" whose value is used — ${setterFor(name)} returns the tag, not the value; rewrite by hand` });
          return;
        }
        // Two edits — wrap the RHS instead of swallowing it, so a storage read
        // inside the RHS still gets its own rewrite.
        edits.push({ start: parent.getStart(), end: parent.getRight().getStart(), text: `${receiver.getText()}.${setterFor(name)}(` });
        edits.push({ start: parent.getEnd(), end: parent.getEnd(), text: ")" });
        return;
      }
    }

    const accessor = GETTERS[name];
    if (accessor !== undefined) {
      const call = `${receiver.getText()}${optional ? "?." : "."}${accessor.getter}()`;
      // A property read is flow-narrowed, a call is not: where the checker had
      // narrowed this read past undefined, restore that knowledge (runtime
      // no-ops — the same flow analysis proved the value non-null).
      const narrowed = !node.getType().isNullable();
      let text = call;
      if (narrowed && !optional) {
        if (accessor.fallback !== undefined) {
          const isCallArgument = Node.isCallExpression(parent) && (parent.getArguments() as Node[]).includes(node);
          text = `${call} ?? ${accessor.fallback}`;
          if (!isCallArgument) text = `(${text})`;
        } else {
          text = `${call}!`;
        }
      }
      edits.push({ start: node.getStart(), end: node.getEnd(), text });
      return;
    }
    skips.push({ line, name, reason: `read of privatized field "${name}" has no public accessor — use the value you passed to ${setterFor(name)}, or request a getter` });
  });

  return { edits, skips };
}

export function applyEdits(file: SourceFile, edits: readonly Edit[]): void {
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    file.replaceText([edit.start, edit.end], edit.text);
  }
}

function run(): void {
  const argv = process.argv.slice(2);
  const dry = argv.includes("--dry");
  const tsConfigFilePath = argv.find((a) => !a.startsWith("--"));
  if (!tsConfigFilePath) {
    console.error("Usage: npm run codemod:storage-fields -- <path/to/tsconfig.json> [--dry]");
    process.exitCode = 1;
    return;
  }

  const project = new Project({ tsConfigFilePath });
  const files = project
    .getSourceFiles()
    .filter((f) => !f.isDeclarationFile() && !f.getFilePath().includes("/node_modules/"));

  let totalEdits = 0;
  let totalSkips = 0;
  const collected = files.map((file) => ({ file, ...collectEdits(file) }));
  for (const { file, edits, skips } of collected) {
    for (const skip of skips) {
      console.warn(`SKIP ${file.getFilePath()}:${skip.line} .${skip.name} — ${skip.reason}`);
    }
    totalSkips += skips.length;
    if (edits.length === 0) continue;
    applyEdits(file, edits);
    totalEdits += edits.length;
    console.log(`${dry ? "[dry] " : ""}${file.getFilePath()} — ${edits.length} site(s)`);
  }

  if (!dry) project.saveSync();
  console.log(
    `codemod:storage-fields ${dry ? "(dry run) " : ""}— ${totalEdits} site(s) rewritten across ${files.length} file(s); ${totalSkips} skipped for manual review.`,
  );
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) run();
