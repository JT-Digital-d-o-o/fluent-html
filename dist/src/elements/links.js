"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaTag = exports.MapTag = exports.AnchorTag = void 0;
exports.A = A;
exports.MapEl = MapEl;
exports.Area = Area;
const tag_js_1 = require("../core/tag.js");
class AnchorTag extends tag_js_1.Tag {
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
exports.AnchorTag = AnchorTag;
/** @internal */
AnchorTag.prototype._sk = ['href', 'target', 'rel', 'download', 'type', 'referrerpolicy'];
function A(...children) {
    return new AnchorTag("a", ...children);
}
class MapTag extends tag_js_1.Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.MapTag = MapTag;
/** @internal */
MapTag.prototype._sk = ['name'];
function MapEl(...children) {
    return new MapTag("map", ...children);
}
class AreaTag extends tag_js_1.Tag {
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
exports.AreaTag = AreaTag;
/** @internal */
AreaTag.prototype._sk = ['shape', 'coords', 'href', 'alt', 'target', 'rel', 'download'];
function Area(...children) {
    return new AreaTag("area", ...children);
}
//# sourceMappingURL=links.js.map