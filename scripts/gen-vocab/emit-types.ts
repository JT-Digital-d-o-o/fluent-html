/**
 * Types emitter — renders `src/core/tailwind-types.gen.ts` from the vocab
 * (llm-styling/vocab-generator, emitter 1).
 *
 * The output is template-driven: `tailwind-types.template.txt` holds the
 * curated type surface verbatim (numeric unions, template-literal forms,
 * variant types — deliberate curation the vocab cannot express), with one
 * marker line per vocab-driven union:
 *
 *     @@UNION <TypeName> <method>[ +arb]@@
 *
 * Each marker is replaced by a canonical rendering of the `values.literals`
 * list on the named vocab row (`+arb` appends the `` `[${string}]` ``
 * escape-hatch arm). A row that is missing, or whose `values` is not a
 * `literals` spec, is a loud error — the generator never invents members.
 *
 * The introduction gate (PRD "Rabbit Holes"): the first generated output was
 * byte-diff-verified against the pre-generator `tailwind-types.ts` (modulo the
 * seams extraction), so generation changed nothing semantically.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as path from "node:path";

import { classVocab } from "../../src/class-vocab/index.js";
import { PINNED_TAILWIND_VERSION } from "./load-design-system.js";

/** Wrap width for rendered unions (matches the surrounding file's style). */
const MAX_WIDTH = 110;

/** `scripts/gen-vocab/` in the SOURCE tree (this module runs from `dist/scripts/gen-vocab/`). */
function sourceDir(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../scripts/gen-vocab");
}

/** Absolute path of the template the gen file is rendered from. */
export function templatePath(): string {
  return path.join(sourceDir(), "tailwind-types.template.txt");
}

/** Absolute path of the generated file. */
export function generatedPath(): string {
  return path.resolve(sourceDir(), "../../src/core/tailwind-types.gen.ts");
}

/**
 * Canonical union rendering: single-line when it fits, otherwise wrapped at
 * {@link MAX_WIDTH} with `  | ` continuation lines and the `;` on the last
 * member line. `arbitrary` appends the `` `[${string}]` `` escape-hatch arm.
 */
export function renderUnion(typeName: string, members: readonly string[], arbitrary: boolean): string {
  const arms = members.map((m) => JSON.stringify(m));
  if (arbitrary) arms.push("`[${string}]`");
  const oneLine = `export type ${typeName} = ${arms.join(" | ")};`;
  if (oneLine.length <= MAX_WIDTH) return oneLine;
  const lines: string[] = [`export type ${typeName} =`];
  let current = "";
  for (const arm of arms) {
    const candidate = current === "" ? `  | ${arm}` : `${current} | ${arm}`;
    if (candidate.length > MAX_WIDTH && current !== "") {
      lines.push(current);
      current = `  | ${arm}`;
    } else {
      current = candidate;
    }
  }
  lines.push(`${current};`);
  return lines.join("\n");
}

const MARKER = /^@@UNION (\w+) (\w+)( \+arb)?@@$/;

/** Every vocab-driven union in the template: type name → source method (+arb flag). */
export function templateUnions(): readonly { readonly typeName: string; readonly method: string; readonly arbitrary: boolean }[] {
  const template = readFileSync(templatePath(), "utf8");
  const unions: { typeName: string; method: string; arbitrary: boolean }[] = [];
  for (const line of template.split("\n")) {
    const m = MARKER.exec(line);
    if (m) unions.push({ typeName: m[1]!, method: m[2]!, arbitrary: m[3] !== undefined });
  }
  return unions;
}

/** The `values.literals` list for a method — loud error for missing/non-literals rows. */
export function literalsOf(method: string): readonly string[] {
  const row = classVocab.find((d) => d.method === method);
  if (!row) throw new Error(`gen-vocab: template references unknown vocab method "${method}"`);
  if (row.values?.kind !== "literals") {
    throw new Error(`gen-vocab: vocab row "${method}" has no literals values spec (found: ${row.values?.kind ?? "none"})`);
  }
  return row.values.list;
}

/** Render the full content of `tailwind-types.gen.ts`. */
export function renderTailwindTypesGen(): string {
  const header = [
    "// AUTO-GENERATED — do NOT edit by hand. Regenerate: `npm run gen:vocab` (CI checks `--check`).",
    "// Sources: src/class-vocab/vocab.ts (values lists) + scripts/gen-vocab/tailwind-types.template.txt.",
    `// Validity oracle: tailwindcss@${PINNED_TAILWIND_VERSION} (exact pin; see scripts/gen-vocab/load-design-system.ts).`,
    "",
  ].join("\n");
  const template = readFileSync(templatePath(), "utf8");
  const body = template
    .split("\n")
    .map((line) => {
      const m = MARKER.exec(line);
      if (!m) return line;
      return renderUnion(m[1]!, literalsOf(m[2]!), m[3] !== undefined);
    })
    .join("\n");
  return header + body;
}
