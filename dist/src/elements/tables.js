import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
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
        this.colspan = colspan;
        return this;
    }
    setRowspan(rowspan) {
        this.rowspan = rowspan;
        return this;
    }
    setScope(scope) {
        this.scope = scope;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
ThTag.prototype._sk = ['colspan', 'rowspan', 'scope'];
export function Th(...children) {
    return new ThTag("th", ...children);
}
export class TdTag extends Tag {
    setColspan(colspan) {
        this.colspan = colspan;
        return this;
    }
    setRowspan(rowspan) {
        this.rowspan = rowspan;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
TdTag.prototype._sk = ['colspan', 'rowspan'];
export function Td(...children) {
    return new TdTag("td", ...children);
}
export function Caption(...children) {
    return El("caption", ...children);
}
export class ColgroupTag extends Tag {
    setSpan(span) {
        this.span = span;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
ColgroupTag.prototype._sk = ['span'];
export function Colgroup(...children) {
    return new ColgroupTag("colgroup", ...children);
}
export class ColTag extends Tag {
    setSpan(span) {
        this.span = span;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
ColTag.prototype._sk = ['span'];
export function Col(...children) {
    return new ColTag("col", ...children);
}
//# sourceMappingURL=tables.js.map