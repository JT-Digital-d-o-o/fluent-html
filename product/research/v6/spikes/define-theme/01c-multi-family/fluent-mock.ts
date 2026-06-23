// Two themeable families (colors + spacing), each with its OWN augmentable seam.
// Demonstrates that the per-family seam is irreducible: you cannot merge two
// different interfaces (FluentCustomColors, FluentCustomSpacing) in one line.
export type TailwindColorName = "gray" | "blue";
export type TailwindShade = 50 | 500 | 900;

export interface FluentCustomColors {}
export interface FluentCustomSpacing {}

type BaseColor = "black" | "white" | `${TailwindColorName}-${TailwindShade}`;
type CustomColor = keyof FluentCustomColors & string;
export type TailwindColor =
  | BaseColor | CustomColor
  | `${BaseColor}/${number}` | `${CustomColor}/${number}` | `[${string}]`;

type BaseSpacing = "0" | "1" | "2" | "4" | "px" | "auto";
type CustomSpacing = keyof FluentCustomSpacing & string;
export type TailwindSpacing = BaseSpacing | CustomSpacing | `[${string}]`;

// Optional sugar so each per-family line is shorter than the raw Record<…>.
export type ThemeKeys<T, K extends keyof T> = Record<keyof T[K] & string, true>;

export interface Tag {
  background(color: TailwindColor): this;
  padding(value: TailwindSpacing): this;
}
export declare function Div(): Tag;
