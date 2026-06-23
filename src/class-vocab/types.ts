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
export const UNITS: ReadonlySet<string> = new Set([
  "px", "rem", "em", "%", "vh", "vw", "dvh", "svh", "lvh",
]);

/**
 * Direction names → Tailwind side abbreviations, shared by the spacing family.
 * Accepts both the long (`top`) and short (`t`) spellings.
 */
export const DIR_MAP: Readonly<Record<string, string>> = {
  x: "x", y: "y",
  top: "t", bottom: "b", left: "l", right: "r",
  t: "t", b: "b", l: "l", r: "r",
};

/** Corner tokens accepted by `.rounded(corner, value?)`. */
export const ROUNDED_CORNERS: ReadonlySet<string> = new Set([
  "t", "r", "b", "l", "tl", "tr", "br", "bl", "s", "e", "ss", "se", "es", "ee",
]);

/** Which generated artifact(s) a row should be excluded from. */
export type VocabTarget = "lib" | "extractor" | "eslint";

/**
 * How a utility method's arguments map to emitted class string(s). One shape
 * per row — `emitClasses(shape, args)` is total over these.
 */
export type EmitShape =
  /** Zero-arg, fixed class. `bold` → `font-bold`, `grid` → `grid`. */
  | { readonly kind: "static"; readonly class: string }
  /** Exactly one required value → `${prefix}-${value}`. `background` → `bg-blue-500`. */
  | { readonly kind: "prefix"; readonly prefix: string }
  /**
   * Optional value: zero args → bare `${prefix}`, one arg → `${prefix}${sep}${value}`.
   * `shadow` → `shadow` | `shadow-md`. `group` (sep `/`) → `group` | `group/nav`.
   */
  | { readonly kind: "optional"; readonly prefix: string; readonly sep?: "-" | "/" }
  /**
   * Spacing/directional family.
   *  - `[value]`        → `${prefix}-${value}`
   *  - `[dir, value]`   → `${prefix}${sep}${abbrev ? DIR_MAP[dir] : dir}-${value}`
   *  - `[unit, amount]` → `${prefix}-[${amount}${unit}]` (only when `units` and `unit ∈ UNITS`)
   *
   * `padding` (sep ``, abbrev, units) → `p-4` / `px-4` / `pt-2` / `p-[16px]`.
   * `gap` (sep `-`, units) → `gap-4` / `gap-x-4` / `gap-[16px]`.
   * `overflow` (sep `-`, no units) → `overflow-hidden` / `overflow-x-auto`.
   */
  | { readonly kind: "spacing"; readonly prefix: string; readonly sep: "" | "-"; readonly abbrev: boolean; readonly units: boolean }
  /**
   * Single-axis sizing/inset with a unit overload (no direction).
   *  - `[value]`        → `${prefix}-${value}`
   *  - `[unit, amount]` → `${prefix}-[${amount}${unit}]`
   *
   * `w` → `w-full` / `w-[180px]`. `top` → `top-0` / `top-[10px]`.
   */
  | { readonly kind: "sizing"; readonly prefix: string }
  /** Arg becomes the class verbatim, optionally with a fixed prefix. `display` → `block`; `neg` (prefix `-`) → `-inset-px`. */
  | { readonly kind: "value"; readonly prefix?: string }
  /** Genuine straggler — explicit emit fn. Carries `samples` on the row for the round-trip test. */
  | { readonly kind: "custom"; readonly emit: (args: readonly string[]) => string[] };

/** One utility method's vocabulary entry. */
export type UtilityDef = {
  /** The fluent method name (`padding`, `background`, `on` is NOT here — variants aren't utilities). */
  readonly method: string;
  /** The single v4 emit shape. */
  readonly emit: EmitShape;
  /** Generated artifacts this row opts out of (e.g. handled by default-class extraction). */
  readonly skip?: readonly VocabTarget[];
  /**
   * Representative argument tuples for the vocab→emit round-trip + lib-parity
   * tests. Required for `custom` rows; optional elsewhere (a generic sample is
   * derived from the shape when absent).
   */
  readonly samples?: readonly (readonly string[])[];
};

/** Identity passthrough that pins a row to {@link UtilityDef} at the definition site. */
export function defineUtility(def: UtilityDef): UtilityDef {
  return def;
}
