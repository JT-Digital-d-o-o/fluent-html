// fluent-html 9: the class-text validator behind `.tw("…")` and `tw("…")`.
// The grammar (tw-grammar.gen.ts) is generated from Tailwind's own class list and variants; the
// theme arm comes from the FluentCustom* seams that `defineTheme` already feeds. A token is peeled
// of its variants, then its base is matched as a keyword or as (root, value) for every dash split.
import type {
  TwKeyword, TwNegKeyword, TwColourRoot, TwNumRoot, TwFracRoot, TwNegRoot, TwFuncRoot, TwRadiusRoot,
  TwPaletteName, TwShade, TwStaticVariant, TwCompoundable, TwBreakpoint, TwContainer,
} from "./tw-grammar.gen.js";
import type {
  FluentColorConfig, FluentCustomColors, FluentCustomRadius, FluentCustomFontSize, FluentCustomShadow,
  FluentCustomFontFamily, FluentCustomSpacing,
} from "./tailwind-types.js";

declare const useBrand: unique symbol;
/** A member that is not callable: its type argument is the fix. */
export type UseInstead<Fix extends string> = { readonly [useBrand]: Fix };

declare const twBrand: unique symbol;
/** Class text the validator has accepted: the result of `tw("…")`. */
export type Tw = string & { readonly [twBrand]: true };

type Closed = FluentColorConfig extends { defaultPalette: false } ? true : false;
type Custom<T> = keyof T & string;
type ThemeColour = Custom<FluentCustomColors>;
type Colour =
  | ThemeColour | "inherit" | "current" | "transparent" | "black" | "white"
  | (Closed extends true ? never : `${TwPaletteName}-${TwShade}`);
type ColourValue = Colour | `${Colour}/${number}` | `${Colour}/[${string}]`;
type TextSize = "xs" | "sm" | "base" | "lg" | "xl" | `${2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}xl` | Custom<FluentCustomFontSize>;
type Arbitrary = `[${string}]` | `(${string})`;
/** A non-negative number as Tailwind writes it (`4`, `0.5`); a sign is a leading minus on the class. */
type Num<V> = V extends `-${string}` | `+${string}` | `${string} ${string}` | `${string}e${string}` ? never : V extends `${number}` ? V : never;
type ColourLiteral = `${"#" | "rgb" | "rgba" | "hsl" | "hsla" | "oklch" | "oklab" | "lab(" | "lch(" | "hwb(" | "color:" | "color(" | "var(--color"}${string}`;

type Join<U extends string, Acc extends string = ""> =
  [U] extends [never] ? Acc
  : UnionLast<U> extends infer L extends string ? Join<Exclude<U, L>, Acc extends "" ? L : `${L}, ${Acc}`> : Acc;
type UnionLast<U> = ((U extends unknown ? (x: () => U) => void : never) extends (x: infer I) => void ? I : never) extends () => infer R ? R : never;
type ColourList = [ThemeColour] extends [never] ? "Tailwind's palette (gray-100 …)"
  : Closed extends true ? Join<ThemeColour> : `${Join<ThemeColour>}, or Tailwind's palette`;

type Splits<T extends string, Pre extends string = ""> =
  T extends `${infer H}-${infer R}` ? [`${Pre}${H}`, R] | Splits<R, `${Pre}${H}-`> : never;

/** `true` when some (root, value) split of T is a class, else never. */
type SplitOk<S> = S extends [infer R, infer V extends string]
  ? (R extends TwColourRoot ? (V extends ColourValue ? true : never) : never)
  | (R extends TwNumRoot ? (V extends Num<V> | Custom<FluentCustomSpacing> ? true : never) : never)
  | (R extends TwFracRoot ? (V extends `${infer A}/${infer B}` ? (A extends Num<A> ? B extends Num<B> ? true : never : never) : never) : never)
  | (R extends TwRadiusRoot ? (V extends Custom<FluentCustomRadius> ? true : never) : never)
  | (R extends "text" ? (V extends Custom<FluentCustomFontSize> | `${TextSize}/${string}` ? true : never) : never)
  | (R extends "shadow" ? (V extends Custom<FluentCustomShadow> ? true : never) : never)
  | (R extends "font" ? (V extends Custom<FluentCustomFontFamily> ? true : never) : never)
  | (R extends TwFuncRoot ? (V extends Arbitrary
      ? (Closed extends true ? (R extends TwColourRoot ? (V extends `[${ColourLiteral}` ? never : true) : true) : true)
      : never) : never)
  : never;

type NegOk<S> = S extends [infer R, infer V extends string]
  ? R extends TwNegRoot ? (V extends Num<V> | "px" | Arbitrary ? true : V extends `${infer A}/${infer B}` ? (A extends Num<A> ? B extends Num<B> ? true : never : never) : never) : never
  : never;

