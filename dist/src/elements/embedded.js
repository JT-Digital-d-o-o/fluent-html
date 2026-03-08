import { Tag } from "../core/tag.js";
export class IframeTag extends Tag {
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
/** @internal */
IframeTag.prototype._sk = ['src', 'srcdoc', 'width', 'height', 'allow', 'allowfullscreen', 'sandbox', 'loading', 'name', 'referrerpolicy'];
export function Iframe(...children) {
    return new IframeTag("iframe", ...children);
}
export class ObjectTag extends Tag {
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
/** @internal */
ObjectTag.prototype._sk = ['data', 'type', 'width', 'height', 'name'];
export function ObjectEl(...children) {
    return new ObjectTag("object", ...children);
}
export class EmbedTag extends Tag {
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
/** @internal */
EmbedTag.prototype._sk = ['src', 'type', 'width', 'height'];
export function Embed(...children) {
    return new EmbedTag("embed", ...children);
}
//# sourceMappingURL=embedded.js.map