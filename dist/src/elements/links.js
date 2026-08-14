import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
/**
 * Specialized Tag for `<a>` (anchor) elements with typed attribute setters.
 *
 * @example
 * A("Dashboard").nav(dashboardRoutes.index())   // or .setHref(route.resolve(...)) for a plain link
 */
export class AnchorTag extends Tag {
    /**
     * Branded (8.0.0): accepts a `ResolvedRoute` (route callable `.resolve()`,
     * `assetUrl()`) or an `ExternalHref` — literal `https://…`/`mailto:…`/
     * `tel:…`/`#…` pass directly; runtime externals go through `externalUrl()`.
     * In-app navigation should prefer the swap verbs (`.nav()`) over `setHref`.
     */
    setHref(href) {
        if (devChecks)
            assertMutable(this, "setHref");
        this._href = href;
        return this;
    }
    setHreflang(hreflang) {
        if (devChecks)
            assertMutable(this, "setHreflang");
        this._hreflang = hreflang;
        return this;
    }
    setTarget(target) {
        if (devChecks)
            assertMutable(this, "setTarget");
        this._target = target;
        return this;
    }
    setRel(...rels) {
        if (devChecks)
            assertMutable(this, "setRel");
        this._rel = rels.length ? rels.join(" ") : undefined;
        return this;
    }
    setDownload(download) {
        if (devChecks)
            assertMutable(this, "setDownload");
        this._download = download;
        return this;
    }
    setType(type) {
        if (devChecks)
            assertMutable(this, "setType");
        this._type = type;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        if (devChecks)
            assertMutable(this, "setReferrerPolicy");
        this._referrerpolicy = referrerpolicy;
        return this;
    }
}
defineSchemaKeys(AnchorTag, ['href', 'target', 'rel', 'download', 'type', 'referrerpolicy', 'hreflang']);
/** Create an `<a>` (anchor) element with typed attribute methods. */
export function A(...children) {
    return new AnchorTag("a", ...children);
}
export class MapTag extends Tag {
    setName(name) {
        if (devChecks)
            assertMutable(this, "setName");
        this._name = name;
        return this;
    }
}
defineSchemaKeys(MapTag, ['name']);
export function MapEl(...children) {
    return new MapTag("map", ...children);
}
export class AreaTag extends Tag {
    setShape(shape) {
        if (devChecks)
            assertMutable(this, "setShape");
        this._shape = shape;
        return this;
    }
    setCoords(coords) {
        if (devChecks)
            assertMutable(this, "setCoords");
        this._coords = coords;
        return this;
    }
    setHref(href) {
        if (devChecks)
            assertMutable(this, "setHref");
        this._href = href;
        return this;
    }
    setAlt(alt) {
        if (devChecks)
            assertMutable(this, "setAlt");
        this._alt = alt;
        return this;
    }
    setTarget(target) {
        if (devChecks)
            assertMutable(this, "setTarget");
        this._target = target;
        return this;
    }
    setRel(...rels) {
        if (devChecks)
            assertMutable(this, "setRel");
        this._rel = rels.length ? rels.join(" ") : undefined;
        return this;
    }
    setDownload(download) {
        if (devChecks)
            assertMutable(this, "setDownload");
        this._download = download;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        if (devChecks)
            assertMutable(this, "setReferrerPolicy");
        this._referrerpolicy = referrerpolicy;
        return this;
    }
}
defineSchemaKeys(AreaTag, ['shape', 'coords', 'href', 'alt', 'target', 'rel', 'download', 'referrerpolicy']);
export function Area() {
    return new AreaTag("area");
}
//# sourceMappingURL=links.js.map