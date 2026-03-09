import { Tag } from "../core/tag.js";
/**
 * Specialized Tag for `<a>` (anchor) elements with typed attribute setters.
 *
 * @example
 * A("Dashboard").setHref("/dashboard").setTarget("_blank")
 */
export class AnchorTag extends Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
    setRel(rel) {
        this.rel = rel;
        return this;
    }
    setDownload(download) {
        this.download = download;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setReferrerpolicy(referrerpolicy) {
        this.referrerpolicy = referrerpolicy;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
AnchorTag.prototype._sk = ['href', 'target', 'rel', 'download', 'type', 'referrerpolicy'];
/** Create an `<a>` (anchor) element with typed attribute methods. */
export function A(...children) {
    return new AnchorTag("a", ...children);
}
export class MapTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
MapTag.prototype._sk = ['name'];
export function MapEl(...children) {
    return new MapTag("map", ...children);
}
export class AreaTag extends Tag {
    setShape(shape) {
        this.shape = shape;
        return this;
    }
    setCoords(coords) {
        this.coords = coords;
        return this;
    }
    setHref(href) {
        this.href = href;
        return this;
    }
    setAlt(alt) {
        this.alt = alt;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
    setRel(rel) {
        this.rel = rel;
        return this;
    }
    setDownload(download) {
        this.download = download;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
AreaTag.prototype._sk = ['shape', 'coords', 'href', 'alt', 'target', 'rel', 'download'];
export function Area() {
    return new AreaTag("area");
}
//# sourceMappingURL=links.js.map