import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { FetchPriority, PermissionsPolicyDirective, ReferrerPolicy, SandboxToken } from "./html-types.js";
export declare class IframeTag extends Tag {
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
    setSrc(src?: string): this;
    setSrcdoc(srcdoc?: string): this;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
    setAllow(policy?: Partial<Record<PermissionsPolicyDirective, string>>): this;
    setLoading(loading?: 'lazy' | 'eager'): this;
    /** Set `sandbox` from closed `SandboxToken`s; each call replaces the list. No args → `sandbox=""` (fully locked). */
    setSandbox(...tokens: SandboxToken[]): this;
    setName(name?: string): this;
    setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
    /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) iframe loading. */
    setFetchPriority(fetchpriority?: FetchPriority): this;
}
export declare function Iframe(...children: View[]): IframeTag;
export declare class ObjectTag extends Tag {
    protected _data?: string;
    protected _type?: string;
    protected _width?: string;
    protected _height?: string;
    protected _name?: string;
    setData(data?: string): this;
    setType(type?: string): this;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
    setName(name?: string): this;
}
export declare function ObjectEl(...children: View[]): ObjectTag;
export declare class EmbedTag extends Tag {
    protected _src?: string;
    protected _type?: string;
    protected _width?: string;
    protected _height?: string;
    setSrc(src?: string): this;
    setType(type?: string): this;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
}
export declare function Embed(): EmbedTag;
//# sourceMappingURL=embedded.d.ts.map