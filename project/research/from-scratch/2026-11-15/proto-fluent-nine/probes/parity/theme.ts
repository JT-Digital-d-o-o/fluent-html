import { defineTheme, type ThemeKeys } from "fluent-html";
const tokens = { colors: { primary: "#2563eb", surface: "#fff", danger: "#b91c1c" }, radius: { card: "0.75rem" } } as const;
export const theme = defineTheme(tokens);
declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentColorConfig { defaultPalette: false }
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
}
