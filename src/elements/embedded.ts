import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import { Empty } from "../core/utils.js";

export class IframeTag extends Tag<IframeTag> {
  src?: string;
  srcdoc?: string;
  width?: string;
  height?: string;
  allow?: string;
  allowfullscreen?: boolean;
  loading?: 'lazy' | 'eager';
  sandbox?: string;
  name?: string;
  referrerpolicy?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setSrcdoc(srcdoc?: string): this {
    this.srcdoc = srcdoc;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
    return this;
  }

  setAllow(allow?: string): this {
    this.allow = allow;
    return this;
  }

  setAllowfullscreen(allowfullscreen: boolean = true): this {
    this.allowfullscreen = allowfullscreen;
    return this;
  }

  setLoading(loading?: 'lazy' | 'eager'): this {
    this.loading = loading;
    return this;
  }

  setSandbox(sandbox?: string): this {
    this.sandbox = sandbox;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setReferrerpolicy(referrerpolicy?: string): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

export function Iframe(child: View = Empty()): IframeTag {
  return new IframeTag("iframe", child);
}

export class ObjectTag extends Tag<ObjectTag> {
  data?: string;
  type?: string;
  width?: string;
  height?: string;
  name?: string;

  setData(data?: string): this {
    this.data = data;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

export function ObjectEl(child: View = Empty()): ObjectTag {
  return new ObjectTag("object", child);
}

export class EmbedTag extends Tag<EmbedTag> {
  src?: string;
  type?: string;
  width?: string;
  height?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
    return this;
  }
}

export function Embed(child: View = Empty()): EmbedTag {
  return new EmbedTag("embed", child);
}
