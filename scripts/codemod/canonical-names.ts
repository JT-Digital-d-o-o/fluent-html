/**
 * `npm run codemod:canonical -- <tsconfig> [--dry]` — migrate a consumer repo
 * to the 7.0.0 canonical method names (method name = Tailwind class prefix).
 *
 * Mechanics: every `CallExpression` whose callee is a `PropertyAccessExpression`
 * with a name in the rename map is rewritten **only if the receiver types as
 * fluent-html's `Tag`** (or a subclass) — a bare name match would also hit
 * formFor's `select`, Prisma's `count`, etc. Because target repos may already
 * link the renamed library (old names no longer resolve, poisoning the types
 * of downstream links in a chain), the check also passes transitively: a
 * receiver that is itself a to-be-renamed call on a verified `Tag` receiver.
 *
 * Three rewrites are not pure renames:
 *   `.outlineHidden()`   → `.outline("hidden")`
 *   `.bold()`            → `.font("bold")`
 *   `.display("block")`  → `.block()`   (legacy pre-6.x method; demos only)
 *
 * Name matches whose receiver cannot be verified are left untouched and
 * reported for manual review.
 *
 * @module
 */
import { Node, Project, type CallExpression, type Expression, type SourceFile, type Type } from "ts-morph";

/** Old → canonical name. 21 simple renames + 29 merge sources (call-site-pure: argument shapes carried over). */
const RENAMES: Readonly<Record<string, string>> = {
  // (b) simple renames
  padding: "p",
  margin: "m",
  background: "bg",
  zIndex: "z",
  objectFit: "object",
  justifyContent: "justify",
  alignItems: "items",
  alignSelf: "self",
  gridAutoFlow: "gridFlow",
  gridAutoRows: "autoRows",
  gridAutoCols: "autoCols",
  fillColor: "fill",
  accentColor: "accent",
  caretColor: "caret",
  backfaceVisibility: "backface",
  transformStyle: "transform",
  scrollBehavior: "scroll",
  scrollMargin: "scrollM",
  scrollPadding: "scrollP",
  gradientRadial: "bgRadial",
  gradientConic: "bgConic",
  // (c) merge sources
  textColor: "text",
  textSize: "text",
  textAlign: "text",
  textWrap: "text",
  fontWeight: "font",
  fontFamily: "font",
  borderColor: "border",
  borderStyle: "border",
  ringColor: "ring",
  shadowColor: "shadow",
  strokeColor: "stroke",
  strokeWidth: "stroke",
  decorationColor: "decoration",
  decorationStyle: "decoration",
  decorationThickness: "decoration",
  textShadowColor: "textShadow",
  dropShadowColor: "dropShadow",
  insetShadowColor: "insetShadow",
  insetRingColor: "insetRing",
  flexDirection: "flex",
  flexWrap: "flex",
  flexShorthand: "flex",
  transitionBehavior: "transition",
  listStyleType: "list",
  listStylePosition: "list",
  maskImage: "mask",
  maskComposite: "mask",
  gradientLinear: "bgLinear",
  gradientTo: "bgLinear",
};

/** Legacy keyword-dispatch methods (pre-6.x) — `.display(value)` / `.position(value)` → canonical no-arg method. */
const KEYWORD_DISPATCH: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  display: {
    block: "block",
    flex: "flex",
    grid: "grid",
    hidden: "hidden",
    inline: "inline",
    contents: "contents",
    "inline-block": "inlineBlock",
    "inline-flex": "inlineFlex",
    "inline-grid": "inlineGrid",
  },
  position: {
    static: "static",
    fixed: "fixed",
    absolute: "absolute",
    relative: "relative",
    sticky: "sticky",
  },
};

const REWRITES = new Set(["outlineHidden", "bold", ...Object.keys(KEYWORD_DISPATCH)]);
const ALL_SOURCE_NAMES = new Set([...Object.keys(RENAMES), ...REWRITES]);

/** A pending text edit: [start, end) replaced by `text`. Applied per file in descending `start` order. */
type Edit = { readonly start: number; readonly end: number; readonly text: string };
type Skip = { readonly line: number; readonly name: string; readonly reason: string };

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

