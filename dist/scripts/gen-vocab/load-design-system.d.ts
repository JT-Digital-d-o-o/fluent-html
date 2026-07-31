import { __unstable__loadDesignSystem } from "tailwindcss";
/**
 * The exact tailwindcss version the vocab was last validated against. Must
 * equal the (exact, no range) `devDependencies.tailwindcss` pin in
 * package.json; the loader refuses to run against anything else.
 */
export declare const PINNED_TAILWIND_VERSION = "4.3.3";
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
/**
 * Load Tailwind's design system for the default `@import "tailwindcss";`
 * sheet. Throws if the installed tailwindcss version differs from
 * {@link PINNED_TAILWIND_VERSION}.
 */
export declare function loadDesignSystem(css?: string): Promise<LoadedDesignSystem>;
//# sourceMappingURL=load-design-system.d.ts.map