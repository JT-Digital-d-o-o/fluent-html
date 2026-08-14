/**
 * `npm run codemod:canonical -- <tsconfig> [--dry]` — migrate a consumer repo
 * to the 7.0.0 canonical method names (method name = Tailwind class prefix)
 * AND the object variant surface (llm-styling/object-variants).
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
 * Variant lambdas convert to typed style objects, using the same key
 * derivation the library runtime uses (`variantKeySpecs`):
 *   `.on("hover", t => t.bg("blue-600"))`   → `.hover({ bg: "blue-600" })`
 *   `.at("md", t => t.p("x", "8"))`         → `.md({ px: "8" })`
 *   `.on("dark", t => t.on("hover", …))`    → `.dark({ hover: { … } })`
 *   `.on("aria-checked", …)`                → `.variant("aria-checked", { … })`
 * A repeated key (two `.ring()` calls) chains a second variant call. Lambdas
 * the transform can't express (non-literal args, `.addClass()` inside, a
 * non-tier-1 nested variant) are left untouched and reported.
 *
 * Name matches whose receiver cannot be verified are left untouched and
 * reported for manual review.
 *
 * @module
 */
import { pathToFileURL } from "node:url";

import { Node, Project, ts, type CallExpression, type Expression, type SourceFile, type Type } from "ts-morph";

import { variantKeySpecs, DIRECT_VARIANTS, DIR_MAP, UNITS } from "../../src/class-vocab/index.js";
import type { VariantKeySpec } from "../../src/class-vocab/index.js";

/**
 * Old → canonical name. Simple renames + merge sources (call-site-pure:
 * argument shapes carried over). `backfaceVisibility` and `scrollMargin` are
 * NOT mapped: their 8.0.0 canonical targets (`backface`, `scrollM`) were
 * pruned with the zero-use surface — those calls skip+report, and the
 * successors are `.variant()` / `.cssProp("backface-visibility", …)` /
 * `.cssProp("scroll-margin", …)`.
 */
export const RENAMES: Readonly<Record<string, string>> = {
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
  transformStyle: "transform",
  scrollBehavior: "scroll",
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
export const KEYWORD_DISPATCH: Readonly<Record<string, Readonly<Record<string, string>>>> = {
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
    table: "table",
    "table-cell": "tableCell",
    "table-row": "tableRow",
  },
  position: {
    static: "static",
    fixed: "fixed",
    absolute: "absolute",
    relative: "relative",
    sticky: "sticky",
  },
};

/** Legacy names whose canonical targets were pruned in 8.0.0 — skip+report with the successor. */
const PRUNED: Readonly<Record<string, string>> = {
  backfaceVisibility: 'canonical target "backface" was pruned in 8.0.0 — use .cssProp("backface-visibility", …) or a .variant() cssProp key',
  scrollMargin: 'canonical target "scrollM" was pruned in 8.0.0 — use .cssProp("scroll-margin", …) or a .variant() cssProp key',
};

const REWRITES = new Set(["outlineHidden", "bold", ...Object.keys(KEYWORD_DISPATCH)]);
const ALL_SOURCE_NAMES = new Set([...Object.keys(RENAMES), ...REWRITES, ...Object.keys(PRUNED), "on", "at"]);

/** A pending text edit: [start, end) replaced by `text`. Applied per file in descending `start` order. */
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

// ── Variant-lambda → object-form conversion (object-variants) ────────

/** Tailwind variant prefix → tier-1 method/nested-key name (`2xl` → `xl2`). */
const TIER1_BY_PREFIX: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(DIRECT_VARIANTS).map(([name, prefix]) => [prefix, name]),
);

/** Canonical method → its variant-key specs, longest fixed-`pre` first. */
const SPECS_BY_METHOD: ReadonlyMap<string, readonly VariantKeySpec[]> = (() => {
  const map = new Map<string, VariantKeySpec[]>();
  for (const spec of variantKeySpecs) {
    const list = map.get(spec.def.method) ?? [];
    list.push(spec);
    map.set(spec.def.method, list);
  }
  for (const list of map.values()) list.sort((a, b) => b.pre.length - a.pre.length);
  return map;
})();

