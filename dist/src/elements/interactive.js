import { defineSchemaKeys } from "../core/proto.js";
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
defineSchemaKeys(DetailsTag, ['open', 'name']);
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
defineSchemaKeys(DialogTag, ['open']);
export function Dialog(...children) {
    return new DialogTag("dialog", ...children);
}
//# sourceMappingURL=interactive.js.map