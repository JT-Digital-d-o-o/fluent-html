import type { ViewAlgebra, TagAttrs } from "../types.js";

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
export const linksAlgebra: ViewAlgebra<LinkInfo[]> = {
  text: () => [],
  raw: () => [],
  tag: (element, attrs: TagAttrs, childLinks) => {
    if (element === 'a' && attrs.href) {
      const linkInfo: LinkInfo = {
        href: attrs.href as string,
      };
      if (attrs.target) linkInfo.target = attrs.target as string;
      if (attrs.rel) linkInfo.rel = attrs.rel as string;
      return [linkInfo, ...childLinks];
    }
    return childLinks;
  },
  list: (linkArrays) => linkArrays.flat(),
};
