import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import { Raw } from "../core/raw-string.js";
export class HtmlTag extends Tag {
    setLang(lang) {
        if (devChecks)
            assertMutable(this, "setLang");
        this._lang = lang;
        return this;
    }
    setDir(dir) {
        if (devChecks)
            assertMutable(this, "setDir");
        this._dir = dir;
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
        if (devChecks)
            assertMutable(this, "setName");
        this._name = name;
        return this;
    }
    setContent(content) {
        if (devChecks)
            assertMutable(this, "setContent");
        this._contentValue = content;
        return this;
    }
    /** Set `charset` — canonical lowercase `"utf-8"`; custom values stay legal via the open tail. */
    setCharset(charset) {
        if (devChecks)
            assertMutable(this, "setCharset");
        this._charset = charset;
        return this;
    }
    /** Set `http-equiv` (emits the real `http-equiv` attribute, not the dead `httpEquiv`). */
    setHttpEquiv(httpEquiv) {
        if (devChecks)
            assertMutable(this, "setHttpEquiv");
        this._httpEquiv = httpEquiv;
        return this;
    }
    setProperty(property) {
        if (devChecks)
            assertMutable(this, "setProperty");
        this._property = property;
        return this;
    }
    setMedia(media) {
        if (devChecks)
            assertMutable(this, "setMedia");
        this._media = media;
        return this;
    }
}
defineSchemaKeys(MetaTag, ['name', 'charset', ['httpEquiv', 'http-equiv'], 'property', ['contentValue', 'content'], 'media']);
export function Meta() {
    return new MetaTag("meta");
}
export class LinkTag extends Tag {
    /** Set `<link rel>` — resource hints + document relations (`preconnect`/`preload`/`stylesheet`/…). */
    setRel(...rels) {
        if (devChecks)
            assertMutable(this, "setRel");
        this._rel = rels.length ? rels.join(" ") : undefined;
        return this;
    }
    setHreflang(hreflang) {
        if (devChecks)
            assertMutable(this, "setHreflang");
        this._hreflang = hreflang;
        return this;
    }
    setHref(href) {
        if (devChecks)
            assertMutable(this, "setHref");
        this._href = href;
        return this;
    }
    setType(type) {
        if (devChecks)
            assertMutable(this, "setType");
        this._type = type;
        return this;
    }
    setMedia(media) {
        if (devChecks)
            assertMutable(this, "setMedia");
        this._media = media;
        return this;
    }
    setSizes(sizes) {
        if (devChecks)
            assertMutable(this, "setSizes");
        this._sizes = sizes;
        return this;
    }
    /** Set `crossorigin`. The bare `""` overload is for preconnect / Google Fonts. */
    setCrossOrigin(crossorigin) {
        if (devChecks)
            assertMutable(this, "setCrossOrigin");
        this._crossorigin = crossorigin;
        return this;
    }
    setIntegrity(integrity) {
        if (devChecks)
            assertMutable(this, "setIntegrity");
        this._integrity = integrity;
        return this;
    }
    setAs(as) {
        if (devChecks)
            assertMutable(this, "setAs");
        this._as = as;
        return this;
    }
    /** Core Web Vitals priority hint — promote the LCP resource (`'high'`) or de-prioritise (`'low'`). */
    setFetchPriority(fetchpriority) {
        if (devChecks)
            assertMutable(this, "setFetchPriority");
        this._fetchpriority = fetchpriority;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        if (devChecks)
            assertMutable(this, "setReferrerPolicy");
        this._referrerpolicy = referrerpolicy;
        return this;
    }
    /** `<link rel=preload as=image>` responsive srcset — distinct from `setSizes` (the icon `sizes` grammar). */
    setImagesrcset(imagesrcset) {
        if (devChecks)
            assertMutable(this, "setImagesrcset");
        this._imagesrcset = imagesrcset;
        return this;
    }
    setImagesizes(imagesizes) {
        if (devChecks)
            assertMutable(this, "setImagesizes");
        this._imagesizes = imagesizes;
        return this;
    }
}
defineSchemaKeys(LinkTag, ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity', 'hreflang', 'fetchpriority', 'referrerpolicy', 'imagesrcset', 'imagesizes']);
export function Link() {
    return new LinkTag("link");
}
export class StyleTag extends Tag {
    setMedia(media) {
        if (devChecks)
            assertMutable(this, "setMedia");
        this._media = media;
        return this;
    }
    setType(type) {
        if (devChecks)
            assertMutable(this, "setType");
        this._type = type;
        return this;
    }
}
defineSchemaKeys(StyleTag, ['media', 'type']);
export function Style(css) {
    return new StyleTag("style", css);
}
export class BaseTag extends Tag {
    setHref(href) {
        if (devChecks)
            assertMutable(this, "setHref");
        this._href = href;
        return this;
    }
    setTarget(target) {
        if (devChecks)
            assertMutable(this, "setTarget");
        this._target = target;
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
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setType(type) {
        if (devChecks)
            assertMutable(this, "setType");
        this._type = type;
        return this;
    }
    setCrossOrigin(crossorigin) {
        if (devChecks)
            assertMutable(this, "setCrossOrigin");
        this._crossorigin = crossorigin;
        return this;
    }
    setIntegrity(integrity) {
        if (devChecks)
            assertMutable(this, "setIntegrity");
        this._integrity = integrity;
        return this;
    }
    /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) script fetching. */
    setFetchPriority(fetchpriority) {
        if (devChecks)
            assertMutable(this, "setFetchPriority");
        this._fetchpriority = fetchpriority;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        if (devChecks)
            assertMutable(this, "setReferrerPolicy");
        this._referrerpolicy = referrerpolicy;
        return this;
    }
}
defineSchemaKeys(ScriptTag, ['src', 'type', 'integrity', 'crossorigin', 'fetchpriority', 'referrerpolicy']);
export function Script(js = "") {
    return new ScriptTag("script", js);
}
//# sourceMappingURL=document.js.map