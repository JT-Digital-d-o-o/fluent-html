"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptTag = exports.BaseTag = exports.StyleTag = exports.LinkTag = exports.MetaTag = void 0;
exports.HTML = HTML;
exports.Head = Head;
exports.Body = Body;
exports.Title = Title;
exports.Meta = Meta;
exports.Link = Link;
exports.Style = Style;
exports.Base = Base;
exports.Noscript = Noscript;
exports.Template = Template;
exports.Script = Script;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
function HTML(child) {
    return (0, utils_js_1.El)("html", child);
}
function Head(child) {
    return (0, utils_js_1.El)("head", child);
}
function Body(child) {
    return (0, utils_js_1.El)("body", child);
}
function Title(child) {
    return (0, utils_js_1.El)("title", child);
}
class MetaTag extends tag_js_1.Tag {
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
exports.MetaTag = MetaTag;
/** @internal */
MetaTag.prototype._sk = ['name', 'charset', 'httpEquiv', 'property', 'content'];
function Meta() {
    return new MetaTag("meta");
}
class LinkTag extends tag_js_1.Tag {
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
exports.LinkTag = LinkTag;
/** @internal */
LinkTag.prototype._sk = ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity'];
function Link() {
    return new LinkTag("link");
}
class StyleTag extends tag_js_1.Tag {
    setMedia(media) {
        this.media = media;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
}
exports.StyleTag = StyleTag;
/** @internal */
StyleTag.prototype._sk = ['media', 'type'];
function Style(css) {
    return new StyleTag("style", css);
}
class BaseTag extends tag_js_1.Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
}
exports.BaseTag = BaseTag;
/** @internal */
BaseTag.prototype._sk = ['href', 'target'];
function Base() {
    return new BaseTag("base");
}
function Noscript(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("noscript", child);
}
function Template(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("template", child);
}
class ScriptTag extends tag_js_1.Tag {
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
exports.ScriptTag = ScriptTag;
/** @internal */
ScriptTag.prototype._sk = ['src', 'type', 'async', 'defer', 'integrity', 'crossorigin', 'nomodule'];
function Script(js = "") {
    return new ScriptTag("script", js);
}
//# sourceMappingURL=document.js.map