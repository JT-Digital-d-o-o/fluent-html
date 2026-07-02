import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { FetchPriority, PermissionsPolicyDirective, ReferrerPolicy, SandboxToken } from "./html-types.js";


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

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
    return this;
  }

  setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>): this {
    if (policy === undefined) {
      this.allow = undefined;
      return this;
    }
    this.allow = Object.entries(policy)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => (v === '' ? k : `${k} ${v}`))
      .join('; ');
    return this;
  }

  setLoading(loading?: 'lazy' | 'eager'): this {
    this.loading = loading;
    return this;
  }

  /** Set `sandbox` from closed `SandboxToken`s; each call replaces the list. No args → `sandbox=""` (fully locked). */
  setSandbox(...tokens: SandboxToken[]): this {
    this.sandbox = tokens.join(' ');
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

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
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

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
    return this;
  }
}

defineSchemaKeys(EmbedTag, ['src', 'type', 'width', 'height']);

export function Embed(): EmbedTag {
  return new EmbedTag("embed");
}
