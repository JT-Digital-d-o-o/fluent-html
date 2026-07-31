/**
 * `defineTheme()` — the ONE theming mechanism (C-02). Design tokens only:
 * `colors` / `spacing` / `fontSize` / `radius` / `shadow` / `fonts` (the
 * Tailwind v4 `@theme` namespaces). Component "presets" (card/button style bundles) stay
 * user-land `.apply()` helpers — they are NOT part of `defineTheme`.
 *
 * From one `tokens` const you get three things:
 *  1. **typed autocomplete + typo-checking** on the fluent methods — via a
 *     once-written `declare module` that derives keys from the const with
 *     {@link ThemeKeys} (populates the `FluentCustom*` seams; the themeable
 *     unions are closed so a typo is a compile error);
 *  2. the `@theme` **CSS** and
 *  3. the extractor **safelist** — both emitted by `fluentHtmlPlugin({ theme })`
 *     (the runtime value returned here is what the plugin reads).
 *
 * @example
 * import { defineTheme, type ThemeKeys } from "fluent-html";
 *
 * const tokens = {
 *   colors:  { brand: "#ff5500", forest: "#2d5016" },
 *   spacing: { gutter: "1.5rem" },
 * } as const;
 *
 * export const theme = defineTheme(tokens);
 *
 * declare module "fluent-html" {
 *   interface FluentCustomColors  extends ThemeKeys<typeof tokens, "colors"> {}
 *   interface FluentCustomSpacing extends ThemeKeys<typeof tokens, "spacing"> {}
 * }
 *
 * @module
 */
/**
 * Declare a project's design tokens. A const-generic identity passthrough — it
 * preserves the literal token keys (so `theme` and `typeof tokens` carry them)
 * and returns the spec for `fluentHtmlPlugin({ theme })` to emit CSS + safelist.
 * The compile-time typing comes from the `declare module` augmentation, not from
 * this call (a runtime value can't add to a type).
 */
export function defineTheme(spec) {
    return spec;
}
//# sourceMappingURL=define-theme.js.map