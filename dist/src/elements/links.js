"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaTag = exports.MapTag = exports.AnchorTag = void 0;
exports.A = A;
exports.MapEl = MapEl;
exports.Area = Area;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
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
function A(child = (0, utils_js_1.Empty)()) {
    return new AnchorTag("a", child);
}
class MapTag extends tag_js_1.Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.MapTag = MapTag;
function MapEl(child = (0, utils_js_1.Empty)()) {
    return new MapTag("map", child);
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
function Area(child = (0, utils_js_1.Empty)()) {
    return new AreaTag("area", child);
}
//# sourceMappingURL=links.js.map