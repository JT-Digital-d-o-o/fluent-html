// The ONE place tokens are defined. Codegen reads this → emits the .d.ts type
// augmentation + the @theme CSS + the extractor manifest. Add a token here and
// regenerate: a single edit, a single source of truth, full type-safety downstream.
export default {
  colors: {
    forest: "#2d5016",
    brand: "#ff5500",
  },
};
