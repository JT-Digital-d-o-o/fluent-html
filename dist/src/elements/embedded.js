import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
export class IframeTag extends Tag {
    setSrc(src) {
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setSrcdoc(srcdoc) {
        if (devChecks)
            assertMutable(this, "setSrcdoc");
        this._srcdoc = srcdoc;
        return this;
    }
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
    setAllow(policy) {
        if (devChecks)
            assertMutable(this, "setAllow");
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
    setLoading(loading) {
        if (devChecks)
            assertMutable(this, "setLoading");
        this._loading = loading;
        return this;
    }
    /** Set `sandbox` from closed `SandboxToken`s; each call replaces the list. No args → `sandbox=""` (fully locked). */
    setSandbox(...tokens) {
        if (devChecks)
            assertMutable(this, "setSandbox");
        this._sandbox = tokens.join(' ');
        return this;
    }
    setName(name) {
        if (devChecks)
            assertMutable(this, "setName");
        this._name = name;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        if (devChecks)
            assertMutable(this, "setReferrerPolicy");
        this._referrerpolicy = referrerpolicy;
        return this;
    }
    /** Core Web Vitals priority hint — promote (`'high'`) or de-prioritise (`'low'`) iframe loading. */
    setFetchPriority(fetchpriority) {
        if (devChecks)
            assertMutable(this, "setFetchPriority");
        this._fetchpriority = fetchpriority;
        return this;
    }
}
defineSchemaKeys(IframeTag, ['src', 'srcdoc', 'width', 'height', 'allow', 'sandbox', 'loading', 'name', 'referrerpolicy', 'fetchpriority']);
export function Iframe(...children) {
    return new IframeTag("iframe", ...children);
}
export class ObjectTag extends Tag {
    setData(data) {
        if (devChecks)
            assertMutable(this, "setData");
        this._data = data;
        return this;
    }
    setType(type) {
        if (devChecks)
            assertMutable(this, "setType");
        this._type = type;
        return this;
    }
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
    setName(name) {
        if (devChecks)
            assertMutable(this, "setName");
        this._name = name;
        return this;
    }
}
defineSchemaKeys(ObjectTag, ['data', 'type', 'width', 'height', 'name']);
export function ObjectEl(...children) {
    return new ObjectTag("object", ...children);
}
export class EmbedTag extends Tag {
    setSrc(src) {
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setType(type) {
        if (devChecks)
            assertMutable(this, "setType");
        this._type = type;
        return this;
    }
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
}
defineSchemaKeys(EmbedTag, ['src', 'type', 'width', 'height']);
export function Embed() {
    return new EmbedTag("embed");
}
//# sourceMappingURL=embedded.js.map