/** Source text of a literal argument (string keeps its quotes, numbers incl. unary minus), or null. */
function literalArg(node: Node): { text: string; value: string } | null {
  if (Node.isStringLiteral(node)) return { text: node.getText(), value: node.getLiteralValue() };
  if (Node.isNumericLiteral(node)) return { text: node.getText(), value: node.getText() };
  if (Node.isPrefixUnaryExpression(node) && node.getOperatorToken() === ts.SyntaxKind.MinusToken && Node.isNumericLiteral(node.getOperand())) {
    return { text: node.getText(), value: node.getText() };
  }
  return null;
}

type ObjEntry = { readonly key: string; readonly value: string };

/** One styling call inside a variant lambda → its object entry, or a skip reason. */
function entryFor(name: string, args: readonly Node[]): { entry?: ObjEntry; reason?: string } {
  // Normalize legacy/renamed spellings first (the lambda may predate canonical names).
  if (name === "bold") return args.length === 0 ? { entry: { key: "font", value: '"bold"' } } : { reason: "bold() with args" };
  if (name === "outlineHidden") return { entry: { key: "outline", value: '"hidden"' } };
  const dispatch = KEYWORD_DISPATCH[name];
  if (dispatch !== undefined) {
    const lit = args.length === 1 ? literalArg(args[0]!) : null;
    const method = lit ? dispatch[lit.value] : undefined;
    return method !== undefined ? { entry: { key: method, value: "true" } } : { reason: `unconvertible ${name}() in variant` };
  }
  const canonical = RENAMES[name] ?? name;
  const specs = SPECS_BY_METHOD.get(canonical);
  if (specs === undefined) return { reason: `.${canonical}() has no variant-object key` };
  const lits = args.map(literalArg);
  if (lits.some((l) => l === null)) return { reason: `.${canonical}() has a non-literal argument` };
  const values = (lits as { text: string; value: string }[]);

  let spec = specs.find((s) => s.pre.length > 0 && s.pre.every((p, i) => {
    const v = values[i]?.value;
    return v !== undefined && (v === p || DIR_MAP[v] === p);
  })) ?? specs.find((s) => s.pre.length === 0);
  if (spec === undefined) return { reason: `.${canonical}() arguments match no object key` };
  let rest = values.slice(spec.pre.length);

  // `.p("x", "8")` / `.m("top", "2")`: the directional keys of p/m are their
  // own rows (`px`, `mt`, …), not derived expansions — route through them.
  if (spec.emit.kind === "spacing" && rest.length === 2 && DIR_MAP[rest[0]!.value] !== undefined && !UNITS.has(rest[0]!.value)) {
    const dirSpec = SPECS_BY_METHOD.get(`${canonical}${DIR_MAP[rest[0]!.value]}`)?.[0];
    if (dirSpec !== undefined) {
      spec = dirSpec;
      rest = rest.slice(1);
    }
  }

  // Unit overload → the bracket arm (`.w("px", 300)` → `w: "[300px]"`).
  if (rest.length === 2 && UNITS.has(rest[0]!.value) && /^-?\d/.test(rest[1]!.value)) {
    return { entry: { key: spec.key, value: `"[${rest[1]!.value}${rest[0]!.value}]"` } };
  }
  if (rest.length === 0) return { entry: { key: spec.key, value: "true" } };
  if (rest.length === 1) return { entry: { key: spec.key, value: rest[0]!.text } };
  return { entry: { key: spec.key, value: `[${rest.map((r) => r.text).join(", ")}]` } };
}

/**
 * Convert a variant lambda body (a call chain rooted at the arrow's parameter)
 * into object entries, recursing into nested `.on()`/`.at()`. Returns null with
 * a reason when any link is not object-expressible.
 */
