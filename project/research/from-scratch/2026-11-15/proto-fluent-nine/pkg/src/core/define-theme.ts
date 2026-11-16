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

/** The design-token families `defineTheme` accepts — the Tailwind v4 `@theme` namespaces. */
export type ThemeSpec = {
  readonly colors?: Readonly<Record<string, string>>;
  readonly spacing?: Readonly<Record<string, string>>;
  readonly fontSize?: Readonly<Record<string, string>>;
  readonly radius?: Readonly<Record<string, string>>;
  readonly shadow?: Readonly<Record<string, string>>;
  /** Font families (`--font-*`): token → font stack. `.font("display")` via FluentCustomFontFamily. */
  readonly fonts?: Readonly<Record<string, string>>;
};

// Font-weight keywords the merged `.font()` accepts — a custom font-family
// token with one of these names would shadow the weight at the call site.
const FONT_WEIGHT_KEYWORDS: ReadonlySet<string> = new Set([
  "thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black",
]);

/**
 * Warn on token names that collide across families sharing one merged emitter
 * (canonical-names): `colors`×`fontSize` both emit `text-*`, `colors`×`shadow`
 * both emit `shadow-*`, and `fonts` shares `font-*` with the weight keywords.
 * The class Tailwind resolves for the ambiguous name follows ITS precedence —
 * same ambiguity you'd have writing raw Tailwind — so this warns, not throws.
 */
function warnOnAmbiguousTokens(spec: ThemeSpec): void {
  const overlap = (a?: Readonly<Record<string, string>>, b?: Readonly<Record<string, string>>): string[] =>
    a && b ? Object.keys(a).filter((k) => k in b) : [];
  const report: string[] = [];
  const textDupes = overlap(spec.colors, spec.fontSize);
  if (textDupes.length) report.push(`colors×fontSize (${textDupes.join(", ")}) — \`.text("${textDupes[0]}")\` is ambiguous`);
  const shadowDupes = overlap(spec.colors, spec.shadow);
  if (shadowDupes.length) report.push(`colors×shadow (${shadowDupes.join(", ")}) — \`.shadow("${shadowDupes[0]}")\` is ambiguous`);
  const weightDupes = Object.keys(spec.fonts ?? {}).filter((k) => FONT_WEIGHT_KEYWORDS.has(k));
  if (weightDupes.length) report.push(`fonts named after font weights (${weightDupes.join(", ")}) — \`.font("${weightDupes[0]}")\` is ambiguous`);
  if (report.length) {
    // eslint-disable-next-line no-console -- define-time diagnostics have no other channel
    console.warn(`fluent-html defineTheme: token name collides across families that share one class prefix — rename the token to keep call sites unambiguous. ${report.join("; ")}`);
  }
}

/**
 * Declare a project's design tokens. A const-generic identity passthrough — it
 * preserves the literal token keys (so `theme` and `typeof tokens` carry them)
 * and returns the spec for `fluentHtmlPlugin({ theme })` to emit CSS + safelist.
 * The compile-time typing comes from the `declare module` augmentation, not from
 * this call (a runtime value can't add to a type). Warns (once, at definition
 * time) on token names that collide across families sharing a merged emitter.
 */
export function defineTheme<const T extends ThemeSpec>(spec: T): T {
  warnOnAmbiguousTokens(spec);
  return spec;
}
