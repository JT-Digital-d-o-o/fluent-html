// Faithful slice of fluent-html's REAL color typing — src/core/tailwind-types.ts:53-62.
export type TailwindColorName = "gray" | "blue" | "red" | "green";
export type TailwindShade = 50 | 100 | 500 | 900;

// OPEN union — the actual v5 shape. The `(string & {})` tail is what lets custom
// theme colors "just work" today — and is exactly why typos slip through unchecked.
export type TailwindColor =
  | "inherit" | "current" | "transparent" | "black" | "white"
  | `${TailwindColorName}-${TailwindShade}`
  | (string & {});

export interface Tag {
  background(color: TailwindColor): this;
}
export declare function Div(): Tag;
