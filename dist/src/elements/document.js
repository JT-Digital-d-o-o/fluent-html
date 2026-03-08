import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
export class HtmlTag extends Tag {
    setLang(lang) {
        this.lang = lang;
        return this;
    }
    setDir(dir) {
        this.dir = dir;
        return this;
    }
}
/** @internal */
HtmlTag.prototype._sk = ['lang', 'dir'];
export function HTML(...children) {
    return new HtmlTag("html", ...children);
}
export function Head(...children) {
    return El("head", ...children);
}
export function Body(...children) {
    return El("body", ...children);
}
export function Title(...children) {
    return El("title", ...children);
}
export class MetaTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setContent(content) {
        this.content = content;
        return this;
    }
    setCharset(charset) {
        this.charset = charset;
        return this;
    }
    setHttpEquiv(httpEquiv) {
        this.httpEquiv = httpEquiv;
        return this;
    }
    setProperty(property) {
        this.property = property;
        return this;
    }
}
/** @internal */
MetaTag.prototype._sk = ['name', 'charset', 'httpEquiv', 'property', 'content'];
export function Meta() {
    return new MetaTag("meta");
}
export class LinkTag extends Tag {
    setRel(rel) {
        this.rel = rel;
        return this;
    }
    setHref(href) {
        this.href = href;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setMedia(media) {
        this.media = media;
        return this;
    }
    setSizes(sizes) {
        this.sizes = sizes;
        return this;
    }
    setCrossorigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
    setIntegrity(integrity) {
        this.integrity = integrity;
        return this;
    }
    setAs(as) {
        this.as = as;
        return this;
    }
}
/** @internal */
LinkTag.prototype._sk = ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity'];
export function Link() {
    return new LinkTag("link");
}
export class StyleTag extends Tag {
    setMedia(media) {
        this.media = media;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
}
/** @internal */
StyleTag.prototype._sk = ['media', 'type'];
export function Style(css) {
    return new StyleTag("style", css);
}
export class BaseTag extends Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
}
/** @internal */
BaseTag.prototype._sk = ['href', 'target'];
export function Base() {
    return new BaseTag("base");
}
export function Noscript(...children) {
    return El("noscript", ...children);
}
export function Template(...children) {
    return El("template", ...children);
}
export class ScriptTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setAsync(async = true) {
        this.async = async;
        return this;
    }
    setDefer(defer = true) {
        this.defer = defer;
        return this;
    }
    setCrossorigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
    setIntegrity(integrity) {
        this.integrity = integrity;
        return this;
    }
    setNomodule(nomodule = true) {
        this.nomodule = nomodule;
        return this;
    }
}
/** @internal */
ScriptTag.prototype._sk = ['src', 'type', 'async', 'defer', 'integrity', 'crossorigin', 'nomodule'];
export function Script(js = "") {
    return new ScriptTag("script", js);
}
//# sourceMappingURL=document.js.map