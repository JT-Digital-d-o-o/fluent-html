import { Tag } from "../core/tag.js";
export class SlotTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
}
/** @internal */
SlotTag.prototype._sk = ['name'];
export function Slot(...children) {
    return new SlotTag("slot", ...children);
}
//# sourceMappingURL=webcomponents.js.map