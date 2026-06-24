import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class DetailsTag extends Tag {
    name?: string;
    setName(name?: string): this;
}
export declare function Details(...children: View[]): DetailsTag;
export declare function Summary(...children: View[]): Tag;
export declare class DialogTag extends Tag {
}
export declare function Dialog(...children: View[]): DialogTag;
//# sourceMappingURL=interactive.d.ts.map