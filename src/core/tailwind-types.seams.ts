// ------------------------------------
// Tailwind Types — hand-written augmentation seams
// ------------------------------------
//
// The ONLY hand-written part of the Tailwind type surface. Everything else
// lives in `tailwind-types.gen.ts` (rendered by `npm run gen:vocab` from
// `src/class-vocab/vocab.ts` + `scripts/gen-vocab/tailwind-types.template.txt`).
// This file must stay generator-free: `defineTheme()` augmentation targets
// these interfaces, and regenerating types must never touch them.

// ── defineTheme augmentation seams (C-02) ───────────────────────────
// One EMPTY interface per themeable @theme family. A user's `defineTheme()`
// augments these — deriving keys from their tokens const via `ThemeKeys` — so a
// custom token becomes a real union member (autocomplete + typo-as-error).
export interface FluentCustomColors {}

/**
 * Compile-time color-policy switches. Augment from the app to turn OFF the built-in
 * Tailwind palette so only theme tokens (FluentCustomColors) plus the functional
 * keywords (`inherit`/`current`/`transparent`/`black`/`white`) typecheck:
 *
 *   declare module "fluent-html" {
 *     interface FluentColorConfig { defaultPalette: false }
 *   }
 *
 * With the palette off, `.bg("gray-100")` is a compile error — define a role token
 * in `defineTheme` (e.g. `surface-2`) and use that instead. Tints stay available via
 * the opacity modifier on tokens (`bg("danger/10")`), and `[...]` arbitrary values
 * remain the escape hatch.
 */
export interface FluentColorConfig {}
export interface FluentCustomSpacing {}
export interface FluentCustomFontSize {}
export interface FluentCustomRadius {}
export interface FluentCustomShadow {}
export interface FluentCustomTextShadow {}
export interface FluentCustomDropShadow {}
export interface FluentCustomInsetShadow {}
export interface FluentCustomFontFamily {}

/** Derive `{ [tokenName]: true }` from a tokens const for one family — shortens each augmentation line. */
export type ThemeKeys<T, K extends keyof T> = Record<keyof T[K] & string, true>;
