import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { BrowsingContext, Charset, CrossOrigin, FetchPriority, HttpEquiv, LinkAs, LinkElementRel, LinkType, MetaName, ReferrerPolicy, ScriptType } from "./html-types.js";
export declare class HtmlTag extends Tag {
    lang?: string;
    dir?: 'ltr' | 'rtl' | 'auto';
    setLang(lang?: string): this;
    setDir(dir?: 'ltr' | 'rtl' | 'auto'): this;
}
export declare function HTML(...children: View[]): HtmlTag;
/**
 * A full-page `<html>` root that the renderer prefixes with `<!DOCTYPE html>`.
 * Extends `HtmlTag` (chainable — `.setLang(...)`). The DOCTYPE is discriminated on
 * the `_doc` brand in the emitter, so plain `HTML(...)` stays byte-identical.
 */
export declare class DocumentTag extends HtmlTag {
    readonly _doc: true;
}
/** Create a full HTML document — emits `<!DOCTYPE html>` then `<html>…</html>`. */
export declare function Document(...children: View[]): DocumentTag;
/** The standalone `<!DOCTYPE html>` declaration, for hand-assembled documents. */
export declare function Doctype(): View;
export declare function Head(...children: View[]): Tag;
export declare function Body(...children: View[]): Tag;
export declare function Title(...children: View[]): Tag;
export declare class MetaTag extends Tag {
    name?: MetaName;
    contentValue?: string;
    charset?: Charset;
    httpEquiv?: string;
    property?: string;
    media?: string;
    /**
     * Set the `<meta name>` (named-meta grammar: `viewport`/`description`/`theme-color`/…).
     * `MetaName` is meta-specific — do **not** reuse it for the unrelated `name` on
     * `<iframe>`/`<object>`/`<map>` (browsing-context / form-association grammar).
     */
    setName(name?: MetaName): this;
    setContent(content?: string): this;
    /** Set `charset` — canonical lowercase `"utf-8"`; custom values stay legal via the open tail. */
    setCharset(charset?: Charset): this;
    /** Set `http-equiv` (emits the real `http-equiv` attribute, not the dead `httpEquiv`). */
    setHttpEquiv(httpEquiv?: HttpEquiv): this;
    setProperty(property?: string): this;
    setMedia(media?: string): this;
}
export declare function Meta(): MetaTag;
export declare class LinkTag extends Tag {
    rel?: LinkElementRel;
    href?: string;
    type?: LinkType;
    media?: string;
    sizes?: string;
    crossorigin?: CrossOrigin | '';
    integrity?: string;
    as?: LinkAs;
    hreflang?: string;
    fetchpriority?: FetchPriority;
    referrerpolicy?: ReferrerPolicy;
    imagesrcset?: string;
    imagesizes?: string;
    /** Set `<link rel>` — resource hints + document relations (`preconnect`/`preload`/`stylesheet`/…). */
    setRel(...rels: LinkElementRel[]): this;
    setHreflang(hreflang?: string): this;
    setHref(href?: string): this;
    setType(type?: LinkType): this;
    setMedia(media?: string): this;
    setSizes(sizes?: string): this;
    /** Set `crossorigin`. The bare `""` overload is for preconnect / Google Fonts. */
    setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
    setIntegrity(integrity?: string): this;
    setAs(as?: LinkAs): this;
    /** Core Web Vitals priority hint — promote the LCP resource (`'high'`) or de-prioritise (`'low'`). */
    setFetchPriority(fetchpriority?: FetchPriority): this;
    setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
    /** `<link rel=preload as=image>` responsive srcset — distinct from `setSizes` (the icon `sizes` grammar). */
    setImagesrcset(imagesrcset?: string): this;
    setImagesizes(imagesizes?: string): this;
}
export declare function Link(): LinkTag;
export declare class StyleTag extends Tag {
    media?: string;
    type?: string;
    setMedia(media?: string): this;
    setType(type?: string): this;
}
export declare function Style(css: string): StyleTag;
export declare class BaseTag extends Tag {
    href?: string;
    target?: BrowsingContext;
    setHref(href?: string): this;
    setTarget(target?: BrowsingContext): this;
}
export declare function Base(): BaseTag;
export declare function Noscript(...children: View[]): Tag;
export declare function Template(...children: View[]): Tag;
export declare class ScriptTag extends Tag {
    src?: string;
    type?: ScriptType;
    crossorigin?: CrossOrigin | '';
    integrity?: string;
    fetchpriority?: FetchPriority;
    referrerpolicy?: ReferrerPolicy;
    setSrc(src?: string): this;
    setType(type?: ScriptType): this;
    setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
    setIntegrity(integrity?: string): this;
    /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) script fetching. */
    setFetchPriority(fetchpriority?: FetchPriority): this;
    setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}
export declare function Script(js?: string): ScriptTag;
//# sourceMappingURL=document.d.ts.map