function chainEntries(body: Expression, param: string): { entries?: ObjEntry[]; reason?: string } {
  const calls: { name: string; node: CallExpression }[] = [];
  let cursor: Expression = body;
  while (Node.isCallExpression(cursor)) {
    const callee = cursor.getExpression();
    if (!Node.isPropertyAccessExpression(callee)) return { reason: "non-method call in variant lambda" };
    calls.push({ name: callee.getName(), node: cursor });
    cursor = callee.getExpression();
  }
  if (!Node.isIdentifier(cursor) || cursor.getText() !== param) return { reason: "lambda body is not a chain on its parameter" };

  const entries: ObjEntry[] = [];
  for (const { name, node } of calls.reverse()) {
    if (name === "on" || name === "at") {
      const nested = variantObjectText(node);
      if (nested.chunks === undefined) return { reason: nested.reason ?? "unconvertible nested variant" };
      const tier1 = TIER1_BY_PREFIX[nested.prefix!];
      if (tier1 === undefined) return { reason: `nested variant "${nested.prefix}" is not a tier-1 member` };
      if (nested.chunks.length === 0) continue; // empty nested lambda — a no-op, drop it
      if (nested.chunks.length > 1) return { reason: "nested variant has a repeated key (cannot nest)" };
      entries.push({ key: tier1, value: nested.chunks[0]! });
      continue;
    }
    const { entry, reason } = entryFor(name, node.getArguments());
    if (entry === undefined) return { reason: reason ?? "unconvertible call" };
    entries.push(entry);
  }
  return { entries };
}

/** Entries → object-literal chunks, starting a new chunk whenever a key repeats. */
function chunkEntries(entries: readonly ObjEntry[]): string[] {
  const chunks: ObjEntry[][] = [[]];
  for (const e of entries) {
    if (chunks[chunks.length - 1]!.some((x) => x.key === e.key)) chunks.push([]);
    chunks[chunks.length - 1]!.push(e);
  }
  return chunks.filter((c) => c.length > 0).map((c) => `{ ${c.map((e) => `${e.key}: ${e.value}`).join(", ")} }`);
}

/** Convert one `.on()`/`.at()` call into its variant prefix + object chunk(s). */
function variantObjectText(call: CallExpression): { prefix?: string; chunks?: string[]; reason?: string } {
  const args = call.getArguments();
  if (args.length !== 2) return { reason: "variant call is not (name, lambda)" };
  const nameArg = args[0]!;
  if (!Node.isStringLiteral(nameArg)) return { reason: "variant name is not a string literal" };
  const arrow = args[1]!;
  if (!Node.isArrowFunction(arrow)) return { reason: "variant callback is not an arrow function" };
  const params = arrow.getParameters();
  if (params.length !== 1) return { reason: "variant callback must take one parameter" };
  const body = arrow.getBody();
  if (!Node.isExpression(body)) return { reason: "variant callback has a block body" };
  const { entries, reason } = chainEntries(body, params[0]!.getName());
  if (entries === undefined) return { reason };
  return { prefix: nameArg.getLiteralValue(), chunks: chunkEntries(entries) };
}

/** The full replacement text for a top-level variant call's `on(...)`/`at(...)` span, or a skip. */
function variantRewriteText(call: CallExpression): { text?: string; skipReason?: string } {
  const { prefix, chunks, reason } = variantObjectText(call);
  if (prefix === undefined || chunks === undefined) return { skipReason: reason ?? "unconvertible variant" };
  if (chunks.length === 0) return { text: "" }; // empty lambda — drop the call entirely
  const tier1 = TIER1_BY_PREFIX[prefix];
  const calls = chunks.map((c) => (tier1 !== undefined ? `${tier1}(${c})` : `variant("${prefix}", ${c})`));
  return { text: calls.join(".") };
}

