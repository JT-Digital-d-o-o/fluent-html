export interface FluentCustomColors {
}
/**
 * Compile-time color-policy switches. Augment from the app to turn OFF the built-in
 * Tailwind palette so only theme tokens (FluentCustomColors) plus the functional
 * keywords (`inherit`/`current`/`transparent`/`black`/`white`) typecheck:
 *
 *   declare module "fluent-html" {
 *     interface FluentColorConfig { defaultPalette: false }
 *   }
 *
 * With the palette off, `.bg("gray-100")` is a compile error — define a role token
 * in `defineTheme` (e.g. `surface-2`) and use that instead. Tints stay available via
 * the opacity modifier on tokens (`bg("danger/10")`), and `[...]` arbitrary values
 * remain the escape hatch.
 */
export interface FluentColorConfig {
}
export interface FluentCustomSpacing {
}
export interface FluentCustomFontSize {
}
export interface FluentCustomRadius {
}
export interface FluentCustomShadow {
}
export interface FluentCustomTextShadow {
}
export interface FluentCustomDropShadow {
}
export interface FluentCustomInsetShadow {
}
export interface FluentCustomFontFamily {
}
/** Derive `{ [tokenName]: true }` from a tokens const for one family — shortens each augmentation line. */
export type ThemeKeys<T, K extends keyof T> = Record<keyof T[K] & string, true>;
//# sourceMappingURL=tailwind-types.seams.d.ts.map