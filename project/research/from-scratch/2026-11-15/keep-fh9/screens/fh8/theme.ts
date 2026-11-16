import { defineTheme, type ThemeKeys, type ThemeSpec } from "fluent-html";

export const tokens = {
  colors: {
    primary: "#2563eb", "primary-700": "#1d4ed8", "on-accent": "#ffffff",
    bg: "#f9fafb", surface: "#ffffff", "surface-2": "#f3f4f6", "surface-3": "#e5e7eb",
    inverse: "#111827", "on-inverse": "#ffffff",
    text: "#111827", "text-dim": "#4b5563", "text-faint": "#9ca3af",
    line: "#e5e7eb", "line-strong": "#d1d5db",
    success: "#15803d", danger: "#dc2626", "danger-700": "#b91c1c",
    warning: "#b45309", "warning-700": "#78350f", info: "#1d4ed8",
  },
  radius: { card: "0.75rem", control: "0.5rem" },
} as const satisfies ThemeSpec;

export const theme = defineTheme(tokens);

declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentColorConfig { defaultPalette: false }
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
}
