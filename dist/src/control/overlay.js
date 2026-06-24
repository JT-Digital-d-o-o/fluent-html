import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
// Position-specific utility classes for the absolutely-positioned overlay layer.
// (`.absolute()`/`.relative()` come from the Tailwind methods; these are the per-
// position inset/translate utilities — all valid C-05/C-06 vocab values.)
const POSITION_CLASSES = {
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top': 'top-0 left-1/2 -translate-x-1/2',
    'bottom': 'bottom-0 left-1/2 -translate-x-1/2',
    'left': 'top-1/2 left-0 -translate-y-1/2',
    'right': 'top-1/2 right-0 -translate-y-1/2',
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
};
const OVERLAY_POSITIONS = new Set(Object.keys(POSITION_CLASSES));
Tag.prototype.overlay = function (positionOrContent, ...rest) {
    let position = 'center';
    let content;
    if (typeof positionOrContent === 'string' && OVERLAY_POSITIONS.has(positionOrContent)) {
        position = positionOrContent;
        content = rest;
    }
    else if (positionOrContent === undefined) {
        content = rest;
    }
    else {
        content = [positionOrContent, ...rest];
    }
    const layer = El("div", ...content).absolute().addClass(POSITION_CLASSES[position]).zIndex("10");
    return El("div", this, layer).relative();
};
//# sourceMappingURL=overlay.js.map