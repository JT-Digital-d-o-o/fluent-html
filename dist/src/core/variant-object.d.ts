/**
 * Object-form variants (llm-styling/object-variants) — the typed style-object
 * surface behind `.hover({…})`, `.md({…})`, and the generic `.variant(name, {…})`.
 *
 * A variant object maps canonical style keys (the same names as the fluent
 * methods) to values; nested tier-1 variant names stack prefixes
 * (`.md({ hover: { bg: "blue-700" } })` → `md:hover:bg-blue-700`). `false` and
 * `undefined` values are skipped, so conditionals are plain expressions —
 * no lambda, no wrong-receiver hazard, and a misplaced key is a compile error.
 *
 * @module
 */
import type { Tag } from "./tag.js";
import { DIRECT_VARIANTS } from "../class-vocab/index.js";
import type { StyleProps } from "./variant-object.gen.js";
export type { StyleProps } from "./variant-object.gen.js";
export type { DirectVariant } from "../class-vocab/index.js";
/** Nested tier-1 variant keys — each stacks its prefix onto the enclosing one. */
export type NestedVariants = {
    [K in keyof typeof DIRECT_VARIANTS]?: VariantStyleObject | undefined;
};
/**
 * A variant's style object: canonical style keys ({@link StyleProps}) plus
 * nested tier-1 variant names ({@link NestedVariants}). Excess-property
 * checking spell-checks keys and values two levels deep at every literal use;
 * an extracted const should be pinned with `satisfies VariantStyleObject`.
 */
export interface VariantStyleObject extends StyleProps, NestedVariants {
}
/**
 * Apply a variant object under `prefix` — the runtime behind the tier-1
 * variant methods and `.variant()`. Pushes the prefix onto the tag's variant
 * stack, emits each key through the shared vocab emitters, recurses into
 * nested variant keys, and restores the outer prefix in a `finally` so a
 * throw can never leak a prefix onto later classes of a reused tag.
 */
export declare function applyVariantObject(tag: Tag, prefix: string, obj: VariantStyleObject): Tag;
//# sourceMappingURL=variant-object.d.ts.map