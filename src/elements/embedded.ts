import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { FetchPriority, ReferrerPolicy } from "./html-types.js";


export class IframeTag extends Tag {
  src?: string;
  srcdoc?: string;
  width?: string;
  height?: string;
  allow?: string;
  loading?: 'lazy' | 'eager';
  sandbox?: string;
  name?: string;
  referrerpolicy?: ReferrerPolicy;
  fetchpriority?: FetchPriority;

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

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }

  /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) iframe loading. */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    this.fetchpriority = fetchpriority;
    return this;
  }
}

defineSchemaKeys(IframeTag, ['src', 'srcdoc', 'width', 'height', 'allow', 'sandbox', 'loading', 'name', 'referrerpolicy', 'fetchpriority']);

export function Iframe(...children: View[]): IframeTag {
  return new IframeTag("iframe", ...children);
}

export class ObjectTag extends Tag {
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

defineSchemaKeys(ObjectTag, ['data', 'type', 'width', 'height', 'name']);

export function ObjectEl(...children: View[]): ObjectTag {
  return new ObjectTag("object", ...children);
}

export class EmbedTag extends Tag {
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

defineSchemaKeys(EmbedTag, ['src', 'type', 'width', 'height']);

export function Embed(): EmbedTag {
  return new EmbedTag("embed");
}
