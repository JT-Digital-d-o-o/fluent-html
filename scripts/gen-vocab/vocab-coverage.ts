/**
 * Vocab coverage over Tailwind's utility-root registry — the computation
 * behind the coverage-watch CI job (job 3). A root is *covered* when the vocab
 * can emit it: exactly (static rows, bare optional rows) or by prefix
 * (prefix/optional/sizing/spacing rows incl. directional expansions, plus
 * roots parsed out of custom rows' samples).
 *
 * Negative roots (`-mt`, `-inset-x`) are normalized to their positive form —
 * the sign is relocated by `signNeg`/`.neg()`, not a separate utility.
 *
 * Prefix matching intentionally over-covers (`border` covers any future
 * `border-*` root): the job watches for NEW utility families appearing on a
 * Tailwind bump, not for every value of a family the vocab already emits.
 *
 * @module
 */
import { classVocab, emitClasses } from "../../src/class-vocab/index.js";
import type { DesignSystem } from "./load-design-system.js";

export type VocabCoverage = {
  readonly exact: ReadonlySet<string>;
  readonly prefixes: ReadonlySet<string>;
};

/** The class names / class prefixes the vocab is able to emit. */
export function computeVocabCoverage(design: DesignSystem): VocabCoverage {
  const exact = new Set<string>();
  const prefixes = new Set<string>();
  for (const def of classVocab) {
    const s = def.emit;
    switch (s.kind) {
      case "static":
        exact.add(s.class);
        break;
      case "prefix":
      case "sizing":
        prefixes.add(s.prefix);
        break;
      case "optional":
        exact.add(s.prefix);
        prefixes.add(s.prefix);
        break;
      case "spacing": {
        prefixes.add(s.prefix);
        const dirs = s.abbrev ? ["x", "y", "t", "b", "l", "r"] : ["x", "y"];
        for (const d of dirs) prefixes.add(`${s.prefix}${s.sep}${d}`);
        break;
      }
      case "value":
        break; // passthrough (`neg`) — no root of its own
      case "custom": {
        for (const args of def.samples ?? []) {
          for (const cls of emitClasses(s, args)) {
            for (const cand of design.parseCandidate(cls)) {
              if (cand.kind === "static") exact.add(cand.root);
              else if ("root" in cand && typeof cand.root === "string") prefixes.add(cand.root);
            }
          }
        }
        break;
      }
    }
  }
  return { exact, prefixes };
}

/**
 * Tailwind utility roots (functional + static, negatives normalized) the
 * vocab cannot emit, sorted and de-duplicated.
 */
export function uncoveredRoots(design: DesignSystem): string[] {
  const { exact, prefixes } = computeVocabCoverage(design);
  const prefixList = [...prefixes];
  const covered = (root: string): boolean =>
    exact.has(root) || prefixList.some((p) => root === p || root.startsWith(`${p}-`));
  const roots = [...design.utilities.keys("functional"), ...design.utilities.keys("static")]
    .map((r) => r.replace(/^-/, ""));
  return [...new Set(roots.filter((r) => !covered(r)))].sort();
}