export function collectEdits(file: SourceFile): { edits: Edit[]; skips: Skip[] } {
  const edits: Edit[] = [];
  const skips: Skip[] = [];
  // Spans of .on/.at calls already handled (converted or reported) by an
  // enclosing conversion — inner calls and renames there must not double-edit.
  const variantSpans: [number, number][] = [];
  const converted: [number, number][] = [];
  const inSpan = (spans: [number, number][], pos: number): boolean => spans.some(([s, e]) => pos >= s && pos < e);

  file.forEachDescendant((node) => {
    if (!Node.isCallExpression(node)) return;
    const callee = node.getExpression();
    if (!Node.isPropertyAccessExpression(callee)) return;
    const name = callee.getName();
    if (!ALL_SOURCE_NAMES.has(name)) return;
    const line = callee.getNameNode().getStartLineNumber();
    const nameStart = callee.getNameNode().getStart();
    // Anything inside an already-converted variant span is folded into the
    // object text — no separate edits, no receiver-check noise. (Inside a
    // FAILED span, renames still apply where the receiver verifies.)
    if (inSpan(converted, nameStart)) return;
    if (!receiverIsTag(callee.getExpression())) {
      // Calls on a variant-lambda parameter type as `any` once the linked lib
      // has dropped .on/.at — inside a reported (failed) span that's implied
      // by the span's own skip, so don't double-report. `.on`/`.at` on a
      // receiver that types cleanly (EventEmitter, Array, string) is stdlib,
      // not fluent — reporting those would bury real review items; an
      // `any`/error-poisoned receiver still reports (may be a broken Tag chain).
      const stdlib = (name === "on" || name === "at") && !callee.getExpression().getType().isAny();
      if (!stdlib && !inSpan(variantSpans, nameStart)) skips.push({ line, name, reason: "receiver does not type as Tag" });
      return;
    }
    if (name === "on" || name === "at") {
      if (inSpan(variantSpans, nameStart)) return; // handled by the enclosing conversion
      variantSpans.push([nameStart, node.getEnd()]);
      const { text, skipReason } = variantRewriteText(node);
      if (text === undefined) {
        skips.push({ line, name, reason: skipReason ?? "unconvertible variant lambda" });
      } else {
        converted.push([nameStart, node.getEnd()]);
        // An empty-lambda drop must also consume the leading dot: scan back
        // over whitespace (`x\n  .on(…)`), take the `?.`'s `?` too, then any
        // whitespace before that — deleting up to the previous token's end.
        const fileText = file.getFullText();
        let dot = nameStart - 1;
        while (dot > 0 && /\s/.test(fileText[dot]!)) dot--;
        let dotStart = fileText[dot - 1] === "?" ? dot - 1 : dot;
        while (dotStart > 0 && /\s/.test(fileText[dotStart - 1]!)) dotStart--;
        edits.push(text === "" ? { start: dotStart, end: node.getEnd(), text: "" } : { start: nameStart, end: node.getEnd(), text });
      }
      return;
    }
    // A rename inside a successfully converted variant span is already folded
    // into the object text; inside a FAILED span it still applies.
    if (inSpan(converted, nameStart)) return;
    if (PRUNED[name] !== undefined) {
      skips.push({ line, name, reason: PRUNED[name] });
      return;
    }
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

/** Apply edits to `file` in descending start order, so a later edit never shifts an earlier span. */
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
    console.error("Usage: npm run codemod:canonical -- <path/to/tsconfig.json> [--dry]");
    process.exitCode = 1;
    return;
  }

  const project = new Project({ tsConfigFilePath });
  const files = project
    .getSourceFiles()
    .filter((f) => !f.isDeclarationFile() && !f.getFilePath().includes("/node_modules/"));

  // Two-phase: collect edits for EVERY file before applying any. Applying as
  // we iterate would error-poison the in-memory program against a pre-rename
  // library (an already-edited file's `.p()` doesn't exist on the old `Tag`,
  // so components imported from it collapse to `any` and later files' chains
  // fail the receiver check with bogus skips).
  let totalEdits = 0;
  let totalSkips = 0;
  const collected = files.map((file) => ({ file, ...collectEdits(file) }));
  for (const { file, edits, skips } of collected) {
    for (const skip of skips) {
      console.warn(`SKIP ${file.getFilePath()}:${skip.line} .${skip.name}() — ${skip.reason}`);
    }
    totalSkips += skips.length;
    if (edits.length === 0) continue;
    applyEdits(file, edits);
    totalEdits += edits.length;
    console.log(`${dry ? "[dry] " : ""}${file.getFilePath()} — ${edits.length} call site(s)`);
  }

  if (!dry) project.saveSync();
  console.log(
    `codemod:canonical ${dry ? "(dry run) " : ""}— ${totalEdits} call site(s) rewritten across ${files.length} file(s); ${totalSkips} skipped for manual review.`,
  );
}

// CLI entry only — importing this module (e.g. from the fixture tests) must not run it.
if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) run();
