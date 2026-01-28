import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export function HTML(child?: View): Tag {
  return El("html", child);
}

export function Head(child?: View): Tag {
  return El("head", child);
}

export function Body(child?: View): Tag {
  return El("body", child);
}

export function Title(child?: View): Tag {
  return El("title", child);
}

export class MetaTag extends Tag<MetaTag> {
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

  setHttpEquiv(httpEquiv?: string): this {
    this.httpEquiv = httpEquiv;
    return this;
  }

  setProperty(property?: string): this {
    this.property = property;
    return this;
  }
}

/** @internal */
(MetaTag.prototype as any)._sk = ['name', 'charset', 'httpEquiv', 'property', 'content'];

export function Meta(): MetaTag {
  return new MetaTag("meta");
}

export class LinkTag extends Tag<LinkTag> {
  rel?: string;
  href?: string;
  type?: string;
  media?: string;
  sizes?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  as?: string;

  setRel(rel?: string): this {
    this.rel = rel;
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

  setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this {
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

/** @internal */
(LinkTag.prototype as any)._sk = ['rel', 'href', 'type', 'media', 'sizes', 'as', 'crossorigin', 'integrity'];

export function Link(): LinkTag {
  return new LinkTag("link");
}

export class StyleTag extends Tag<StyleTag> {
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

/** @internal */
(StyleTag.prototype as any)._sk = ['media', 'type'];

export function Style(css: string): StyleTag {
  return new StyleTag("style", css);
}

export class BaseTag extends Tag<BaseTag> {
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

/** @internal */
(BaseTag.prototype as any)._sk = ['href', 'target'];

export function Base(): BaseTag {
  return new BaseTag("base");
}

export function Noscript(child: View = Empty()): Tag {
  return El("noscript", child);
}

export function Template(child: View = Empty()): Tag {
  return El("template", child);
}

export class ScriptTag extends Tag<ScriptTag> {
  src?: string;
  type?: string;
  async?: boolean;
  defer?: boolean;
  crossorigin?: 'anonymous' | 'use-credentials';
  integrity?: string;
  nomodule?: boolean;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setAsync(async: boolean = true): this {
    this.async = async;
    return this;
  }

  setDefer(defer: boolean = true): this {
    this.defer = defer;
    return this;
  }

  setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this {
    this.crossorigin = crossorigin;
    return this;
  }

  setIntegrity(integrity?: string): this {
    this.integrity = integrity;
    return this;
  }

  setNomodule(nomodule: boolean = true): this {
    this.nomodule = nomodule;
    return this;
  }
}

/** @internal */
(ScriptTag.prototype as any)._sk = ['src', 'type', 'async', 'defer', 'integrity', 'crossorigin', 'nomodule'];

export function Script(js: string = ""): ScriptTag {
  return new ScriptTag("script", js);
}
