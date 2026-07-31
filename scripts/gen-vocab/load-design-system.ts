/**
 * Hardened loader for Tailwind's design system — the per-class validity oracle
 * behind the vocab CI jobs (`candidatesToCss(cls) === null` ⇒ invalid class).
 *
 * Wraps `__unstable__loadDesignSystem`, an API Tailwind explicitly marks
 * unstable, so two guards keep it honest:
 *  1. the tailwindcss devDependency is pinned EXACTLY in package.json, and
 *  2. this module throws at load time if the installed version differs from
 *     {@link PINNED_TAILWIND_VERSION} — bumping the pin and re-validating the
 *     vocab is a deliberate act, never an accidental `npm update`.
 *
 * Generated artifacts record {@link PINNED_TAILWIND_VERSION} in their headers
 * so a stale generation is visible in review.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as path from "node:path";
import { __unstable__loadDesignSystem } from "tailwindcss";

/**
 * The exact tailwindcss version the vocab was last validated against. Must
 * equal the (exact, no range) `devDependencies.tailwindcss` pin in
 * package.json; the loader refuses to run against anything else.
 */
export const PINNED_TAILWIND_VERSION = "4.3.3";

/**
 * The design-system object (`getClassList`, `getVariants`, `parseCandidate`,
 * `candidatesToCss`, `utilities.keys`, `theme`, …). Tailwind does not export
 * the type by name, so it is derived structurally from the loader's return.
 */
export type DesignSystem = Awaited<ReturnType<typeof __unstable__loadDesignSystem>>;

export type LoadedDesignSystem = {
  readonly design: DesignSystem;
  /** Version of the installed tailwindcss package (=== {@link PINNED_TAILWIND_VERSION}). */
  readonly tailwindVersion: string;
};

const requireFromHere = createRequire(import.meta.url);

/** Absolute path of the installed tailwindcss package directory. */
function tailwindRootDir(): string {
  return path.dirname(requireFromHere.resolve("tailwindcss/package.json"));
}

function installedTailwindVersion(): string {
  const pkg = JSON.parse(readFileSync(path.join(tailwindRootDir(), "package.json"), "utf8")) as { version?: string };
  if (typeof pkg.version !== "string") {
    throw new Error("gen-vocab: installed tailwindcss package.json has no version field");
  }
  return pkg.version;
}

/**
 * Resolve the stylesheets `@import "tailwindcss";` pulls in. Tailwind's own
 * entry (`tailwindcss` → index.css, which then imports theme/preflight/
 * utilities relatively) plus plain relative imports; anything else is a loud
 * error rather than a silent empty design system.
 */
async function loadStylesheet(id: string, base: string): Promise<{ path: string; base: string; content: string }> {
  let file: string;
  if (id === "tailwindcss") {
    file = path.join(tailwindRootDir(), "index.css");
  } else if (id.startsWith("tailwindcss/")) {
    const sub = id.slice("tailwindcss/".length);
    file = path.join(tailwindRootDir(), sub.endsWith(".css") ? sub : `${sub}.css`);
  } else if (id.startsWith("./") || id.startsWith("../")) {
    file = path.resolve(base, id);
  } else {
    throw new Error(`gen-vocab: unexpected stylesheet import "${id}" (from ${base})`);
  }
  try {
    return { path: file, base: path.dirname(file), content: await readFile(file, "utf8") };
  } catch (cause) {
    throw new Error(`gen-vocab: failed to read stylesheet "${id}" → ${file} (${String(cause)})`);
  }
}

/**
 * Load Tailwind's design system for the default `@import "tailwindcss";`
 * sheet. Throws if the installed tailwindcss version differs from
 * {@link PINNED_TAILWIND_VERSION}.
 */
export async function loadDesignSystem(css = '@import "tailwindcss";'): Promise<LoadedDesignSystem> {
  const tailwindVersion = installedTailwindVersion();
  if (tailwindVersion !== PINNED_TAILWIND_VERSION) {
    throw new Error(
      `gen-vocab: installed tailwindcss@${tailwindVersion} ≠ pinned ${PINNED_TAILWIND_VERSION}. ` +
        "The design-system API is __unstable__; re-pin package.json and re-validate the vocab deliberately.",
    );
  }
  const design = await __unstable__loadDesignSystem(css, { loadStylesheet });
  return { design, tailwindVersion };
}
