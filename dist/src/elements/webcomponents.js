import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
export class SlotTag extends Tag {
    setName(name) {
        if (devChecks)
            assertMutable(this, "setName");
        this._name = name;
        return this;
    }
}
defineSchemaKeys(SlotTag, ['name']);
export function Slot(...children) {
    return new SlotTag("slot", ...children);
}
//# sourceMappingURL=webcomponents.js.map