import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import { Raw } from "../core/raw-string.js";
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
defineSchemaKeys(HtmlTag, ['lang', 'dir']);
export function HTML(...children) {
    return new HtmlTag("html", ...children);
}
/**
 * A full-page `<html>` root that the renderer prefixes with `<!DOCTYPE html>`.
 * Extends `HtmlTag` (chainable — `.setLang(...)`). The DOCTYPE is discriminated on
 * the `_doc` brand in the emitter, so plain `HTML(...)` stays byte-identical.
 */
export class DocumentTag extends HtmlTag {
}
DocumentTag.prototype._doc = true;
/** Create a full HTML document — emits `<!DOCTYPE html>` then `<html>…</html>`. */
export function Document(...children) {
    return new DocumentTag("html", ...children);
}
/** The standalone `<!DOCTYPE html>` declaration, for hand-assembled documents. */
export function Doctype() {
    return Raw("<!DOCTYPE html>");
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
    /**
     * Set the `<meta name>` (named-meta grammar: `viewport`/`description`/`theme-color`/…).
     * `MetaName` is meta-specific — do **not** reuse it for the unrelated `name` on
     * `<iframe>`/`<object>`/`<map>` (browsing-context / form-association grammar).
     */
    setName(name) {
        this.name = name;
        return this;
    }
    setContent(content) {
        this.content = content;
        return this;
    }
    /** Set `charset` — canonical lowercase `"utf-8"`; custom values stay legal via the open tail. */
    setCharset(charset) {
        this.charset = charset;
        return this;
    }
    /** Set `http-equiv` (emits the real `http-equiv` attribute, not the dead `httpEquiv`). */
    setHttpEquiv(httpEquiv) {
        this.httpEquiv = httpEquiv;
        return this;
    }
    setProperty(property) {
        this.property = property;
        return this;
    }
}
defineSchemaKeys(MetaTag, ['name', 'charset', ['httpEquiv', 'http-equiv'], 'property', 'content']);
export function Meta() {
    return new MetaTag("meta");
}
export class LinkTag extends Tag {
    /** Set `<link rel>` — resource hints + document relations (`preconnect`/`preload`/`stylesheet`/…). */
    setRel(rel) {
        this.rel = rel;
        return this;
    }
    setHreflang(hreflang) {
        this.hreflang = hreflang;
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
    /** Set `crossorigin`. The bare `""` overload is for preconnect / Google Fonts. */
    setCrossOrigin(crossorigin) {
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
    /** Core Web Vitals priority hint — promote the LCP resource (`'high'`) or de-prioritise (`'low'`). */
    setFetchPriority(fetchpriority) {
        this.fetchpriority = fetchpriority;
        return this;
    }
}
defineSchemaKeys(LinkTag, ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity', 'hreflang', 'fetchpriority']);
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
defineSchemaKeys(StyleTag, ['media', 'type']);
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
defineSchemaKeys(BaseTag, ['href', 'target']);
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
    setCrossOrigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
    setIntegrity(integrity) {
        this.integrity = integrity;
        return this;
    }
    /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) script fetching. */
    setFetchPriority(fetchpriority) {
        this.fetchpriority = fetchpriority;
        return this;
    }
}
defineSchemaKeys(ScriptTag, ['src', 'type', 'integrity', 'crossorigin', 'fetchpriority']);
export function Script(js = "") {
    return new ScriptTag("script", js);
}
//# sourceMappingURL=document.js.map