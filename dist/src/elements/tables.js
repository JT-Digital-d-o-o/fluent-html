"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColTag = exports.ColgroupTag = exports.TdTag = exports.ThTag = void 0;
exports.Table = Table;
exports.Thead = Thead;
exports.Tbody = Tbody;
exports.Tfoot = Tfoot;
exports.Tr = Tr;
exports.Th = Th;
exports.Td = Td;
exports.Caption = Caption;
exports.Colgroup = Colgroup;
exports.Col = Col;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
function Table(...children) {
    return (0, utils_js_1.El)("table", ...children);
}
function Thead(...children) {
    return (0, utils_js_1.El)("thead", ...children);
}
function Tbody(...children) {
    return (0, utils_js_1.El)("tbody", ...children);
}
function Tfoot(...children) {
    return (0, utils_js_1.El)("tfoot", ...children);
}
function Tr(...children) {
    return (0, utils_js_1.El)("tr", ...children);
}
class ThTag extends tag_js_1.Tag {
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
exports.ThTag = ThTag;
/** @internal */
ThTag.prototype._sk = ['colspan', 'rowspan', 'scope'];
function Th(...children) {
    return new ThTag("th", ...children);
}
class TdTag extends tag_js_1.Tag {
    setColspan(colspan) {
        this.colspan = colspan;
        return this;
    }
    setRowspan(rowspan) {
        this.rowspan = rowspan;
        return this;
    }
}
exports.TdTag = TdTag;
/** @internal */
TdTag.prototype._sk = ['colspan', 'rowspan'];
function Td(...children) {
    return new TdTag("td", ...children);
}
function Caption(...children) {
    return (0, utils_js_1.El)("caption", ...children);
}
class ColgroupTag extends tag_js_1.Tag {
    setSpan(span) {
        this.span = span;
        return this;
    }
}
exports.ColgroupTag = ColgroupTag;
/** @internal */
ColgroupTag.prototype._sk = ['span'];
function Colgroup(...children) {
    return new ColgroupTag("colgroup", ...children);
}
class ColTag extends tag_js_1.Tag {
    setSpan(span) {
        this.span = span;
        return this;
    }
}
exports.ColTag = ColTag;
/** @internal */
ColTag.prototype._sk = ['span'];
function Col(...children) {
    return new ColTag("col", ...children);
}
//# sourceMappingURL=tables.js.map