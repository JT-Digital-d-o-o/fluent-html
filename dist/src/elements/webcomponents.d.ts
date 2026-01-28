import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class SlotTag extends Tag<SlotTag> {
    name?: string;
    setName(name?: string): this;
}
export declare function Slot(child?: View): SlotTag;
//# sourceMappingURL=webcomponents.d.ts.map