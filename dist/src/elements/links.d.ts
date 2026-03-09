import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { BrowsingContext, LinkRel, ReferrerPolicy } from "./html-types.js";
/**
 * Specialized Tag for `<a>` (anchor) elements with typed attribute setters.
 *
 * @example
 * A("Dashboard").setHref("/dashboard").setTarget("_blank")
 */
export declare class AnchorTag extends Tag {
    href?: string;
    target?: BrowsingContext;
    rel?: LinkRel;
    download?: string | boolean;
    type?: string;
    referrerpolicy?: ReferrerPolicy;
    setHref(href?: string): this;
    setTarget(target?: BrowsingContext): this;
    setRel(rel?: LinkRel): this;
    setDownload(download?: string | boolean): this;
    setType(type?: string): this;
    setReferrerpolicy(referrerpolicy?: ReferrerPolicy): this;
}
/** Create an `<a>` (anchor) element with typed attribute methods. */
export declare function A(...children: View[]): AnchorTag;
export declare class MapTag extends Tag {
    name?: string;
    setName(name?: string): this;
}
export declare function MapEl(...children: View[]): MapTag;
export declare class AreaTag extends Tag {
    shape?: 'rect' | 'circle' | 'poly' | 'default';
    coords?: string;
    href?: string;
    alt?: string;
    target?: BrowsingContext;
    rel?: LinkRel;
    download?: string;
    setShape(shape?: 'rect' | 'circle' | 'poly' | 'default'): this;
    setCoords(coords?: string): this;
    setHref(href?: string): this;
    setAlt(alt?: string): this;
    setTarget(target?: BrowsingContext): this;
    setRel(rel?: LinkRel): this;
    setDownload(download?: string): this;
}
export declare function Area(): AreaTag;
//# sourceMappingURL=links.d.ts.map