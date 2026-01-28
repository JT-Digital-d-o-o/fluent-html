"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedTag = exports.ObjectTag = exports.IframeTag = void 0;
exports.Iframe = Iframe;
exports.ObjectEl = ObjectEl;
exports.Embed = Embed;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
class IframeTag extends tag_js_1.Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setSrcdoc(srcdoc) {
        this.srcdoc = srcdoc;
        return this;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
    setAllow(allow) {
        this.allow = allow;
        return this;
    }
    setAllowfullscreen(allowfullscreen = true) {
        this.allowfullscreen = allowfullscreen;
        return this;
    }
    setLoading(loading) {
        this.loading = loading;
        return this;
    }
    setSandbox(sandbox) {
        this.sandbox = sandbox;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setReferrerpolicy(referrerpolicy) {
        this.referrerpolicy = referrerpolicy;
        return this;
    }
}
exports.IframeTag = IframeTag;
function Iframe(child = (0, utils_js_1.Empty)()) {
    return new IframeTag("iframe", child);
}
class ObjectTag extends tag_js_1.Tag {
    setData(data) {
        this.data = data;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.ObjectTag = ObjectTag;
function ObjectEl(child = (0, utils_js_1.Empty)()) {
    return new ObjectTag("object", child);
}
class EmbedTag extends tag_js_1.Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
}
exports.EmbedTag = EmbedTag;
function Embed(child = (0, utils_js_1.Empty)()) {
    return new EmbedTag("embed", child);
}
//# sourceMappingURL=embedded.js.map