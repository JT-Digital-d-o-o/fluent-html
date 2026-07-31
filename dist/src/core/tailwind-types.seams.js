// ------------------------------------
// Tailwind Types — hand-written augmentation seams
// ------------------------------------
//
// The ONLY hand-written part of the Tailwind type surface. Everything else
// lives in `tailwind-types.gen.ts` (rendered by `npm run gen:vocab` from
// `src/class-vocab/vocab.ts` + `scripts/gen-vocab/tailwind-types.template.txt`).
// This file must stay generator-free: `defineTheme()` augmentation targets
// these interfaces, and regenerating types must never touch them.
export {};
//# sourceMappingURL=tailwind-types.seams.js.map