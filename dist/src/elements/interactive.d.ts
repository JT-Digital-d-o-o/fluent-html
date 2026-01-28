import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class DetailsTag extends Tag<DetailsTag> {
    open?: boolean;
    name?: string;
    setOpen(open?: boolean): this;
    setName(name?: string): this;
}
export declare function Details(child?: View): DetailsTag;
export declare function Summary(child?: View): Tag;
export declare class DialogTag extends Tag<DialogTag> {
    open?: boolean;
    setOpen(open?: boolean): this;
}
export declare function Dialog(child?: View): DialogTag;
//# sourceMappingURL=interactive.d.ts.map