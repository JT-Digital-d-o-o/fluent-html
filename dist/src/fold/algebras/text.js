"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textAlgebra = void 0;
/**
 * Algebra that extracts all plain text content from a View.
 * Block-level elements add newlines for readability.
 *
 * @example
 * const heading = H1("Welcome to my site");
 * const text = foldView(textAlgebra, heading);  // "Welcome to my site\n"
 */
exports.textAlgebra = {
    text: (s) => s,
    raw: () => "", // Raw HTML is not plain text
    tag: (element, _, childText) => {
        // Block-level elements get newlines
        const blockElements = new Set([
            'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'li', 'dt', 'dd', 'blockquote', 'pre', 'br',
            'article', 'section', 'header', 'footer', 'nav', 'aside',
            'tr', 'th', 'td'
        ]);
        if (blockElements.has(element)) {
            return childText + "\n";
        }
        return childText;
    },
    list: (texts) => texts.join(""),
};
//# sourceMappingURL=text.js.map