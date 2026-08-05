// Tag class
export { Tag } from "./tag.js";
// Mixins — attach every chainable method to Tag.prototype (side-effecting).
// Registration lives in one module so any barrel that re-exports Tag factories
// yields a fully-populated prototype (see register.ts + package.json sideEffects).
import "./register.js";
// Raw HTML support
export { RawString, Raw } from "./raw-string.js";
// Utility functions
export { Empty, El } from "./utils.js";
// Type guards
export { isTag, isRawString } from "./guards.js";
// Dev-mode structural guards for the mutable builder
export { setDevChecks } from "./dev-checks.js";
// Theming — defineTheme + the augmentation seams (C-02)
export { defineTheme } from "./define-theme.js";
//# sourceMappingURL=index.js.map