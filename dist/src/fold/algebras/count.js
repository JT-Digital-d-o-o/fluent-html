"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countAlgebra = void 0;
/**
 * Algebra that counts all elements in a View.
 *
 * @example
 * const view = Div([P("Hello"), P("World")]);
 * const count = foldView(countAlgebra, view);  // 3
 */
exports.countAlgebra = {
    text: () => 0,
    raw: () => 0,
    tag: (_, __, childCount) => 1 + childCount,
    list: (counts) => counts.reduce((a, b) => a + b, 0),
};
//# sourceMappingURL=count.js.map