/**
 * `CssPropertyName` emitter — renders `src/core/css-props.gen.ts` for the
 * `.cssProp()` typed escape (llm-styling/escape-hatch, emitter 2).
 *
 * Source: the `CSSStyleDeclaration` interface in the installed TypeScript's
 * `lib.dom.d.ts` — every string-typed camelCase member kebab-cased (plus the
 * `cssFloat` → `float` alias), vendor-prefixed aliases dropped. The library
 * itself compiles WITHOUT the DOM lib (and so may its consumers), which is why
 * the union is generated as literals instead of derived type-level from
 * `keyof CSSStyleDeclaration`.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as path from "node:path";

import { renderUnion } from "./emit-types.js";

const requireFromHere = createRequire(import.meta.url);

/** `scripts/gen-vocab/` in the SOURCE tree (this module runs from `dist/scripts/gen-vocab/`). */
function sourceDir(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../scripts/gen-vocab");
}

/** Absolute path of the generated file. */
export function cssPropsGeneratedPath(): string {
  return path.resolve(sourceDir(), "../../src/core/css-props.gen.ts");
}

function tsLibDir(): string {
  return path.dirname(requireFromHere.resolve("typescript"));
}

function tsVersion(): string {
  return (requireFromHere("typescript/package.json") as { version: string }).version;
}

const kebab = (name: string): string => name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Kebab-case CSS property names parsed from CSSStyleDeclaration, sorted + deduped. */
export function cssPropertyNames(): string[] {
  const libDom = readFileSync(path.join(tsLibDir(), "lib.dom.d.ts"), "utf8");
  const start = libDom.indexOf("interface CSSStyleDeclaration {");
  if (start === -1) throw new Error("emit-css-props: CSSStyleDeclaration not found in lib.dom.d.ts");
  const body = libDom.slice(start, libDom.indexOf("\n}", start));
  const names = new Set<string>();
  for (const m of body.matchAll(/^\s+([a-zA-Z][a-zA-Z0-9]*): string;$/gm)) {
    const prop = m[1]!;
    if (prop === "cssText") continue;                 // serialization accessor, not a property
    if (/^(webkit|moz|ms|o)[A-Z]/.test(prop)) continue; // deprecated vendor aliases
    names.add(prop === "cssFloat" ? "float" : kebab(prop));
  }
  const sorted = [...names].sort();
  if (sorted.length < 300) {
    throw new Error(`emit-css-props: parsed only ${sorted.length} properties from lib.dom.d.ts — the parser is stale`);
  }
  return sorted;
}

/** Render the full content of `css-props.gen.ts`. */
export function renderCssPropsGen(): string {
  const names = cssPropertyNames();
  return [
    "// AUTO-GENERATED — do NOT edit by hand. Regenerate: `npm run gen:vocab` (CI checks `--check`).",
    `// Source: CSSStyleDeclaration in typescript@${tsVersion()} lib.dom.d.ts (string-typed members,`,
    "// kebab-cased, vendor aliases dropped) — see scripts/gen-vocab/emit-css-props.ts.",
    "",
    "/**",
    " * Kebab-case CSS property names accepted by `.cssProp()` — plus the",
    " * `` `--${string}` `` arm for custom properties (`.cssProp(\"--x\", \"1\")` → `[--x:1]`).",
    ` * ${names.length} generated members.`,
    " */",
    renderUnion("CssPropertyName", names, false, ["`--${string}`"]),
    "",
  ].join("\n");
}
