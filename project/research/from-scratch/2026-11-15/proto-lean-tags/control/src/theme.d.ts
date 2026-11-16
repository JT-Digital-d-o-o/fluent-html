// The control's theme, as the template's defineTheme would declare it (the same colors as support/theme.css).
import type { Tag } from "fluent-html";
declare module "fluent-html" {
  interface FluentColorConfig { defaultPalette: false }
  interface FluentCustomColors {
    surface: true; "surface-2": true; line: true; "text-dim": true; primary: true; "primary-700": true;
    "on-accent": true; danger: true; "danger-700": true; success: true; warning: true; overlay: true;
  }
  interface FluentCustomRadius { card: true; control: true }
  type Styler = <T extends Tag>(t: T) => T;
}
