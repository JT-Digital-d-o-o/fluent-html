// Core fold function
export { foldView } from "./fold.js";

// Types
export type { ViewAlgebra, TagAttrs } from "./types.js";

// Pre-built algebras
export {
  countAlgebra,
  textAlgebra,
  linksAlgebra,
  renderAlgebra,
  createTransformAlgebra,
  addClassToMatching,
} from "./algebras/index.js";

export type { LinkInfo } from "./algebras/links.js";
