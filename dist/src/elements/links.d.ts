import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { ResolvedRoute, ExternalHref } from "../htmx.js";
import type { BrowsingContext, LinkRel, ReferrerPolicy } from "./html-types.js";
/**
 * Specialized Tag for `<a>` (anchor) elements with typed attribute setters.
 *
 * @example
 * A("Dashboard").nav(dashboardRoutes.index())   // or .setHref(route.resolve(...)) for a plain link
 */
export declare class AnchorTag extends Tag {
    protected _href?: string;
    protected _target?: BrowsingContext;
    protected _rel?: LinkRel;
    protected _download?: string | boolean;
    protected _type?: string;
    protected _referrerpolicy?: ReferrerPolicy;
    protected _hreflang?: string;
    /**
     * Branded (8.0.0): accepts a `ResolvedRoute` (route callable `.resolve()`,
     * `assetUrl()`) or an `ExternalHref` — literal `https://…`/`mailto:…`/
     * `tel:…`/`#…` pass directly; runtime externals go through `externalUrl()`.
     * In-app navigation should prefer the swap verbs (`.nav()`) over `setHref`.
     */
    setHref(href?: ResolvedRoute | ExternalHref): this;
    setHreflang(hreflang?: string): this;
    setTarget(target?: BrowsingContext): this;
    setRel(...rels: LinkRel[]): this;
    setDownload(download?: string | boolean): this;
    setType(type?: string): this;
    setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}
/** Create an `<a>` (anchor) element with typed attribute methods. */
export declare function A(...children: View[]): AnchorTag;
export declare class MapTag extends Tag {
    protected _name?: string;
    setName(name?: string): this;
}
export declare function MapEl(...children: View[]): MapTag;
export declare class AreaTag extends Tag {
    protected _shape?: 'rect' | 'circle' | 'poly' | 'default';
    protected _coords?: string;
    protected _href?: string;
    protected _alt?: string;
    protected _target?: BrowsingContext;
    protected _rel?: LinkRel;
    protected _download?: string | boolean;
    protected _referrerpolicy?: ReferrerPolicy;
    setShape(shape?: 'rect' | 'circle' | 'poly' | 'default'): this;
    setCoords(coords?: string): this;
    setHref(href?: string): this;
    setAlt(alt?: string): this;
    setTarget(target?: BrowsingContext): this;
    setRel(...rels: LinkRel[]): this;
    setDownload(download?: string | boolean): this;
    setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}
export declare function Area(): AreaTag;
//# sourceMappingURL=links.d.ts.map