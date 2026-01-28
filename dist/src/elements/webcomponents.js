"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotTag = void 0;
exports.Slot = Slot;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
class SlotTag extends tag_js_1.Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.SlotTag = SlotTag;
function Slot(child = (0, utils_js_1.Empty)()) {
    return new SlotTag("slot", child);
}
//# sourceMappingURL=webcomponents.js.map