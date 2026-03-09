import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
export class DetailsTag extends Tag {
    setOpen(open = true) {
        this.open = open;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
DetailsTag.prototype._sk = ['open', 'name'];
export function Details(...children) {
    return new DetailsTag("details", ...children);
}
export function Summary(...children) {
    return El("summary", ...children);
}
export class DialogTag extends Tag {
    setOpen(open = true) {
        this.open = open;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
DialogTag.prototype._sk = ['open'];
export function Dialog(...children) {
    return new DialogTag("dialog", ...children);
}
//# sourceMappingURL=interactive.js.map