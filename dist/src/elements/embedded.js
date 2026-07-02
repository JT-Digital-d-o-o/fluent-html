import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
export class IframeTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setSrcdoc(srcdoc) {
        this.srcdoc = srcdoc;
        return this;
    }
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
    setAllow(policy) {
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
    setLoading(loading) {
        this.loading = loading;
        return this;
    }
    /** Set `sandbox` from closed `SandboxToken`s; each call replaces the list. No args → `sandbox=""` (fully locked). */
    setSandbox(...tokens) {
        this.sandbox = tokens.join(' ');
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        this.referrerpolicy = referrerpolicy;
        return this;
    }
    /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) iframe loading. */
    setFetchPriority(fetchpriority) {
        this.fetchpriority = fetchpriority;
        return this;
    }
}
defineSchemaKeys(IframeTag, ['src', 'srcdoc', 'width', 'height', 'allow', 'sandbox', 'loading', 'name', 'referrerpolicy', 'fetchpriority']);
export function Iframe(...children) {
    return new IframeTag("iframe", ...children);
}
export class ObjectTag extends Tag {
    setData(data) {
        this.data = data;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
defineSchemaKeys(ObjectTag, ['data', 'type', 'width', 'height', 'name']);
export function ObjectEl(...children) {
    return new ObjectTag("object", ...children);
}
export class EmbedTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
}
defineSchemaKeys(EmbedTag, ['src', 'type', 'width', 'height']);
export function Embed() {
    return new EmbedTag("embed");
}
//# sourceMappingURL=embedded.js.map