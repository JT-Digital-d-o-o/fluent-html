import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { ClosedBy } from "./html-types.js";
export declare class DetailsTag extends Tag {
    protected _name?: string;
    setName(name?: string): this;
}
export declare function Details(...children: View[]): DetailsTag;
export declare function Summary(...children: View[]): Tag;
export declare class DialogTag extends Tag {
    protected _closedby?: ClosedBy;
    /**
     * Set `closedby` — how the dialog light-dismisses: `"any"` (click-outside + Esc),
     * `"closerequest"` (Esc only), `"none"` (explicit close only). The native replacement
     * for hand-rolled backdrop/Escape handling; pairs with `Button().setCommand("close")`.
     *
     * @example
     * Dialog(...).setClosedby("any").setId(ids.modal)
     */
    setClosedby(closedby?: ClosedBy): this;
}
export declare function Dialog(...children: View[]): DialogTag;
//# sourceMappingURL=interactive.d.ts.map