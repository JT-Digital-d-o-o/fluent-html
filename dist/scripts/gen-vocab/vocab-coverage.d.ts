import type { DesignSystem } from "./load-design-system.js";
export type VocabCoverage = {
    readonly exact: ReadonlySet<string>;
    readonly prefixes: ReadonlySet<string>;
};
/** The class names / class prefixes the vocab is able to emit. */
export declare function computeVocabCoverage(design: DesignSystem): VocabCoverage;
/**
 * Tailwind utility roots (functional + static, negatives normalized) the
 * vocab cannot emit, sorted and de-duplicated.
 */
export declare function uncoveredRoots(design: DesignSystem): string[];
//# sourceMappingURL=vocab-coverage.d.ts.map