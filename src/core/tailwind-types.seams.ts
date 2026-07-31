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
