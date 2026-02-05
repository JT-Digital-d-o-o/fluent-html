import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class AnchorTag extends Tag {
    href?: string;
    target?: '_self' | '_blank' | '_parent' | '_top' | string;
    rel?: string;
    download?: string | boolean;
    type?: string;
    referrerpolicy?: string;
    setHref(href?: string): this;
    setTarget(target?: '_self' | '_blank' | '_parent' | '_top' | string): this;
    setRel(rel?: string): this;
    setDownload(download?: string | boolean): this;
    setType(type?: string): this;
    setReferrerpolicy(referrerpolicy?: string): this;
}
export declare function A(child?: View): AnchorTag;
export declare class MapTag extends Tag {
    name?: string;
    setName(name?: string): this;
}
export declare function MapEl(child?: View): MapTag;
export declare class AreaTag extends Tag {
    shape?: 'rect' | 'circle' | 'poly' | 'default';
    coords?: string;
    href?: string;
    alt?: string;
    target?: string;
    rel?: string;
    download?: string;
    setShape(shape?: 'rect' | 'circle' | 'poly' | 'default'): this;
    setCoords(coords?: string): this;
    setHref(href?: string): this;
    setAlt(alt?: string): this;
    setTarget(target?: string): this;
    setRel(rel?: string): this;
    setDownload(download?: string): this;
}
export declare function Area(child?: View): AreaTag;
//# sourceMappingURL=links.d.ts.map