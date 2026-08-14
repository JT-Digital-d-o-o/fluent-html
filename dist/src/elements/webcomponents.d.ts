import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class SlotTag extends Tag {
    protected _name?: string;
    setName(name?: string): this;
}
export declare function Slot(...children: View[]): SlotTag;
//# sourceMappingURL=webcomponents.d.ts.map