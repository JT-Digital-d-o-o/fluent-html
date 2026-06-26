import { defineSchemaKeys } from "../core/proto.js";
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
  ScriptType,
} from "./html-types.js";

export class HtmlTag extends Tag {
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';

  setLang(lang?: string): this {
    this.lang = lang;
    return this;
  }

  setDir(dir?: 'ltr' | 'rtl' | 'auto'): this {
    this.dir = dir;
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
  name?: MetaName;
  content?: string;
  charset?: Charset;
  httpEquiv?: string;
  property?: string;

  /**
   * Set the `<meta name>` (named-meta grammar: `viewport`/`description`/`theme-color`/…).
   * `MetaName` is meta-specific — do **not** reuse it for the unrelated `name` on
   * `<iframe>`/`<object>`/`<map>` (browsing-context / form-association grammar).
   */
  setName(name?: MetaName): this {
    this.name = name;
    return this;
  }

  setContent(content?: string): this {
    this.content = content;
    return this;
  }

  /** Set `charset` — canonical lowercase `"utf-8"`; custom values stay legal via the open tail. */
  setCharset(charset?: Charset): this {
    this.charset = charset;
    return this;
  }

  /** Set `http-equiv` (emits the real `http-equiv` attribute, not the dead `httpEquiv`). */
  setHttpEquiv(httpEquiv?: HttpEquiv): this {
    this.httpEquiv = httpEquiv;
    return this;
  }

  setProperty(property?: string): this {
    this.property = property;
    return this;
  }
}

defineSchemaKeys(MetaTag, ['name', 'charset', ['httpEquiv', 'http-equiv'], 'property', 'content']);

export function Meta(): MetaTag {
  return new MetaTag("meta");
}

export class LinkTag extends Tag {
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

  /** Set `<link rel>` — resource hints + document relations (`preconnect`/`preload`/`stylesheet`/…). */
  setRel(rel?: LinkElementRel): this {
    this.rel = rel;
    return this;
  }

  setHreflang(hreflang?: string): this {
    this.hreflang = hreflang;
    return this;
  }

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setType(type?: LinkType): this {
    this.type = type;
    return this;
  }

  setMedia(media?: string): this {
    this.media = media;
    return this;
  }

  setSizes(sizes?: string): this {
    this.sizes = sizes;
    return this;
  }

  /** Set `crossorigin`. The bare `""` overload is for preconnect / Google Fonts. */
  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    this.crossorigin = crossorigin;
    return this;
  }

  setIntegrity(integrity?: string): this {
    this.integrity = integrity;
    return this;
  }

  setAs(as?: LinkAs): this {
    this.as = as;
    return this;
  }

  /** Core Web Vitals priority hint — promote the LCP resource (`'high'`) or de-prioritise (`'low'`). */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    this.fetchpriority = fetchpriority;
    return this;
  }
}

defineSchemaKeys(LinkTag, ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity', 'hreflang', 'fetchpriority']);

export function Link(): LinkTag {
  return new LinkTag("link");
}

export class StyleTag extends Tag {
  media?: string;
  type?: string;

  setMedia(media?: string): this {
    this.media = media;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }
}

defineSchemaKeys(StyleTag, ['media', 'type']);

export function Style(css: string): StyleTag {
  return new StyleTag("style", css);
}

export class BaseTag extends Tag {
  href?: string;
  target?: BrowsingContext;

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    this.target = target;
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
  src?: string;
  type?: ScriptType;
  crossorigin?: CrossOrigin | '';
  integrity?: string;
  fetchpriority?: FetchPriority;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setType(type?: ScriptType): this {
    this.type = type;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    this.crossorigin = crossorigin;
    return this;
  }

  setIntegrity(integrity?: string): this {
    this.integrity = integrity;
    return this;
  }

  /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) script fetching. */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    this.fetchpriority = fetchpriority;
    return this;
  }
}

defineSchemaKeys(ScriptTag, ['src', 'type', 'integrity', 'crossorigin', 'fetchpriority']);

export function Script(js: string = ""): ScriptTag {
  return new ScriptTag("script", js);
}
