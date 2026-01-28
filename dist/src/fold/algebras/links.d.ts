import type { ViewAlgebra } from "../types.js";
/**
 * Information about a link found in the View.
 */
export interface LinkInfo {
    href: string;
    text?: string;
    target?: string;
    rel?: string;
}
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
export declare const linksAlgebra: ViewAlgebra<LinkInfo[]>;
//# sourceMappingURL=links.d.ts.map