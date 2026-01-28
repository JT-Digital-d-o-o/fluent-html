import type { ViewAlgebra } from "../types.js";

/**
 * Algebra that counts all elements in a View.
 *
 * @example
 * const view = Div([P("Hello"), P("World")]);
 * const count = foldView(countAlgebra, view);  // 3
 */
export const countAlgebra: ViewAlgebra<number> = {
  text: () => 0,
  raw: () => 0,
  tag: (_, __, childCount) => 1 + childCount,
  list: (counts) => counts.reduce((a, b) => a + b, 0),
};
