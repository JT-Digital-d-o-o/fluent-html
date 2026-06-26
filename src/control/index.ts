// Control flow - Conditionals
export {
  IfThen,
  IfThenElse,
  Match,
} from "./conditionals.js";

// Control flow - Value mapping
export { MatchValue } from "./match-value.js";

// Control flow - Iteration
export {
  ForEach,
  ForEachElse,
  ForEachKeyed,
  Repeat,
  Intersperse,
} from "./iteration.js";

// Overlay — registers Tag.prototype.overlay() (side-effecting), like the core method mixins
import "./overlay.js";
export type { OverlayPosition } from "./overlay.js";
