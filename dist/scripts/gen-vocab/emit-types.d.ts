/** Absolute path of the template the gen file is rendered from. */
export declare function templatePath(): string;
/** Absolute path of the generated file. */
export declare function generatedPath(): string;
/**
 * Canonical union rendering: single-line when it fits, otherwise wrapped at
 * {@link MAX_WIDTH} with `  | ` continuation lines and the `;` on the last
 * member line. `arbitrary` appends the `` `[${string}]` `` escape-hatch arm;
 * `extraArms` appends further non-literal arms verbatim (e.g. `` `--${string}` ``).
 */
export declare function renderUnion(typeName: string, members: readonly string[], arbitrary: boolean, extraArms?: readonly string[]): string;
/** Every vocab-driven union in the template: type name → source method (+arb flag). */
export declare function templateUnions(): readonly {
    readonly typeName: string;
    readonly method: string;
    readonly arbitrary: boolean;
}[];
/** The `values.literals` list for a method — loud error for missing/non-literals rows. */
export declare function literalsOf(method: string): readonly string[];
/** Render the full content of `tailwind-types.gen.ts`. */
export declare function renderTailwindTypesGen(): string;
//# sourceMappingURL=emit-types.d.ts.map