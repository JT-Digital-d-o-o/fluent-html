import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { FetchPriority, PermissionsPolicyDirective, ReferrerPolicy, SandboxToken } from "./html-types.js";


export class IframeTag extends Tag {
  protected _src?: string;
  protected _srcdoc?: string;
  protected _width?: string;
  protected _height?: string;
  protected _allow?: string;
  protected _loading?: 'lazy' | 'eager';
  protected _sandbox?: string;
  protected _name?: string;
  protected _referrerpolicy?: ReferrerPolicy;
  protected _fetchpriority?: FetchPriority;

  setSrc(src?: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setSrcdoc(srcdoc?: string): this {
    if (devChecks) assertMutable(this, "setSrcdoc");
    this._srcdoc = srcdoc;
    return this;
  }

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }

  setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>): this {
    if (devChecks) assertMutable(this, "setAllow");
    if (policy === undefined) {
      this._allow = undefined;
      return this;
    }
    this._allow = Object.entries(policy)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => (v === '' ? k : `${k} ${v}`))
      .join('; ');
    return this;
  }

  setLoading(loading?: 'lazy' | 'eager'): this {
    if (devChecks) assertMutable(this, "setLoading");
    this._loading = loading;
    return this;
  }

  /** Set `sandbox` from closed `SandboxToken`s; each call replaces the list. No args → `sandbox=""` (fully locked). */
  setSandbox(...tokens: SandboxToken[]): this {
    if (devChecks) assertMutable(this, "setSandbox");
    this._sandbox = tokens.join(' ');
    return this;
  }

  setName(name?: string): this {
    if (devChecks) assertMutable(this, "setName");
    this._name = name;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    if (devChecks) assertMutable(this, "setReferrerPolicy");
    this._referrerpolicy = referrerpolicy;
    return this;
  }

  /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) iframe loading. */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    if (devChecks) assertMutable(this, "setFetchPriority");
    this._fetchpriority = fetchpriority;
    return this;
  }
}

defineSchemaKeys(IframeTag, ['src', 'srcdoc', 'width', 'height', 'allow', 'sandbox', 'loading', 'name', 'referrerpolicy', 'fetchpriority']);

export function Iframe(...children: View[]): IframeTag {
  return new IframeTag("iframe", ...children);
}

export class ObjectTag extends Tag {
  protected _data?: string;
  protected _type?: string;
  protected _width?: string;
  protected _height?: string;
  protected _name?: string;

  setData(data?: string): this {
    if (devChecks) assertMutable(this, "setData");
    this._data = data;
    return this;
  }

  setType(type?: string): this {
    if (devChecks) assertMutable(this, "setType");
    this._type = type;
    return this;
  }

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }

  setName(name?: string): this {
    if (devChecks) assertMutable(this, "setName");
    this._name = name;
    return this;
  }
}

defineSchemaKeys(ObjectTag, ['data', 'type', 'width', 'height', 'name']);

export function ObjectEl(...children: View[]): ObjectTag {
  return new ObjectTag("object", ...children);
}

export class EmbedTag extends Tag {
  protected _src?: string;
  protected _type?: string;
  protected _width?: string;
  protected _height?: string;

  setSrc(src?: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setType(type?: string): this {
    if (devChecks) assertMutable(this, "setType");
    this._type = type;
    return this;
  }

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }
}

defineSchemaKeys(EmbedTag, ['src', 'type', 'width', 'height']);

export function Embed(): EmbedTag {
  return new EmbedTag("embed");
}
