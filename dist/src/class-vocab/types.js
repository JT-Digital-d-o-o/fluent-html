/**
 * Shared Tailwind class vocabulary — the single source of truth (C-05).
 *
 * The method↔class mapping was historically maintained THREE times by hand:
 * the library's render-time emitters (`src/core/tailwind-methods.ts`), the
 * Tailwind extractor (`fluent-html-tailwind-extractor`), and the ESLint plugin
 * (`fluent-html-eslint-plugin`). They drifted. This module is the one place a
 * utility's shape is declared; the extractor + ESLint maps are generated from
 * it, and a CI drift test pins them.
 *
 * **v4-native** — there is exactly ONE emit shape per row (no v3/v4 dual
 * target). v4 class-name changes (`bg-linear-*`, `xs` slots) land by editing
 * the relevant rows in C-03, not by adding a second emit.
 *
 * @module
 */
/** Arbitrary-value units accepted by the unit-overload methods (`.w("px", 180)`). */
export const UNITS = new Set([
    "px", "rem", "em", "%", "vh", "vw", "dvh", "svh", "lvh",
]);
/**
 * Direction names → Tailwind side abbreviations, shared by the spacing family.
 * Accepts both the long (`top`) and short (`t`) spellings.
 */
export const DIR_MAP = {
    x: "x", y: "y",
    top: "t", bottom: "b", left: "l", right: "r",
    t: "t", b: "b", l: "l", r: "r",
};
/** Corner tokens accepted by `.rounded(corner, value?)`. */
export const ROUNDED_CORNERS = new Set([
    "t", "r", "b", "l", "tl", "tr", "br", "bl", "s", "e", "ss", "se", "es", "ee",
]);
/** Identity passthrough that pins a row to {@link UtilityDef} at the definition site. */
export function defineUtility(def) {
    return def;
}
//# sourceMappingURL=types.js.map