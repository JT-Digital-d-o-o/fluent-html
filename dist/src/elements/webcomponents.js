import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
export class SlotTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
defineSchemaKeys(SlotTag, ['name']);
export function Slot(...children) {
    return new SlotTag("slot", ...children);
}
//# sourceMappingURL=webcomponents.js.map