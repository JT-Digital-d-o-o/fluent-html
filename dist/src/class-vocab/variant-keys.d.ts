import type { EmitShape, UtilityDef } from "./types.js";
/**
 * Tier-1 variant methods/nested keys → the Tailwind variant prefix each emits.
 * `xl2` is the one divergent spelling (`2xl` is not an identifier — see the
 * 2026-08-01 decision record); `.variant("2xl", …)` keeps the exact spelling.
 */
export declare const DIRECT_VARIANTS: {
    readonly hover: "hover";
    readonly focus: "focus";
    readonly focusVisible: "focus-visible";
    readonly focusWithin: "focus-within";
    readonly active: "active";
    readonly disabled: "disabled";
    readonly checked: "checked";
    readonly dark: "dark";
    readonly first: "first";
    readonly last: "last";
    readonly odd: "odd";
    readonly even: "even";
    readonly groupHover: "group-hover";
    readonly peerChecked: "peer-checked";
    readonly before: "before";
    readonly after: "after";
    readonly sm: "sm";
    readonly md: "md";
    readonly lg: "lg";
    readonly xl: "xl";
    readonly xl2: "2xl";
};
/** Tier-1 variant member names (`hover` | … | `xl2`). */
export type DirectVariant = keyof typeof DIRECT_VARIANTS;
/** One `VariantStyleObject` style key: where it emits and what it prepends. */
export type VariantKeySpec = {
    /** The object key (`px`, `translateY`, `gapX`). */
    readonly key: string;
    /** The owning vocab row. */
    readonly def: UtilityDef;
    /** The row's emit shape (denormalized for direct `emitClasses` calls). */
    readonly emit: EmitShape;
    /** Fixed leading args prepended before the value's own args. */
    readonly pre: readonly string[];
    /** Explicit TS value-type expression (emitter-only; derived when absent). */
    readonly type?: string;
};
/** All `VariantStyleObject` style keys, in vocab order (base keys, then expansions). */
export declare const variantKeySpecs: readonly VariantKeySpec[];
//# sourceMappingURL=variant-keys.d.ts.map