import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
export class DetailsTag extends Tag {
    setName(name) {
        if (devChecks)
            assertMutable(this, "setName");
        this._name = name;
        return this;
    }
}
defineSchemaKeys(DetailsTag, ['name']);
export function Details(...children) {
    return new DetailsTag("details", ...children);
}
export function Summary(...children) {
    return El("summary", ...children);
}
export class DialogTag extends Tag {
    /**
     * Set `closedby` — how the dialog light-dismisses: `"any"` (click-outside + Esc),
     * `"closerequest"` (Esc only), `"none"` (explicit close only). The native replacement
     * for hand-rolled backdrop/Escape handling; pairs with `Button().setCommand("close")`.
     *
     * @example
     * Dialog(...).setClosedby("any").setId(ids.modal)
     */
    setClosedby(closedby) {
        if (devChecks)
            assertMutable(this, "setClosedby");
        this._closedby = closedby;
        return this;
    }
}
defineSchemaKeys(DialogTag, ['closedby']);
export function Dialog(...children) {
    return new DialogTag("dialog", ...children);
}
//# sourceMappingURL=interactive.js.map