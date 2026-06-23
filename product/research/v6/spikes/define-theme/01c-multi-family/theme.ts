import type { ThemeKeys } from "./fluent-mock.ts";

// ONE source for all families.
const tokens = {
  colors:  { forest: "#2d5016", brand: "#ff5500" },
  spacing: { gutter: "1.5rem", bleed: "2.5rem" },
} as const;

export function defineTheme<const T>(spec: T): T {
  // runtime: feed the plugin (CSS + manifest). elided.
  return spec;
}
export const theme = defineTheme(tokens);

// One line PER FAMILY (irreducible — each targets a distinct seam interface).
// The `ThemeKeys` helper just shortens the raw `Record<keyof typeof tokens.X, true>`.
declare module "./fluent-mock.ts" {
  interface FluentCustomColors  extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
}
