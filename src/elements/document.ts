import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";
import type { CrossOrigin, HttpEquiv } from "./html-types.js";

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
  name?: string;
  content?: string;
  charset?: string;
  httpEquiv?: string;
  property?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setContent(content?: string): this {
    this.content = content;
    return this;
  }

  setCharset(charset?: string): this {
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
  rel?: string;
  href?: string;
  type?: string;
  media?: string;
  sizes?: string;
  crossorigin?: CrossOrigin | '';
  integrity?: string;
  as?: string;
  hreflang?: string;

  setRel(rel?: string): this {
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

  setType(type?: string): this {
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

  setAs(as?: string): this {
    this.as = as;
    return this;
  }
}

defineSchemaKeys(LinkTag, ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity', 'hreflang']);

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
  target?: string;

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setTarget(target?: string): this {
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
  type?: string;
  crossorigin?: CrossOrigin | '';
  integrity?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setType(type?: string): this {
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
}

defineSchemaKeys(ScriptTag, ['src', 'type', 'integrity', 'crossorigin']);

export function Script(js: string = ""): ScriptTag {
  return new ScriptTag("script", js);
}
