"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogTag = exports.DetailsTag = void 0;
exports.Details = Details;
exports.Summary = Summary;
exports.Dialog = Dialog;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
class DetailsTag extends tag_js_1.Tag {
    setOpen(open = true) {
        this.open = open;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.DetailsTag = DetailsTag;
function Details(child = (0, utils_js_1.Empty)()) {
    return new DetailsTag("details", child);
}
function Summary(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("summary", child);
}
class DialogTag extends tag_js_1.Tag {
    setOpen(open = true) {
        this.open = open;
        return this;
    }
}
exports.DialogTag = DialogTag;
function Dialog(child = (0, utils_js_1.Empty)()) {
    return new DialogTag("dialog", child);
}
//# sourceMappingURL=interactive.js.map