type ColourMiss<S> = S extends [infer R extends TwColourRoot, infer V extends string] ? `'${V}' after '${R}-'` : never;

type CheckBase<T extends string, Whole extends string> =
  T extends `${infer B}!` ? CheckBase<B, Whole>
  : T extends TwKeyword | TwNegKeyword ? never
  : T extends `[${infer P}:${infer V}]`
    ? (Closed extends true ? (V extends ColourLiteral ? `✗ '${Whole}': '${V}' is a colour literal and the palette is closed. Colours: ${ColourList}` : never) : never)
  : [SplitOk<Splits<T>>] extends [never]
    ? T extends `-${infer N}`
      ? ([NegOk<Splits<N>>] extends [never] ? `✗ '${Whole}' is not a Tailwind class` : never)
      : [ColourMiss<Splits<T>>] extends [never] ? `✗ '${Whole}' is not a Tailwind class`
      : `✗ '${Whole}': ${ColourMiss<Splits<T>> & string} is not a colour. Colours: ${ColourList}`
    : never;

type Variant =
  | TwStaticVariant
  | `${"not" | "in" | "has"}-${TwCompoundable}`
  | `${"group" | "peer"}-${TwCompoundable}${"" | `/${string}`}`
  | `${"not" | "group" | "peer" | "in" | "has"}-${"aria" | "data"}-${string}`
  | `${"not" | "group" | "peer" | "in" | "has" | "aria" | "data" | "supports" | "nth" | "nth-last" | "nth-of-type" | "nth-last-of-type" | "max" | "min" | "@" | "@max" | "@min"}-[${string}]${"" | `/${string}`}`
  | `aria-${"busy" | "checked" | "disabled" | "expanded" | "hidden" | "pressed" | "readonly" | "required" | "selected" | "invalid" | "current" | "modal" | "multiline" | "multiselectable" | "atomic" | "grabbed"}`
  | `data-${string}` | `supports-${string}` | `nth-${number}` | `nth-last-${number}`
  | `${"max" | "min"}-${TwBreakpoint}` | `@${TwContainer}` | `@${"max" | "min"}-${TwContainer}` | `[${string}]`;

type CheckToken<T extends string, Whole extends string = T> =
  T extends "" ? never
  : {} extends Record<T, 1> ? "✗ class text is literal: pass a tw(…) constant or a value in its own argument, .tw(base, \"…\"), never a template string"
  : T extends `!${infer R}` ? CheckToken<R, Whole>
  : T extends `${infer V}:${infer R}`
    ? V extends `${string}[${string}`
      ? T extends `${infer A}]:${infer R2}`
        ? (`${A}]` extends Variant ? CheckToken<R2, Whole> : `✗ '${Whole}': unknown variant '${A}]:'`)
        : CheckBase<T, Whole>
      : V extends Variant ? CheckToken<R, Whole> : `✗ '${Whole}': unknown variant '${V}:'`
    : CheckBase<T, Whole>;

type Errors<S extends string, Acc extends string[] = []> =
  S extends `${infer H} ${infer R}` ? Errors<R, [CheckToken<H>] extends [never] ? Acc : [...Acc, CheckToken<H>]>
  : [CheckToken<S>] extends [never] ? Acc : [...Acc, CheckToken<S>];

type AllErrors<S extends string> = S extends unknown ? Errors<S> : never;

/**
 * `unknown` when every token of S is a class, else the list of errors. Used as `S & TwCheck<S>`
 * inline in a signature, so tsc prints the errors and not an alias name.
 */
export type TwCheck<S extends string> =
  [S] extends [Tw] ? unknown
  : string extends S ? ["✗ .tw() takes literal class text or a tw(…) constant, not a string built at runtime"]
  : [AllErrors<S>] extends [[]] ? unknown
  : Exclude<AllErrors<S>, []>;

type TwShaped<T extends string> =
  T extends `${string}:${string}` ? true
  : T extends TwKeyword | TwNegKeyword ? true
  : Splits<T> extends infer S ? (S extends [infer R, string] ? (R extends TwFuncRoot ? true : never) : never) extends never ? false : true
  : false;
type ShapedTokens<S extends string> =
  S extends `${infer H} ${infer R}` ? (TwShaped<H> extends true ? H : never) | ShapedTokens<R> : TwShaped<S> extends true ? S : never;

/**
 * A raw class sink (`cssClass`, `setClass`, `addClass`) takes classes that are not Tailwind's; a
 * Tailwind-shaped literal fails and names `.tw()`. A runtime string passes (it cannot be checked).
 */
export type RawClassCheck<S extends string> =
  string extends S ? unknown
  : [ShapedTokens<S>] extends [never] ? unknown
  : [`✗ '${ShapedTokens<S>}' is Tailwind class text: write it in .tw("…"), which checks it`];
