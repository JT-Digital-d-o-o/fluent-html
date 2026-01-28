"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.linksAlgebra = void 0;
/**
 * Algebra that collects all anchor links from a View.
 *
 * @example
 * const nav = Div([
 *   A("Home").setHref("/"),
 *   A("About").setHref("/about"),
 * ]);
 * const links = foldView(linksAlgebra, nav);
 * // [{ href: "/" }, { href: "/about" }]
 */
exports.linksAlgebra = {
    text: () => [],
    raw: () => [],
    tag: (element, attrs, childLinks) => {
        if (element === 'a' && attrs.href) {
            const linkInfo = {
                href: attrs.href,
            };
            if (attrs.target)
                linkInfo.target = attrs.target;
            if (attrs.rel)
                linkInfo.rel = attrs.rel;
            return [linkInfo, ...childLinks];
        }
        return childLinks;
    },
    list: (linkArrays) => linkArrays.flat(),
};
//# sourceMappingURL=links.js.map