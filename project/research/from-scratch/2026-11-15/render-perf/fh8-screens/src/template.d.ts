// Stand-ins for the template pieces the fluent-html 8 screens import, so the views can be
// type-checked against fluent-html 8's own declarations. Verb signatures follow htmx.md.
import type { HTMX, Id } from "fluent-html";
declare module "fluent-html" {
  interface FluentCustomMethods {
    nav(route: HTMX, opts?: { invalid?: Id }): this;
    submit(route: HTMX, opts?: { invalid?: Id }): this;
    search(id: Id, route: HTMX, delay?: number): this;
    poll(route: HTMX, every?: string): this;
  }
  interface FluentColorConfig { defaultPalette: false }
  interface FluentCustomColors {
    ink: true; "text-dim": true; surface: true; "surface-2": true; line: true; primary: true; "primary-700": true;
    "on-accent": true; danger: true; success: true; info: true;
  }
  interface FluentCustomRadius { card: true; control: true }
}
