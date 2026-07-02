export type TailwindColorName = "gray" | "blue" | "red" | "green";
export type TailwindShade = 50 | 100 | 500 | 900;

// Augmentation seam: the library ships this EMPTY interface for users to extend.
// Custom tokens become real union members only by augmenting it.
export interface FluentCustomColors {}

type BaseColor =
  | "inherit" | "current" | "transparent" | "black" | "white"
  | `${TailwindColorName}-${TailwindShade}`;
type CustomColor = keyof FluentCustomColors & string;

// CLOSED union (no `(string & {})`). Cost of closing: every combinatorial form
// that `(string & {})` gave for free — opacity, arbitrary values — must now be
// RESTATED as an explicit arm. This is 5 arms for what was 1 line. And it is
// per-token-family: spacing / radius / shadow / font each need the same treatment.
export type TailwindColor =
  | BaseColor
  | CustomColor
  | `${BaseColor}/${number}`        // base + opacity   (e.g. blue-500/50)
  | `${CustomColor}/${number}`      // custom + opacity (e.g. forest/50)
  | `[${string}]`;                  // arbitrary value  (e.g. [#1a2b3c])

export interface Tag {
  background(color: TailwindColor): this;
}
export declare function Div(): Tag;
