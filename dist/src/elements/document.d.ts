import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare function HTML(...children: View[]): Tag;
export declare function Head(...children: View[]): Tag;
export declare function Body(...children: View[]): Tag;
export declare function Title(...children: View[]): Tag;
export declare class MetaTag extends Tag {
    name?: string;
    content?: string;
    charset?: string;
    httpEquiv?: string;
    property?: string;
    setName(name?: string): this;
    setContent(content?: string): this;
    setCharset(charset?: string): this;
    setHttpEquiv(httpEquiv?: string): this;
    setProperty(property?: string): this;
}
export declare function Meta(): MetaTag;
export declare class LinkTag extends Tag {
    rel?: string;
    href?: string;
    type?: string;
    media?: string;
    sizes?: string;
    crossorigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
    as?: string;
    setRel(rel?: string): this;
    setHref(href?: string): this;
    setType(type?: string): this;
    setMedia(media?: string): this;
    setSizes(sizes?: string): this;
    setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this;
    setIntegrity(integrity?: string): this;
    setAs(as?: string): this;
}
export declare function Link(): LinkTag;
export declare class StyleTag extends Tag {
    media?: string;
    type?: string;
    setMedia(media?: string): this;
    setType(type?: string): this;
}
export declare function Style(css: string): StyleTag;
export declare class BaseTag extends Tag {
    href?: string;
    target?: string;
    setHref(href?: string): this;
    setTarget(target?: string): this;
}
export declare function Base(): BaseTag;
export declare function Noscript(...children: View[]): Tag;
export declare function Template(...children: View[]): Tag;
export declare class ScriptTag extends Tag {
    src?: string;
    type?: string;
    async?: boolean;
    defer?: boolean;
    crossorigin?: 'anonymous' | 'use-credentials';
    integrity?: string;
    nomodule?: boolean;
    setSrc(src?: string): this;
    setType(type?: string): this;
    setAsync(async?: boolean): this;
    setDefer(defer?: boolean): this;
    setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this;
    setIntegrity(integrity?: string): this;
    setNomodule(nomodule?: boolean): this;
}
export declare function Script(js?: string): ScriptTag;
//# sourceMappingURL=document.d.ts.map