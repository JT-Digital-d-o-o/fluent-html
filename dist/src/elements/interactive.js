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
/** @internal */
DetailsTag.prototype._sk = ['open', 'name'];
function Details(...children) {
    return new DetailsTag("details", ...children);
}
function Summary(...children) {
    return (0, utils_js_1.El)("summary", ...children);
}
class DialogTag extends tag_js_1.Tag {
    setOpen(open = true) {
        this.open = open;
        return this;
    }
}
exports.DialogTag = DialogTag;
/** @internal */
DialogTag.prototype._sk = ['open'];
function Dialog(...children) {
    return new DialogTag("dialog", ...children);
}
//# sourceMappingURL=interactive.js.map