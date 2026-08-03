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
/**
 * Relocate a leading `-` from the value to the front of the whole utility, so a
 * negative transform emits Tailwind's `-translate-y-1` / `-rotate-45`, not the
 * silently-dropped `translate-y--1` / `rotate--45`. Shared by the lib emitter and
 * the vocab so lib-parity holds. A bracketed arbitrary value is left untouched.
 */
export function signNeg(prefix, value) {
    return value.startsWith("-") ? `-${prefix}-${value.slice(1)}` : `${prefix}-${value}`;
}
/**
 * Encode a CSS value for Tailwind's arbitrary-property form (`[prop:value]`).
 * Tailwind decodes every unescaped `_` in an arbitrary value back to a space,
 * so literal underscores must be escaped (`card_1` → `card\_1`) before each
 * whitespace char becomes `_` (char-by-char, not run-collapsed, so spacing
 * inside quoted strings round-trips). `url(…)` segments are left untouched —
 * Tailwind preserves their underscores as-is, and substituting there would
 * corrupt the URL (a space inside `url(…)` is not representable in a class
 * name; quote such URLs at the CSS level instead). Shared by the lib emitter
 * and the vocab row so lib-parity holds.
 */
export function cssPropValue(value) {
    return value
        .split(/(url\([^)]*\))/i)
        .map((part, i) => (i % 2 === 1 ? part : part.replace(/_/g, "\\_").replace(/\s/g, "_")))
        .join("");
}
/**
 * The `bg-radial-*` gradient class. Single source of truth for both the render-time
 * emitter and the class-vocab row so they cannot drift.
 *
 * Tailwind v4 rejects the `/interpolation` modifier on the arbitrary-value form
 * (`bg-radial-[at_x]/oklch` compiles to zero CSS), so when both an origin and an
 * interpolation are present they are folded into a single arbitrary value
 * (`bg-radial-[at_x_in_oklch]`). Hue-interpolation keywords expand the way Tailwind's
 * own modifier does (`/longer` → `in oklch longer hue`); a bare color space is `in <space>`.
 */
const HUE_INTERPOLATION_METHODS = new Set([
    "shorter", "longer", "increasing", "decreasing",
]);
export function radialGradientClass(origin, interpolation) {
    if (!origin)
        return interpolation ? `bg-radial/${interpolation}` : "bg-radial";
    const inner = origin.startsWith("[") ? origin.slice(1, -1) : `at_${origin.replace(/-/g, "_")}`;
    if (!interpolation)
        return `bg-radial-[${inner}]`;
    const tail = HUE_INTERPOLATION_METHODS.has(interpolation)
        ? `in_oklch_${interpolation}_hue`
        : `in_${interpolation}`;
    return `bg-radial-[${inner}_${tail}]`;
}
/** Identity passthrough that pins a row to {@link UtilityDef} at the definition site. */
export function defineUtility(def) {
    return def;
}
//# sourceMappingURL=types.js.map