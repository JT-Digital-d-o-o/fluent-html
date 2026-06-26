// SINGLE SOURCE, no codegen, one file. The `tokens` const is the only place token
// names live. defineTheme consumes it (→ CSS + manifest at runtime), AND the type
// augmentation DERIVES its keys from `typeof tokens`. Add a token to `tokens` and
// types + CSS + manifest all move together — nothing to hand-sync, no build step.
const tokens = {
  forest: "#2d5016",
  brand: "#ff5500",
} as const;

export function defineTheme(spec: Record<string, string>): Record<string, string> {
  // css + manifest emission identical to spike 00, elided
  return spec;
}
export const theme = defineTheme(tokens);

// Does TS let a `declare module` augmentation reference a module-local `typeof`?
// That is the entire question this spike answers.
declare module "./fluent-mock.ts" {
  interface FluentCustomColors extends Record<keyof typeof tokens, true> {}
}
