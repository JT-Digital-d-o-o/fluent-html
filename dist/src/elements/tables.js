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
function Table(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("table", child);
}
function Thead(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("thead", child);
}
function Tbody(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("tbody", child);
}
function Tfoot(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("tfoot", child);
}
function Tr(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("tr", child);
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
function Th(child = (0, utils_js_1.Empty)()) {
    return new ThTag("th", child);
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
function Td(child = (0, utils_js_1.Empty)()) {
    return new TdTag("td", child);
}
function Caption(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("caption", child);
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
function Colgroup(child = (0, utils_js_1.Empty)()) {
    return new ColgroupTag("colgroup", child);
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
function Col(child = (0, utils_js_1.Empty)()) {
    return new ColTag("col", child);
}
//# sourceMappingURL=tables.js.map