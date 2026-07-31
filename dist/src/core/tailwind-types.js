// ------------------------------------
// Tailwind Type Definitions — barrel
// ------------------------------------
//
// The type surface is split in two (llm-styling/vocab-generator):
//  - `tailwind-types.seams.ts` — hand-written `defineTheme()` augmentation
//    seams (`FluentCustom*` + `ThemeKeys`); regeneration never touches them.
//  - `tailwind-types.gen.ts`   — everything else, rendered by
//    `npm run gen:vocab` from the class-vocab `values` lists + the template
//    in `scripts/gen-vocab/tailwind-types.template.txt` (CI pins it with
//    `npm run gen:vocab -- --check`).
export * from "./tailwind-types.seams.js";
export * from "./tailwind-types.gen.js";
//# sourceMappingURL=tailwind-types.js.map