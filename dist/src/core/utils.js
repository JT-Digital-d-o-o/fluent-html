"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empty = Empty;
exports.El = El;
const tag_js_1 = require("./tag.js");
function Empty() {
    return "";
}
function El(el, ...children) {
    return new tag_js_1.Tag(el, ...children);
}
//# sourceMappingURL=utils.js.map