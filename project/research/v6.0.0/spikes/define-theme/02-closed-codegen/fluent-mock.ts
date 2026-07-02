// Identical to spike 01's closed union — the difference between 01 and 02 is ONLY
// how the augmentation is produced (hand-written vs generated), not the type shape.
export type TailwindColorName = "gray" | "blue" | "red" | "green";
export type TailwindShade = 50 | 100 | 500 | 900;

export interface FluentCustomColors {}

type BaseColor =
  | "inherit" | "current" | "transparent" | "black" | "white"
  | `${TailwindColorName}-${TailwindShade}`;
type CustomColor = keyof FluentCustomColors & string;

export type TailwindColor =
  | BaseColor
  | CustomColor
  | `${BaseColor}/${number}`
  | `${CustomColor}/${number}`
  | `[${string}]`;

export interface Tag {
  background(color: TailwindColor): this;
}
export declare function Div(): Tag;
