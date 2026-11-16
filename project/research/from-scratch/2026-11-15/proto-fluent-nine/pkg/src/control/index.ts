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

// Register every Tag.prototype mixin so a control-only import still yields a
// fully-populated Tag (overlay() moved to core/ alongside the other mixins).
import "../core/register.js";
export type { OverlayPosition } from "../core/overlay.js";
