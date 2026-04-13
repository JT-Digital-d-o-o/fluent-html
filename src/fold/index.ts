// Core fold functions
export { foldView } from "./fold.js";
export { paraView } from "./para.js";
export { unfoldView } from "./unfold.js";
export { hyloView } from "./hylo.js";

// Types
export type { ViewAlgebra, ParaAlgebra, TagAttrs, ViewCoalgebra, ViewLayer } from "./types.js";

// Pre-built algebras
export {
  countAlgebra,
  textAlgebra,
  linksAlgebra,
  renderAlgebra,
  createTransformAlgebra,
  addClassToMatching,
  ariaDescribeAlgebra,
  tocCoalgebra,
  linkedTocCoalgebra,
} from "./algebras/index.js";

export type { LinkInfo } from "./algebras/links.js";
export type { TocEntry, TocSeed } from "./algebras/toc.js";
