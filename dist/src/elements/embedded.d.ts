import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class IframeTag extends Tag {
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
    setSrc(src?: string): this;
    setSrcdoc(srcdoc?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
    setAllow(allow?: string): this;
    setAllowfullscreen(allowfullscreen?: boolean): this;
    setLoading(loading?: 'lazy' | 'eager'): this;
    setSandbox(sandbox?: string): this;
    setName(name?: string): this;
    setReferrerpolicy(referrerpolicy?: string): this;
}
export declare function Iframe(child?: View): IframeTag;
export declare class ObjectTag extends Tag {
    data?: string;
    type?: string;
    width?: string;
    height?: string;
    name?: string;
    setData(data?: string): this;
    setType(type?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
    setName(name?: string): this;
}
export declare function ObjectEl(child?: View): ObjectTag;
export declare class EmbedTag extends Tag {
    src?: string;
    type?: string;
    width?: string;
    height?: string;
    setSrc(src?: string): this;
    setType(type?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
}
export declare function Embed(child?: View): EmbedTag;
//# sourceMappingURL=embedded.d.ts.map