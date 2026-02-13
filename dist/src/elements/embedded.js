"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbedTag = exports.ObjectTag = exports.IframeTag = void 0;
exports.Iframe = Iframe;
exports.ObjectEl = ObjectEl;
exports.Embed = Embed;
const tag_js_1 = require("../core/tag.js");
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
/** @internal */
IframeTag.prototype._sk = ['src', 'srcdoc', 'width', 'height', 'allow', 'allowfullscreen', 'sandbox', 'loading', 'name', 'referrerpolicy'];
function Iframe(...children) {
    return new IframeTag("iframe", ...children);
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
/** @internal */
ObjectTag.prototype._sk = ['data', 'type', 'width', 'height', 'name'];
function ObjectEl(...children) {
    return new ObjectTag("object", ...children);
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
/** @internal */
EmbedTag.prototype._sk = ['src', 'type', 'width', 'height'];
function Embed(...children) {
    return new EmbedTag("embed", ...children);
}
//# sourceMappingURL=embedded.js.map