/**
 * The receiver types as `Tag`, either directly or transitively through a chain
 * of to-be-renamed calls (whose own types are error-poisoned when the target
 * repo already links the renamed library).
 */
function receiverIsTag(expr: Expression): boolean {
  if (typeIsTag(expr.getType())) return true;
  if (Node.isCallExpression(expr)) {
    const callee = expr.getExpression();
    if (Node.isPropertyAccessExpression(callee) && ALL_SOURCE_NAMES.has(callee.getName())) {
      return receiverIsTag(callee.getExpression());
    }
  }
  return false;
}

/** Replacement text for the `name(...)` span of the non-pure-rename rewrites, or undefined to skip. */
function rewriteText(name: string, call: CallExpression): { text?: string; skipReason?: string } {
  if (name === "outlineHidden") return { text: 'outline("hidden")' };
  if (name === "bold") return { text: 'font("bold")' };
  const dispatch = KEYWORD_DISPATCH[name];
  if (dispatch === undefined) return { skipReason: "unknown rewrite" };
  const args = call.getArguments();
  const arg = args.length === 1 ? args[0] : undefined;
  if (!arg || !Node.isStringLiteral(arg)) return { skipReason: `${name}() argument is not a single string literal` };
  const method = dispatch[arg.getLiteralValue()];
  if (method === undefined) return { skipReason: `no canonical method for ${name}("${arg.getLiteralValue()}")` };
  return { text: `${method}()` };
}

function collectEdits(file: SourceFile): { edits: Edit[]; skips: Skip[] } {
  const edits: Edit[] = [];
  const skips: Skip[] = [];
  file.forEachDescendant((node) => {
    if (!Node.isCallExpression(node)) return;
    const callee = node.getExpression();
    if (!Node.isPropertyAccessExpression(callee)) return;
    const name = callee.getName();
    if (!ALL_SOURCE_NAMES.has(name)) return;
    const line = callee.getNameNode().getStartLineNumber();
    if (!receiverIsTag(callee.getExpression())) {
      skips.push({ line, name, reason: "receiver does not type as Tag" });
      return;
    }
    const nameStart = callee.getNameNode().getStart();
    if (REWRITES.has(name)) {
      const { text, skipReason } = rewriteText(name, node);
      if (text === undefined) skips.push({ line, name, reason: skipReason ?? "unsupported call shape" });
      else edits.push({ start: nameStart, end: node.getEnd(), text });
    } else {
      const canonical = RENAMES[name];
      if (canonical !== undefined) edits.push({ start: nameStart, end: callee.getNameNode().getEnd(), text: canonical });
    }
  });
  return { edits, skips };
}

function run(): void {
  const argv = process.argv.slice(2);
  const dry = argv.includes("--dry");
  const tsConfigFilePath = argv.find((a) => !a.startsWith("--"));
  if (!tsConfigFilePath) {
    console.error("Usage: npm run codemod:canonical -- <path/to/tsconfig.json> [--dry]");
    process.exitCode = 1;
    return;
  }

  const project = new Project({ tsConfigFilePath });
  const files = project
    .getSourceFiles()
    .filter((f) => !f.isDeclarationFile() && !f.getFilePath().includes("/node_modules/"));

  let totalEdits = 0;
  let totalSkips = 0;
  for (const file of files) {
    const { edits, skips } = collectEdits(file);
    for (const skip of skips) {
      console.warn(`SKIP ${file.getFilePath()}:${skip.line} .${skip.name}() — ${skip.reason}`);
    }
    totalSkips += skips.length;
    if (edits.length === 0) continue;
    // Descending start order: applying a later edit never shifts an earlier span.
    for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
      file.replaceText([edit.start, edit.end], edit.text);
    }
    totalEdits += edits.length;
    console.log(`${dry ? "[dry] " : ""}${file.getFilePath()} — ${edits.length} call site(s)`);
  }

  if (!dry) project.saveSync();
  console.log(
    `codemod:canonical ${dry ? "(dry run) " : ""}— ${totalEdits} call site(s) rewritten across ${files.length} file(s); ${totalSkips} skipped for manual review.`,
  );
}

run();
