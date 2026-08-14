import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import { Raw } from "../core/raw-string.js";
import type { View } from "../core/types.js";
import type {
  BrowsingContext,
  Charset,
  CrossOrigin,
  FetchPriority,
  HttpEquiv,
  LinkAs,
  LinkElementRel,
  LinkType,
  MetaName,
  ReferrerPolicy,
  ScriptType,
} from "./html-types.js";

export class HtmlTag extends Tag {
  protected _lang?: string;
  protected _dir?: 'ltr' | 'rtl' | 'auto';

  override setLang(lang?: string): this {
    if (devChecks) assertMutable(this, "setLang");
    this._lang = lang;
    return this;
  }

  override setDir(dir?: 'ltr' | 'rtl' | 'auto'): this {
    if (devChecks) assertMutable(this, "setDir");
    this._dir = dir;
    return this;
  }
}

defineSchemaKeys(HtmlTag, ['lang', 'dir']);

export function HTML(...children: View[]): HtmlTag {
  return new HtmlTag("html", ...children);
}

/**
 * A full-page `<html>` root that the renderer prefixes with `<!DOCTYPE html>`.
 * Extends `HtmlTag` (chainable — `.setLang(...)`). The DOCTYPE is discriminated on
 * the `_doc` brand in the emitter, so plain `HTML(...)` stays byte-identical.
 */
export class DocumentTag extends HtmlTag {
  declare readonly _doc: true;
}
(DocumentTag.prototype as unknown as { _doc: true })._doc = true;

/** Create a full HTML document — emits `<!DOCTYPE html>` then `<html>…</html>`. */
export function Document(...children: View[]): DocumentTag {
  return new DocumentTag("html", ...children);
}

/** The standalone `<!DOCTYPE html>` declaration, for hand-assembled documents. */
export function Doctype(): View {
  return Raw("<!DOCTYPE html>");
}

export function Head(...children: View[]): Tag {
  return El("head", ...children);
}

export function Body(...children: View[]): Tag {
  return El("body", ...children);
}

export function Title(...children: View[]): Tag {
  return El("title", ...children);
}

export class MetaTag extends Tag {
  protected _name?: MetaName;
  // Storage is `contentValue` (aliased to the `content` attribute in the schema) so the
  // field doesn't shadow Tag's `.content()` styling method.
  protected _contentValue?: string;
  protected _charset?: Charset;
  protected _httpEquiv?: string;
  protected _property?: string;
  protected _media?: string;

  /**
   * Set the `<meta name>` (named-meta grammar: `viewport`/`description`/`theme-color`/…).
   * `MetaName` is meta-specific — do **not** reuse it for the unrelated `name` on
   * `<iframe>`/`<object>`/`<map>` (browsing-context / form-association grammar).
   */
  setName(name?: MetaName): this {
    if (devChecks) assertMutable(this, "setName");
    this._name = name;
    return this;
  }

  setContent(content?: string): this {
    if (devChecks) assertMutable(this, "setContent");
    this._contentValue = content;
    return this;
  }

  /** Set `charset` — canonical lowercase `"utf-8"`; custom values stay legal via the open tail. */
  setCharset(charset?: Charset): this {
    if (devChecks) assertMutable(this, "setCharset");
    this._charset = charset;
    return this;
  }

  /** Set `http-equiv` (emits the real `http-equiv` attribute, not the dead `httpEquiv`). */
  setHttpEquiv(httpEquiv?: HttpEquiv): this {
    if (devChecks) assertMutable(this, "setHttpEquiv");
    this._httpEquiv = httpEquiv;
    return this;
  }

  setProperty(property?: string): this {
    if (devChecks) assertMutable(this, "setProperty");
    this._property = property;
    return this;
  }

  setMedia(media?: string): this {
    if (devChecks) assertMutable(this, "setMedia");
    this._media = media;
    return this;
  }
}

defineSchemaKeys(MetaTag, ['name', 'charset', ['httpEquiv', 'http-equiv'], 'property', ['contentValue', 'content'], 'media']);

export function Meta(): MetaTag {
  return new MetaTag("meta");
}

export class LinkTag extends Tag {
  protected _rel?: LinkElementRel;
  protected _href?: string;
  protected _type?: LinkType;
  protected _media?: string;
  protected _sizes?: string;
  protected _crossorigin?: CrossOrigin | '';
  protected _integrity?: string;
  protected _as?: LinkAs;
  protected _hreflang?: string;
  protected _fetchpriority?: FetchPriority;
  protected _referrerpolicy?: ReferrerPolicy;
  protected _imagesrcset?: string;
  protected _imagesizes?: string;

  /** Set `<link rel>` — resource hints + document relations (`preconnect`/`preload`/`stylesheet`/…). */
  setRel(...rels: LinkElementRel[]): this {
    if (devChecks) assertMutable(this, "setRel");
    this._rel = rels.length ? rels.join(" ") : undefined;
    return this;
  }

