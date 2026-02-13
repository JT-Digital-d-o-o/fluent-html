"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotTag = void 0;
exports.Slot = Slot;
const tag_js_1 = require("../core/tag.js");
class SlotTag extends tag_js_1.Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.SlotTag = SlotTag;
/** @internal */
SlotTag.prototype._sk = ['name'];
function Slot(...children) {
    return new SlotTag("slot", ...children);
}
//# sourceMappingURL=webcomponents.js.map