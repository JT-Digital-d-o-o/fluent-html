export interface FluentCustomColors {
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