  setHreflang(hreflang?: string): this {
    if (devChecks) assertMutable(this, "setHreflang");
    this._hreflang = hreflang;
    return this;
  }

  setHref(href?: string): this {
    if (devChecks) assertMutable(this, "setHref");
    this._href = href;
    return this;
  }

  setType(type?: LinkType): this {
    if (devChecks) assertMutable(this, "setType");
    this._type = type;
    return this;
  }

  setMedia(media?: string): this {
    if (devChecks) assertMutable(this, "setMedia");
    this._media = media;
    return this;
  }

  setSizes(sizes?: string): this {
    if (devChecks) assertMutable(this, "setSizes");
    this._sizes = sizes;
    return this;
  }

  /** Set `crossorigin`. The bare `""` overload is for preconnect / Google Fonts. */
  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    if (devChecks) assertMutable(this, "setCrossOrigin");
    this._crossorigin = crossorigin;
    return this;
  }

  setIntegrity(integrity?: string): this {
    if (devChecks) assertMutable(this, "setIntegrity");
    this._integrity = integrity;
    return this;
  }

  setAs(as?: LinkAs): this {
    if (devChecks) assertMutable(this, "setAs");
    this._as = as;
    return this;
  }

  /** Core Web Vitals priority hint — promote the LCP resource (`'high'`) or de-prioritise (`'low'`). */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    if (devChecks) assertMutable(this, "setFetchPriority");
    this._fetchpriority = fetchpriority;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    if (devChecks) assertMutable(this, "setReferrerPolicy");
    this._referrerpolicy = referrerpolicy;
    return this;
  }

  /** `<link rel=preload as=image>` responsive srcset — distinct from `setSizes` (the icon `sizes` grammar). */
  setImagesrcset(imagesrcset?: string): this {
    if (devChecks) assertMutable(this, "setImagesrcset");
    this._imagesrcset = imagesrcset;
    return this;
  }

  setImagesizes(imagesizes?: string): this {
    if (devChecks) assertMutable(this, "setImagesizes");
    this._imagesizes = imagesizes;
    return this;
  }
}

defineSchemaKeys(LinkTag, ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity', 'hreflang', 'fetchpriority', 'referrerpolicy', 'imagesrcset', 'imagesizes']);

export function Link(): LinkTag {
  return new LinkTag("link");
}

export class StyleTag extends Tag {
  protected _media?: string;
  protected _type?: string;

  setMedia(media?: string): this {
    if (devChecks) assertMutable(this, "setMedia");
    this._media = media;
    return this;
  }

  setType(type?: string): this {
    if (devChecks) assertMutable(this, "setType");
    this._type = type;
    return this;
  }
}

defineSchemaKeys(StyleTag, ['media', 'type']);

export function Style(css: string): StyleTag {
  return new StyleTag("style", css);
}

export class BaseTag extends Tag {
  protected _href?: string;
  protected _target?: BrowsingContext;

  setHref(href?: string): this {
    if (devChecks) assertMutable(this, "setHref");
    this._href = href;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    if (devChecks) assertMutable(this, "setTarget");
    this._target = target;
    return this;
  }
}

defineSchemaKeys(BaseTag, ['href', 'target']);

export function Base(): BaseTag {
  return new BaseTag("base");
}

export function Noscript(...children: View[]): Tag {
  return El("noscript", ...children);
}

export function Template(...children: View[]): Tag {
  return El("template", ...children);
}

export class ScriptTag extends Tag {
  protected _src?: string;
  protected _type?: ScriptType;
  protected _crossorigin?: CrossOrigin | '';
  protected _integrity?: string;
  protected _fetchpriority?: FetchPriority;
  protected _referrerpolicy?: ReferrerPolicy;

  setSrc(src?: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setType(type?: ScriptType): this {
    if (devChecks) assertMutable(this, "setType");
    this._type = type;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    if (devChecks) assertMutable(this, "setCrossOrigin");
    this._crossorigin = crossorigin;
    return this;
  }

  setIntegrity(integrity?: string): this {
    if (devChecks) assertMutable(this, "setIntegrity");
    this._integrity = integrity;
    return this;
  }

  /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) script fetching. */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    if (devChecks) assertMutable(this, "setFetchPriority");
    this._fetchpriority = fetchpriority;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    if (devChecks) assertMutable(this, "setReferrerPolicy");
    this._referrerpolicy = referrerpolicy;
    return this;
  }
}

defineSchemaKeys(ScriptTag, ['src', 'type', 'integrity', 'crossorigin', 'fetchpriority', 'referrerpolicy']);

export function Script(js: string = ""): ScriptTag {
  return new ScriptTag("script", js);
}
