import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import { extractId } from "../ids.js";
function joinHeaderIds(ids) {
    return ids.map(extractId).map(s => s.trim()).filter(Boolean);
}
export function Table(...children) {
    return El("table", ...children);
}
export function Thead(...children) {
    return El("thead", ...children);
}
export function Tbody(...children) {
    return El("tbody", ...children);
}
export function Tfoot(...children) {
    return El("tfoot", ...children);
}
export function Tr(...children) {
    return El("tr", ...children);
}
export class ThTag extends Tag {
    setColspan(colspan) {
        if (devChecks)
            assertMutable(this, "setColspan");
        this._colspan = colspan;
        return this;
    }
    setRowspan(rowspan) {
        if (devChecks)
            assertMutable(this, "setRowspan");
        this._rowspan = rowspan;
        return this;
    }
    setScope(scope) {
        if (devChecks)
            assertMutable(this, "setScope");
        this._scope = scope;
        return this;
    }
    setHeaders(...ids) {
        if (devChecks)
            assertMutable(this, "setHeaders");
        const j = joinHeaderIds(ids);
        this._headers = j.length ? j.join(' ') : undefined;
        return this;
    }
    addHeaders(...ids) {
        if (devChecks)
            assertMutable(this, "addHeaders");
        const existing = this._headers ? this._headers.split(/\s+/).filter(Boolean) : [];
        const merged = [...new Set([...existing, ...joinHeaderIds(ids)])];
        this._headers = merged.length ? merged.join(' ') : undefined;
        return this;
    }
    setAbbr(abbr) {
        if (devChecks)
            assertMutable(this, "setAbbr");
        this._abbr = abbr;
        return this;
    }
}
defineSchemaKeys(ThTag, ['colspan', 'rowspan', 'scope', 'headers', 'abbr']);
export function Th(...children) {
    return new ThTag("th", ...children);
}
export class TdTag extends Tag {
    setColspan(colspan) {
        if (devChecks)
            assertMutable(this, "setColspan");
        this._colspan = colspan;
        return this;
    }
    setRowspan(rowspan) {
        if (devChecks)
            assertMutable(this, "setRowspan");
        this._rowspan = rowspan;
        return this;
    }
    setHeaders(...ids) {
        if (devChecks)
            assertMutable(this, "setHeaders");
        const j = joinHeaderIds(ids);
        this._headers = j.length ? j.join(' ') : undefined;
        return this;
    }
    addHeaders(...ids) {
        if (devChecks)
            assertMutable(this, "addHeaders");
        const existing = this._headers ? this._headers.split(/\s+/).filter(Boolean) : [];
        const merged = [...new Set([...existing, ...joinHeaderIds(ids)])];
        this._headers = merged.length ? merged.join(' ') : undefined;
        return this;
    }
}
defineSchemaKeys(TdTag, ['colspan', 'rowspan', 'headers']);
export function Td(...children) {
    return new TdTag("td", ...children);
}
export function Caption(...children) {
    return El("caption", ...children);
}
export class ColgroupTag extends Tag {
    setSpan(span) {
        if (devChecks)
            assertMutable(this, "setSpan");
        this._span = span;
        return this;
    }
}
defineSchemaKeys(ColgroupTag, ['span']);
export function Colgroup(...children) {
    return new ColgroupTag("colgroup", ...children);
}
export class ColTag extends Tag {
    setSpan(span) {
        if (devChecks)
            assertMutable(this, "setSpan");
        this._span = span;
        return this;
    }
}
defineSchemaKeys(ColTag, ['span']);
export function Col() {
    return new ColTag("col");
}
//# sourceMappingURL=tables.js.map