// Control flow - Conditionals
export {
  IfThen,
  IfThenElse,
  Match,
} from "./conditionals.js";

// Control flow - Iteration
export {
  ForEach,
  ForEachElse,
  Repeat,
} from "./iteration.js";

// Context (scoped implicit values)
export {
  createContext,
  createRequiredContext,
} from "./context.js";

export type { Context } from "./context.js";

// Overlay — registers Tag.prototype.overlay() (side-effecting), like the core method mixins
import "./overlay.js";
export type { OverlayPosition } from "./overlay.js";
