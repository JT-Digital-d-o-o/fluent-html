import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class DetailsTag extends Tag {
    open?: boolean;
    name?: string;
    setOpen(open?: boolean): this;
    setName(name?: string): this;
}
export declare function Details(...children: View[]): DetailsTag;
export declare function Summary(...children: View[]): Tag;
export declare class DialogTag extends Tag {
    open?: boolean;
    setOpen(open?: boolean): this;
}
export declare function Dialog(...children: View[]): DialogTag;
//# sourceMappingURL=interactive.d.ts.map