import { Tag } from "./tag.js";
export function Empty() {
    return "";
}
export function El(el, ...children) {
    return new Tag(el, ...children);
}
//# sourceMappingURL=utils.js.map